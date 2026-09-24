# SvelteKit surfaces

The installed SvelteKit version controls exact API choices. In current
SvelteKit, file-based routes use `src/routes` and `+` files:

- `+page.svelte` and `+layout.svelte` render page and shared UI.
- Universal `+page.js` or `+layout.js` load can run on server and client; server
  `.server.js` load stays on the server and returns serializable data.
- Form actions in `+page.server.js` handle page mutations with native forms and
  optional progressive enhancement.
- `+server.js` provides HTTP method handlers for API-shaped endpoints.
- Hooks handle genuinely cross-cutting request/response behavior.

Keep layout data broad and stable and page data specific. Validate form and
endpoint input on the server, including authorization. Use supported redirect,
error, and response primitives; preserve safe form state when validation fails.
Do not place private tokens or privileged records in serialized load output.

Official reference: [SvelteKit routing](https://svelte.dev/docs/kit/routing),
[loading data](https://svelte.dev/docs/kit/load), and
[form actions](https://svelte.dev/docs/kit/form-actions), consulted 2026-09-24.
