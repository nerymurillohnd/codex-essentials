---
name: shellcheck-after-edit
description: Use when linting or formatting .sh/.bash files with ShellCheck or shfmt, or when designing, installing, reviewing, testing, or troubleshooting an approval-gated Codex ShellCheck-after-edit hook.
---

# ShellCheck After Edit

Use ShellCheck and shfmt deliberately for shell scripts. Installing this plugin
exposes guidance only; it never creates, registers, activates, trusts, or runs a
consumer hook.

## Route the request

1. **Intentional command:** Run ShellCheck or shfmt on explicitly requested
   .sh/.bash files after inspecting project policy. Preserve .shellcheckrc,
   shellcheckrc, and .editorconfig; never add a suppression or ignore to make a
   check pass.
2. **Hook workflow:** Create, change, wire, test, review, or troubleshoot an
   after-edit hook. Read [Hook Workflow](references/hook-workflow.md), then the
   policy references selected by the user.
3. **Installed-hook diagnosis:** Inspect the actual consumer hook, event payload,
   tool paths, scope, and configuration before proposing a repair. Do not retry
   blindly, widen scope, or declare success when a tool was skipped.

## Intentional ShellCheck and shfmt use

Inspect the target project first. Use existing .shellcheckrc or shellcheckrc
through normal ShellCheck discovery unless the user selected an approved
--rcfile profile. Run shfmt without parser or printer style flags so
.editorconfig remains authoritative:

    shfmt --apply-ignore -w -- path/to/script.sh
    shellcheck -- path/to/script.sh

Run shfmt before ShellCheck when both are requested. Scope commands to the
reported/requested files. Treat ShellCheck exit 1 as a finding and exit 2 or
higher as a processing or invocation failure.

## Hook workflow

Read the current official Codex hook contract before any installation proposal.
First inspect the operating system, Bash/jq/shfmt/ShellCheck availability,
project/user hook sources, trust state, existing shell policy, and baseline
diagnostics. Ask the user to select:

- project or user/global scope;
- hooks.json or inline config.toml, never both in one scope;
- ShellCheck defaults/discovery, existing/adapted project configuration, or
  the consumer-owned bundled --rcfile profile;
- shfmt defaults/existing .editorconfig or the project-only bundled fragment.

Present the exact files, merge, commands, timeout, status message, side effects,
test, /hooks review, trust, and rollback. Obtain explicit approval before any
consumer file or configuration is written. Follow [Hook Workflow](references/hook-workflow.md).

The generated handler accepts only reported regular .sh/.bash files contained in
the approved scope, runs shfmt then ShellCheck, and fails visibly when a
required tool, target, process, or lint result is not clean. It never scans a
directory or processes an unreported file.

## Boundaries

Do not install Bash, jq, ShellCheck, shfmt, or any package manager dependency.
Do not use npx or uvx, modify PATH, use --no-verify, weaken an existing policy,
or create an active plugin hook. Do not place consumer configuration in this
package. The user reviews and trusts the final hook definition in /hooks.

## References

- [Hook Workflow](references/hook-workflow.md)
- [Bundled ShellCheck Profile](references/bundled-shellcheck-profile.md)
- [Project Configuration](references/project-configuration.md)
- [Hook Validation](references/hook-validation.md)
