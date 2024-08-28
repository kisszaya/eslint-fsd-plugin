import { ESLintUtils } from "@typescript-eslint/utils";
import { SCHEMA, SchemaOptions } from "./schema";
import {
  getAbsoluteImportPathElems,
  getFilenamePattern,
  isAbsolute,
} from "./helpers";
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

        const checker = new PublicApiImportsChecker(alias, projectStructure);

        const isAbsolutePath = isAbsolute({
          importPath,
          alias,
          projectStructure,
        });

        if (!isAbsolutePath) {
          return;
        }

        if (checker.isPublicApiImportsViolated({ importPath })) {
          return context.report({
            node,
            messageId:
              MessageIds.ISSUE_ABSOLUTE_IMPORT_SHOULD_BE_FROM_PUBLIC_API,
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

  isPublicApiImportsViolated({ importPath }: { importPath: string }) {
    const importPathElems = getAbsoluteImportPathElems({
      importPath,
      alias: this.alias,
    });
    const pattern = getFilenamePattern({
      filenameElems: importPathElems,
      projectStructure: this.projectStructure,
    });
    if (importPathElems.length > pattern.length) {
      return true;
    }
    return false;
  }
}
