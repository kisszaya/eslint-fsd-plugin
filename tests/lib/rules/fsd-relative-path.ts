import { RuleTester } from "@typescript-eslint/rule-tester";

import {
  ABSOLUTE_ALIAS,
  fsdRelativePath,
  MessageIds,
} from "../../../lib/rules/fsd-relative-path";

RuleTester.afterAll = () => {};

const ruleTester = new RuleTester();

const FILENAMES = {
  APP_WINDOWS: "C:\\projects\\src\\app\\index.ts",
  APP_UNIX: "home/projects/src/app/index.ts",
  ENTITIES_WINDOWS: "C:\\projects\\src\\entities\\entity-name\\index.ts",
  ENTITIES_UNIX: "home/projects/src/entities/entity-name/index.ts",
  FEATURES_WINDOWS: "C:\\projects\\src\\features\\feature-name\\index.ts",
  FEATURES_UNIX: "home/projects/src/features/feature-name/index.ts",
};

ruleTester.run("fsd-relative-path", fsdRelativePath, {
  valid: [
    {
      code: "import Test from './styles/index.ts'",
      filename: FILENAMES.APP_WINDOWS,
    },
    {
      code: `import Test from '${ABSOLUTE_ALIAS}entities/entity-name/index.ts'`,
      filename: FILENAMES.APP_UNIX,
    },
    {
      code: "import Test from './styles/index.ts'",
      filename: FILENAMES.ENTITIES_WINDOWS,
    },
    {
      code: `import Test from '${ABSOLUTE_ALIAS}shared/ui/button.ts'`,
      filename: FILENAMES.ENTITIES_UNIX,
    },
    {
      code: "import Test from './styles/index.ts'",
      filename: FILENAMES.FEATURES_WINDOWS,
    },
    {
      code: `import Test from '${ABSOLUTE_ALIAS}shared/ui/button.ts'`,
      filename: FILENAMES.FEATURES_UNIX,
    },
  ],
  invalid: [
    {
      code: "import Test from '../entities/entity-name'",
      filename: FILENAMES.APP_WINDOWS,
      errors: [{ messageId: MessageIds.ISSUE_SHOULD_BE_ABSOLUTE }],
    },
    {
      code: `import Test from '${ABSOLUTE_ALIAS}app/styles/index.ts'`,
      filename: FILENAMES.APP_UNIX,
      errors: [{ messageId: MessageIds.ISSUE_SHOULD_BE_RELATIVE }],
    },
    {
      code: "import Test from '../../shared/ui/button.ts'",
      filename: FILENAMES.ENTITIES_WINDOWS,
      errors: [{ messageId: MessageIds.ISSUE_SHOULD_BE_ABSOLUTE }],
    },
    {
      code: `import Test from '${ABSOLUTE_ALIAS}entities/entity-name/ui/index.ts'`,
      filename: FILENAMES.ENTITIES_UNIX,
      errors: [{ messageId: MessageIds.ISSUE_SHOULD_BE_RELATIVE }],
    },
    {
      code: "import Test from '../../shared/ui/button.ts'",
      filename: FILENAMES.FEATURES_WINDOWS,
      errors: [{ messageId: MessageIds.ISSUE_SHOULD_BE_ABSOLUTE }],
    },
    {
      code: `import Test from '${ABSOLUTE_ALIAS}features/feature-name/ui/index.ts'`,
      filename: FILENAMES.FEATURES_UNIX,
      errors: [{ messageId: MessageIds.ISSUE_SHOULD_BE_RELATIVE }],
    },
  ],
});
