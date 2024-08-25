import { LAYER_SET, RULES } from "./const";

export function isAbsolute({
  alias,
  importPath,
}: {
  importPath: string;
  alias: string;
}) {
  if (!importPath.startsWith(alias)) {
    return false;
  }
  const layer = importPath.slice(alias.length).split("/")[0];
  return LAYER_SET.has(layer);
}

/**
 * Get passed filename Pattern
 * @example filenameElems: ["pages", "page-name", "ui", "index.ts"] --> ["pages", "**"]
 */
export function getFilenamePattern(filenameElems: string[]): string[] {
  const pattern: string[] = [];
  let rules = RULES;
  for (let elem of filenameElems) {
    if (rules[elem]) {
      pattern.push(elem);

      if (rules[elem] === 1) {
        break;
      } else {
        rules = rules[elem];
      }
    } else if (Boolean(rules["**"])) {
      pattern.push("**");

      if (rules?.["**"] === 1) {
        break;
      } else {
        rules = rules[elem];
      }
    }
  }
  return pattern;
}
