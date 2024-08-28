import { ESLintUtils } from "@typescript-eslint/utils";
import { ALIAS_START_PATH, SCHEMA, SchemaOptions } from "./schema";
import path from "path";
import {
  getAbsoluteImportPathElems,
  getFilenameElems,
  getFilenamePattern,
  isAbsolute,
  normalizePath,
} from "./helpers";
import { ProjectStructureSchema } from "../../types";

export enum MessageIds {
  ISSUE_SHOULD_BE_RELATIVE = "issue:relative",
  ISSUE_SHOULD_BE_ABSOLUTE = "issue:absolute",
}

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://example.com/rule/${name}`,
);

export const fsdRelativePath = createRule<SchemaOptions[], MessageIds>({
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
    const projectStructure = context.options[0].projectStructure;

    return {
      ImportDeclaration(node) {
        const filename = context.physicalFilename;
        const importPath = node.source.value;

        const checker = new RelativePathChecker(alias, projectStructure);

        const isRelativePath = checker.isRelative(importPath);
        const isAbsolutePath = isAbsolute({
          importPath,
          alias,
          projectStructure,
        });

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

type Params = {
  filename: string;
  importPath: string;
};

class RelativePathChecker {
  private readonly alias: string;
  private readonly projectStructure: ProjectStructureSchema;

  constructor(alias: string, projectStructure: ProjectStructureSchema) {
    this.alias = alias;
    this.projectStructure = projectStructure;
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
    const filenameElems = getFilenameElems({ filename });
    const pattern = getFilenamePattern({
      filenameElems,
      projectStructure: this.projectStructure,
    });
    const isTheSamePattern = this.checkPattern({
      pattern,
      importPathElems,
      filenameElems,
    });
    return !isTheSamePattern;
  }

  shouldBeRelative({ filename, importPath }: Params): boolean {
    const importPathElems = getAbsoluteImportPathElems({
      importPath,
      alias: this.alias,
    });
    const filenameElems = getFilenameElems({ filename });
    const pattern = getFilenamePattern({
      filenameElems,
      projectStructure: this.projectStructure,
    });
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

  private getRelativeImportPathElems({
    filename,
    importPath,
  }: {
    importPath: string;
    filename: string;
  }) {
    const normalizedImportPath = filename.includes("\\")
      ? normalizePath(
          path.win32.resolve(path.win32.dirname(filename), importPath),
        )
      : normalizePath(
          path.win32.resolve(path.win32.dirname(filename), importPath),
        );

    return normalizedImportPath.split(ALIAS_START_PATH)[1].split("/");
  }
}
