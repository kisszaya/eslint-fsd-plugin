import { RuleMetaData } from "@typescript-eslint/utils/ts-eslint";

export const RULES: any = {
  app: 1,
  pages: {
    "**": 1,
  },
  layouts: {
    "**": 1,
  },
  widgets: {
    "**": 1,
  },
  features: {
    "**": 1,
  },
  entities: {
    "**": 1,
  },
  shared: {
    api: 1,
    assets: 1,
    config: 1,
    consts: 1,
    init: 1,
    routing: 1,
    types: 1,
    ui: {
      "**": 1,
    },
    lib: {
      "**": 1,
    },
    viewer: 1,
  },
};

export const SCHEMA: RuleMetaData<"", unknown>["schema"] = [
  {
    type: "object",
    properties: {
      alias: {
        type: "string",
      },
    },
  },
];

export const LAYER_SET = new Set(Object.keys(RULES));
