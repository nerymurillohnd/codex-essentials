# Svelte 5 component patterns

Use the installed project's Svelte version and the relevant official MCP
sections for exact syntax. Keep state ownership visible:

- `$state` for writable interaction state and `$derived` for values computed
  from that state; use `$effect` for actual side effects with cleanup.
- `$props` for explicit inputs; use `$bindable` only when the component's public
  contract intentionally supports two-way binding.
- Snippets and composition for reusable markup when they clarify ownership.
- Stable keys in lists when identity matters during reordering or updates.

Do not mirror a prop into state unless the component owns an editable draft or
reset behavior. Keep browser APIs behind an appropriate client/lifecycle
boundary and module-level code SSR-safe. Preserve semantic controls, labels,
keyboard behavior, visible focus, and relevant loading/error/empty states.

When returning file-ready code, include coherent imports, props, markup, styles,
and tests rather than a partial fragment that cannot run.
