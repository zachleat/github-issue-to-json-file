import test from "ava";
import followRedirects from "follow-url-redirects";
import normalizeUrl from "normalize-url";
import { cleanupUrl } from "../cleanup-url.js";

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
