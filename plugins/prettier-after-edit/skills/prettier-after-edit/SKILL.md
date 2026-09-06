---
name: prettier-after-edit
description: Use after Codex edits files that should be formatted with Prettier immediately. Resolve project-local Prettier first, fall back to PATH, and do not install dependencies or change configuration.
---

# Prettier After Edit

`prettier-after-edit` is the behavior guide for automatic, event-driven
formatting. Read this before suggesting ad-hoc format commands or manual cleanup
in the same workflow.

## Resolution order

Resolve Prettier for each target:

1. Search `node_modules/.bin` from the edited file upward through event `cwd`.
2. Use the first matching executable visible on `PATH` as a fallback.
3. Skip with an explicit message when no executable is available.

Do not call `npm install`, `npx`, Corepack, Yarn, or pnpm. The hook only uses
Prettier already available to the target project or process environment.

## Runtime behavior

The hook runs on `PostToolUse` with matcher:

```text
apply_patch|Write|Edit|MultiEdit
```

It collects and deduplicates:

- `tool_response.filePath`
- `tool_input.file_path`
- `tool_input.path`
- `tool_input.file`
- every `*** Add File:` and `*** Update File:` line from string `tool_input` or
  `tool_input.command`

The hook canonicalizes each existing file and rejects any target resolving
outside event `cwd`. It never expands directories or repository-wide globs.

For every supported target, it runs Prettier. It reports `formatted` only when
file bytes change, `unchanged` when they do not, and distinct `skipped` or
`failed` outcomes for ignore, parser, executable, or process failures.

## Failure behavior

- Invalid or empty payloads produce an explicit skip message.
- Missing, non-file, and outside-cwd targets are skipped without execution.
- Missing Prettier skips only the affected target.
- A child process receives a 20-second timeout; the hook command has a
  60-second timeout.
- Failure in one target does not prevent reporting other event targets.
- The hook exits `0` after reporting because the triggering edit already
  completed. Repository CLI and CI checks remain the enforcement boundary.

## Approval boundaries

Use this automatically for selected edit events. Review and trust the current
hook implementation before enabling it in a critical repository. Ask for
explicit approval before bulk rewrites, repository-wide formatting, dependency
installation, configuration changes, linting, or another non-idempotent
expansion.
