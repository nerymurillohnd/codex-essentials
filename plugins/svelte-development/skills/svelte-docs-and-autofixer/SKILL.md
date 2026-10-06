---
name: svelte-docs-and-autofixer
description: Use when a Svelte or SvelteKit task needs current official API documentation, a Svelte compiler check, autofixer feedback, or a Svelte playground link.
---

# Current documentation and autofixer

The bundled Svelte MCP server supplies `list-sections`, `get-documentation`, `svelte-autofixer`, and `playground-link`. Discover their exposed tool names and schemas in the active Codex client; do not assume a Claude Code tool prefix. [Svelte describes these tools](https://svelte.dev/docs/ai/tools).

## Workflow for a code change

1. Inspect the project's installed Svelte and SvelteKit versions. Identify the exact APIs affected and use [the source map](../svelte-best-practices/references/sources.md) or `list-sections` to obtain valid documentation paths.
2. Call `get-documentation` for the relevant sections before editing. Reconcile examples with the installed version and its changelog. If sources disagree, record the disagreement and choose the version-correct behavior.
3. Edit only the requested files. For each changed `.svelte`, `.svelte.ts`, or `.svelte.js` file supported by the tool, send its **full contents**, not its path, to `svelte-autofixer`; include filename and relevant version or async options accepted by the current tool schema.
4. Apply valid issues and suggestions. Call the autofixer again while it reports issues or requests another call. Stop and explain any suggestion that would conflict with the project's version or the user's requirements.
5. Run the project's check script and relevant tests. The autofixer does not replace TypeScript, routing, runtime, or integration checks.

The remote autofixer receives the code passed to it at `https://mcp.svelte.dev/mcp`. Do not include unrelated files, credentials, or secrets in a tool call. The [Svelte remote setup page](https://svelte.dev/docs/ai/remote-setup) states its handling of submitted code. A `playground-link` likewise puts supplied code in a URL; use it for an example shared in chat when useful, not as a way to export project files.

## Unavailable server or offline work

- State that the MCP result is unavailable. Fetch the specific official documentation page through an available web or HTTP tool.
- If `svelte-mcp` is already installed locally, use its documented CLI for documentation and autofixer. Pass a file path only to this local CLI when its current syntax accepts one; the remote tool needs source text.
- Run the project's existing check command even when neither autofixer is available. Report which verification could not run. Do not silently download a package with `npx -y`.
