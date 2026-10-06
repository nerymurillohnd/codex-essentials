---
name: svelte-code-navigation
description: Use when locating Svelte symbol definitions or references, tracing callers, checking types or diagnostics, or assessing a Svelte rename or deletion.
---

# Svelte code navigation

Use the packaged [local LSP client](../../scripts/svelte-lsp.mjs) for semantic questions when `svelteserver` is available on `PATH`. It starts the server for one query, opens a `.svelte` document, prints JSON, and exits. It defaults the Svelte server's file watcher to polling to avoid `EMFILE` in constrained Codex subprocesses; an existing `CHOKIDAR_USEPOLLING` value takes precedence. Node.js and `svelte-language-server` are user-installed requirements; this plugin does not install them.

## Query

Resolve the installed plugin root from this skill's location, then run:

```sh
node <plugin-root>/scripts/svelte-lsp.mjs --root <app-root> --file src/lib/Widget.svelte --operation references --line 12 --character 8
```

The position is **one-based** (first line and first character are 1) and characters count UTF-16 code units, as in LSP. A character after an emoji can therefore have a higher column than its visual code-point count. The JSON result uses the same one-based convention. Operations are `definition`, `references`, `hover`, `document-symbols`, `workspace-symbols` (add `--query NAME`), `incoming-calls`, `outgoing-calls`, and `diagnostics`. For symbol operations, put the position on the symbol's name. Start from a `.svelte` file even when references lead into TypeScript. The helper does not modify files.

Before a rename or delete: find the symbol, query references, and search text for route filenames, dynamic import strings, `import.meta.glob` patterns, CSS classes, and route paths. Those are not guaranteed to appear as semantic references. Check the project's own check script after an edit.

## Full-project verification

Use the project's `check` script when present (`npm run check`, `pnpm check`, or the project's package manager). If absent, run the already-installed `svelte-check` binary with the project's TypeScript configuration; SvelteKit may first need its existing sync command to regenerate `.svelte-kit` types. State that generated files may change. Do not install dependencies merely to make a check command available.

`diagnostics` waits for a notification about the opened file; it is narrower than a full project check. Empty or failed LSP results require checking the file and position, then trying `document-symbols`. If `svelteserver` is absent or unresponsive, say so and use `rg` for text matches plus project checks for errors. Describe text matches as text matches, not as complete symbol references.
