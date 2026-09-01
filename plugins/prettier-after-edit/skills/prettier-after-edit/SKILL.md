---
name: prettier-after-edit
description: Use this skill first when you need immediate formatting after Codex write/edit operations. It resolves a local project Prettier first, then a global fallback in PATH.
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

It collects and deduplicates:

- `tool_response.filePath`
- `tool_input.file_path`
- `tool_input.path`
- `tool_input.file`
- every `*** Add File:` and `*** Update File:` line from string tool input or
  `tool_input.command`

Only files reported by the event are formatted. For each file, the hook runs
from the event `cwd` so project Prettier configuration and ignore policy apply.

## Failure behavior

- If the hook payload cannot be parsed, it emits `skipped; unable to parse hook payload.` and exits 0.
- If `jq` is missing, it emits `skipped; jq not found.` and exits 0.
- If target file resolution fails, it emits `skipped; no target file in hook payload.` or
  `skipped; target file not found: <file>.` and continues safely.
- If no formatter exists for a target, it emits
  `skipped; prettier not found for <file>.` and continues safely.
- If formatter execution fails, it emits `failed to format <file>.`

## Approval boundaries

Use this automatically for selected edit events. For non-idempotent operations
(bulk refactors, repository-wide rewrites, file move strategy changes), ask for
explicit approval before enabling formatting in that run.
