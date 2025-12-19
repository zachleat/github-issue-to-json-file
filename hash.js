import { createHash } from "node:crypto";

function base64ToBase64Url(hashString = "") {
	return hashString.replace(/[=\+\/]/g, function(match) {
		if(match === "=") {
			return "";
		}
		if(match === "+") {
			return "-";
		}
		return "_";
	});
}

export function getBase64UrlHash(content) {
  let hash = createHash("sha256");
  hash.update(url);

  return base64ToBase64Url(hash.digest("base64"));
}
