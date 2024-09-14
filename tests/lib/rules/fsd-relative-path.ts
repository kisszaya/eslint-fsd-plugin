import { RuleTester } from "@typescript-eslint/rule-tester";

import {
  fsdRelativePath,
  MessageIds,
} from "../../../lib/rules/fsd-relative-path";
import { unixPath, windowsPath } from "./helpers";
import { BASE_ALIAS, BASE_OPTIONS } from "./const";

RuleTester.afterAll = () => {};

const ruleTester = new RuleTester();

ruleTester.run("fsd-relative-path", fsdRelativePath, {
  valid: [
    {
      code: "import Test from 'effector'",
      filename: windowsPath("app", "index.ts"),
      options: BASE_OPTIONS,
    },
    {
      code: "import Test from './styles/index.ts'",
      filename: windowsPath("app", "index.ts"),
      options: BASE_OPTIONS,
    },
    {
      code: `import Test from '${BASE_ALIAS}entities/entity-name/index.ts'`,
      filename: unixPath("app", "index.ts"),
      options: BASE_OPTIONS,
    },
    {
      code: "import Test from './styles/index.ts'",
      filename: windowsPath("entities", "entity-name", "index.ts"),
      options: BASE_OPTIONS,
    },
    {
      code: `import Test from '${BASE_ALIAS}shared/ui/button.ts'`,
      filename: unixPath("entities", "entity-name", "index.ts"),
      options: BASE_OPTIONS,
    },
    {
      code: "import Test from './styles/index.ts'",
      filename: windowsPath("features", "feature-name", "index.ts"),
      options: BASE_OPTIONS,
    },
    {
      code: `import Test from '${BASE_ALIAS}shared/ui/button.ts'`,
      filename: unixPath("features", "feature-name", "index.ts"),
      options: BASE_OPTIONS,
    },
    {
      code: `import Test from '../lib/button.ts'`,
      filename: windowsPath(
        "shared",
        "ui",
        "molecules",
        "ui",
        "meow",
        "page.ts",
      ),
      options: BASE_OPTIONS,
    },
    {
      code: `import Test from '${BASE_ALIAS}features/material-playback'`,
      filename: unixPath("pages", "material-playback", "model.ts"),
      options: BASE_OPTIONS,
    },
    {
      code: `import Test from '${BASE_ALIAS}shared/init'`,
      filename: unixPath("shared", "routing", "router.ts"),
      options: BASE_OPTIONS,
    },
  ],
  invalid: [
    {
      code: "import Test from '../entities/entity-name/index.ts'",
      output: `import Test from '${BASE_ALIAS}entities/entity-name'`,
      filename: windowsPath("app", "index.ts"),
      errors: [{ messageId: MessageIds.ISSUE_SHOULD_BE_ABSOLUTE }],
      options: BASE_OPTIONS,
    },
    {
      code: "import Test from '../entities/entity-name/index.ts'",
      output: `import Test from '${BASE_ALIAS}entities/entity-name'`,
      filename: unixPath("app", "index.ts"),
      errors: [{ messageId: MessageIds.ISSUE_SHOULD_BE_ABSOLUTE }],
      options: BASE_OPTIONS,
    },
    {
      code: `import Test from '${BASE_ALIAS}app/styles/index.ts'`,
      output: `import Test from './styles/index.ts'`,
      filename: unixPath("app", "index.ts"),
      errors: [{ messageId: MessageIds.ISSUE_SHOULD_BE_RELATIVE }],
      options: BASE_OPTIONS,
    },
    {
      code: "import Test from '../../shared/ui/atoms/button.ts'",
      output: `import Test from '${BASE_ALIAS}shared/ui/atoms'`,
      filename: windowsPath("entities", "entity-name", "index.ts"),
      errors: [{ messageId: MessageIds.ISSUE_SHOULD_BE_ABSOLUTE }],
      options: BASE_OPTIONS,
    },
    {
      code: `import Test from '${BASE_ALIAS}entities/entity-name/ui/index.ts'`,
      output: `import Test from './ui/index.ts'`,
      filename: unixPath("entities", "entity-name", "index.ts"),
      errors: [{ messageId: MessageIds.ISSUE_SHOULD_BE_RELATIVE }],
      options: BASE_OPTIONS,
    },
    {
      code: "import Test from '../../shared/ui/atoms/button.ts'",
      output: `import Test from '${BASE_ALIAS}shared/ui/atoms'`,
      filename: windowsPath("features", "feature-name", "index.ts"),
      errors: [{ messageId: MessageIds.ISSUE_SHOULD_BE_ABSOLUTE }],
      options: BASE_OPTIONS,
    },
    {
      code: `import Test from '${BASE_ALIAS}features/feature-name/ui/index.ts'`,
      output: `import Test from './ui/index.ts'`,
      filename: unixPath("features", "feature-name", "index.ts"),
      errors: [{ messageId: MessageIds.ISSUE_SHOULD_BE_RELATIVE }],
      options: BASE_OPTIONS,
    },
    {
      code: `import Test from '${BASE_ALIAS}shared/ui/molecules/input/ui/index.ts'`,
      output: `import Test from './ui/index.ts'`,
      filename: windowsPath("shared", "ui", "molecules", "input", "page.tsx"),
      errors: [{ messageId: MessageIds.ISSUE_SHOULD_BE_RELATIVE }],
      options: BASE_OPTIONS,
    },
    {
      code: `import Test from '${BASE_ALIAS}shared/ui/molecules/input/ui/index.ts'`,
      output: `import Test from '../ui/index.ts'`,
      filename: windowsPath(
        "shared",
        "ui",
        "molecules",
        "input",
        "model",
        "index.tsx",
      ),
      errors: [{ messageId: MessageIds.ISSUE_SHOULD_BE_RELATIVE }],
      options: BASE_OPTIONS,
    },
    {
      code: `import Test from '../atoms/ui/index.ts'`,
      output: `import Test from '${BASE_ALIAS}shared/ui/atoms'`,
      filename: windowsPath("shared", "ui", "molecules", "page.tsx"),
      errors: [{ messageId: MessageIds.ISSUE_SHOULD_BE_ABSOLUTE }],
      options: BASE_OPTIONS,
    },
  ],
});
