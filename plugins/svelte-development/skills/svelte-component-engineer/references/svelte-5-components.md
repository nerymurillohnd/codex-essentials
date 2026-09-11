# Svelte 5 Component Reference

## State and derivation

- Keep writable state close to the interaction that changes it.
- Use derived values for data that can be computed from existing state.
- Use effects for side effects such as subscriptions, browser APIs, analytics,
  imperative widgets, or synchronization with an external system.
- Do not mirror props into local state unless the component intentionally owns a
  draft or resettable copy.

## Props and composition

- Make component inputs explicit and typed when TypeScript is present.
- Keep defaults near the prop declaration.
- Use snippets for reusable child markup when it clarifies ownership.
- Prefer callback props for component events when that matches the project's
  Svelte 5 style.
- Avoid spreading unknown props onto interactive elements unless the component
  intentionally forwards a DOM contract.

## Browser and SSR boundaries

- Guard browser-only APIs behind lifecycle, environment checks, or client-only
  surfaces already used by the project.
- Keep module-level code deterministic and SSR-safe.
- Clean up intervals, observers, subscriptions, and external listeners.

## Markup and styling

- Preserve semantic elements before reaching for generic containers.
- Connect labels, descriptions, validation errors, and controls explicitly.
- Keep focus states visible.
- Prefer component-scoped styles for local behavior and project-native tokens
  for shared design decisions.

## Code output

When returning or editing component code, include enough context for imports,
props, state, markup, styles, and tests to remain coherent. Do not provide a
partial snippet when the user asked for a file-ready implementation.
