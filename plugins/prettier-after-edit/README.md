# ✨ Prettier After Edit

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[← Back to Codex Essentials](../../README.md)

> Format files after Codex edits without widening scope beyond the reported
> targets.

**Explore:** [Install](#-quick-start) · [Purpose](#-purpose) ·
[Environments](#supported-environments) · [Safety](#-behavior-and-boundaries) ·
[Docs](#-documentation-and-support)

Prettier After Edit is installed as `prettier-after-edit`. Its single
`PostToolUse` hook formats supported edited files with Prettier. It never
installs dependencies, lints Markdown, or scans the repository because one file
changed. Its skill metadata scopes activation to immediate post-edit formatting,
not Prettier configuration work.

| Version source                                           | Install ref |
| -------------------------------------------------------- | ----------- |
| [`.codex-plugin/plugin.json`](.codex-plugin/plugin.json) | `main`      |

> [!CAUTION]
> A matching hook can write Prettier output immediately after an edit. Review
> the hook and target-project configuration before enabling it in a critical
> repository.

## ⚡ Quick start

Add the marketplace and install the plugin:

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add prettier-after-edit@codex-essentials
codex plugin list
```

Provide Prettier in the target project's dependencies or on `PATH`.

## 🎯 Use cases

| Scenario                                              | How this plugin helps                                                          | Expected result                                                           |
| ----------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| Codex edits a Prettier-supported file.                | Resolves Prettier locally first, formats the exact target, and compares bytes. | Reports `formatted` only after a real change; otherwise `unchanged`.      |
| Codex edits a file Prettier ignores or cannot parse.  | Checks Prettier file info before writing.                                      | Reports `skipped` with the reason and leaves the file untouched.          |
| An edit reports multiple paths or a path with spaces. | Deduplicates arguments and invokes tools without shell interpolation.          | Processes each contained file once and leaves unreported files untouched. |

**Not a fit when:** the workflow requires repository-wide formatting, automatic
dependency installation, Markdown linting, or another quality gate after edits.

## 🎯 Purpose

- Keep supported edited files aligned with project Prettier configuration.
- Make changed, unchanged, skipped, and failed formatting outcomes distinct and
  auditable.

## 🧰 Included Components

| Component                                                                                        | Purpose                                                                      |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| [`.codex-plugin/plugin.json`](.codex-plugin/plugin.json)                                         | Plugin identity, version, interface, and component declarations.             |
| [`hooks/hooks.json`](hooks/hooks.json)                                                           | `PostToolUse` matcher, Node command, timeout, and status text.               |
| [`hooks/format.mjs`](hooks/format.mjs)                                                           | Payload parsing, containment, tool execution, hashing, and status reporting. |
| [`skills/prettier-after-edit/SKILL.md`](skills/prettier-after-edit/SKILL.md)                     | Authoritative behavior and approval contract.                                |
| [`skills/prettier-after-edit/agents/openai.yaml`](skills/prettier-after-edit/agents/openai.yaml) | Codex-facing presentation metadata and explicit automatic invocation policy. |
| [`CHANGELOG.md`](CHANGELOG.md)                                                                   | User-facing change history.                                                  |
| [`LICENSE.md`](LICENSE.md)                                                                       | MIT license terms.                                                           |

## 🖥️ Requirements and compatibility

## Supported Environments

| Requirement   | Supported value or behavior                                          |
| ------------- | -------------------------------------------------------------------- |
| Codex surface | Hosts that support the declared `PostToolUse` command hook contract. |
| Runtime/tools | Node.js and Prettier; project-local first, then `PATH`.              |
| Project types | Any project whose available Prettier supports the edited file.       |
| Credentials   | None.                                                                |
| Network       | Not used by the hook.                                                |
| Last verified | `2026-09-03` with Prettier `3.9.6`.                                  |

The target project, its lockfile, and its configuration remain authoritative.
The hook does not supply or replace project formatting and lint policy.

## 🔐 Behavior and boundaries

## Inputs and Outputs

**Inputs:** A JSON hook payload containing event `cwd`, direct file fields, or
`apply_patch` `*** Add File:` and `*** Update File:` directives.

**Outputs:** One JSON `systemMessage` per target with the Prettier state plus
the first actionable diagnostic when formatting fails.

## Required Tools and Credentials

Node.js executes the packaged hook. Prettier is required for formatting. No
credentials are required.

## Permissions

| Access or effect | What this plugin may do                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------ |
| Read             | Read the hook payload, exact reported files, ignore/config metadata, and executable paths. |
| Write            | Write Prettier output to contained reported files.                                         |
| Process          | Invoke `prettier --file-info` and `prettier --write`.                                      |
| Network          | Not used.                                                                                  |
| Authentication   | Not required.                                                                              |

Targets are canonicalized against event `cwd`. Missing files, directories,
absolute escapes, and symlinks resolving outside that boundary are rejected.
Each child process has a 20-second timeout; the complete hook has 60 seconds.

## Side Effects

Plugin installation changes Codex-managed plugin state only. Matching edit
events can write target files. The hook does not change dependencies,
configuration, lockfiles, or unrelated files.

## Human Approval Boundaries

The declared exact-file hook runs automatically after matching events. Bulk
rewrites, repository-wide formatting, dependency installation, configuration
changes, and remote operations require separate explicit approval.

## Installation Behavior

Installing the plugin does not install Prettier into the target project. A
missing Prettier executable produces an explicit skip message.

## 🔁 Uninstall and Rollback Behavior

Refresh the marketplace:

```bash
codex plugin marketplace upgrade codex-essentials
codex plugin list
```

Remove only this plugin:

```bash
codex plugin remove prettier-after-edit@codex-essentials
```

Removal stops future hook runs but does not revert prior writes. Use Git history
or another trusted backup to restore earlier file content.

## ✅ Verification

Maintainers can run the package and repository checks from the marketplace root:

```bash
npm run marketplace:check
npx vitest run tests/prettier-after-edit-hooks.test.ts
```

To exercise the hook against a disposable or version-controlled target:

```bash
printf '%s\n' '{"cwd":"/path/to/project","tool_input":{"file_path":"README.md"}}' \
  | node plugins/prettier-after-edit/hooks/format.mjs
```

The smoke test can write the selected file. Inspect its JSON message and Git
diff afterward.

## 🚧 Known Limitations

- Deleted files, directory moves, and folder renames are skipped because no
  existing regular file remains to process.
- PATH fallbacks can drift from project-local versions.

## Failure and Recovery

`skipped` states identify missing Prettier, ignored files, unsupported parsers,
or invalid targets. `failed` includes the first process diagnostic. Reproduce
the corresponding command from project `cwd`, correct the target policy or
content, and rerun the repository's normal verification command.

The hook exits `0` after reporting because the triggering edit already
completed. Repository CLI and CI checks remain the enforcement boundary.

## ❓ FAQ

<details>
<summary>Does installing this plugin modify the target project?</summary>

No. Installation changes Codex-managed plugin state. A later matching edit event
may write only the contained file reported by that event.
</details>

<details>
<summary>Does markdownlint run?</summary>

No. The hook runs only Prettier. Run markdownlint through the target
repository's own scripts, hooks, editor integration, or CI when that project
requires Markdown linting.
</details>

<details>
<summary>How do I undo automatic changes?</summary>

Use the target repository's Git diff/history or another trusted backup.
Uninstalling prevents future runs but does not restore previous bytes.
</details>

## 📚 Documentation and support

- [Authoritative skill](skills/prettier-after-edit/SKILL.md)
- [Hook configuration](hooks/hooks.json)
- [Hook implementation](hooks/format.mjs)
- [Prettier CLI documentation](https://prettier.io/docs/cli)
- [Changelog](CHANGELOG.md)
- [Codex Essentials marketplace](../../README.md)
- [Plugin contribution guidelines](../../docs/contributing/plugins.md)
- [Issues](https://github.com/nerymurillohnd/codex-essentials/issues)
- [License](LICENSE.md)

This plugin is community-maintained and is not an official Prettier or OpenAI
infrastructure module.

## 📄 License

MIT. See [LICENSE.md](LICENSE.md).
