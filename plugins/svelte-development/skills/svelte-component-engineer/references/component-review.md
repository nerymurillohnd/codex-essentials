# Component Review Reference

Use this checklist before claiming a component change is complete.

## Correctness

- Props are typed or documented according to project convention.
- State has one owner and no duplicated derived copies.
- Event callbacks, bindings, and form behavior match the caller contract.
- Error, empty, loading, and disabled states are handled when the flow can enter
  them.

## Accessibility

- Interactive controls are native elements unless there is a strong reason.
- Labels and descriptions are associated with form controls.
- Keyboard behavior still works after markup changes.
- Focus is not trapped, lost, or hidden.
- Dynamic status changes are announced when users need that feedback.

## Performance

- Expensive derived work is scoped and not repeated unnecessarily.
- Lists have stable identity when reordering or partial updates matter.
- Large components are split only when it improves ownership or readability.
- Browser-only work is deferred to the right lifecycle or client boundary.

## Verification

Use the project-native gates first. Typical evidence includes:

- `npm run check`, `npm run typecheck`, or `npx sv check` when available.
- Unit or component tests that cover the changed behavior.
- Browser inspection for interactive UI, responsive layout, focus, and visual
  regressions.
- Svelte MCP autofix for changed `.svelte` files when remote source analysis is
  authorized.
