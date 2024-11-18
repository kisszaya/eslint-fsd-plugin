import { RuleTester } from "@typescript-eslint/rule-tester";

import {
  MessageIds,
  fsdAbsolutePublicApiImports,
} from "../../../lib/rules/absolute-public-api-imports";
import {unixPathWithLib, windowsPath} from "./helpers";
import {BASE_ALIAS, BASE_OPTIONS, OPTIONS_WITH_LIB} from "./const";

RuleTester.afterAll = () => {};

const ruleTester = new RuleTester();

ruleTester.run("absolute-public-api-imports", fsdAbsolutePublicApiImports, {
  valid: [
    {
      code: `import Test from '${BASE_ALIAS}shared/ui/molecules'`,
      filename: windowsPath("app", "index.ts"),
      options: BASE_OPTIONS,
    },
    {
      code: `import Test from '${BASE_ALIAS}shared/ui/molecules/modal/index.ts'`,
      filename: unixPathWithLib("app", "index.ts"),
      options: BASE_OPTIONS,
    },
  ],
  invalid: [
    {
      code: `import Test from '${BASE_ALIAS}shared/ui/molecules/index.ts'`,
      output: `import Test from '${BASE_ALIAS}shared/ui/molecules'`,
      filename: windowsPath("app", "index.ts"),
      errors: [
        {
          messageId: MessageIds.ISSUE_ABSOLUTE_IMPORT_SHOULD_BE_FROM_PUBLIC_API,
        },
      ],
      options: BASE_OPTIONS,
    },
    {
      code: `import Test from '${BASE_ALIAS}shared/ui/molecules/modal/index.ts'`,
      output: `import Test from '${BASE_ALIAS}shared/ui/molecules'`,
      filename: windowsPath("app", "index.ts"),
      errors: [
        {
          messageId: MessageIds.ISSUE_ABSOLUTE_IMPORT_SHOULD_BE_FROM_PUBLIC_API,
        },
      ],
      options: BASE_OPTIONS,
    },
    {
      code: `import Test from '${BASE_ALIAS}shared/ui/molecules/modal/index.ts'`,
      output: `import Test from '${BASE_ALIAS}shared/ui/molecules'`,
      filename: unixPathWithLib("app", "index.ts"),
      errors: [
        {
          messageId: MessageIds.ISSUE_ABSOLUTE_IMPORT_SHOULD_BE_FROM_PUBLIC_API,
        },
      ],
      options: OPTIONS_WITH_LIB,
    },
  ],
});
