import { ESLintUtils } from "@typescript-eslint/utils";
import { ALIAS_START_PATH, SCHEMA, SchemaOptions } from "./schema";
import path from "path";
import {
  getAbsoluteImportPathElems,
  getFilenameElems,
  getPattern,
  isAbsolute,
  isLayer,
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
    fixable: "code",
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
    const srcPath = context.options[0].srcPath || ALIAS_START_PATH;
    const projectStructure = context.options[0].projectStructure;

    return {
      ImportDeclaration(node) {
        const filename = context.physicalFilename;
        const importPath = node.source.value;
        const normalizedFilename = normalizePath(filename)

        if (!normalizedFilename.includes(srcPath)) {
          return;
        }

        const checker = new RelativePathChecker(alias, projectStructure, srcPath);

        const isRelativePath = checker.isRelative(importPath);
        const isAbsolutePath = isAbsolute({
          importPath,
          alias,
          projectStructure,
        });

        if (!isRelativePath && !isAbsolutePath) {
          return;
        }

        const { requiredPath: requiredAbsolutePath, shouldBeAbsolute } =
          checker.shouldBeAbsolute({
            filename,
            importPath,
          });
        if (isRelativePath && shouldBeAbsolute) {
          return context.report({
            node,
            messageId: MessageIds.ISSUE_SHOULD_BE_ABSOLUTE,
            fix: (fixer) => {
              return fixer.replaceText(node.source, requiredAbsolutePath ?? "");
            },
          });
        }

        const { requiredPath: requiredRelativePath, shouldBeRelative } =
          checker.shouldBeRelative({ filename, importPath });
        if (isAbsolutePath && shouldBeRelative) {
          return context.report({
            node,
            messageId: MessageIds.ISSUE_SHOULD_BE_RELATIVE,
            fix: (fixer) => {
              return fixer.replaceText(node.source, requiredRelativePath ?? "");
            },
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
  private readonly srcPath: string;
  private readonly projectStructure: ProjectStructureSchema;

  constructor(alias: string, projectStructure: ProjectStructureSchema, srcPath: string ) {
    this.alias = alias;
    this.srcPath = srcPath;
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

  shouldBeAbsolute({ filename, importPath }: Params): {
    shouldBeAbsolute: boolean;
    requiredPath?: string;
  } {
    if (!importPath.startsWith("../")) {
      return { shouldBeAbsolute: false };
    }

    const importPathElems = this.getRelativeImportPathElems({
      importPath,
      filename,
    });
    const importPathPattern = getPattern({
      elems: importPathElems,
      projectStructure: this.projectStructure,
    });

    const filenameElems = getFilenameElems({ filename, srcPath: this.srcPath });
    const filenamePattern = getPattern({
      elems: filenameElems,
      projectStructure: this.projectStructure,
    });

    const isTheSamePattern = this.checkPattern({
      pattern: filenamePattern,
      importPathElems,
      filenameElems,
    });

    if (isTheSamePattern) {
      return { shouldBeAbsolute: false };
    }

    return {
      shouldBeAbsolute: true,
      requiredPath: this.getRequiredAbsolutePath({
        importPathPattern,
        importPathElems,
      }),
    };
  }

  getRequiredAbsolutePath({
    importPathElems,
    importPathPattern,
  }: {
    importPathPattern: string[];
    importPathElems: string[];
  }) {
    return `'${this.alias + importPathElems.slice(0, importPathPattern.length).join("/")}'`;
  }

  shouldBeRelative({ filename, importPath }: Params): {
    shouldBeRelative: boolean;
    requiredPath?: string;
  } {
    const importPathElems = getAbsoluteImportPathElems({
      importPath,
      alias: this.alias,
    });
    const filenameElems = getFilenameElems({ filename, srcPath: this.srcPath });
    const pattern = getPattern({
      elems: filenameElems,
      projectStructure: this.projectStructure,
    });
    const isTheSamePattern = this.checkPattern({
      pattern,
      importPathElems,
      filenameElems,
    });

    if (!isTheSamePattern) {
      return {
        shouldBeRelative: false,
      };
    }
    return {
      shouldBeRelative: true,
      requiredPath: this.getRequiredRelativePath({
        importPathElems,
        filenameElems,
      }),
    };
  }

  getRequiredRelativePath({
    importPathElems,
    filenameElems,
  }: {
    filenameElems: string[];
    importPathElems: string[];
  }) {
    let result = path.relative(
      path.dirname(path.join(...filenameElems)),
      path.join(...importPathElems),
    );

    if (!result.startsWith("..")) {
      return `'./${result}'`;
    }
    return `'${result}'`;
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

    return normalizedImportPath.split(this.srcPath)[1].split("/");
  }
}
