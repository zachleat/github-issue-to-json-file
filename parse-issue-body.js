import { readFile } from "node:fs/promises";

import yaml from "js-yaml";

import { cleanupUrl } from "./cleanup-url.js";
import { cleanupUsernames } from "./cleanup-usernames.js";

function removeNewLines(str) {
  return str.replace(/[\r\n]*/g, "");
}
function normalizeNewLines(str) {
  return str.replace(/\r\n/g, "\n");
}

export async function parseIssueBody(githubIssueTemplateFile, body) {
  let issueTemplate = await readFile(githubIssueTemplateFile, "utf8");
  let githubFormData = yaml.load(issueTemplate);

  // Markdown fields aren’t included in output body
  let fields = githubFormData.body.filter(field => field.type !== "markdown");

  // Warning: this will likely not handle new lines in a textarea field input
  let bodyData = normalizeNewLines(body).split("\n").filter(entry => {
    return !!entry && !entry.startsWith("###")
  }).map(entry => {
    entry = entry.trim();

    return entry === "_No response_" ? "" : entry;
  });

  // console.log( { fields, bodyData } );

  let returnObject = {};
  for(let j = 0, k = bodyData.length; j<k; j++) {
    if(!fields[j]) {
      continue;
    }

    let entry = bodyData[j];
    let attributes = fields[j] && fields[j].attributes || {};
    // let fieldLabel = attributes.label || "";
    let fieldDescription =  attributes.description || "";

    // Clean up GitHub or Twitter usernames (strip out commas, convert to array, remove @ prefixes)
    if(fieldDescription.includes("[parser:usernames]")) {
      entry = cleanupUsernames(removeNewLines(entry));
    }

    // Normalize urls (add protocol, follow redirects)
    if(fieldDescription.includes("[parser:url]")) {
      entry = removeNewLines(entry);
      console.log( "About to cleanup URL: ", { entry } );
      entry = await cleanupUrl(entry);
    }

    // Only supports a single checkbox (for now)
    if(fields[j].type === "checkboxes") {
      entry = removeNewLines(entry);
      // Convert to Boolean
      entry = entry.startsWith("- [X]");
    }

    returnObject[fields[j].id] = entry;
  }

  console.log( { returnObject } );
  return returnObject;
}