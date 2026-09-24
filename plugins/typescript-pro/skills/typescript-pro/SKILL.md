---
name: typescript-pro
description:
  Use when reading, writing, reviewing, refactoring, or debugging TypeScript,
  TSX, tsconfig, declarations, generics, strict typing, external data
  boundaries, or type-related build errors.
---

# TypeScript Pro

Treat TypeScript as a correctness layer. Preserve runtime behavior unless the
requested fix requires a change, and use runtime validation for facts the
compiler cannot prove.

## Inspect before changing

Read the project's manifest, lockfile, `tsconfig*`, framework configuration,
relevant source, and existing check scripts. Identify its installed TypeScript
version, Node/browser runtime, ESM/CJS mode, test runner, and package manager.
Use project-local commands and dependencies; do not introduce a new package
manager or download an unpinned compiler as a fallback.

For version-specific compiler options, decorators, module resolution, or
compiler-API integrations, fetch current official TypeScript and framework
documentation before changing configuration. TypeScript 7 is a native compiler
line with different defaults and no compiler API in 7.0; read
[version and boundary notes](references/boundary-and-state-patterns.md) when
that distinction affects a tool or migration.

## Find the proof boundary

Treat network responses, `JSON.parse`, forms, environment variables, CLI
arguments, files, database rows, cookies, webhooks, and third-party SDK output
as `unknown` until a parser, guard, or controlled constructor proves the domain
shape. Find the exact point where an untrusted value becomes a domain type. An
assertion such as `as User`, `value!`, a double cast, `@ts-ignore`, or bare
`any` moves proof to the author. Keep it only with a concrete runtime or interop
justification and the validation point documented.

Prefer narrow public types, inference inside simple implementations,
discriminated unions for mutually exclusive states, and `never` exhaustiveness
where the vocabulary is closed. Use `satisfies` when a value must meet a
contract while retaining useful literal inference. Avoid generic type machinery
that increases complexity without removing a real invalid state.

Types do not enforce authentication, authorization, money, quantity, inventory,
or pricing rules at runtime. Recompute client-submitted monetary totals from
authoritative server data. Validate quantities as finite safe integers within
domain limits before using them. Report security defects separately from type
style findings.

Read [boundary and state patterns](references/boundary-and-state-patterns.md)
only when implementing a parser, closed async state, or typed internal event
contract; it is not a template to add to ordinary code.

## Implement and verify

For a review-only request, report findings with file locations and risk; do not
edit. For an authorized change, make a scoped, behavior-preserving fix and run
the project's declared typecheck, tests, lint, and build gates that apply. If a
local compiler is present, use it directly. Never hide errors with a global
`skipLibCheck`, broad cast, or suppressed diagnostic merely to obtain a green
run. When strictness exposes migration debt, stage work from external boundaries
through nullability and indexing to public APIs, recording any temporary
exception and its removal condition.

Report the detected compiler/runtime versions, what changed, what was proved at
runtime, commands and outcomes, remaining type or migration debt, and any
behavioral or security implications. If a required tool or project fact is
missing, state the validation limit rather than inventing compatibility.
