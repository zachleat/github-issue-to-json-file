import test from "ava";
import followRedirects from "follow-url-redirects";
import normalizeUrl from "normalize-url";
import { cleanupUrl } from "../cleanup-url.js";
import { cleanupUsernames } from "../cleanup-usernames.js";
import { parseIssueBody } from "../parse-issue-body.js";

test("Test redirect lib", async t => {
  let results = await followRedirects("http://11ty.dev", {
    timeout: 5000,
    maxRedirects: 5,
  });

  t.is(results.pop().url, "https://www.11ty.dev/");
});

test("Test normalize url lib", async t => {
  let normalized = normalizeUrl("11ty.dev", {
    defaultProtocol: "http:"
  });

  t.is(normalized, "http://11ty.dev");
});

test("Test both together url lib", async t => {
  let normalized = await cleanupUrl("11ty.dev");

  t.is(normalized, "https://www.11ty.dev/");
});

test("Test normalize empty URL", async t => {
  let normalized = await cleanupUrl("");
  
  t.is(normalized, "");
});

test("Test parse body", async t => {
  let body = `### Site URL  

netlify.com

### Exclude from Leaderboards?

- [X] Excluded

### Source code URL

_No response_

### Authors (GitHub usernames)

@zachleat,    pdehaan

### Super Professional Business Network CTA URL

_No response_

### Super Professional Business Network Company Name

_No response_`;

  let result = await parseIssueBody("./test/sample-issue-template.yml", body);
  t.is(result.url, "https://www.netlify.com/");
  t.is(result.leaderboard_excluded, true);
  t.deepEqual(result.authors, ["zachleat", "pdehaan"]);
});

test("Cleanup usernames", async t => {
  t.deepEqual(cleanupUsernames(""), []);
  t.deepEqual(cleanupUsernames("zachleat"), ["zachleat"]);
  t.deepEqual(cleanupUsernames("@zachleat"), ["zachleat"]);
  t.deepEqual(cleanupUsernames("@zachleat, @pdehaan"), ["zachleat", "pdehaan"]);
  t.deepEqual(cleanupUsernames("@zachleat @pdehaan"), ["zachleat", "pdehaan"]);
  t.deepEqual(cleanupUsernames("zachleat @pdehaan"), ["zachleat", "pdehaan"]);
  t.deepEqual(cleanupUsernames("zachleat pdehaan"), ["zachleat", "pdehaan"]);
  t.deepEqual(cleanupUsernames("zachleat, pdehaan"), ["zachleat", "pdehaan"]);
});

test("Cleanup usernames with prefix", async t => {
  t.deepEqual(cleanupUsernames("", "github:"), []);
  t.deepEqual(cleanupUsernames("", "twitter:"), []);
  t.deepEqual(cleanupUsernames("zachleat", "github:"), ["github:zachleat"]);
  t.deepEqual(cleanupUsernames("@zachleat", "github:"), ["github:zachleat"]);
  t.deepEqual(cleanupUsernames("zachleat", "twitter:"), ["twitter:zachleat"]);
  t.deepEqual(cleanupUsernames("@zachleat", "twitter:"), ["twitter:zachleat"]);
});
