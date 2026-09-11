# Svelte Architecture Reference

## Project inspection

Before proposing structure, inspect these project-owned files when present:

- `package.json` scripts and dependencies.
- The lockfile and package manager already used by the project.
- `svelte.config.*`, `vite.config.*`, `tsconfig.*`, and adapter settings.
- `src/routes/`, `src/lib/`, tests, stories, and component naming conventions.
- Existing state, form, API, authentication, and environment-variable patterns.

## Decision model

Choose the smallest Svelte surface that owns the behavior:

- Component-local state for UI-only behavior.
- Shared modules or context for cross-component UI state.
- SvelteKit `load` functions for route data ownership.
- Form actions for progressively enhanced mutations.
- Server-only modules for credentials, private environment variables, and
  trusted backend work.
- Endpoints for API-shaped behavior that must be consumed outside a page route.

Do not move data to the client only because it is easy to render there. Keep
private data and privileged operations on the server.

## Svelte 5 design defaults

- Prefer explicit props, typed data flow, and runes-compatible state when the
  project is already on Svelte 5.
- Keep derived data derived instead of duplicating it into mutable state.
- Keep effects for side effects, not for basic data transformation.
- Use snippets and composition where they remove component coupling.
- Keep stores when the existing codebase depends on them or when interop makes
  them the clearest boundary.

## SvelteKit design defaults

- Use route groups and layouts to represent product information architecture.
- Keep layout data stable and page data specific.
- Put form validation and mutation authority on the server when progressive
  enhancement matters.
- Choose adapters based on deployment target and runtime capabilities, not
  preference.
- Treat hooks, cookies, auth, and headers as cross-cutting infrastructure.

## Output shape

Architecture output should name:

- The selected Svelte/SvelteKit surfaces.
- Files to create or edit.
- Data and state ownership.
- Client/server trust boundaries.
- Accessibility, performance, and failure states that affect implementation.
- Verification commands and browser checks needed before completion.
