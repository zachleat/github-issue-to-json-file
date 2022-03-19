import { readFile } from "node:fs/promises";

import yaml from "js-yaml";

import { cleanupUrl } from "./cleanup-url.js";

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

  console.log( { fields, bodyData } );

  let returnObject = {};
  for(let j = 0, k = bodyData.length; j<k; j++) {
    if(!fields[j]) {
      continue;
    }

    let entry = bodyData[j];
    // Clean up GitHub usernames
    let fieldLabel = fields[j] && fields[j].attributes && fields[j].attributes.label;
    if(fieldLabel && (fieldLabel.toLowerCase().endsWith("(github usernames)") || fieldLabel.toLowerCase().endsWith("(twitter usernames)"))) {
      entry = entry.split(" ").map(name => {
        return removeNewLines(name).trim().replace(/\,/g, "");
      }).filter(name => !!name).map(name => {
        return name.startsWith("@") ? name.substring(1) : name;
      });
    }

    if(fieldLabel && fieldLabel.toLowerCase() === "url" || fields[j].id === "url" || fields[j].id.endsWith("_url") || fields[j].id.startsWith("url_")) {
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