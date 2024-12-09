import { RuleTester } from "@typescript-eslint/rule-tester";

import { MessageIds, layerImports } from "../../../lib/rules/layer-imports";
import { windowsPath } from "./helpers";
import {BASE_ALIAS, BASE_OPTIONS, OPTIONS_WITH_LIB} from "./const";

RuleTester.afterAll = () => {};

const ruleTester = new RuleTester();

ruleTester.run("layer-imports", layerImports, {
  valid: [
    {
      code: `import Test from '${BASE_ALIAS}entities/entity-name'`,
      filename: windowsPath("features", "feature-name", "index.ts"),
      options: BASE_OPTIONS,
    },
    {
      code: `import Test from '${BASE_ALIAS}entities/entity-name'`,
      filename: windowsPath("entities", "another-entity-name", "index.ts"),
      options: BASE_OPTIONS,
    },
    {
      code: `import Test from '${BASE_ALIAS}widgets/widget-name'`,
      filename: windowsPath("features", "feature-name", "index.ts"),
      options: OPTIONS_WITH_LIB,
    },
    {
      code: `import Test from '${BASE_ALIAS}shared/ui/atoms/tooltip'`,
      filename: windowsPath("shared", "ui", "atoms", "tooltip-next"),
      options: OPTIONS_WITH_LIB,
    },
  ],
  invalid: [
    {
      code: `import Test from '${BASE_ALIAS}widgets/widget-name'`,
      filename: windowsPath("features", "feature-name", "index.ts"),
      errors: [
        {
          messageId: MessageIds.ISSUE_LAYER_IMPORTS,
        },
      ],
      options: BASE_OPTIONS,
    },
  ],
});
