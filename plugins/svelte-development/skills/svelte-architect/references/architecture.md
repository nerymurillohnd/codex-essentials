# Svelte architecture boundaries

Inspect package scripts and lockfile, installed Svelte/SvelteKit versions,
`svelte.config.*`, Vite and TypeScript settings, adapter, `src/routes`, shared
components, tests, and existing state/auth patterns.

Choose the smallest owner:

- Component-local state for a local interaction; context or a shared module only
  when more than one component needs the same lifecycle.
- Route `load` for page data, with server `load` when trusted data access or
  private environment is required.
- Form actions for progressively enhanced page mutations; endpoints for
  API-shaped consumers outside the page flow.
- Server-only modules for credentials and privileged work; hooks for genuine
  cross-cutting request or response behavior.

Keep derived values derived and effects for side effects. Use layouts and route
groups for product navigation, not arbitrary component decomposition. Select the
adapter from the actual deployment target and runtime limits.

An architecture brief should name files, data/state owner, client/server
boundary, accessibility and failure states, alternatives considered, and the
commands or rendered paths that will prove the design works.
