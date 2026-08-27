# Prettier After Edit

![Plugin version](https://img.shields.io/badge/version-0.1.0-111827.svg)
![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)

> Auto-format files edited by Codex using `prettier`.

`prettier-after-edit` formats files reported by selected Codex write/edit tool
events. It prefers project-local Prettier (`node_modules/.bin/prettier`) from the
edited file path and falls back to a PATH-visible global `prettier` executable
only when local resolution fails.

## 🎯 Purpose

Use this plugin if you want immediate formatting after each relevant edit operation
without re-running formatters manually.

Use the following event contract:

```text
Select file -> resolve local prettier -> fallback to global -> run prettier --write --ignore-unknown
```

## 🧰 Included Components

| Component                             | Purpose                                               |
| ------------------------------------- | ----------------------------------------------------- |
| `.codex-plugin/plugin.json`           | Marketplace manifest and plugin metadata.             |
| `hooks/hooks.json`                    | Hook event matchers and invocation configuration.     |
| `hooks/prettier-format.sh`            | Format behavior and fallback logic.                   |
| `skills/prettier-after-edit/SKILL.md` | Author-facing usage guidance for the plugin behavior. |
| `README.md`                           | Plugin purpose, limits, verification, and operations. |
| `CHANGELOG.md`                        | User-facing change history.                           |
| `LICENSE.md`                          | License terms.                                        |

## 🖥️ Supported Environments

Node ecosystem projects and any project where `prettier` is accessible are supported.
You need:

- Bash
- `jq`
- `prettier` in either `node_modules/.bin/prettier` (preferred) or PATH

This plugin does not require network access and does not install project
dependencies.

## 🔁 Inputs and Outputs

Inputs:

- Hook payload JSON from Codex on `PostToolUse`.
- `tool_input.file_path`, `tool_input.path`, or `tool_input.file`.
- `tool_input.command` fallback for `apply_patch` payloads.

Outputs:

- One JSON line to Codex:

```json
{ "systemMessage": "prettier-after-edit: formatted <file>." }
```

- Exit status `0` in all normal and skip conditions.

## 🧩 Required Tools and Credentials

No credentials are required.

Required tools:

- Bash
- `jq` (for payload parsing)
- `prettier` (project-local preferred, global fallback)

## 🔐 Permissions

The plugin reads edited file paths and may write formatted content to those files.

| Access  | What it does                                    |
| ------- | ----------------------------------------------- |
| Read    | Hook payload and file metadata.                 |
| Write   | Write formatted output to the target file only. |
| Process | Invoke shell command `prettier`.                |
| Network | Not used.                                       |

## ⚠️ Side Effects

- One file is formatted per event.
- It uses existing project-level Prettier config and ignores unknown file types.
- It can change line breaks, quotes, semicolons, and spacing according to project
  settings and Prettier defaults.

## 🛡️ Human Approval Boundaries

This plugin can auto-format immediately after matching events. Human approval is
recommended before using it in critical repositories until formatting policy is
verified.

No additional approval is required for local config discovery.

## 📦 Installation Behavior

Install or update from the marketplace:

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add prettier-after-edit@codex-essentials
```

The package caches the hook in Codex and does not alter your project lock files.

### 🔄 Update

```bash
codex plugin marketplace update codex-essentials
codex plugin list
```

### 🧹 Remove

```bash
codex plugin remove prettier-after-edit@codex-essentials
```

## ↩️ Uninstall and Rollback Behavior

Removing the plugin stops future automatic formatting events for this package.
Keep a backup of local formatting policy in VCS before changing install state.

## ✅ Verification

Run validation and smoke tests from this repository:

```bash
npm run validate:plugins
npm run validate:all
npm run validate:release -- plugin/prettier-after-edit/v0.1.0
```

From a target project, validate the hook behavior by editing a tracked file:

```bash
printf '{"cwd":"/path/to/project","tool_input":{"file_path":"src/index.js"}}\n' \\
  | bash plugins/prettier-after-edit/hooks/prettier-format.sh
```

## 🚧 Known Limitations

- The hook formats one file per event.
- `Move to:` and folder rename operations are not specially handled.
- The hook resolves only the first match for `*** Add File:` or `*** Update File:` in
  an `apply_patch` command payload.
- No package-managed `prettier` install is attempted.

## 🩺 Failure and Recovery

- If you receive `prettier not found`, install or expose `prettier` in the
  project's local binary path or PATH.
- If formatting fails, check whether the target file is readable and whether
  the selected `prettier` binary is executable.
- If hook output is missing, verify hook payload compatibility and that the target
  file exists.

## 🌐 Documentation and Attribution

Official formatter source: https://prettier.io/docs/cli.
This package is community-maintained and is not an official Prettier or Codex
infrastructure module.
