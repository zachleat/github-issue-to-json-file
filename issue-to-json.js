import { getInput, exportVariable, setFailed } from "@actions/core";
import * as github from "@actions/github";
import { writeFile, mkdir, readFile } from "fs/promises";
import { createHash } from "crypto";
import yaml from "js-yaml";
import path from "node:path";

function getFileName(url) {
  let hash = createHash("sha256");
  hash.update(url);

  return hash.digest("base64url").substr(0, 10) + ".json";
}

function parseIssueBody(githubFormData, body) {
  let fields = githubFormData.body;

  let bodyData = body.split("\n").filter(entry => {
    return !!entry && !entry.startsWith("###")
  }).map(entry => {
    return entry === "_No response_" ? "" : entry;
  });

  console.log( {fields, bodyData} );
  let returnObject = {};
  for(let j = 0, k = bodyData.length; j<k; j++) {
    if(!fields[j]) {
      continue;
    }

    let entry = bodyData[j];
    // Clean up GitHub usernames
    if(fields[j] && fields[j].attributes && fields[j].attributes.label && fields[j].attributes.label.endsWith("(GitHub usernames)")) {
      entry = entry.split(" ").map(name => {
        return name.trim().replace(/\,/g, "");
      }).filter(name => !!name).map(name => {
        return name.startsWith("@") ? name : `@${name}`;
      });
    }

    returnObject[fields[j].id] = entry;
  }
  console.log( { returnObject } );
  return returnObject;
}

function getTestData() {
  return {
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

    const issueTemplateFile = getInput("issue-template");
    const issueTemplate = await readFile(path.join("./.github/ISSUE_TEMPLATE/", issueTemplateFile), "utf8");
    // const issueTemplate = await readFile("./test/sample-issue-template.yml");

    const { title, number, body } = github.context.payload.issue;
    // const { title, number, body } = getTestData();

    const formData = yaml.load(issueTemplate);

    if (!title || !body) {
      throw new Error("Unable to parse GitHub issue.");
    }

    const issueData = parseIssueBody(formData, body);

    exportVariable("IssueNumber", number);

    // create output dir
    await mkdir(outputDir, { recursive: true });

    let fileName = getFileName(issueData.url);
    await writeFile(path.join(outputDir, fileName), JSON.stringify(issueData, null, 2));
  } catch (error) {
    setFailed(error.message);
  }
}

export default issueToJson();
