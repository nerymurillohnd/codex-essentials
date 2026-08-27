---
name: prettier-after-edit
description: Use this skill first when you need immediate formatting after Codex write/edit operations. It resolves a local project Prettier first, then a global fallback in PATH.
disable-model-invocation: false
---

# Prettier After Edit

`prettier-after-edit` is the plugin behavior guide for automatic, event-driven
formatting. Read this before suggesting ad-hoc formatting commands or manual
cleanup in the same workflow.

## Resolution order

Always use this order:

1. `node_modules/.bin/prettier` found from the edited file path upward.
2. `command -v prettier` from the current environment.
3. Skip with a warning status message when no formatter is available.

Do not call `npm install`, `pnpm add`, `yarn add`, or `npx prettier` from this
plugin. The hook only formats when a formatter is already available to the project.

## Runtime behavior

The hook runs on `PostToolUse` with matcher:

```text
apply_patch|Write|Edit|MultiEdit
```

It selects:

- `tool_input.file_path`
- `tool_input.path`
- `tool_input.file`
- first `*** Add File:` or `*** Update File:` line inside `tool_input.command`

in that order.

Only one file is formatted per event.

## Failure behavior

- If the hook payload cannot be parsed, it emits `skipped; unable to parse hook payload.` and exits 0.
- If `jq` is missing, it emits `skipped; jq not found.` and exits 0.
- If target file resolution fails, it emits `skipped; no target file in hook payload.` or
  `skipped; target file not found: <file>.` and exits 0 with no formatter invocation.
- If no formatter exists, it emits `skipped; prettier not found.` and exits 0.
- If formatter execution fails, it emits `failed to format <file>.`

## Approval boundaries

Use this automatically for selected edit events. For non-idempotent operations
(bulk refactors, repository-wide rewrites, file move strategy changes), ask for
explicit approval before enabling formatting in that run.
