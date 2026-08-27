# Resolved Debt

Move completed maintenance items here with the resolution date and verification reference.

- 2026-08-27 — Added `// @ts-check` to every repository JavaScript source,
  introduced the separate `tsconfig.scripts.json` `checkJs` project, and added
  `scripts/tsconfig.json` for editor project association without changing the
  TypeScript-only root project. Verified with `npm run check` and both
  TypeScript 7 and TypeScript 6 script-project checks.
- 2026-08-27 — Migrated Vitest tests to TypeScript, corrected the strict
  `tsconfig.json` boundaries, and made `tsconfig.build.json` compatible with
  TypeScript 7. All repository `.ts` files are typechecked while runtime
  CommonJS/ESM tooling remains excluded. Verified with `npm run check` and
  `npx tsc --project tsconfig.build.json`.
- 2026-08-27 — Added the documented TypeScript side-by-side aliases: native
  TypeScript 7 through `@typescript/native` and the TypeScript 6 compiler API
  through `typescript`. Verified with `npx tsc --version`, `npx tsc6 --version`,
  and both no-emit checks.
- 2026-08-27 — Confirmed that the `@typescript/typescript6` wrapper publishes
  through `6.0.2` while its `@typescript/old` dependency provides the effective
  TypeScript 6.0.3 API. Verified against npm metadata and
  `require("typescript").version`.
- 2026-08-27 — Added canonical plugin README and changelog templates, generator
  scaffolding, documentation validation, GitHub contribution forms, release
  configuration, documentation gates, per-plugin release validation, and a
  dry-run/idempotent Projects bootstrap helper. Verified with the repository
  format, lint, typecheck, Vitest coverage, and manifest validation gates.
