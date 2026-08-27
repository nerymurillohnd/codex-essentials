---
status: accepted
date: 2026-08-27
decision-makers: Nery Samuel Murillo
consulted: None recorded
informed: Repository contributors and maintainers
---

# Preserve the TypeScript 6 Wrapper Alias at 6.0.2

## Context and Problem Statement

The repository runs TypeScript 7 as its native command-line compiler while
retaining TypeScript 6 for tools that require the JavaScript compiler API. The
root `package.json` therefore uses two npm aliases:

```json
{
  "@typescript/native": "npm:typescript@^7.0.2",
  "typescript": "npm:@typescript/typescript6@^6.0.2"
}
```

The effective API version is reported as TypeScript 6.0.3, which raised the
question of whether the second alias should be changed to
`npm:@typescript/typescript6@^6.0.3`.

## Decision Drivers

- Keep `npx tsc` mapped to TypeScript 7.
- Preserve `npx tsc6` and `require("typescript")` compatibility for API-dependent tools.
- Use a package specification that exists in the npm registry.
- Keep clean installs reproducible through `package-lock.json`.

## Considered Options

- Keep `npm:@typescript/typescript6@^6.0.2` and document its effective API version.
- Change the wrapper alias to `npm:@typescript/typescript6@^6.0.3`.
- Replace the wrapper with `npm:typescript@^6.0.3` under the package name `typescript`.

## Decision Outcome

Chosen option: **Keep `npm:@typescript/typescript6@^6.0.2` and document the
effective API version**.

The wrapper package currently publishes only versions `6.0.0`, `6.0.1`, and
`6.0.2`. Its `@typescript/old` dependency resolves the JavaScript compiler API
to `typescript@6.0.3`. The requested `@typescript/typescript6@^6.0.3`
specification is therefore invalid and produces npm `ETARGET`.

### Consequences

- Good, because the existing alias remains installable and preserves the
  `tsc6` binary without colliding with TypeScript 7's `tsc` binary.
- Good, because API-dependent consumers receive TypeScript 6.0.3 today.
- Bad, because the wrapper package version shown in `package.json` is 6.0.2,
  while the effective compiler/API version is 6.0.3.
- Bad, because the wrapper's `@typescript/old` range may resolve a later
  TypeScript 6 release when dependencies are deliberately updated; the lockfile
  must be reviewed whenever that resolution changes.

### Confirmation

The decision is confirmed by the package manifest, lockfile, runtime API, and
clean-install checks:

```text
npm view @typescript/typescript6 versions --json
-> ["6.0.0", "6.0.1", "6.0.2"]

npx tsc --version
-> Version 7.0.2

npx tsc6 --version
-> Version 6.0.3

require("typescript").version
-> 6.0.3

npm ci
-> added 144 packages, and audited 145 packages
```

## Pros and Cons of the Options

### Keep the wrapper alias at 6.0.2

- Good, because the package exists and is the documented side-by-side layout.
- Good, because it exposes `tsc6` while the native alias exposes `tsc`.
- Neutral, because the effective API is supplied transitively by
  `@typescript/old`.
- Bad, because the wrapper and effective API versions differ.

### Change the wrapper alias to 6.0.3

- Bad, because npm reports `ETARGET`: no
  `@typescript/typescript6@6.0.3` package exists.
- Bad, because `npm ci` would not be able to resolve the dependency.

### Alias regular `typescript@6.0.3`

- Good, because the regular TypeScript package exists at 6.0.3 and includes
  the JavaScript compiler API.
- Bad, because it exposes a `tsc` binary rather than the wrapper's `tsc6`,
  creating a binary-name collision with `@typescript/native` and requiring a
  different toolchain layout.

## More Information

- [TypeScript 7 and TypeScript 6 side-by-side overview](typescript-side-by-side.md)
- [`@typescript/typescript6` package metadata](https://www.npmjs.com/package/@typescript/typescript6)
- [`typescript@6.0.3` package metadata](https://www.npmjs.com/package/typescript/v/6.0.3)
- Revisit this decision when `@typescript/typescript6@6.0.3` is published or
  when all API-dependent tooling supports TypeScript 7 directly.
