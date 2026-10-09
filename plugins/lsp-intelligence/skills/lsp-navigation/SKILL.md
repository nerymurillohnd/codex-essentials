---
name: lsp-navigation
description: Use when locating definitions, finding semantic references, reading hover types, searching symbols, or previewing imports and refactorings through local language servers in Codex CLI.
---

# Semantic navigation

Use the exposed `lsp_` tools. Always pass `workspace_root` from the current authorized task, never from the plugin installation directory. Source paths must be absolute and inside that root. File tools select the profile; for tools without `file_path`, pass the explicit profile from [the profile table](../../README.md#capabilities).

Read the tool's actual schema. Positions are one-based UTF-16, so an emoji counts as two code units. Put the position on the symbol name; do not convert to visual columns.

Start with document symbols when the occurrence is uncertain. Use definition, hover, and references for semantic questions. During indexing, a definition may identify an import alias rather than its implementation; distinguish these, recheck after indexing and use hover/references to confirm the actual target. Before deleting or renaming, also search text for dynamic imports, route strings, templates, and other relationships that LSP may omit. Empty, ambiguous, truncated, or degraded results are not proof of no usage.

For organize imports, ask `lsp_get_code_actions` with the schema's `source.organizeimports` filter. Edits are proposals. Check action kind, disabled state, truncation and dropped edits; review and apply only complete edits through Codex's normal authorized editing tools. Run the project's own gates afterward. Do not use a language-server formatter to replace the project's established formatter ownership.

When Svelte Development is also installed, prefer this MCP for supported semantic operations and retain its documentation/autofixer workflows. If the MCP is unavailable, its local navigation helper is a fallback; an empty fallback diagnostic list remains inconclusive until project checks pass.
