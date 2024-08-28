import { RuleMetaData } from "@typescript-eslint/utils/ts-eslint";
import { ProjectStructureSchema } from "../../types";

export const ALIAS_START_PATH = "src/";

export interface SchemaOptions {
  alias?: string;
  projectStructure: ProjectStructureSchema;
}

export const SCHEMA: RuleMetaData<"", unknown>["schema"] = [
  {
    type: "object",
    properties: {
      alias: {
        type: "string",
      },
      projectStructure: {
        type: "object",
        additionalProperties: {
          type: ["object", "integer", "string"],
        },
      },
    },
    required: ["alias", "projectStructure"],
    additionalProperties: false,
  },
];
