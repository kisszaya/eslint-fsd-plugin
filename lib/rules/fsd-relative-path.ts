import { ESLintUtils } from "@typescript-eslint/utils";
import { LAYER_SET, RULES } from "./const";
import path from "path";

export enum MessageIds {
  ISSUE_SHOULD_BE_RELATIVE = "issue:relative",
  ISSUE_SHOULD_BE_ABSOLUTE = "issue:absolute",
}

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://example.com/rule/${name}`,
);

export const fsdRelativePath = createRule<unknown[], MessageIds>({
  name: "fsd-relative-path",
  meta: {
    docs: {
      description: "Imports within one slice should be relative",
    },
    type: "problem",
    messages: {
      [MessageIds.ISSUE_SHOULD_BE_RELATIVE]: "Import should be relative",
      [MessageIds.ISSUE_SHOULD_BE_ABSOLUTE]: "Import should be absolute",
    },
    schema: [],
  },
  defaultOptions: [],
  create: (context) => {
    return {
      ImportDeclaration(node) {
        const filename = context.physicalFilename;
        const importPath = node.source.value;

        const checker = new RelativePathChecker();

        const isRelativePath = checker.isRelative(importPath);
        const isAbsolutePath = checker.isAbsolute(importPath);

        if (!isRelativePath && !isAbsolutePath) {
          return;
        }

        if (
          isRelativePath &&
          checker.shouldBeAbsolute({ filename, importPath })
        ) {
          return context.report({
            node,
            messageId: MessageIds.ISSUE_SHOULD_BE_ABSOLUTE,
          });
        }

        if (
          isAbsolutePath &&
          checker.shouldBeRelative({ filename, importPath })
        ) {
          return context.report({
            node,
            messageId: MessageIds.ISSUE_SHOULD_BE_RELATIVE,
          });
        }
      },
    };
  },
});

export const ABSOLUTE_ALIAS = "@/";
export const ALIAS_START_PATH = "src/";

type Params = {
  filename: string;
  importPath: string;
};

class RelativePathChecker {
  isRelative(importPath: string) {
    return (
      importPath === "." ||
      importPath === ".." ||
      importPath.startsWith("./") ||
      importPath.startsWith("../")
    );
  }

  isAbsolute(importPath: string) {
    if (!importPath.startsWith(ABSOLUTE_ALIAS)) {
      return false;
    }
    const layer = importPath.slice(2).split("/")[0];
    return LAYER_SET.has(layer);
  }

  shouldBeAbsolute({ filename, importPath }: Params): boolean {
    if (!importPath.startsWith("../")) {
      return false;
    }

    const importPathElems = this.getRelativeImportPathElems({
      importPath,
      filename,
    });
    const filenameElems = this.getFilenameElems(filename);
    const pattern = this.getPattern(filenameElems);
    const isTheSamePattern = this.checkPattern({
      pattern,
      importPathElems,
      filenameElems,
    });
    return !isTheSamePattern;
  }

  shouldBeRelative({ filename, importPath }: Params): boolean {
    const importPathElems = this.getAbsoluteImportPathElems(importPath);
    const filenameElems = this.getFilenameElems(filename);
    const pattern = this.getPattern(filenameElems);
    const isTheSamePattern = this.checkPattern({
      pattern,
      importPathElems,
      filenameElems,
    });
    return isTheSamePattern;
  }

  private checkPattern({
    pattern,
    importPathElems,
    filenameElems,
  }: {
    pattern: string[];
    importPathElems: string[];
    filenameElems: string[];
  }): boolean {
    let isTheSamePattern = true;

    pattern.forEach((patternPart, index) => {
      isTheSamePattern = filenameElems[index] === importPathElems[index];
    });

    return isTheSamePattern;
  }

  private getPattern(filenameElems: string[]): string[] {
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

  private getAbsoluteImportPathElems(importPath: string) {
    const importPathWithoutAlias = importPath.slice(ABSOLUTE_ALIAS.length);
    return importPathWithoutAlias.split("/");
  }

  private getRelativeImportPathElems({
    filename,
    importPath,
  }: {
    importPath: string;
    filename: string;
  }) {
    const normalizedImportPath = filename.includes("\\")
      ? this.normalizePath(
          path.win32.resolve(path.win32.dirname(filename), importPath),
        )
      : this.normalizePath(
          path.win32.resolve(path.win32.dirname(filename), importPath),
        );

    return normalizedImportPath.split(ALIAS_START_PATH)[1].split("/");
  }

  private getFilenameElems(filename: string) {
    const normalizedFilename = this.normalizePath(filename);
    return normalizedFilename.split(ALIAS_START_PATH)[1].split("/");
  }

  private normalizePath(filename: string) {
    const normalized = path.normalize(filename).replace(/\\/g, "/");
    return normalized.split(path.sep).join(path.posix.sep);
  }
}
