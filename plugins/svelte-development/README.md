# Svelte Development

Svelte Development gives Codex four focused routes for Svelte 5 and SvelteKit:
architecture, component work, route/server work, and final verification. Its
portable `mcp.json` declares the
[official remote Svelte MCP](https://svelte.dev/docs/ai/remote-setup) at
`https://mcp.svelte.dev/mcp` with `streamable-http` transport.

## Install and use

```sh
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add svelte-development@codex-essentials
```

Ask Codex to plan, edit, or verify a specific Svelte task. The package includes
[`svelte-architect`](skills/svelte-architect/SKILL.md),
[`svelte-component-engineer`](skills/svelte-component-engineer/SKILL.md),
[`sveltekit-engineer`](skills/sveltekit-engineer/SKILL.md), and
[`svelte-verification`](skills/svelte-verification/SKILL.md), each with its own
Codex presentation metadata and conditional references.

## Requirements and network boundary

- The target project supplies its Svelte/SvelteKit dependencies, package
  manager, scripts, adapter, and tests. The plugin installs none of them.
- The remote MCP needs network access. Its tools can receive a framework
  question or selected source code for static analysis. Never send real secrets,
  credential files, private customer data, or unauthorized source.
- Installation changes Codex-managed plugin state and registers the bundled MCP
  declaration in hosts that support it. It does not modify the target project,
  start a server, run `sv`, or install dependencies.
- A project edit, migration, lockfile change, build, preview server, or
  deployment remains bounded by the user's task and repository instructions.
  Documentation lookup alone does not authorize those mutations.

The official Svelte MCP section inventory and documentation routes were queried
on 2026-09-24. The Svelte remote setup page still shows an older Codex CLI
configuration flag; this package uses the portable `mcp.json` contract
documented by OpenAI and does not write global `config.toml`.

## Inputs and results

Give the user goal and target project's manifest, lockfile, route tree,
configuration, source, and tests. Architecture work identifies data/state
ownership and a verification plan. Component work covers Svelte 5 state, props,
accessibility, and SSR. SvelteKit work covers load functions, actions,
endpoints, auth and server-only boundaries. Verification reports exact checks,
browser behavior where relevant, MCP use or its absence, and residual risk.

If the MCP is unavailable, the skills use project-local checks and official
public documentation while labeling the missing remote analysis. They must not
represent a local formatter or build as proof of an untested user path.

## Update and removal

```sh
codex plugin marketplace upgrade codex-essentials
codex plugin add svelte-development@codex-essentials
codex plugin list --json
codex plugin remove svelte-development@codex-essentials
```

This clean-history package begins at `0.1.0`; refresh and explicitly reinstall
if an older cached version remains. Start a new Codex session to confirm both
skills and MCP tools are exposed. Removing the plugin does not revert prior
edits to a Svelte project.

## Maintainer verification

Run `npm run check`, install from a clean Codex home, and verify the installed
four skills and `mcp.json`. Confirm the remote MCP is callable and its section
inventory is available; do not infer health merely from installation. A
component task should invoke the Svelte autofixer when authorized and a
SvelteKit route task should preserve server-only boundaries. Check project
scripts, builds, browser paths, and failures according to the actual change.

See the [changelog](CHANGELOG.md) and [MIT license](LICENSE.md). This is an
independent integration package, not an official Svelte or OpenAI product.
