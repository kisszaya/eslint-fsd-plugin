import { fsdRelativePath } from "./fsd-relative-path";
import { fsdAbsolutePublicApiImports } from "./absolute-public-api-imports";
import { layerImports } from "./layer-imports";

export const rules = {
  "fsd-relative-path": fsdRelativePath,
  "absolute-public-api-imports": fsdAbsolutePublicApiImports,
  "layer-imports": layerImports,
};
