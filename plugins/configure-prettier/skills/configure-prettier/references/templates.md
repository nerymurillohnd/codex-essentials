# Templates

Use these only after scope resolution, convention inference, and live verification. Replace every angle-bracket value with audit evidence, then present the resulting complete diff for approval. Never apply a template wholesale.

## Minimal project configuration

Use only the options justified by repository evidence. Select the configuration format after verifying repository runtime support and the project’s existing configuration conventions. A JavaScript config is appropriate when the repository needs comments, typed config, conditional plugin lists, or paths resolved from the config file.

```js
// .prettierrc.mjs
// @ts-check

/** @type {import("prettier").Config} */
const config = {
  // Insert only options supported by the audited house-style evidence.
};

export default config;
```

Do not set `parser` at the top level. Add an override only when Prettier cannot correctly infer a parser or when a documented repo requirement needs one.

## Local dependency and command integration

```diff
 {
   "devDependencies": {
+    "prettier": "<verified-exact-prettier-version>"
   }
 }
```

Never preselect script names or commands. The audit must determine whether Prettier belongs in an existing quality, lint, check, test, or task-runner command; needs a dedicated non-writing command; or should remain directly invocable through the local CLI. Show the exact integration selected and its alternatives in the proposed diff.

Any CLI path must resolve the repository-local Prettier dependency and repository-local configuration. A check command is CI-safe; every writing format command must be a separately approved operation. Preserve existing script naming, ordering, task-runner conventions, and package-manager behavior when present. See [IDE and CLI parity](ide-cli-parity.md) before selecting the command.

## Plugin configuration

```js
// Add only detected, installed/approved, compatible plugins.
const config = {
  plugins: [
    "<verified-project-plugin>",
    "prettier-plugin-tailwindcss", // only when detected; must be last
  ],
};
```

Do not add plugin-specific settings—such as Astro, Svelte, Tailwind, import sorting, or stylesheet paths—without verified plugin documentation and repository evidence. Some plugins have compatibility constraints; verify them live before proposing exact versions or plugin order.

## JSON/JSONC compatibility override

```js
// .prettierrc.mjs
const config = {
  overrides: [
    {
      files: ["*.jsonc", "*.json5"],
      options: {
        trailingComma: "none",
      },
    },
  ],
};

export default config;
```

Use this only when a repository validator, consumer, or official tool documentation demonstrates that trailing commas are rejected. Standard JSON behavior must be verified against the relevant consumer; do not generalize a repository-specific constraint such as Wrangler to other projects.

## VS Code workspace settings

```json
{
  "[<audited-vs-code-language-id>]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

Add every detected language scope only when Prettier is the chosen formatter for that file class. Propose `editor.formatOnSave`, `prettier.requireConfig`, extension recommendations, `prettier.prettierPath`, or a workspace-local formatter default only after determining how they interact with actual CLI/config resolution. The final plan must explicitly prove IDE/CLI parity. Follow [IDE and CLI parity](ide-cli-parity.md); never set `prettier.configPath` to a personal path.

## Existing lint-staged integration

```json
{
  "lint-staged": {
    "<audited-staged-file-glob>": "<audited-local-prettier-write-command>"
  }
}
```

Only extend a detected lint-staged/Husky-equivalent setup after independent approval. Preserve the repository’s existing config location, glob policy, commands, and partial-staging behavior. If the repository has no automation, assess its value as an optional independently approvable recommendation; do not assume it should be introduced.

## CI check job

```yaml
format:
  name: Format
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@<verified-immutable-sha>
    - uses: actions/setup-node@<verified-immutable-sha>
      with:
        node-version-file: "<audited-runtime-version-source>"
        cache: "<audited-package-manager>"
    - run: "<audited-immutable-install-command>"
    - run: "<audited-non-writing-format-check-command>"
```

Use only with a detected compatible CI environment and an existing or separately approved workflow. Verify action references, runtime policy, package-manager command, cache setting, workflow permissions, and the exact checked package/workspace from current official documentation and the repository’s security policy. CI must check, not write.
