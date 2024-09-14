import { ALIAS_START_PATH } from "./schema";
import path from "path";
import { ProjectStructureSchema } from "../../types";

export function isLayer({
  path,
  projectStructure,
}: {
  path: string;
  projectStructure: ProjectStructureSchema;
}) {
  return new Set(Object.keys(projectStructure)).has(path);
}

export function isAbsolute({
  alias,
  importPath,
  projectStructure,
}: {
  importPath: string;
  alias: string;
  projectStructure: ProjectStructureSchema;
}) {
  if (!importPath.startsWith(alias)) {
    return false;
  }
  const layer = importPath.slice(alias.length).split("/")[0];
  return isLayer({ path: layer, projectStructure });
}

/**
 * Get passed filename Pattern
 * @example filenameElems: ["pages", "page-name", "ui", "index.ts"] --> ["pages", "**"]
 */
export function getPattern({
  elems,
  projectStructure,
}: {
  elems: string[];
  projectStructure: ProjectStructureSchema;
}): string[] {
  const pattern: string[] = [];
  let structure: any = projectStructure;
  for (let elem of elems) {
    if (structure[elem]) {
      pattern.push(elem);

      if (structure[elem] === 1) {
        break;
      } else {
        structure = structure[elem];
      }
    } else if (Boolean(structure["**"])) {
      pattern.push("**");

      if (structure?.["**"] === 1) {
        break;
      } else {
        structure = structure[elem];
      }
    }
  }
  return pattern;
}

export function getFilenameElems({ filename }: { filename: string }) {
  const normalizedFilename = normalizePath(filename);
  return normalizedFilename.split(ALIAS_START_PATH)[1].split("/");
}

export function normalizePath(filename: string) {
  const normalized = path.normalize(filename).replace(/\\/g, "/");
  return normalized.split(path.sep).join(path.posix.sep);
}

export function getAbsoluteImportPathElems({
  importPath,
  alias,
}: {
  importPath: string;
  alias: string;
}) {
  const importPathWithoutAlias = importPath.slice(alias.length);
  return importPathWithoutAlias.split("/");
}
