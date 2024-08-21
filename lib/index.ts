import { RuleModule } from "@typescript-eslint/utils/ts-eslint";
import { ESLint } from "eslint";
import { rules } from "./rules";

type RuleKey = keyof typeof rules;

interface Plugin extends Omit<ESLint.Plugin, "rules"> {
  rules: Record<RuleKey, RuleModule<any, any, any>>;
}

const plugin: Plugin = {
  meta: {
    name: "eslint-plugin-kisszaya-fsd-plugin",
    version: "0.0.3",
  },
  rules,
};

export default plugin;
