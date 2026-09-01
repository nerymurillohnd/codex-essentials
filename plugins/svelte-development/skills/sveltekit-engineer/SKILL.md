---
name: sveltekit-engineer
description: Use when implementing, reviewing, or debugging SvelteKit routes, layouts, load functions, form actions, endpoints, hooks, cookies, auth, env, adapters, redirects, and server-only modules.
disable-model-invocation: false
---

# SvelteKit Engineer

Use this skill for SvelteKit work: routes, layouts, `load` functions, form
actions, endpoints, hooks, cookies, auth, environment variables, adapters,
redirects, errors, and server-only modules.

## Operating contract

1. Inspect the route tree, layout hierarchy, server modules, hooks, adapter,
   existing auth/session code, forms, and tests before editing.
2. Use Svelte MCP documentation before changing SvelteKit APIs, routing
   behavior, load/action semantics, adapter behavior, or current migration
   paths.
3. Keep private data and credentials on server-only surfaces.
4. Preserve progressive enhancement for forms unless the product requirement
   explicitly chooses a client-only flow.
5. Use redirects, errors, cookies, and headers through SvelteKit-supported
   primitives, not ad hoc response handling.
6. Route component-only work to `svelte-component-engineer` and final proof to
   `svelte-verification`.

## Server/client boundaries

- Do not import server-only modules into client-rendered code.
- Treat environment variables, credentials, database clients, and privileged API
  calls as server-owned.
- Keep route data minimal and serializable.
- Avoid leaking internal error details to users.
- Prefer project-owned auth/session helpers over introducing a parallel system.

## Read the relevant reference

| Reference                                                   | Read when                                                                        |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [sveltekit-surfaces.md](references/sveltekit-surfaces.md)   | Choosing routes, layouts, loads, actions, endpoints, redirects, and errors.      |
| [server-and-security.md](references/server-and-security.md) | Handling cookies, auth, env, server-only modules, adapters, and deployment risk. |

When a fix changes request handling, state which HTTP path, method, session
state, and failure path were verified.
