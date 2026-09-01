# ✨ Prettier + Markdownlint After Edit

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[← Back to Codex Essentials](../../README.md)

> Format files after Codex edits and lint configured Markdown without widening
> scope beyond the reported targets.

**Explore:** [Install](#-quick-start) · [Purpose](#-purpose) ·
[Environments](#supported-environments) · [Safety](#-behavior-and-boundaries) ·
[Docs](#-documentation-and-support)

Prettier + Markdownlint After Edit is installed as `prettier-after-edit`. Its
single `PostToolUse` hook formats supported edited files with Prettier, then
fixes and checks edited Markdown when the target project provides markdownlint
configuration. It never installs dependencies or scans the repository because
one file changed.

| Version source                                           | Install ref |
| -------------------------------------------------------- | ----------- |
| [`.codex-plugin/plugin.json`](.codex-plugin/plugin.json) | `main`      |

> [!CAUTION]
> A matching hook can write Prettier output and markdownlint fixes immediately
> after an edit. Review the hook and target-project configuration before
> enabling it in a critical repository.

## ⚡ Quick start

Add the marketplace and install the plugin:

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add prettier-after-edit@codex-essentials
codex plugin list
```

Provide Prettier in the target project's dependencies or on `PATH`. To enable
the Markdown phase, also provide markdownlint-cli2 and a recognized
`.markdownlint*` or `.markdownlint-cli2*` configuration inside the project.

## 🎯 Use cases

| Scenario                                              | How this plugin helps                                                          | Expected result                                                           |
| ----------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| Codex edits a Prettier-supported file.                | Resolves Prettier locally first, formats the exact target, and compares bytes. | Reports `formatted` only after a real change; otherwise `unchanged`.      |
| Codex edits configured Markdown.                      | Runs markdownlint-cli2 with `--fix --no-globs` after Prettier.                 | Reports `clean`, `fixed`, or the first remaining diagnostic.              |
| An edit reports multiple paths or a path with spaces. | Deduplicates arguments and invokes tools without shell interpolation.          | Processes each contained file once and leaves unreported files untouched. |

**Not a fit when:** the workflow requires repository-wide formatting, automatic
dependency installation, or universal detection of every ambiguous Markdown
delimiter.

## 🎯 Purpose

- Keep supported edited files aligned with project Prettier configuration.
- Apply project-owned markdownlint fixes and expose non-fixable diagnostics.
- Make changed, unchanged, skipped, failed, clean, and remaining-issue outcomes
  distinct and auditable.

## 🧰 Included Components

| Component                                                                                        | Purpose                                                                      |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| [`.codex-plugin/plugin.json`](.codex-plugin/plugin.json)                                         | Plugin identity, version, interface, and component declarations.             |
| [`hooks/hooks.json`](hooks/hooks.json)                                                           | `PostToolUse` matcher, Node command, timeout, and status text.               |
| [`hooks/format-and-lint.mjs`](hooks/format-and-lint.mjs)                                         | Payload parsing, containment, tool execution, hashing, and status reporting. |
| [`skills/prettier-after-edit/SKILL.md`](skills/prettier-after-edit/SKILL.md)                     | Authoritative behavior and approval contract.                                |
| [`skills/prettier-after-edit/agents/openai.yaml`](skills/prettier-after-edit/agents/openai.yaml) | Codex-facing presentation metadata.                                          |
| [`CHANGELOG.md`](CHANGELOG.md)                                                                   | User-facing change history.                                                  |
| [`LICENSE.md`](LICENSE.md)                                                                       | MIT license terms.                                                           |

## 🖥️ Requirements and compatibility

## Supported Environments

| Requirement   | Supported value or behavior                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| Codex surface | Hosts that support the declared `PostToolUse` command hook contract.                                           |
| Runtime/tools | Node.js, Prettier, and optional markdownlint-cli2; project-local first, then `PATH`.                           |
| Project types | Any project whose available Prettier supports the edited file; Markdown linting requires `.md` or `.markdown`. |
| Credentials   | None.                                                                                                          |
| Network       | Not used by the hook.                                                                                          |
| Last verified | `2026-08-31` with Prettier `3.9.6`, markdownlint-cli2 `0.23.2`, and markdownlint `0.41.1`.                     |

The target project, its lockfile, and its configuration remain authoritative.
The hook does not supply or replace project formatting and lint policy.

## 🔐 Behavior and boundaries

## Inputs and Outputs

**Inputs:** A JSON hook payload containing event `cwd`, direct file fields, or
`apply_patch` `*** Add File:` and `*** Update File:` directives.

**Outputs:** One JSON `systemMessage` per target with Prettier and markdownlint
states plus the first actionable diagnostic when a phase fails or leaves issues.

## Required Tools and Credentials

Node.js executes the packaged hook. Prettier is required for formatting.
markdownlint-cli2 is optional and runs only for Markdown with project
configuration. No credentials are required.

## Permissions

| Access or effect | What this plugin may do                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------ |
| Read             | Read the hook payload, exact reported files, ignore/config metadata, and executable paths. |
| Write            | Write Prettier output and markdownlint rule-provided fixes to contained reported files.    |
| Process          | Invoke `prettier --file-info`, `prettier --write`, and scoped `markdownlint-cli2 --fix`.   |
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

Installing the plugin does not install Prettier or markdownlint-cli2 into the
target project. Missing tools and missing Markdown configuration produce
explicit skip messages.

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
  | node plugins/prettier-after-edit/hooks/format-and-lint.mjs
```

The smoke test can write the selected file. Inspect its JSON message and Git
diff afterward.

## 🚧 Known Limitations

- Deleted files, directory moves, and folder renames are skipped because no
  existing regular file remains to process.
- Stock markdownlint does not diagnose every unmatched delimiter that Markdown
  parsers treat as literal text.
- PATH fallbacks can drift from project-local versions.
- JavaScript markdownlint configuration and custom rules require a trusted VS
  Code workspace.

## Failure and Recovery

`skipped` states identify missing tools, missing configuration, ignored files,
unsupported parsers, or invalid targets. `failed` includes the first process
diagnostic. `issues remain` includes the first markdownlint violation. Reproduce
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
<summary>When does markdownlint run?</summary>

Only for `.md` or `.markdown` files when a recognized project configuration and
markdownlint-cli2 executable are available.
</details>

<details>
<summary>How do I undo automatic changes?</summary>

Use the target repository's Git diff/history or another trusted backup.
Uninstalling prevents future runs but does not restore previous bytes.
</details>

## 📚 Documentation and support

- [Authoritative skill](skills/prettier-after-edit/SKILL.md)
- [Hook configuration](hooks/hooks.json)
- [Hook implementation](hooks/format-and-lint.mjs)
- [Prettier CLI documentation](https://prettier.io/docs/cli)
- [markdownlint-cli2 documentation](https://github.com/DavidAnson/markdownlint-cli2)
- [Changelog](CHANGELOG.md)
- [Codex Essentials marketplace](../../README.md)
- [Plugin contribution guidelines](../../docs/contributing/plugins.md)
- [Issues](https://github.com/nerymurillohnd/codex-essentials/issues)
- [License](LICENSE.md)

This plugin is community-maintained and is not an official Prettier,
markdownlint, or OpenAI infrastructure module.

## 📄 License

MIT. See [LICENSE.md](LICENSE.md).
