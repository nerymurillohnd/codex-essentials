// @ts-check

const globals = {
  __dirname: "readonly",
  __filename: "readonly",
  console: "readonly",
  module: "readonly",
  process: "readonly",
  require: "readonly",
};

/** @type {import("eslint").Linter.RulesRecord} */
const rules = {
  curly: ["error", "all"],
  eqeqeq: ["error", "always"],
  "no-constant-condition": "error",
  "no-debugger": "error",
  "no-duplicate-imports": "error",
  "no-implicit-coercion": "error",
  "no-undef": "error",
  "no-unused-vars": ["error", { args: "after-used", argsIgnorePattern: "^_" }],
  "no-var": "error",
  "prefer-const": "error",
};

/** @type {import("eslint").Linter.Config[]} */
module.exports = [
  {
    ignores: [
      ".codex/**",
      ".tmp/**",
      "coverage/**",
      "dist/**",
      "node_modules/**",
      "**/*.ts",
      "**/*.tsx",
      "**/*.mts",
      "**/*.cts",
    ],
  },
  {
    files: ["**/*.{js,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals,
    },
    rules,
  },
  {
    files: ["**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals,
    },
    rules,
  },
];
