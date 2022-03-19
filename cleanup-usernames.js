export function cleanupUsernames(str, prefix) {
  return str.split(" ").map(name => {
      return name.trim().replace(/\,/g, "");
    })
    .filter(name => !!name)
    .map(name => {
      let withoutAt = name.startsWith("@") ? name.substring(1) : name;
      return `${prefix || ""}${withoutAt}`;
    });
};