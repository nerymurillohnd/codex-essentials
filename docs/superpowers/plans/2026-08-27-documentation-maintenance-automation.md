# Documentation and Maintenance Automation for Codex Essentials

> **Status: Superseded historical record**
>
> This plan records an earlier implementation approach and is retained for
> historical context. It was superseded by [ADR-0007](../../decisions/adr-0007-plugin-manifest-marketplace-contract.md).
> Do not use its source-of-truth, synchronization, validation, or release
> commands as current instructions. Use the current [architecture guidance](../../agent-guidelines/architecture.md),
> `npm run marketplace:build`, and `npm run marketplace:check` instead.

## Summary

Initialize this workspace as a Git repository and establish a reviewable,
dynamic documentation lifecycle for a community Codex plugin marketplace.
Each plugin is an independently versioned product with a manifest, README,
changelog, tests, and marketplace registration. Documentation changes travel
with the same pull request as the implementation; CI enforces synchronization
and release automation publishes notes without overwriting curated history.

## Architecture and constraints

- `plugins/<id>/` is a product package; there is intentionally no root
  `skills/` directory.
- `templates/` is the local source of truth for JSON Schemas and product
  documentation; GitHub templates provide contribution UX only.
- Scripts remain CommonJS with `// @ts-check`, named constants, and no `any`;
  tests remain TypeScript (`*.test.ts`) and require at least 96% per-file
  coverage.
- Node/npm follow the existing nvm and npm policy. TypeScript 6 remains the
  API provider and TypeScript 7 remains the native `tsc` provider.
- Secrets are never read or printed. Commands and CI use `${VAR}` masks.
- Every material change is verified with format, lint, typecheck, tests, and
  manifest/documentation validation.

## Implementation sequence

1. **Repository bootstrap.** Preserve the existing tree, run `git init`, verify
   `.nvmrc`, `.npmrc`, and `.gitignore`, then create the first commit only after
   all current checks pass. Record the durable architecture decision in
   `docs/decisions/adr-0004-documentation-and-maintenance-automation.md`.
2. **Canonical product templates.** Add `templates/README.md` and revise
   `templates/CHANGELOG.md` to follow Keep a Changelog 1.1.0 (`Unreleased`,
   standard categories, ISO dates, comparison links, and `[YANKED]` support),
   with conditional local area labels and an explicit Breaking Changes
   extension. Templates must explain required evidence, not provide empty
   checklists.
3. **Generator and validator contract.** Extend
   `scripts/generate_manifests.cjs` and `scripts/validate_manifests.cjs` (or a
   focused `scripts/validate_documentation.cjs`) so generation creates
   `plugin.json`, `README.md`, and `CHANGELOG.md`; completion preserves authored
   files; validation checks required headings, manifest/name/version agreement,
   local paths, marketplace registration, and empty-plugin states. Add Vitest
   coverage for every new branch and failure message.
4. **GitHub contribution UX.** Add Issue Forms under
   `.github/ISSUE_TEMPLATE/`, a Markdown PR template, and `.github/release.yml`.
   Forms collect plugin id, impact, permissions, documentation, changelog, and
   verification evidence. The PR template requires synchronized README,
   changelog, manifest, marketplace, tests, and rollback information.
5. **Quality and documentation gates.** Add
   `.github/workflows/quality.yml` and
   `.github/workflows/documentation-gate.yml`. CI runs `npm ci`, formatting,
   lint, both typechecks, Vitest coverage, and `validate:all`. The PR gate
   detects changed plugin surfaces, requires `Unreleased` entries and README
   updates when product behavior, permissions, installation, security,
   manifests, skills, hooks, scripts, MCP, or apps change, and rejects
   credential patterns. YAML and changed-plugin detection receive TypeScript
   Vitest tests.
6. **Independent releases.** Use tags
   `plugin/<plugin-id>/v<semver>`. A merged PR already contains the plugin
   changelog update. `.github/workflows/plugin-release.yml` validates the tag
   against the manifest, generates release metadata, and never rewrites
   historical changelog text. Pin
   `mikepenz/release-changelog-builder-action` to the immutable commit for the
   verified v6.2.3 release, set `failOnError: true`, and record the tag/SHA in
   the ADR; resolve the SHA from the live release immediately before writing
   the workflow.
7. **Community Projects operations.** Add
   `docs/operations/github-project-template.md` and an idempotent,
   dry-run-capable `scripts/bootstrap_project.cjs` using `${GITHUB_ORG}` and
   `${PROJECT_TITLE}`. Define views, fields, labels, review/documentation
   states, auto-add/auto-archive, and the single-source-of-truth boundary.
   Organization-level Projects require the organization prerequisite and a
   token with Projects scope; do not use the repo-scoped default token for
   organization mutations.
8. **Guidance and maintenance synchronization.** Update `AGENTS.md`,
   `README.md`, `docs/agent-guidelines/*`, and maintenance records so the
   actual data/plugin structure, commands, release policy, GitHub limitations,
   and unresolved external prerequisites are explicit. Move completed debt to
   `resolved-debt.md` only after verification.

## Verification and acceptance

Run the following before each milestone and before the final commit:

```bash
npm run format
npm run format:check
npm run lint
npm run typecheck
npm run typecheck:scripts
npm test -- --coverage
npm run validate
npm run validate:plugins
npm run validate:all
npx tsc --project tsconfig.diagnostics.json
```

Acceptance requires a clean Git diff review, at least 96% coverage per file,
zero `any`, `// @ts-check` on every CJS/MJS/JS runtime file, valid empty and
populated marketplace states, precise validator diagnostics, enforced PR
documentation synchronization, secret-safe and idempotent Project bootstrap,
and release workflows that preserve curated changelog history.

## Assumptions

- Releases are per plugin; the PR is the write boundary for changelogs.
- GitHub Actions gate and publish metadata but do not silently modify authored
  documentation.
- `${GITHUB_ORG}` identifies the future community organization; creating the
  remote repository or organization Project is an authorized external action
  performed only after local validation.
