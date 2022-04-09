import normalizeUrl from "normalize-url";
import followRedirects from "follow-url-redirects";

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

  let urls = await followRedirects(normalized, {
    timeout: 5000,
    maxRedirects: 5,
  });

  // console.log( {normalized, urls} );

  return (urls.pop()).url;
}