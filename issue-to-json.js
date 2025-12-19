import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

import { getInput, exportVariable, setFailed } from "@actions/core";
import * as github from "@actions/github";

import { parseIssueBody } from "./parse-issue-body.js";
import { getBase64UrlHash } from "./hash.js";

function getFileName(url) {
  return getBase64UrlHash(url).slice(0, 10) + ".json";
}

export async function issueToJson() {
  try {
    const outputDir = getInput("folder");

    if (!github.context.payload.issue) {
      setFailed("Cannot find GitHub issue");
      return;
    }

    let issueTemplatePath = path.join("./.github/ISSUE_TEMPLATE/", getInput("issue-template"));

    let { title, number, body, user } = github.context.payload.issue;

    if (!title || !body) {
      throw new Error("Unable to parse GitHub issue.");
    }

    let issueData = await parseIssueBody(issueTemplatePath, body);

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