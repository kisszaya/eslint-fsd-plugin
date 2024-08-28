import { ProjectStructureSchema } from "../../../types";

export const PROJECT_STRUCTURE: ProjectStructureSchema = {
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
    assets: {
      images: 1,
      icons: 1,
    },
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

export const BASE_OPTIONS = [
  {
    alias: "@/",
    projectStructure: PROJECT_STRUCTURE,
  },
];
export const BASE_ALIAS = BASE_OPTIONS[0].alias;
