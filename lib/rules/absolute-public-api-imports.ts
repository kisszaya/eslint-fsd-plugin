import { ESLintUtils } from "@typescript-eslint/utils";
import { RULES, SCHEMA } from "./const";
import { getFilenamePattern, isAbsolute } from "./helpers";

export enum MessageIds {
  ISSUE_ABSOLUTE_IMPORT_SHOULD_BE_FROM_PUBLIC_API = "issue:public-api",
}

interface Options {
  alias?: string;
}

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://example.com/rule/${name}`,
);

export const fsdAbsolutePublicApiImports = createRule<Options[], MessageIds>({
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

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;

        const checker = new PublicApiImportsChecker(alias);

        const isAbsolutePath = isAbsolute({ importPath, alias });

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

  constructor(alias: string) {
    this.alias = alias;
  }

  isPublicApiImportsViolated({ importPath }: { importPath: string }) {
    const importPathElems = this.getAbsoluteImportPathElems(importPath);
    const pattern = getFilenamePattern(importPathElems);
    if (importPathElems.length > pattern.length) {
      return true;
    }
    return false;
  }

  private getAbsoluteImportPathElems(importPath: string) {
    const importPathWithoutAlias = importPath.slice(this.alias.length);
    return importPathWithoutAlias.split("/");
  }
}
