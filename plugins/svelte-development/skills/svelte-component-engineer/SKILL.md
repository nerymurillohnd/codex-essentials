---
name: svelte-component-engineer
description:
  Use when writing, editing, reviewing, or debugging Svelte 5 components or
  .svelte.ts/.svelte.js modules, including runes, props, snippets, bindings,
  events, accessibility, styles, and component tests. Exclude route/server-only
  SvelteKit work.
---

# Svelte Component Engineer

Inspect adjacent components, installed Svelte version, project styling and test
conventions, and the caller contract before editing. Use the official Svelte MCP
section inventory and relevant component documentation for runes, snippets,
bindings, actions, transitions, compiler diagnostics, or migration behavior.
Read [component patterns](references/svelte-5-components.md) only when the task
uses those constructs; use [component review](references/component-review.md)
before claiming a substantial component change is complete.

Keep writable state near its owner, derive computed values instead of copying
them into mutable state, and reserve effects for real side effects. Make props
and event callbacks explicit. Match the project's TypeScript and CSS
conventions. Preserve SSR safety, semantic HTML, labels, keyboard operation,
visible focus, and relevant loading, error, empty, and disabled states. Clean up
subscriptions, observers, timers, and browser-only resources.

When `.svelte` source is changed and remote source analysis is authorized, run
the Svelte MCP autofixer on the changed component and address its supported
findings; re-run it after corrections when requested by the tool. Do not send
secrets or unauthorized private source. Run project-native checks and relevant
component/browser tests, then route final evidence through
`svelte-verification`. A route/server-only request belongs to
`sveltekit-engineer`.
