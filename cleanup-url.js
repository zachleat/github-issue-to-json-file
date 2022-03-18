import normalizeUrl from "normalize-url";
import followRedirects from "follow-url-redirects";

export async function cleanupUrl(url) {
  if(!url) {
    return "";
  }

  let normalized = normalizeUrl(url, {
    defaultProtocol: "http:"
  });

  let urls = await followRedirects(normalized, {
    timeout: 5000,
    maxRedirects: 5,
  });

  return (urls.pop()).url;
}