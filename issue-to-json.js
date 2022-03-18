import { getInput, exportVariable, setFailed } from "@actions/core";
import * as github from "@actions/github";
import { writeFile } from "fs/promises";
import { createHash } from "crypto";
import path from "node:path";

function getFileName(url) {
  let hash = createHash("sha256");
  hash.update(url);

  return hash.digest("base64url").substr(0, 10) + ".json";
}

function parseIssueBody(body) {
  let [urlTitle, url, sourceTitle, source_url, authorsTitle, authors] = body.split("\n").filter(entry => !!entry);

  if(authors === "_No response_") {
    authors = "";
  }

  let authorsList = authors.split(" ").map(entry => {
    return entry.trim().replace(/\,/g, "");
  }).filter(entry => !!entry).map(entry => {
    return entry.startsWith("@") ? entry : `@${entry}`;
  });

  return {
    url,
    source_url,
    authors: authorsList
  }
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

_No response_`,
  };
}

export async function issueToJson() {
  try {
    const outputDir = getInput("dataFolderPath");

    if (!github.context.payload.issue) {
      setFailed("Cannot find GitHub issue");
      return;
    }

    const { title, number, body } = github.context.payload.issue;
    // const { title, number, body } = getTestData();

    if (!title || !body) {
      throw new Error("Unable to parse GitHub issue.");
    }

    const issueData = parseIssueBody(body);

    issueData.githubIssueNumber = number;

    exportVariable("IssueNumber", number);

    let fileName = getFileName(issueData.url);
    await writeFile(path.join(outputDir, fileName), JSON.stringify(issueData, null, 2));
  } catch (error) {
    setFailed(error.message);
  }
}

export default issueToJson();
