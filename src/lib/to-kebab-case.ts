export const toKebabCase = (str = ""): string =>
  str
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
    .split(" ")
    .join("-")
    .split("_")
    .join("-");
