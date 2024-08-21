import { RuleTester } from "@typescript-eslint/rule-tester";

import {
  ABSOLUTE_ALIAS,
  fsdRelativePath,
  MessageIds,
} from "../../../lib/rules/fsd-relative-path";

RuleTester.afterAll = () => {};

const ruleTester = new RuleTester();

function unixPath(...path: string[]) {
  return `home/projects/src/${path.join("/")}`;
}
function windowsPath(...path: string[]) {
  return `C:\\projects\\src\\${path.join("\\")}`;
}

ruleTester.run("fsd-relative-path", fsdRelativePath, {
  valid: [
    {
      code: "import Test from 'effector'",
      filename: windowsPath("app", "index.ts"),
    },
    {
      code: "import Test from './styles/index.ts'",
      filename: windowsPath("app", "index.ts"),
    },
    {
      code: `import Test from '${ABSOLUTE_ALIAS}entities/entity-name/index.ts'`,
      filename: unixPath("app", "index.ts"),
    },
    {
      code: "import Test from './styles/index.ts'",
      filename: windowsPath("entities", "entity-name", "index.ts"),
    },
    {
      code: `import Test from '${ABSOLUTE_ALIAS}shared/ui/button.ts'`,
      filename: unixPath("entities", "entity-name", "index.ts"),
    },
    {
      code: "import Test from './styles/index.ts'",
      filename: windowsPath("features", "feature-name", "index.ts"),
    },
    {
      code: `import Test from '${ABSOLUTE_ALIAS}shared/ui/button.ts'`,
      filename: unixPath("features", "feature-name", "index.ts"),
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
    },
  ],
  invalid: [
    {
      code: "import Test from '../entities/entity-name/index.ts'",
      filename: windowsPath("app", "index.ts"),
      errors: [{ messageId: MessageIds.ISSUE_SHOULD_BE_ABSOLUTE }],
    },
    {
      code: "import Test from '../entities/entity-name/index.ts'",
      filename: unixPath("app", "index.ts"),
      errors: [{ messageId: MessageIds.ISSUE_SHOULD_BE_ABSOLUTE }],
    },
    {
      code: `import Test from '${ABSOLUTE_ALIAS}app/styles/index.ts'`,
      filename: unixPath("app", "index.ts"),
      errors: [{ messageId: MessageIds.ISSUE_SHOULD_BE_RELATIVE }],
    },
    {
      code: "import Test from '../../shared/ui/button.ts'",
      filename: windowsPath("entities", "entity-name", "index.ts"),
      errors: [{ messageId: MessageIds.ISSUE_SHOULD_BE_ABSOLUTE }],
    },
    {
      code: `import Test from '${ABSOLUTE_ALIAS}entities/entity-name/ui/index.ts'`,
      filename: unixPath("entities", "entity-name", "index.ts"),
      errors: [{ messageId: MessageIds.ISSUE_SHOULD_BE_RELATIVE }],
    },
    {
      code: "import Test from '../../shared/ui/button.ts'",
      filename: windowsPath("features", "feature-name", "index.ts"),
      errors: [{ messageId: MessageIds.ISSUE_SHOULD_BE_ABSOLUTE }],
    },
    {
      code: `import Test from '${ABSOLUTE_ALIAS}features/feature-name/ui/index.ts'`,
      filename: unixPath("features", "feature-name", "index.ts"),
      errors: [{ messageId: MessageIds.ISSUE_SHOULD_BE_RELATIVE }],
    },
    {
      code: `import Test from '${ABSOLUTE_ALIAS}shared/ui/molecules/ui/index.ts'`,
      filename: windowsPath("shared", "ui", "molecules", "page.tsx"),
      errors: [{ messageId: MessageIds.ISSUE_SHOULD_BE_RELATIVE }],
    },
    {
      code: `import Test from '../atoms/ui/index.ts'`,
      filename: windowsPath("shared", "ui", "molecules", "page.tsx"),
      errors: [{ messageId: MessageIds.ISSUE_SHOULD_BE_ABSOLUTE }],
    },
  ],
});
