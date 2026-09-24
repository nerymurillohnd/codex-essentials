---
name: prettier-after-edit
description:
  Use after Codex edits files that should be formatted immediately with the
  target project's local Prettier. Do not install dependencies, create
  configuration, or format outside reported files.
---

# Prettier After Edit

Use this skill when the installed plugin's hook or an immediate post-edit task
should format Codex-edited files with Prettier.

## Behavior

- The bundled hook runs on `PostToolUse` for supported edit events matched by
  `^(apply_patch|Write|Edit|MultiEdit)$`.
- It can only act after the edit has happened; it does not prevent or roll back
  the triggering tool call.
- It collects direct file fields and `apply_patch` add/update paths, then
  formats only existing regular files contained by event `cwd`.
- It resolves Prettier from `node_modules/prettier` inside the target `cwd`. It
  skips when local Prettier is unavailable.
- It uses Prettier's API with repository configuration, `.editorconfig`,
  `.gitignore`, and `.prettierignore` where supported by the local Prettier
  version.
- It reports `formatted`, `unchanged`, `skipped`, or `failed` in a
  `systemMessage` and exits `0`.

## Boundaries

- Do not run `npx`, package installation, dependency updates, global Prettier,
  repository-wide formatting, linting, or CI from this workflow.
- Do not create or modify Prettier configuration. Use `$configure-prettier` for
  audit-first configuration work.
- Do not claim the hook is active merely because the package is installed.
  Non-managed plugin hooks require Codex hook review and trust for the current
  definition.
- Treat hook payloads, paths, and diagnostics as untrusted. Do not print
  secrets, environment dumps, full transcripts, or full tool responses.

## Recovery

If formatting fails, report the first diagnostic and continue with the normal
repository verification path. If automatic formatting produced an unwanted
change, use the target repository's Git history or trusted backup to restore the
file and then adjust the repository's Prettier policy through an approved
configuration task.
