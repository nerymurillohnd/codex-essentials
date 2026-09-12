---
name: typescript-pro
description: Use when reading, writing, refactoring, reviewing, or debugging TypeScript, TSX, tsconfig, type declarations, generics, strict typing, module boundaries, external data boundaries, or type-related build errors.
---

# TypeScript Pro

Use TypeScript as a correctness layer, not decoration. Preserve runtime behavior
unless a change is explicitly requested, and make illegal states unrepresentable
when the added type complexity is justified.

## Mandatory workflow

1. Inspect the real project before editing: `package.json`, lockfile,
   `tsconfig*.json`, framework config, test config, build scripts, and relevant
   source files.
2. Detect the active package manager and use existing scripts. Do not introduce
   a new package manager.
3. Identify TypeScript version, module system, runtime target, framework, test
   runner, and lint/typecheck commands before recommending config changes.
4. Locate trust boundaries: network data, JSON, forms, environment variables,
   database rows, CLI args, files, third-party SDKs, plugin inputs, and
   user-controlled values.
5. When the user authorizes implementation, make the smallest safe change that
   improves type safety without changing behavior. For review or audit-only
   requests, report findings, evidence, risks, and recommended changes without
   modifying files.
6. Verify with project-local commands when available:

   - `npm run typecheck`
   - `npm test`
   - `npm run lint`
   - `./node_modules/.bin/tsc --noEmit` when that local executable exists

7. Do not use `npx tsc` as a fallback because it can download and execute an
   unpinned package. If no project script or local compiler exists, state that
   validation was not run, why, and which project-local command is needed.

## Proved versus asserted types

Separate a type that was **proved** from one that was **asserted**.

The following move a claim from the compiler to a human and must be treated as
findings unless backed by validation or a stated justification:

- `as SomeType`
- non-null assertion: `value!`
- `@ts-ignore`
- `@ts-expect-error`
- bare `any`
- broad double casts such as `value as unknown as DomainType`

A justified assertion must explain:

1. Why TypeScript cannot prove the claim.
2. What runtime fact makes it true.
3. Where that fact is validated.
4. What would fail if the claim becomes false.

Acceptable exceptions include contained interop boundaries, generated code
boundaries, verified framework contracts, and type-level tests that intentionally
use `@ts-expect-error`.

## Type safety rules

- Do not use `any` unless isolating an unsafe external boundary. Prefer
  `unknown` plus narrowing.
- Do not silence TypeScript with `@ts-ignore`, `@ts-expect-error`, non-null
  assertions, or broad casts unless there is a verified reason and no safer
  alternative.
- Prefer `unknown` for untrusted input, caught errors, JSON, network responses,
  environment variables, plugin data, and external library boundaries.
- Validate runtime inputs before trusting their types.
- Find the exact line where `unknown` becomes a domain type. If nothing
  validates it there, it is a must-fix.
- Grade unsafe trust by blast radius, not line count.
- Prefer discriminated unions for states, variants, actions, API results,
  permissions, and workflows.
- Use `never` exhaustiveness checks for switches over closed unions.
- Prefer `readonly`, immutable inputs, `as const`, and `satisfies` where they
  preserve intent without blocking extension.
- Prefer inference when obvious; add explicit types at public APIs, exported
  functions, unclear callbacks, and boundaries.
- Avoid type cleverness that harms readability, compile time, or
  maintainability.
- Do not model business rules only in types when runtime validation is required.

## Strictest TSConfig baseline

When the project can tolerate strict mode, prefer this baseline and adapt only
after inspecting framework and runtime constraints:

```json
{
  "compilerOptions": {
    "strict": true,
    "noEmitOnError": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noPropertyAccessFromIndexSignature": true,
    "useUnknownInCatchVariables": true,
    "alwaysStrict": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "noUncheckedSideEffectImports": true,
    "forceConsistentCasingInFileNames": true,
    "moduleDetection": "force"
  }
}
```

Before applying the baseline, check whether the project uses Node, browser,
React, Astro, Next.js, Vite, Vitest, Jest, ESM, CJS, decorators, path aliases,
monorepos, generated types, or framework-managed config.

Keep library checking enabled. Treat `skipLibCheck: true` only as an explicit,
documented compatibility or performance tradeoff; do not introduce it as part of
a strictness baseline.

## Trust-boundary audit

External data is not trusted because TypeScript says it has a type. It is trusted
only after runtime validation or controlled construction. Audit these boundaries
aggressively:

- `JSON.parse`
- `fetch`, API clients, and SDK responses
- form input and URL params
- request bodies, headers, cookies, and sessions
- database rows and raw SQL results
- environment variables
- filesystem reads
- message queues and webhooks
- third-party plugins and extensions
- local storage and browser APIs
- CLI arguments and process input

Bad pattern:

```ts
const user = JSON.parse(raw) as User;
```

Prefer a runtime parser at the boundary:

```ts
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseUser(value: unknown): User {
  if (!isRecord(value)) {
    throw new Error("Invalid user: expected object");
  }

  if (typeof value.id !== "string") {
    throw new Error("Invalid user: expected string id");
  }

  if (typeof value.email !== "string") {
    throw new Error("Invalid user: expected string email");
  }

  return { id: value.id, email: value.email };
}
```

For a complete boundary parser, a discriminated state reducer, or an internal
typed event registry, read
[boundary and state patterns](references/boundary-and-state-patterns.md). Use
that reference only when the task needs one of those designs; it is not a
catalog of abstractions to copy into ordinary code.

## Money, quantity, and client-controlled values

Judge money and quantity separately from ordinary typing. A client-submitted
price, discount, tax, shipping cost, subtotal, or total used without server-side
recomputation is a security finding, not merely a typing issue. A client
quantity expresses user intent: validate it as a domain value before inventory
or pricing logic uses it.

- Never trust client-submitted monetary totals.
- Recompute money server-side from authoritative product, pricing, tax, and
  discount data.
- Use integer minor units for money when possible and keep currency explicit.
- Parse quantities as finite, positive safe integers and validate domain limits,
  availability, and authorization before using them.
- Treat negative, zero, fractional, extreme, missing, and overflow values as
  edge cases.
- Do not let TypeScript types replace authorization, pricing, or inventory
  checks.

```ts
type Money = {
  readonly amountMinor: number;
  readonly currency: "USD" | "HNL";
};

type OrderLineInput = {
  readonly productId: string;
  readonly quantity: number;
};

type PricedOrderLine = {
  readonly productId: string;
  readonly quantity: number;
  readonly unitPrice: Money;
  readonly lineTotal: Money;
};
```

The client may submit `OrderLineInput`; the server creates `PricedOrderLine`.

## Impossible-state detection

Read the current shape and identify which states it admits that reality does
not. Optional booleans encoding mutually exclusive cases are a defect when a
discriminated union can remove the impossible state.

```ts
type PaymentState =
  | { readonly status: "pending" }
  | { readonly status: "paid"; readonly transactionId: string }
  | { readonly status: "failed"; readonly error: string };

function describePayment(state: PaymentState): string {
  switch (state.status) {
    case "pending":
      return "Payment pending";
    case "paid":
      return `Paid: ${state.transactionId}`;
    case "failed":
      return `Failed: ${state.error}`;
    default: {
      const exhaustive: never = state;
      return exhaustive;
    }
  }
}
```

## Expected versus exceptional errors

TypeScript has no checked exceptions. A typed throw is only a comment unless the
caller is forced to handle it.

- Expected failures belong in the return type; exceptional failures may throw.
- Do not throw strings or plain objects from new code.
- Treat caught errors as `unknown` and preserve original causes when wrapping.

```ts
type Result<T, E> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: E };

type CreateUserError =
  | { readonly code: "invalid_email"; readonly message: string }
  | { readonly code: "email_taken"; readonly message: string };

function createUser(email: string): Result<User, CreateUserError> {
  if (!email.includes("@")) {
    return {
      ok: false,
      error: { code: "invalid_email", message: "Email must contain @" },
    };
  }

  return { ok: true, value: { id: crypto.randomUUID(), email } };
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}
```

## Loose objects and magic strings

Do not accept loose objects or magic strings in domain logic.
`Record<string, unknown>` is acceptable for boundary parsing, not internal
domain state. Convert loose objects into domain types early; use literal unions,
readonly constants, enums, or discriminated unions for closed vocabularies.

```ts
const ORDER_STATUS = {
  Draft: "draft",
  Submitted: "submitted",
  Paid: "paid",
  Cancelled: "cancelled",
} as const;

type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    value === ORDER_STATUS.Draft ||
    value === ORDER_STATUS.Submitted ||
    value === ORDER_STATUS.Paid ||
    value === ORDER_STATUS.Cancelled
  );
}
```

Open user-provided strings may remain `string`, but validate format, length,
normalization, and authorization where needed. Do not scatter repeated string
literals across business logic.

## `satisfies` rule

Use `satisfies` when an explicit strict contract is required but preserving an
expression's specific inferred type is valuable. Prefer it for configuration,
route, permission, event, registry, and constant domain tables, plus fixtures
that must match a contract. Do not replace it with a broad annotation when
narrower literal information matters.

```ts
type RouteConfig = {
  readonly path: string;
  readonly requiresAuth: boolean;
};

const route = {
  path: "/dashboard",
  requiresAuth: true,
} satisfies RouteConfig;
```

## Public APIs, frameworks, and type tests

- Export explicit types for public functions, SDK surfaces, packages, handlers,
  and shared modules; keep implementation details private.
- Prefer `type` for unions, mapped types, conditional types, and function object
  shapes. Prefer `interface` only when declaration merging or object extension
  is intentional.
- Use branded types only for real domain invariants, not cosmetic distinctions.
- React/TSX: type props at component boundaries and avoid `React.FC` unless the
  project requires it.
- Node: verify ESM/CJS mode from `package.json` and `tsconfig` before changing
  imports.
- API handlers: validate request data at runtime. TypeScript types alone are not
  enough.
- Decorators: verify compiler flags, framework requirements, and TypeScript
  compatibility before editing.
- Use runtime tests plus type-level assertions where behavior depends on types.

```ts
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

type Expect<T extends true> = T;
```

Use `@ts-expect-error` in a type test only when the expected failure is the
test, and explain the reason on that line.

## Gradual migration

If the strictest mode creates many errors:

1. Do not disable `strict` globally without explaining the cost.
2. Stage work: external boundaries first, nullability and indexing second,
   public APIs third, then internal inference cleanup.
3. Fix root causes over suppressions.
4. Track intentional temporary suppressions with owner, reason, and removal
   condition.
5. Never hide migration debt inside broad casts.

## Review and output checklist

Before finalizing, verify:

- No new uncontained `any`, unjustified assertions, non-null assertions, or
  TypeScript suppression comments.
- No unchecked conversion from `unknown` to domain types.
- No client-controlled money, quantity, discount, or total trusted without
  server-side recomputation.
- No impossible state encoded with optional booleans or loosely related nullable
  fields.
- Expected failures are return types; exceptional failures are narrowed from
  `unknown`.
- No loose objects leaking into domain logic or repeated magic strings for
  closed vocabularies.
- `satisfies`, discriminated unions, and `never` exhaustiveness checks are used
  where appropriate.
- Public APIs are stable and external data is runtime-validated.
- TSConfig changes match the runtime and framework.
- Build, typecheck, lint, and tests pass, or failures are reported precisely.

When producing TypeScript work, include complete edited code when feasible,
relevant `tsconfig` rationale, trust-boundary findings and fixes, security
findings separately from typing findings, validation run or recommended,
remaining risks and migration debt, and compatibility notes tied to the detected
TypeScript and framework version.
