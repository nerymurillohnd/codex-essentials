---
name: svelte-architect
description:
  Use when planning Svelte 5 or SvelteKit app architecture, major features,
  migrations, routing, state ownership, adapter choice, or shared component
  systems before implementation.
---

# Svelte Architect

Inspect `package.json`, lockfile, Svelte/SvelteKit versions, route tree,
`svelte.config.*`, Vite config, adapter, tests, and component conventions.
Select the smallest framework surface that owns the requested behavior before
creating components or new shared state.

Use the bundled official Svelte MCP when callable. Start with its section
inventory, then retrieve the relevant architecture, routing, state, form, or
adapter documentation. Reconcile current docs with the installed project
version. If the remote tool is unavailable, use official public docs and local
evidence, and state what remains unverified.

Read [architecture boundaries](references/architecture.md) when choosing routes,
state, data flow, or deployment shape. Read
[source verification](references/source-verification.md) when a framework claim,
migration, or third-party example materially affects the plan.

Produce a concise design naming the user outcome, selected Svelte surfaces,
data/state owner, client/server boundary, exact files, accessibility and failure
states, adapter constraints, and checks that will prove the result. Use
`svelte-component-engineer` for component implementation, `sveltekit-engineer`
for route/server work, and `svelte-verification` before a completion claim.
Preserve the target project's shape unless a real requirement justifies
restructuring it.
