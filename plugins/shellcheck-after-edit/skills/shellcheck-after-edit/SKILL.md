---
name: shellcheck-after-edit
description:
  Use when linting or formatting .sh/.bash files with ShellCheck or shfmt, or
  when designing, installing, reviewing, testing, or troubleshooting a
  consumer-owned Codex ShellCheck after-edit hook.
---

# ShellCheck After Edit

Use ShellCheck and shfmt deliberately for shell scripts. When explicitly asked,
prepare an approval-gated Codex after-edit workflow. Installing this plugin does
not create, register, activate, trust, or run hooks.

## Route the request

1. **Intentional command:** run ShellCheck or shfmt on requested `.sh` or
   `.bash` files after inspecting project policy. Preserve `.shellcheckrc`,
   `shellcheckrc`, and `.editorconfig`.
2. **Hook workflow:** create, change, wire, test, review, or troubleshoot an
   after-edit hook. Read [Hook Workflow](references/hook-workflow.md), then
   [Hook Validation](references/hook-validation.md).
3. **Installed-hook diagnosis:** inspect the actual consumer hook, event
   payload, tool paths, scope, and configuration before proposing a repair.

## Intentional ShellCheck and shfmt use

Inspect the target project first. Use normal ShellCheck discovery unless the
user selected an approved `--rcfile`. Run shfmt without parser or printer style
flags so `.editorconfig` remains authoritative:

```sh
shfmt --apply-ignore -w -- path/to/script.sh
shellcheck -- path/to/script.sh
```

Run shfmt before ShellCheck when both are requested. Scope commands to the
reported or requested files. Treat ShellCheck exit `1` as a finding and exit `2`
or higher as a processing or invocation failure.

Never add a ShellCheck suppression, exclusion, shell override, or formatting
style override merely to make a check pass.

## Hook workflow

Read the current official Codex hook contract before proposing installation.
First inspect the operating system, Bash, jq, shfmt, and ShellCheck
availability; project and user hook sources; trust state; existing shell policy;
and baseline shfmt/ShellCheck output.

Ask the user to select:

- project or user scope;
- `hooks.json` or inline `config.toml`, never both in one scope;
- ShellCheck discovery, an existing project policy, or an approved explicit
  `--rcfile`;
- shfmt normal `.editorconfig` discovery or an approved project `.editorconfig`
  merge.

Present the exact files, merge, commands, timeout, status message, side effects,
test, `/hooks` review, trust step, and rollback. Obtain explicit approval before
writing any consumer file or configuration.

The generated handler accepts only reported regular `.sh` and `.bash` files
contained in the approved scope, runs shfmt then ShellCheck, and fails visibly
when a required tool, target, process, or lint result is not clean. It never
scans a directory or processes an unreported file.

## Boundaries

Do not install Bash, jq, ShellCheck, shfmt, or any package manager dependency.
Do not modify `PATH`, use `--no-verify`, weaken existing policy, create active
plugin hooks, or trust a hook for the user.

## Sources

This skill is grounded in current official Codex Hooks and Agent Plugins
documentation, ShellCheck and shfmt documentation, and local project evidence.
Recheck current documentation before changing a consumer hook.
