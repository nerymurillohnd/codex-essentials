---
name: svelte-architect
description: Use before designing a Svelte 5 or SvelteKit app, major feature, migration, routing model, state model, adapter strategy, or shared component architecture.
disable-model-invocation: false
---

# Svelte Architect

Use this skill when the task needs structure before code: greenfield Svelte
apps, SvelteKit feature design, migrations, routing decisions, state ownership,
server/client boundaries, adapter choices, or shared component systems.

Do not start by writing components. First determine which part of the Svelte
surface owns the behavior and which verification gate will prove it.

## Operating contract

1. Inspect the project before designing: `package.json`, lockfile, Svelte and
   SvelteKit versions, `svelte.config.*`, `vite.config.*`, route tree, tests,
   and existing component conventions.
2. Use the remote Svelte MCP for current documentation when the decision is
   version-sensitive, migration-related, or touches Svelte 5 runes,
   SvelteKit routing, load functions, actions, forms, adapters, or compiler
   behavior.
3. Write a concise architecture brief before implementation: goal,
   constraints, selected Svelte surface, rejected alternatives, file plan,
   verification plan, and residual risks.
4. Prefer the existing project shape unless the request requires a structural
   change. Local conventions beat generic framework preferences.
5. Route follow-up work to the narrower skill:
   `svelte-component-engineer` for component implementation,
   `sveltekit-engineer` for route/server work, and `svelte-verification`
   before completion.

## MCP and CLI routing

- Use the Svelte MCP for docs lookup and source-aware checks when available.
- Use `sv` for project creation, add-ons, official migrations, and installed
  CLI behavior after checking the command help.
- Use package scripts for project-native gates; do not invent a new build or
  test path when the repo already defines one.
- If MCP or CLI access is unavailable, state exactly what could not be verified
  and continue with official docs or local evidence.

## Read the relevant reference

| Reference                                                   | Read when                                                                                                         |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| [architecture.md](references/architecture.md)               | Choosing app structure, state boundaries, routing model, data flow, styling, or deployment shape.                 |
| [source-verification.md](references/source-verification.md) | Deciding which official or public source to trust, how to cite it, and how to avoid license-contaminated copying. |

Keep architecture decisions short enough to execute. A plan that does not name
files, owners, and verification gates is not ready.
