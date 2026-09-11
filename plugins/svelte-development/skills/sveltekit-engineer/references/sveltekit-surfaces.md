# SvelteKit Surface Reference

## Choosing the right surface

- Use `+page.svelte` for route UI.
- Use `+layout.svelte` for shared UI shells.
- Use universal `load` when data is safe for client execution and serialization.
- Use server `load` when data access needs trusted server context.
- Use form actions for user mutations that should progressively enhance.
- Use endpoints for API-shaped behavior consumed outside normal page rendering.
- Use hooks for cross-cutting request, response, auth, or header behavior.

## Data flow

- Keep layout data broad and stable; keep page data specific.
- Avoid putting secrets, raw tokens, or privileged records in serialized data.
- Make loading, error, and redirect behavior explicit.
- Prefer existing project fetch, client, validation, and auth helpers.

## Forms and mutations

- Preserve native form behavior unless a client-only experience is required.
- Validate on the server even when the client also validates.
- Return field-specific errors and safe form state when users need correction.
- Keep mutation side effects transactional where the backing service allows it.

## Routes and errors

- Keep route organization aligned with product navigation, not implementation
  convenience.
- Use SvelteKit-supported redirects and errors.
- Keep user-facing error messages safe and actionable.
- Log or preserve diagnostic detail only in the project's approved server-side
  channel.
