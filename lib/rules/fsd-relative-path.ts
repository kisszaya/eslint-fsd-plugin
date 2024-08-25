import { ESLintUtils } from "@typescript-eslint/utils";
import { LAYER_SET, RULES, SCHEMA } from "./const";
import path from "path";
import { getFilenamePattern, isAbsolute } from "./helpers";

export enum MessageIds {
  ISSUE_SHOULD_BE_RELATIVE = "issue:relative",
  ISSUE_SHOULD_BE_ABSOLUTE = "issue:absolute",
}

interface Options {
  alias?: string;
}

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://example.com/rule/${name}`,
);

export const fsdRelativePath = createRule<Options[], MessageIds>({
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
    schema: SCHEMA,
  },
  defaultOptions: [],
  create: (context) => {
    const alias = context.options[0].alias || "";

    return {
      ImportDeclaration(node) {
        const filename = context.physicalFilename;
        const importPath = node.source.value;

        const checker = new RelativePathChecker(alias);

        const isRelativePath = checker.isRelative(importPath);
        const isAbsolutePath = isAbsolute({ importPath, alias });

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

// export const ABSOLUTE_ALIAS = "@/";
export const ALIAS_START_PATH = "src/";

type Params = {
  filename: string;
  importPath: string;
};

class RelativePathChecker {
  private readonly alias: string;

  constructor(alias: string) {
    this.alias = alias;
  }

  isRelative(importPath: string) {
    return (
      importPath === "." ||
      importPath === ".." ||
      importPath.startsWith("./") ||
      importPath.startsWith("../")
    );
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
    const pattern = getFilenamePattern(filenameElems);
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
    const pattern = getFilenamePattern(filenameElems);
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

    for (let i = 0; i < pattern.length; i++) {
      isTheSamePattern = filenameElems[i] === importPathElems[i];
      if (!isTheSamePattern) {
        break;
      }
    }

    return isTheSamePattern;
  }

  private getAbsoluteImportPathElems(importPath: string) {
    const importPathWithoutAlias = importPath.slice(this.alias.length);
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
