# Declarative Plugin Architecture Implementation Plan

> **Status: Superseded historical record**
>
> This plan records an earlier implementation approach and is retained for
> historical context. It was superseded by [ADR-0007](../../decisions/adr-0007-plugin-manifest-marketplace-contract.md).
> Do not use its source-of-truth, synchronization, validation, or release
> commands as current instructions. Use the current [architecture guidance](../../agent-guidelines/architecture.md),
> `npm run marketplace:build`, and `npm run marketplace:check` instead.

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans`
> to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Replace legacy manifest tooling with a secure JSON SSOT, domain-local
operational library, generated Codex artifacts, and package-containment gates.

**Architecture:** `lib/source.json` owns fixed metadata for the entire
marketplace. Typed CJS modules load it, validate it with Ajv and JSON Schema,
render package-local JSON/YAML artifacts, and provide explicit scaffold, sync,
validation, documentation, release, project, and quality commands. Plugins own
only distributable resources and never resolve repository infrastructure.

**Tech Stack:** Node.js 24, CommonJS with `// @ts-check`, TypeScript strict
checking, Ajv Draft 2020-12, YAML, Vitest and V8 coverage.

**Spec:** `docs/superpowers/specs/2026-08-27-declarative-plugin-architecture-design.md`

## Global Constraints

- `lib/source.json` is the sole declarative SSOT.
- `lib/` is never a plugin runtime dependency.
- All effective plugin paths must canonically resolve inside the package.
- JSON Schema plus Ajv validates data; no executable plugin definitions or Zod.
- Generated metadata is the only overwriteable output.
- `SKILL.md`, README, and changelog are initialized but never overwritten.
- Code and tests are co-located by domain under `lib/`.
- Root `scripts/`, `tests/`, and `templates/` are removed only after replacement.

### Task 1: Establish the typed source and schema boundary

**Files:**

- Create: `lib/source.json`
- Create: `lib/schemas/source.schema.json`
- Move: `templates/{agent,marketplace,plugin}.schema.json` to `lib/schemas/`
- Create: `lib/core/{errors,paths,schema,source}.cjs`
- Test: `lib/core/source.test.ts`

- [ ] Write failing tests for schema-valid source loading, duplicate IDs,
      unsupported fields, and unsafe package-relative paths.
- [ ] Implement source JSON Schema and typed source loader using Ajv.
- [ ] Populate `lib/source.json` from the current two published package
      manifests, agent manifests, and marketplace policies.
- [ ] Add canonical containment helpers that reject external symlink targets.
- [ ] Run `npx vitest run lib/core/source.test.ts` and confirm green.

### Task 2: Implement source-derived scaffolding and synchronization

**Files:**

- Create: `lib/templates/{README,CHANGELOG,SKILL}.md`
- Create: `lib/sync/{render,plugin,marketplace}.cjs`
- Create: `lib/cli/{scaffold,sync}.cjs`
- Test: `lib/sync/{plugin,marketplace}.test.ts`
- Test: `lib/cli/{scaffold,sync}.test.ts`

- [ ] Write failing fixtures for render output, author-content preservation,
      missing artifact creation, metadata drift, and a nonmatching skill ID.
- [ ] Implement deterministic renderers for `plugin.json`, `openai.yaml`, and
      `.agents/plugins/marketplace.json`.
- [ ] Implement scaffold-only creation for missing skill, README, and changelog
      templates; do not overwrite existing author-owned files.
- [ ] Implement sync write and read-only drift checks.
- [ ] Run the relevant domain tests and confirm green.

### Task 3: Implement strict package and release validation

**Files:**

- Create: `lib/validate/{package,release}.cjs`
- Create: `lib/cli/validate.cjs`
- Test: `lib/validate/{package,release}.test.ts`

- [ ] Write failing fixtures for a symlinked `skills/` directory, a symlinked
      skill root, external manifests/assets, missing generated metadata, and a
      malformed release archive.
- [ ] Implement canonical package scanning, schema validation, documentation
      contract checks, source/output consistency, and release-tag checks.
- [ ] Implement archive-member and symbolic-link rejection for releases.
- [ ] Run the validation domain tests and confirm green.

### Task 4: Migrate supporting operational domains

**Files:**

- Move: `scripts/documentation_gate.cjs` to `lib/documentation/gate.cjs`
- Move: `scripts/bootstrap_project.cjs` to `lib/projects/bootstrap.cjs`
- Move: `scripts/typecheck.cjs` to `lib/quality/typecheck.cjs`
- Move related tests under matching `lib/<domain>/` directories

- [ ] Update each module's relative imports and its colocated test imports.
- [ ] Preserve command-line behavior, arguments, exit codes, and diagnostics.
- [ ] Run the migrated domain tests and confirm green.

### Task 5: Replace repository entrypoints and delete legacy layout

**Files:**

- Modify: `package.json`, `vitest.config.ts`, `tsconfig.json`,
  `tsconfig.scripts.json`, `.gitignore`, `.prettierignore`
- Modify: `.github/workflows/{quality,documentation-gate,plugin-release}.yml`
- Modify: `README.md`, `docs/contributing/plugins.md`, decision records
- Delete: `scripts/`, `tests/`, `templates/`

- [ ] Point package commands and CI at `lib/cli/` entrypoints.
- [ ] Change TypeScript and coverage discovery to `lib/**/*.cjs` and
      `lib/**/*.test.ts`.
- [ ] Update public contributor guidance and decision records to the SSOT model.
- [ ] Delete the legacy roots only after all code and tests are migrated.
- [ ] Run format, lint, TypeScript checks, Vitest, source drift checks,
      `validate:all`, documentation gate fixtures, and release validation fixtures.

### Task 6: Completion audit

**Files:**

- Inspect: `lib/`, `plugins/`, package scripts, CI workflows, and generated
  outputs.

- [ ] Verify that no root `scripts/`, `tests/`, or `templates/` directory
      remains.
- [ ] Verify that all plugin runtime paths are package-contained after symlink
      canonicalization and that no plugin references `lib/`.
- [ ] Verify that `lib/source.json` derives each published manifest, agent
      manifest, and marketplace entry without drift.
- [ ] Run `npm run check` and an independent release archive validation.
