# Component review

Before handoff, check the actual caller contract and rendered behavior:

- Props, callback events, bindings, and state owner match the surrounding
  project. Derived data is not duplicated into mutable copies.
- Native interactive elements, labels, validation messages, keyboard use, focus,
  and announced status changes work for the affected flow.
- Browser-only work is contained and subscriptions, observers, listeners, or
  timers are cleaned up. SSR/hydration behavior remains sound.
- Tests cover the changed interaction. Inspect relevant viewport sizes and
  error, loading, empty, disabled, and success states in a browser when they can
  occur.
- Run the project's format/check/test/build scripts and Svelte MCP autofix where
  remote source analysis is authorized. Recheck after a correction.

Do not call the component complete from a formatter result or a static autofix
suggestion alone.
