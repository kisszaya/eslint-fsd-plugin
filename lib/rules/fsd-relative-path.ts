import { ESLintUtils } from "@typescript-eslint/utils";
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

        const isRelativePath = isRelative(importPath);
        const isAbsolutePath = !isRelativePath;

        if (isRelativePath && shouldBeAbsolute({ filename, importPath })) {
          return context.report({
            node,
            messageId: MessageIds.ISSUE_SHOULD_BE_ABSOLUTE,
          });
        }

        if (isAbsolutePath && shouldBeRelative({ filename, importPath })) {
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

enum LAYER {
  SHARED = "shared",
  ENTITIES = "entities",
  FEATURES = "features",
  WIDGETS = "widgets",
  PAGES = "page",
  APP = "app",
}
const LAYERS_ARR = new Set([
  "shared",
  "entities",
  "features",
  "widgets",
  "page",
  "app",
]);

const RULES = {
  app: 1,
  pages: {
    "**": 1,
  },
  layouts: {
    "**": 1,
  },
  features: {
    "**": 1,
  },
  entities: {
    "**": 1,
  },
  shared: {
    ui: {
      "**": 1,
    },
    lib: {
      "**": 1,
    },
    viewer: 1,
  },
};
// 1. делаем настройку файлов.
// Три уровня по вложенности внутрь.
// Если 1 уровень: проверка только по layer
// Если 2 уровень: проверка только по layer и slice
// Если 3 уровень то проверка по трем штукам

type Params = {
  filename: string;
  importPath: string;
};

// importPath '${ABSOLUTE_ALIAS}app/styles/index.ts'
// filename "home/projects/src/app/index.ts",
// 1. Получаем массив importPathElems, получаем массив filenameElems
function shouldBeRelative({ filename, importPath }: Params): boolean {
  const importPathWithoutAlias = importPath.slice(ABSOLUTE_ALIAS.length);
  const [importLayer, importSlice] = importPathWithoutAlias.split("/");

  if (!importLayer || !importSlice || !LAYERS_ARR.has(importLayer)) {
    return false;
  }

  const { filenameSlice, filenameLayer } = getFilenameLayerSlice(filename);

  if (!filenameLayer) {
    return false;
  }

  const filenameContainSlice = isFilenameShouldContainSlice(filenameLayer);

  if (filenameContainSlice && !filenameSlice) {
    return false;
  }

  if (
    filenameContainSlice &&
    filenameLayer === importLayer &&
    importSlice === filenameSlice
  ) {
    return true;
  }

  if (!filenameContainSlice && filenameLayer === importLayer) {
    return true;
  }

  return false;
}

function shouldBeAbsolute({ filename, importPath }: Params): boolean {
  if (!importPath.startsWith("../")) {
    return false;
  }
  const importWithoutRelative = removeRelativePath(importPath);
  const [importLayer, importSlice] = importWithoutRelative.split("/");

  if (!importLayer || !importSlice || !LAYERS_ARR.has(importLayer)) {
    return false;
  }

  const { filenameSlice, filenameLayer } = getFilenameLayerSlice(filename);

  if (!filenameLayer) {
    return false;
  }
  const filenameContainSlice = isFilenameShouldContainSlice(filenameLayer);
  if (filenameContainSlice && !filenameSlice) {
    return false;
  }

  if (
    filenameContainSlice &&
    (filenameSlice !== importSlice || filenameLayer !== importLayer)
  ) {
    return true;
  }

  if (!filenameContainSlice && filenameLayer !== importLayer) {
    return true;
  }

  return false;
}

function isFilenameShouldContainSlice(filenameLayer: LAYER) {
  if (filenameLayer === LAYER.APP) {
    return false;
  }
  return true;
}

function getFilenameLayerSlice(filename: string): {
  filenameLayer: LAYER | null;
  filenameSlice: string | null;
} {
  const normalizedFilename = normalizeFilename(filename);
  const filenameElems = normalizedFilename
    .split(ALIAS_START_PATH)[1]
    .split("/");
  const filenameLayer = filenameElems[0] ?? null;
  const filenameSlice = filenameElems[1] ?? null;

  return {
    filenameSlice,
    filenameLayer: LAYERS_ARR.has(filenameLayer)
      ? (filenameLayer as LAYER)
      : null,
  };
}

function removeRelativePath(path: string) {
  if (path.startsWith("../")) {
    return removeRelativePath(path.slice(3));
  }
  return path;
}

function isRelative(importPath: string) {
  return (
    importPath === "." ||
    importPath === ".." ||
    importPath.startsWith("./") ||
    importPath.startsWith("../")
  );
}

function normalizeFilename(filename: string) {
  const normalized = path.normalize(filename).replace(/\\/g, "/");
  return normalized.split(path.sep).join(path.posix.sep);
}
