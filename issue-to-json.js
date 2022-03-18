import { writeFile, mkdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

import { getInput, exportVariable, setFailed } from "@actions/core";
import * as github from "@actions/github";
import yaml from "js-yaml";
import normalizeUrl from "normalize-url";
import redirectChain from "redirect-chain";

const getRedirects = redirectChain({ maxRedirects: 5 });

function getFileName(url) {
  let hash = createHash("sha256");
  hash.update(url);

  return hash.digest("base64url").substr(0, 10) + ".json";
}

function parseIssueBody(githubFormData, body) {
  // Markdown fields aren’t included in output body
  let fields = githubFormData.body.filter(field => field.type !== "markdown");

  let bodyData = body.split("\n").filter(entry => {
    return !!entry && !entry.startsWith("###")
  }).map(entry => {
    return entry === "_No response_" ? "" : entry;
  });

  // console.log( {fields, bodyData} );

  let returnObject = {};
  for(let j = 0, k = bodyData.length; j<k; j++) {
    if(!fields[j]) {
      continue;
    }

    let entry = bodyData[j];
    // Clean up GitHub usernames
    let fieldLabel = fields[j] && fields[j].attributes && fields[j].attributes.label;
    if(fieldLabel && (fieldLabel.toLowerCase().endsWith("(gitHub usernames)") || fieldLabel.toLowerCase().endsWith("(twitter usernames)"))) {
      entry = entry.split(" ").map(name => {
        return name.trim().replace(/\,/g, "");
      }).filter(name => !!name).map(name => {
        return name.startsWith("@") ? name.substring(1) : name;
      });
    }
    if(fieldLabel && fieldLabel.toLowerCase() === "url" || fields[j].id === "url" || fields[j].id.endsWith("_url") || fields[j].id.startsWith("url_")) {
      let normalized = normalizeUrl(entry, {
        defaultProtocol: "http:"
      });

      let urls = await getRedirects(normalized);

      entry = urls.pop();
    }

    returnObject[fields[j].id] = entry;
  }

  console.log( { returnObject } );
  return returnObject;
}

function getTestData() {
  return {
    user: {
      login: "zachleat",
    },
    number: 1,
    title: "I built something",
    body: `### Site URL

https://www.zachleat.com/

### Source code URL

https://github.com/zachleat/zachleat.com

### Authors (GitHub usernames)

@zachleat, @pdehaan`,
  };
}

export async function issueToJson() {
  try {
    const outputDir = getInput("folder");

    if (!github.context.payload.issue) {
      setFailed("Cannot find GitHub issue");
      return;
    }

    let issueTemplateFile = getInput("issue-template");
    let issueTemplate = await readFile(path.join("./.github/ISSUE_TEMPLATE/", issueTemplateFile), "utf8");
    // let issueTemplate = await readFile("./test/sample-issue-template.yml");

    let { title, number, body, user } = github.context.payload.issue;
    // let { title, number, body, user } = getTestData();

    let formData = yaml.load(issueTemplate);

    if (!title || !body) {
      throw new Error("Unable to parse GitHub issue.");
    }

    let issueData = parseIssueBody(formData, body);

    issueData.opened_by = user.login;

    exportVariable("IssueNumber", number);

    // create output dir
    await mkdir(outputDir, { recursive: true });
    
    let hashPropertyName = getInput("hash-property-name");
    let fileName = getFileName(issueData[ hashPropertyName ]); // usually .url
    await writeFile(path.join(outputDir, fileName), JSON.stringify(issueData, null, 2));
  } catch (error) {
    setFailed(error.message);
  }
}

export default issueToJson();
