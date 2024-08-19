import { ESLintUtils } from '@typescript-eslint/utils';

export enum MessageIds  {
  ISSUE_RELATIVE ='issue:relative'
}

const createRule = ESLintUtils.RuleCreator(name => `https://example.com/rule/${name}`);

export const fsdRelativePath = createRule<unknown[], MessageIds>({
  name: 'fsd-relative-path',
  meta: {
    docs: {
      description: "Imports within one slice should be relative",
    },
    type: 'problem',
    messages: {
      "issue:relative": 'Should be relative'
    },
    schema: [],
  },
  defaultOptions: [],
  create: context => {
    return {
      ImportDeclaration (node) {
        context.report({
          node, messageId: MessageIds.ISSUE_RELATIVE
        })
      }
    };
  },
})
