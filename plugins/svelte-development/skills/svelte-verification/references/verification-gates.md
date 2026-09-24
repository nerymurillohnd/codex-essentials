# Svelte verification gates

Choose checks from the changed path, then report what actually ran:

| Change                          | Relevant evidence                                                                             |
| ------------------------------- | --------------------------------------------------------------------------------------------- |
| `.svelte` component             | Formatting, Svelte diagnostics, component tests, MCP autofix when authorized, rendered states |
| SvelteKit route/action/endpoint | Typecheck or `sv check`, request tests, build, valid and invalid HTTP/form paths              |
| Auth, cookies, private env      | Server-only import review, session and unauthorized cases, safe errors                        |
| Adapter or build configuration  | Project build plus platform-aware preview or local runtime proof                              |
| Visual interaction              | Desktop/mobile viewport, keyboard/pointer behavior, focus, console and network diagnostics    |

Use the target project's scripts and pinned dependencies. A dev or preview
server is a process with a lifecycle: stop it or report it at handoff. Preserve
exact failing output and state what remains untested. No narrower green check
can certify an unexercised user path.
