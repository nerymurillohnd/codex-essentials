---
name: svelte-component-engineer
description: Use when writing, editing, reviewing, or debugging Svelte 5 components, .svelte.ts modules, props, runes, snippets, bindings, events, accessibility, styles, or component tests. Do not use for route/server-only SvelteKit work.
---

# Svelte Component Engineer

Use this skill for component-level implementation in Svelte 5 projects. It
covers `.svelte`, `.svelte.ts`, and `.svelte.js` work, including props, runes,
snippets, event callbacks, bindings, accessibility, styles, and tests.

## Operating contract

1. Inspect adjacent components and project conventions before editing.
2. Use Svelte MCP documentation for current syntax, warnings, and compiler
   behavior when touching runes, snippets, actions, transitions, bindings, or
   migration-sensitive code.
3. Keep state minimal: source state, derived state, and effects must each have a
   distinct reason to exist.
4. Keep components readable at the call site. Prefer explicit props and event
   contracts over hidden module state.
5. Preserve accessibility and keyboard behavior while changing markup.
6. After edits, route to `svelte-verification` for autofix, checks, tests, and
   browser validation when applicable.

## Implementation defaults

- Match the project's TypeScript and formatting conventions.
- Keep SSR compatibility unless the component is intentionally browser-only.
- Use keyed lists when identity matters.
- Avoid broad reactive effects for simple derivations.
- Keep DOM reads, browser APIs, timers, and subscriptions contained and cleaned
  up.
- Use CSS custom properties or component-scoped styles for local theming; do not
  introduce a design system unless the task requires it.
- Keep errors, loading, empty, and disabled states visible in the implementation
  when the user flow needs them.

## Read the relevant reference

| Reference                                                   | Read when                                                                                                |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [svelte-5-components.md](references/svelte-5-components.md) | Writing or reviewing runes, props, derived values, snippets, events, bindings, or component modules.     |
| [component-review.md](references/component-review.md)       | Checking accessibility, SSR behavior, performance, and maintainability before finalizing component code. |

If the code depends on behavior that the local project or MCP docs do not prove,
state the uncertainty and verify before broadening the change.
