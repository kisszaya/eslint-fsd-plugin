import { RuleTester } from '@typescript-eslint/rule-tester';

import { fsdRelativePath, MessageIds } from '../../../lib/rules/fsd-relative-path';

RuleTester.afterAll = () => {}

const ruleTester = new RuleTester();

ruleTester.run('fsd-relative-path', fsdRelativePath, {
  valid: [],
  invalid: [
    {
      code: "import Meow from './entities'",
      errors: [{ messageId: MessageIds.ISSUE_RELATIVE }],
    },
  ],
});
