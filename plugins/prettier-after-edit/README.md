# ✨ Prettier After Edit

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[← Back to Codex Essentials](../../README.md)

> Auto-format files edited by Codex using the project's Prettier.

**Explore:** [Install](#-quick-start) · [Capabilities](#-what-it-does) ·
[Requirements](#-requirements-and-compatibility) · [Safety](#-behavior-and-boundaries) ·
[Docs](#-documentation-and-support)

Prettier After Edit is a Codex plugin with a `PostToolUse` hook. It formats the
file reported by supported write/edit events, prefers a project-local Prettier,
and does not install dependencies or change project configuration.

| Version source                                           | Release history                                                                | Install ref |
| -------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------- |
| [`.codex-plugin/plugin.json`](.codex-plugin/plugin.json) | [Plugin releases](https://github.com/nerymurillohnd/codex-essentials/releases) | `main`      |

> [!CAUTION]
> This plugin can write formatted content back to the edited file immediately
> after a matching Codex event. Review and trust the hook before enabling it in
> a critical repository.

## 🎯 Purpose

Use Prettier After Edit when Codex should format each supported edited file
without installing dependencies or running a multi-file formatter.

## ⚡ Quick start

Add the marketplace and install the plugin:

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add prettier-after-edit@codex-essentials
codex plugin list
```

Then edit a supported file in a target project. The hook resolves local Prettier
from the edited file's directory upward and falls back to a PATH-visible global
executable.

Read the write and trust boundaries below before enabling automatic formatting.

## 🎯 Use cases

| Scenario                                | How this plugin helps                                                                            | Expected result                                    |
| --------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| Codex edits a tracked source file.      | Runs the project's [local Prettier after the event](hooks/prettier-format.sh).                   | The file matches project formatting rules.         |
| A project has no local Prettier binary. | Falls back to a [PATH-visible global executable](skills/prettier-after-edit/SKILL.md).           | Formatting proceeds or skips with a clear message. |
| An unsupported file type is edited.     | Uses `--ignore-unknown` and one-file-per-event scope from the [hook contract](hooks/hooks.json). | The hook skips safely without a project mutation.  |

**Not a fit when:** formatting requires a package-managed install, multi-file
format orchestration, or approval before every automatic write.

## 🎯 What it does

- Handles `PostToolUse` events matching `apply_patch|Write|Edit|MultiEdit`.
- Selects the first supported file path from the event payload.
- Prefers `node_modules/.bin/prettier`, then falls back to `prettier` in PATH.
- Emits JSON status messages and exits cleanly for normal and skip conditions.

## 🧰 Included Components

| Component                                                                                        | Purpose                                             |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| [`.codex-plugin/plugin.json`](.codex-plugin/plugin.json)                                         | Plugin identity, version, and hook declaration.     |
| [`hooks/hooks.json`](hooks/hooks.json)                                                           | PostToolUse matcher and command configuration.      |
| [`hooks/prettier-format.sh`](hooks/prettier-format.sh)                                           | File selection, resolution, formatting, and status. |
| [`skills/prettier-after-edit/SKILL.md`](skills/prettier-after-edit/SKILL.md)                     | Authoritative behavior and approval guidance.       |
| [`skills/prettier-after-edit/agents/openai.yaml`](skills/prettier-after-edit/agents/openai.yaml) | Codex-facing skill metadata and invocation prompt.  |
| [`CHANGELOG.md`](CHANGELOG.md)                                                                   | User-facing release history.                        |
| [`LICENSE.md`](LICENSE.md)                                                                       | MIT license terms.                                  |

## 🖥️ Requirements and compatibility

## Supported Environments

| Requirement   | Supported value or behavior                                         |
| ------------- | ------------------------------------------------------------------- |
| Codex surface | Codex `PostToolUse` events for supported write tools.               |
| Runtime/tools | Bash, `jq`, and Prettier from the target project or PATH.           |
| Project types | Node ecosystem projects or any project with an accessible Prettier. |
| Credentials   | None.                                                               |
| Network       | Not used by the hook; dependencies are not installed.               |
| Last verified | `2026-08-30` against the hook, manifest, skill, and package tree.   |

## 🧩 Required Tools and Credentials

The hook requires Bash, `jq`, and an executable Prettier in the target project's
`node_modules/.bin` or in PATH. No credentials or network access are required.

Project-local Prettier and its configuration take precedence over global PATH
resolution. The [official Prettier CLI documentation](https://prettier.io/docs/cli)
is the upstream reference for formatter behavior.

## 🔐 Behavior and boundaries

## Inputs and Outputs

**Inputs:** JSON hook payload containing `cwd` and a file path, or an
`apply_patch` payload containing the first `*** Add File:` or `*** Update File:`.
**Outputs:** JSON status lines such as `formatted`, `skipped`, or `failed to
format`; normal skip and failure conditions exit with status `0`.

## Permissions and Side Effects

| Access or effect | What this plugin may do                                     |
| ---------------- | ----------------------------------------------------------- |
| Read             | Read the hook payload, target path, and formatter metadata. |
| Write            | Write formatted content to the selected target file only.   |
| Process          | Invoke `prettier --write --ignore-unknown` through Bash.    |
| Network          | Not used.                                                   |
| Authentication   | Not required.                                               |

Each matching event formats at most one file. Installation changes Codex-managed
plugin state and does not alter project lockfiles, configuration, or dependencies.

## Human Approval Boundaries

The hook runs automatically after matching events. Users should review and trust
the current hook implementation and project formatting policy before enabling it
in a critical repository. It never runs `npm install`, `pnpm add`, `yarn add`, or
`npx prettier`.

## 📦 Installation Behavior

Installation changes Codex-managed plugin state and does not alter project
lockfiles, configuration, dependencies, or files. A matching hook event may
write the selected edited file.

## 🔁 Update, Remove, and Uninstall and Rollback Behavior

Refresh the configured marketplace:

```bash
codex plugin marketplace upgrade codex-essentials
codex plugin list
```

Remove only this plugin:

```bash
codex plugin remove prettier-after-edit@codex-essentials
```

Removing the plugin stops future automatic formatting events. It does not revert
files already formatted; use version control or a backup to restore prior content.

## ✅ Verification

From the marketplace repository, run the read-only package check:

```bash
npm run marketplace:check
```

For the hook smoke test, run from the marketplace repository root and provide a
real existing target file in a project with `jq` and Prettier available:

```bash
cd /path/to/codex-essentials
printf '%s\n' '{"cwd":"/path/to/project","tool_input":{"file_path":"src/index.js"}}' \
  | bash plugins/prettier-after-edit/hooks/prettier-format.sh
```

The smoke test can write the selected file. Use a disposable or version-controlled
fixture and inspect the JSON status output.

## 🚧 Known Limitations

- One file is formatted per event; move or folder rename operations are not specially handled.
- Only the first matching `apply_patch` file directive is selected.
- Missing `jq`, target files, or Prettier produce a clean skip message.
- A formatter failure produces a failure message without hiding the target state.
- No package-managed Prettier installation is attempted.

## 🩺 Failure and Recovery

If formatting fails, verify the target is readable and the selected formatter is
executable. For a `jq not found` skip, expose an installed `jq` executable on the
hook process's `PATH`. For a `target file not found` skip, correct the payload's
`cwd` or file path and ensure that the target exists. For a `prettier not found`
skip, install Prettier in the target project's dependencies or expose an existing
`prettier` executable on `PATH`; this plugin does not install it. If output is
missing, check the payload shape and hook registration, then rerun the smoke test.

## ❓ FAQ

<details>
<summary>Does installing this plugin modify my project?</summary>

No. Installation changes Codex-managed plugin state. A matching hook event may
write only the selected edited file with Prettier output.
</details>

<details>
<summary>Which Prettier executable is used?</summary>

The hook searches upward from the edited file for an executable project-local
`node_modules/.bin/prettier`, then uses the first `prettier` found in PATH.
</details>

<details>
<summary>How do I undo an automatic formatting change?</summary>

Use the target project's version-control diff or a backup. Removing the plugin
stops future events but does not revert files already formatted.
</details>

## 📚 Documentation and support

- [Authoritative skill](skills/prettier-after-edit/SKILL.md)
- [Hook configuration](hooks/hooks.json)
- [Hook implementation](hooks/prettier-format.sh)
- [Prettier CLI documentation](https://prettier.io/docs/cli)
- [Changelog](CHANGELOG.md)
- [Codex Essentials marketplace](../../README.md)
- [Plugin contribution guidelines](../../docs/contributing/plugins.md)
- [Issues](https://github.com/nerymurillohnd/codex-essentials/issues)
- [License](LICENSE.md)

Prettier After Edit is community-maintained and is not an official Prettier or
Codex infrastructure module.

## 📄 License

MIT. See [LICENSE.md](LICENSE.md).
