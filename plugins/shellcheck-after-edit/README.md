# 🐚 ShellCheck After Edit

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[← Back to Codex Essentials](../../README.md)

> Format and lint edited .sh and .bash files through an approval-gated consumer-owned Codex hook.

ShellCheck After Edit is a skills-only Codex plugin. Installation exposes the
skill, references, and templates; it does not create, register, activate, trust,
or execute a hook.

> [!CAUTION]
> An approved consumer hook rewrites the reported shell file with shfmt and then
> runs ShellCheck. Review the exact files, configuration, scope, and /hooks trust
> state before enabling it.

## Quick start

    codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
    codex plugin add shellcheck-after-edit@codex-essentials
    codex plugin list

Ask Codex to inspect the environment and propose a project or user hook. It must
show the exact wiring and wait for approval before changing consumer files.

## Use cases

| Scenario                                  | Result                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| A Codex edit changes a .sh or .bash file. | The approved hook formats that exact file and runs ShellCheck.           |
| A project has existing shell policy.      | The skill discovers and preserves .shellcheckrc and .editorconfig.       |
| A user wants a reusable hook.             | The skill proposes project/user scope and hooks.json/config.toml wiring. |

Not a fit when automatic dependency installation, repository-wide scans,
unapproved configuration changes, or a global shfmt profile is required.

## Purpose

- Keep every reported shell edit formatted with the project's shfmt policy.
- Run ShellCheck after formatting and fail visibly on diagnostics or tool failure.
- Provide a reviewable, reversible consumer hook installation workflow.

## Included Components

| Component                                                                                   | Purpose                                                                                         |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [plugin.json](plugin.json)                                                                  | Portable plugin identity and interface metadata.                                                |
| [SKILL.md](skills/shellcheck-after-edit/SKILL.md)                                           | Authoritative routing, inspection, and approval workflow.                                       |
| [openai.yaml](skills/shellcheck-after-edit/agents/openai.yaml)                              | Codex-facing discovery metadata.                                                                |
| [Hook workflow](skills/shellcheck-after-edit/references/hook-workflow.md)                   | Scope, representation, merge, trust, and rollback procedure.                                    |
| [ShellCheck profile](skills/shellcheck-after-edit/references/bundled-shellcheck-profile.md) | Optional ShellCheck rcfile policy.                                                              |
| [Project configuration](skills/shellcheck-after-edit/references/project-configuration.md)   | Existing/adapted ShellCheck and shfmt policy.                                                   |
| [Hook validation](skills/shellcheck-after-edit/references/hook-validation.md)               | Disposable validation and /hooks review.                                                        |
| [Handler template](skills/shellcheck-after-edit/assets/templates/shellcheck-after-edit.sh)  | Consumer-owned PostToolUse handler.                                                             |
| [Handler test](skills/shellcheck-after-edit/assets/templates/test-shellcheck-after-edit.sh) | Consumer-owned handler test.                                                                    |
| Templates directory                                                                         | Project/user hooks.json and inline config.toml fragments, shellcheckrc, and editorconfig-shell. |
| [CHANGELOG.md](CHANGELOG.md)                                                                | User-facing change history.                                                                     |
| [LICENSE.md](LICENSE.md)                                                                    | MIT license terms.                                                                              |

## Requirements and compatibility

| Requirement   | Supported value                                                    |
| ------------- | ------------------------------------------------------------------ |
| Codex surface | Hosts supporting command PostToolUse hooks.                        |
| Runtime/tools | Bash, jq, shfmt, and ShellCheck already available to the consumer. |
| Files         | Existing regular .sh and .bash files reported by an edit event.    |
| Credentials   | None.                                                              |
| Network       | Not used.                                                          |
| Last verified | 2026-09-12 with ShellCheck 0.11.0 and shfmt 3.14.1.                |

The target project and current official documentation remain authoritative.

## Behavior and boundaries

### Inputs and outputs

Inputs are the hook JSON payload, approved scope, optional ShellCheck rcfile,
and reported file path. The handler formats the exact target and writes
diagnostics to standard error. It exits zero only for an irrelevant candidate or
a successful clean shell file; missing tools, invalid selected targets,
formatting errors, and ShellCheck findings exit non-zero.

### Permissions and side effects

| Access or effect | Behavior                                                        |
| ---------------- | --------------------------------------------------------------- |
| Read             | Hook payload, selected configuration, and reported target file. |
| Write            | Only the contained reported shell file after approved wiring.   |
| Process          | Runs existing shfmt and ShellCheck executables.                 |
| Network          | Not used.                                                       |
| Authentication   | Not required.                                                   |

Plugin installation changes Codex-managed plugin discovery only. Approved
consumer wiring may write the handler, selected config fragment, optional
ShellCheck profile, and the reported file during future PostToolUse events.
PostToolUse happens after the edit and cannot undo it.

### Approval and installation behavior

The skill inventories project and user hook sources, tools, ShellCheck
configuration, and .editorconfig. The user chooses project or user scope,
hooks.json or inline config.toml, and each tool's policy route. The agent shows
an exact merge and waits for approval before writing. The user reviews and
trusts the resulting definition in /hooks.

The skill never installs Bash, jq, ShellCheck, shfmt, or other dependencies and
never adds a disable or exclusion merely to make a check pass.

## Uninstall and rollback

    codex plugin marketplace upgrade codex-essentials
    codex plugin remove shellcheck-after-edit@codex-essentials

Removing the plugin stops future skill discovery but does not remove consumer
hooks or revert files already formatted. Roll back only the approved consumer
files and hook entries; use Git history or a trusted backup to restore prior
content. Preserve unrelated hook groups and configuration.

## Verification

From the marketplace root, maintainers run:

    python3 scripts/test_shellcheck_after_edit_plugin.py
    npm run marketplace:check
    npm run check

For a disposable consumer, follow
[Hook Validation](skills/shellcheck-after-edit/references/hook-validation.md).
Inspect the resulting diff after any formatting write.

## Known limitations

- The handler supports .sh and .bash only; it does not claim Zsh, .inc,
  .command, or extensionless coverage.
- A user/global bundled shfmt profile is not supported because shfmt discovers
  .editorconfig from the edited script's ancestry.
- The hook does not scan unreported files or undo a completed edit.
- A project policy can override or ignore formatting and lint behavior.

## Failure and recovery

A missing executable, malformed payload, invalid path, timeout, or tool error is
reported to standard error and returns non-zero for an eligible shell target.
Reproduce the exact command from the selected scope, correct the prerequisite or
content, and rerun the disposable test. Do not weaken policy or silently trust a
configuration that was not reviewed.

## FAQ

<details>
<summary>Does installation modify my project?</summary>

No. It installs only the Codex plugin skill. Consumer hooks and configuration
are created only after your explicit request and approval.
</details>

<details>
<summary>Can I use config.toml instead of hooks.json?</summary>

Yes. Choose exactly one representation for the selected scope. The skill provides
both JSON and inline TOML fragments and preserves the other hook source.
</details>

<details>
<summary>Can the bundled shfmt style be global?</summary>

No. shfmt reads .editorconfig from the edited project's path. The bundled style
is offered only as a reviewed project-level merge.
</details>

## Documentation and support

- [Authoritative skill](skills/shellcheck-after-edit/SKILL.md)
- [Hook workflow](skills/shellcheck-after-edit/references/hook-workflow.md)
- [ShellCheck profile](skills/shellcheck-after-edit/references/bundled-shellcheck-profile.md)
- [Project configuration](skills/shellcheck-after-edit/references/project-configuration.md)
- [Hook validation](skills/shellcheck-after-edit/references/hook-validation.md)
- [Codex Essentials marketplace](../../README.md)
- [ShellCheck manual](https://github.com/koalaman/shellcheck/blob/master/shellcheck.1.md)
- [shfmt manual](https://github.com/mvdan/sh/blob/master/cmd/shfmt/shfmt.1.scd)
- [License](LICENSE.md)

This plugin is not affiliated with ShellCheck, mvdan/sh, or OpenAI.

## License

MIT. See [LICENSE.md](LICENSE.md).
