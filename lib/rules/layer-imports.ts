import { ESLintUtils } from "@typescript-eslint/utils";
import {ALIAS_START_PATH, SCHEMA, SchemaOptions} from "./schema";
import {
  getAbsoluteImportPathElems,
  getFilenameElems,
  isAbsolute,
  isLayer, normalizePath,
} from "./helpers";
import { ProjectStructureSchema } from "../../types";

export enum MessageIds {
  ISSUE_LAYER_IMPORTS = "issue:layer-imports",
}

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://example.com/rule/${name}`,
);

export const layerImports = createRule<SchemaOptions[], MessageIds>({
  name: "layer-imports",
  meta: {
    docs: {
      description:
        "Modules on one layer can only interact with modules from the layers strictly below",
    },
    type: "problem",
    messages: {
      [MessageIds.ISSUE_LAYER_IMPORTS]:
        "Modules on one layer can only interact with modules from the layers strictly below",
    },
    schema: SCHEMA,
  },
  defaultOptions: [],
  create: (context) => {
    const alias = context.options[0].alias || "";
    const projectStructure = context.options[0].projectStructure;
    const srcPath = context.options[0].srcPath || ALIAS_START_PATH;

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        const filename = context.physicalFilename;
        const normalizedFilename = normalizePath(filename)

        if (!normalizedFilename.includes(srcPath)) {
          return;
        }

        const checker = new LayerImportsChecker(alias, projectStructure, srcPath);

        const isAbsolutePath = isAbsolute({
          importPath,
          alias,
          projectStructure,
        });

        if (!isAbsolutePath) {
          return;
        }

        if (checker.isLayerImportsViolated({ importPath, filename })) {
          return context.report({
            node,
            messageId: MessageIds.ISSUE_LAYER_IMPORTS,
          });
        }
      },
    };
  },
});

class LayerImportsChecker {
  private readonly alias: string;
  private readonly projectStructure: ProjectStructureSchema;
  private readonly srcPath: string;

  constructor(alias: string, projectStructure: ProjectStructureSchema, srcPath: string) {
    this.alias = alias;
    this.srcPath = srcPath;
    this.projectStructure = projectStructure;
  }

  isLayerImportsViolated({
    importPath,
    filename,
  }: {
    importPath: string;
    filename: string;
  }) {
    const importPathElems = getAbsoluteImportPathElems({
      importPath,
      alias: this.alias,
    });
    const filenameElems = getFilenameElems({ filename, srcPath: this.srcPath });

    const importPathLayer = importPathElems[0];
    const filenameLayer = filenameElems[0];

    if (
      !importPathLayer ||
      !filenameLayer ||
      !isLayer({
        path: importPathLayer,
        projectStructure: this.projectStructure,
      }) ||
      !isLayer({ path: filenameLayer, projectStructure: this.projectStructure })
    ) {
      return false;
    }

    const layerKeys = Object.keys(this.projectStructure);

    const importPathLayerIndex = layerKeys.findIndex(
      (layer) => importPathLayer === layer,
    );
    const filenameLayerIndex = layerKeys.findIndex(
      (layer) => filenameLayer === layer,
    );

    const isRuleViolated = importPathLayerIndex < filenameLayerIndex;
    if (isRuleViolated) {
      return true;
    }

    return false;
  }
}
