import { ESLintUtils } from "@typescript-eslint/utils";
import { SCHEMA, SchemaOptions } from "./schema";
import { getAbsoluteImportPathElems, getPattern, isAbsolute } from "./helpers";
import { ProjectStructureSchema } from "../../types";

export enum MessageIds {
  ISSUE_ABSOLUTE_IMPORT_SHOULD_BE_FROM_PUBLIC_API = "issue:public-api",
}

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://example.com/rule/${name}`,
);

export const fsdAbsolutePublicApiImports = createRule<
  SchemaOptions[],
  MessageIds
>({
  name: "absolute-public-api-imports",
  meta: {
    fixable: "code",
    docs: {
      description:
        "Absolute imports should be only from public api, not inside module",
    },
    type: "problem",
    messages: {
      [MessageIds.ISSUE_ABSOLUTE_IMPORT_SHOULD_BE_FROM_PUBLIC_API]:
        "Absolute import should be from public api",
    },
    schema: SCHEMA,
  },
  defaultOptions: [],
  create: (context) => {
    const alias = context.options[0].alias || "";
    const projectStructure = context.options[0].projectStructure;

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        const filename = context.physicalFilename;

        if (!filename.includes('/src/') && !filename.includes('\\src\\')) {
          return;
        }

        const checker = new PublicApiImportsChecker(alias, projectStructure);

        const isAbsolutePath = isAbsolute({
          importPath,
          alias,
          projectStructure,
        });

        if (!isAbsolutePath) {
          return;
        }

        const { isViolated, requiredPath } =
          checker.checkPublicApiImportsViolated({
            importPath,
          });

        if (isViolated) {
          return context.report({
            node,
            messageId:
              MessageIds.ISSUE_ABSOLUTE_IMPORT_SHOULD_BE_FROM_PUBLIC_API,
            fix: (fixer) => {
              return fixer.replaceText(node.source, requiredPath ?? "");
            },
          });
        }
      },
    };
  },
});

class PublicApiImportsChecker {
  private readonly alias: string;
  private readonly projectStructure: ProjectStructureSchema;

  constructor(alias: string, projectStructure: ProjectStructureSchema) {
    this.alias = alias;
    this.projectStructure = projectStructure;
  }

  checkPublicApiImportsViolated({ importPath }: { importPath: string }): {
    isViolated: boolean;
    requiredPath?: string;
  } {
    const importPathElems = getAbsoluteImportPathElems({
      importPath,
      alias: this.alias,
    });
    const pattern = getPattern({
      elems: importPathElems,
      projectStructure: this.projectStructure,
    });
    if (importPathElems.length > pattern.length) {
      return {
        isViolated: true,
        requiredPath: this.getRequiredPath({ pattern, importPathElems }),
      };
    }
    return {
      isViolated: false,
    };
  }

  getRequiredPath({
    importPathElems,
    pattern,
  }: {
    pattern: string[];
    importPathElems: string[];
  }) {
    return `'${this.alias + importPathElems.slice(0, pattern.length).join("/")}'`;
  }
}
