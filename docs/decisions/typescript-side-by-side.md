# TypeScript 7 and TypeScript 6 Side-by-Side

The wrapper-version decision is recorded in
[ADR-0003](adr-0003-typescript6-wrapper-version.md).

## Decision

Keep TypeScript 7 as the repository's native command-line compiler and expose
TypeScript 6 through the package name `typescript` for tools that still need
the JavaScript compiler API.

The root `package.json` uses these aliases:

```json
{
  "@typescript/native": "npm:typescript@^7.0.2",
  "typescript": "npm:@typescript/typescript6@^6.0.2"
}
```

This produces `npx tsc` for TypeScript 7 and `npx tsc6` for TypeScript 6.
API-dependent tools resolve `require("typescript")` to the TypeScript 6
package. The TypeScript 7 binary does not provide that JavaScript compiler API.

The wrapper package and the effective compiler version have different package
names: `@typescript/typescript6` currently publishes through `6.0.2`, while its
`@typescript/old` dependency resolves the JavaScript compiler API to
`typescript@6.0.3`. Do not change the alias suffix to `^6.0.3`; npm rejects that
request because no `@typescript/typescript6@6.0.3` package exists.

## Consequences

- `npm run typecheck` invokes `node_modules/@typescript/native/bin/tsc` so the
  main quality gate checks with TypeScript 7.
- Use `npx tsc6` when a tool or compatibility check requires the TypeScript 6
  API.
- Path-based tooling must account for the API package under
  `node_modules/@typescript/` as well as `node_modules/typescript/`.
- Do not install `typescript-eslint` against the TypeScript 7 package name
  until its supported peer range includes TypeScript 7. Use an isolated
  TypeScript 6 lint toolchain if typed ESLint rules become necessary.

## Verification

```text
npx tsc --version  -> Version 7.0.2
npx tsc6 --version -> Version 6.0.3
npm view @typescript/typescript6 versions --json -> latest 6.0.2
require("typescript").version -> 6.0.3
npx tsc --noEmit   -> exit 0
npx tsc6 --noEmit  -> exit 0
```
