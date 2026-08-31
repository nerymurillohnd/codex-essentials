# Complete Script Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every maintained script subject to the existing 96% per-file coverage gate through behavioral tests, without lowering thresholds or hiding sources.

**Architecture:** Vitest coverage profiles will enumerate every production CJS module. Thin CLI wrappers will expose deterministic `main`/`run` functions for in-process branch coverage while separate child-process tests retain the real Node entrypoint contract. Pure path and documentation helpers will be tested directly against temporary Git fixtures.

**Tech Stack:** Node.js 24.20.0, Vitest 4.1.11 with V8 coverage, CommonJS scripts, npm.

**Spec:** `AGENTS.md` automated quality gate and `docs/maintenance/resolved-debt.md` 2026-08-27 JavaScript coverage record.

**Status:** Completed in `7a1d7b8`. The implementation consolidated the planned
wrapper tests into `tests/script-entrypoints.test.ts` and the Git-backed
documentation and guard integration tests into
`tests/marketplace-pipeline.test.ts`.

**Completion evidence:** `npm run check` passed on 2026-08-31 with 8 test files,
57 tests, 99.20% line coverage, 97.87% branch coverage, and 100% function
coverage.

## Global Constraints

- Preserve per-file 96% thresholds for lines, functions, branches, and statements.
- Keep every CLI executable through `node scripts/<name>.cjs`.
- Do not add dependencies, disable controls, create coverage exclusions for production behavior, or commit without explicit authorization.
- Use real temporary filesystem and Git fixtures; mocks may capture process output only.

---

### Task 1: Expose thin CLI wrappers for deterministic coverage

**Files:**

- Modify: `scripts/documentation-gate.cjs`
- Modify: `scripts/plugin-manifest-guard.cjs`
- Modify: `scripts/validate-github-labels.cjs`
- Test: `tests/script-entrypoints.test.ts`
- Test: `tests/marketplace-pipeline.test.ts`
- Test: `tests/github-labels.test.ts`

**Interfaces:**

- Produces: `main(args)` and `run(args)` exports for each CLI; direct execution remains guarded by `require.main === module`.
- Produces: `eventTouchesPluginManifest(value)` export for manifest-event classification.

- [x] Write assertions that importing each wrapper exposes its callable interface and that its real child-process entrypoint preserves success and failure exit behavior.
- [x] Run each focused test before the wrapper refactor and confirm it fails because the interface is not exported.
- [x] Add the smallest `main`/`run` separation that accepts explicit arguments, returns an exit status, and keeps the existing emitted text and CLI behavior.
- [x] Run the focused tests and confirm the original child-process behavior and the new in-process branches pass.

### Task 2: Test uncovered path and documentation boundaries

**Files:**

- Create: `tests/path-utils.test.ts`
- Modify: `tests/script-entrypoints.test.ts`
- Modify: `tests/marketplace-pipeline.test.ts`

**Interfaces:**

- Consumes: `resolveContainedPath(root, relativePath)` and documentation-gate exports.
- Produces: adversarial assertions for traversal, external and unresolved symlinks, invalid CLI arguments, Git failures, documentation drift, and masked versus unmasked credentials.

- [x] Write focused tests for normal contained paths and every path rejection mode; use temporary directories and real symbolic links.
- [x] Write focused documentation-gate tests using actual temporary Git repositories and commits.
- [x] Run the tests before changing coverage configuration; they must initially prove behavior but not make the omitted source visible to the coverage gate.
- [x] Retain child-process tests for `documentation-gate.cjs` and `plugin-manifest-guard.cjs` so module-guard wiring is independently exercised.

### Task 3: Make the complete source inventory a coverage contract

**Files:**

- Create: `coverage-profiles.ts`
- Modify: `vitest.config.ts`
- Test: `tests/coverage-contract.test.ts`
- Test: the focused files declared in `coverage-profiles.ts`

**Interfaces:**

- Produces: a complete coverage profile map containing every maintained production CJS module exactly once.
- Produces: focused-test profiles that only include the source exercised by that test file.

- [x] Add `documentation-gate.cjs`, `plugin-manifest-guard.cjs`, `path-utils.cjs`, and `validate-github-labels.cjs` to the appropriate profiles without changing any threshold.
- [x] Run each focused test command with coverage and verify no unrelated script is required by that focused command.
- [x] Run `npm run test`, inspect the text coverage table, and verify every module under `scripts/` except `scripts/tsconfig.json` is present and each metric is at least 96%.
- [x] Run `npm run check`; report the exact output and any residual diagnostics. Do not commit because authorization has not been granted.

### Task 4: Normalize every CJS error boundary

**Files:**

- Create: `scripts/error-utils.cjs`
- Create: `tests/error-utils.test.ts`
- Modify: every `scripts/*.cjs` that formats a caught value for output or an enclosing error

**Interfaces:**

- Produces: `formatError(error: unknown): string`, returning an Error message only when it is non-empty and otherwise `String(error)`.
- Consumes: CJS catch boundaries that report errors; bare catches used solely for explicit control flow remain unchanged.

- [x] Write a failing `formatError` table test for `Error`, string, number, `null`, and `undefined` values.
- [x] Replace every blind `/** @type {Error} */` cast and duplicated error formatter in `scripts/*.cjs` with the shared helper.
- [x] Preserve the first-line shebang and second-line `// @ts-check` in executable CJS files; retain `.cjs` for every CommonJS runtime boundary.
- [x] Run focused coverage for the helper and every affected wrapper, then `npm run check`; do not commit without authorization.
