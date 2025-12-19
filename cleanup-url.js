import normalizeUrl from "normalize-url";

async function followRedirects(url) {
  let response = await fetch(url, {
    // 5 second timeout
    signal: AbortSignal.timeout(15000),
  });
  return response.url;
}

export async function cleanupUrl(url) {
  if(!url || !(url || "").trim()) {
    return "";
  }

  let normalized;
  try {
    // Only run normalizedUrl on invalid urls, fixes https://github.com/11ty/11ty-community/issues/72
    new URL(url);
    normalized = url;
  } catch(e) {
    normalized = normalizeUrl(url, {
      defaultProtocol: "http:"
    });
  }

  let u = await followRedirects(normalized);

  return u;
}