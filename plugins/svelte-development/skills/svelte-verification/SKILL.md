---
name: svelte-verification
description:
  Use when verifying Svelte or SvelteKit work before completion, including
  official MCP documentation and autofix, project checks, tests, builds, preview
  servers, browser paths, accessibility, diagnostics, and failure recovery.
---

# Svelte Verification

Identify changed files and user-visible behavior first. Use the official Svelte
MCP section inventory and relevant current docs for version-sensitive claims.
For changed `.svelte` source, run MCP autofix when that source may be sent
remotely and the tool is callable; otherwise record why it was skipped. Do not
send secrets or unauthorized private code to remote analysis.

Read [MCP and CLI routing](references/mcp-and-cli.md) when choosing remote
analysis, `sv`, migrations, or a fallback. Read
[verification gates](references/verification-gates.md) to select checks from the
actual change. Prefer project scripts over generic commands. The official
`sv check` command diagnoses Svelte, JS/TS, CSS, and accessibility issues when
the project has `svelte-check`; inspect installed help and dependencies before
invoking or installing tooling.

Run applicable format, typecheck/`sv check`, unit/component tests, build,
adapter-aware preview, and browser checks. Interactive or visual work needs the
relevant rendered viewport and keyboard/pointer path, not just a green build.
Server changes need valid and invalid request behavior and private-data review.
Stop and report a failed gate rather than replacing it with a weaker passing
check.

Report commands, versions, relevant output, MCP use or limitation, rendered
checks when applicable, and unresolved risk. A running dev or preview server
must be stopped or explicitly reported at handoff.
