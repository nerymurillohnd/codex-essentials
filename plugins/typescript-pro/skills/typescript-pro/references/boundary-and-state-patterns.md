# Boundary and state patterns

Read this reference only for a runtime parser, a closed asynchronous state, or a
typed internal event contract. Keep ordinary code simpler.

## Prove external data once

An API response type is a compiler claim about bytes that have not yet been
validated. Parse `unknown` at the boundary and return a domain type only after
checking every field and invariant the caller uses:

```ts
type User = { readonly id: string; readonly email: string };
type ParseResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly reason: string };

function parseUser(value: unknown): ParseResult<User> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { ok: false, reason: "Expected an object" };
  }
  const record = value as Record<string, unknown>;
  if (typeof record.id !== "string" || typeof record.email !== "string") {
    return { ok: false, reason: "Expected string id and email" };
  }
  return { ok: true, value: { id: record.id, email: record.email } };
}
```

The contained record assertion is justified by the preceding runtime shape
check. Extend the parser for domain constraints such as email format or ID
syntax when downstream logic relies on them.

## Close impossible states

Use a discriminated union when each state permits different fields:

```ts
type LoadState<T> =
  | { readonly status: "idle" }
  | { readonly status: "loading"; readonly requestId: string }
  | { readonly status: "ready"; readonly value: T }
  | { readonly status: "failed"; readonly error: Error };

function describe<T>(state: LoadState<T>): string {
  switch (state.status) {
    case "idle":
      return "Idle";
    case "loading":
      return `Loading ${state.requestId}`;
    case "ready":
      return "Ready";
    case "failed":
      return state.error.message;
    default: {
      const exhaustive: never = state;
      return exhaustive;
    }
  }
}
```

Types do not guarantee request ordering. When stale responses matter, compare
the request ID at runtime before applying a completion event.

## Version and tool compatibility

Inspect the installed compiler and dependent tooling before migrating. The
[TypeScript 7.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
(2026-07-08) explains that 7.0 has no compiler API and documents side-by-side
use of the 6.0 compatibility package for tools that still import that API.
TypeScript 7.0 also adopts changed compiler defaults and errors on options
deprecated in 6.0. Do not apply a 6.x/7.x configuration recipe to another
project version without checking its actual release documentation.
