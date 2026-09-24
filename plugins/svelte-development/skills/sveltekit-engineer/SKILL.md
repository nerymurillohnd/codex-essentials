---
name: sveltekit-engineer
description:
  Use when implementing, reviewing, or debugging SvelteKit routes, layouts, load
  functions, form actions, endpoints, hooks, cookies, authentication,
  environment, adapters, redirects, or server-only modules. Exclude
  component-only work.
---

# SvelteKit Engineer

Inspect route and layout hierarchy, installed SvelteKit version, adapter, server
modules, auth/session code, forms, and tests before editing. Use the official
Svelte MCP section inventory, then current docs for the specific route, `load`,
action, endpoint, hook, or adapter contract. Verify the installed version before
using newer APIs.

Read [SvelteKit surfaces](references/sveltekit-surfaces.md) when deciding where
data or a mutation belongs. Read
[server and security](references/server-and-security.md) for cookies, auth,
private environment, redirects, and deployment constraints. Keep secrets and
privileged clients on server-only surfaces; do not serialize private data to the
browser. Validate user input and authorization on the server even when the
client validates too. Preserve progressive enhancement unless a client-only
product requirement is explicit.

Use project-owned helpers and SvelteKit's supported responses, redirects, and
errors. Keep failure states safe for users while retaining diagnostics in the
approved server channel. A component-only request belongs to
`svelte-component-engineer`.

Run project-native checks, tests, build, and adapter-aware preview when they
apply. For a changed request path, report the HTTP method, session state, valid
and invalid input behavior, and exact checks observed. Route final evidence
through `svelte-verification`.
