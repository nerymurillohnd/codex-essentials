# Husky and Multi-Stage Quality Gates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a modern Husky/lint-staged local safety net and a reproducible, least-privilege CI/CD quality-gate system for this community Codex plugin/data marketplace, covering pull requests, protected branches, security checks, releases, and post-release verification.

**Architecture:** Keep local hooks fast and advisory to CI: Husky 9.1.7 invokes lint-staged, while GitHub Actions runs authoritative, independently observable jobs. Every workflow uses Node 24, npm lockfile installation, minimal permissions, full commit-SHA action pins, and `HUSKY=0`. Manifest, plugin, documentation, security, and release checks remain separate jobs so branch protection can require each signal without hiding the failing concern behind one opaque command.

**Tech Stack:** Node.js 24.19.0 (`.nvmrc`), npm 12, Husky 9.1.7, lint-staged, Prettier 3.9.6, ESLint 10.9.1 flat config, TypeScript 7 native `tsc` with TypeScript 6.0.2 API-compatible `tsc6`, Vitest 4.1.11 with V8 coverage, AJV/YAML manifest validators, GitHub Actions, CodeQL, dependency review, and actionlint.

**Spec:** Repository requirements in `AGENTS.md`, `docs/agent-guidelines/quality.md`, `docs/agent-guidelines/tooling.md`, `docs/decisions/adr-0004-documentation-and-maintenance-automation.md`, and the user-approved request for local hooks plus quality gates at every delivery stage.

## Global Constraints

- This is a data/plugin marketplace, not a web application. Do not add web build assumptions, `src/`, or site-specific jobs.
- Preserve the existing dirty worktree changes. Before implementation, inspect `git status`; never use `git add .`, reset, or checkout to hide unrelated work.
- Use English for repository artifacts and Spanish for collaboration messages.
- Tests must be TypeScript (`tests/**/*.test.ts`), use Vitest, avoid `any` and magic strings, and keep per-file coverage at or above the repository’s 96% threshold.
- JavaScript/CJS/MJS files edited by the implementation must begin with `// @ts-check`; shell scripts must use POSIX-compatible syntax and `#!/usr/bin/env bash` with `set -euo pipefail` when Bash is required.
- Do not read or print `.env`, `.dev.vars`, or other real-secret files. Use names-only example files and `${VAR}` masks.
- Keep `package.json`, `package-lock.json`, `.nvmrc`, and `.npmrc` aligned. Add `engine-strict=true` and a Node engine of `>=24` without changing the managed runtime policy.
- Husky 9.1.7 is the current published release verified for this plan. Husky 10 is not published; write hooks without the deprecated `_/husky.sh` shim so the repository is forward-compatible.
- Retrieve current action release SHAs immediately before implementation. Never replace a full SHA with a floating tag.

## Current Repository Map

| Area                   | Existing location                                          | Planned change                                                                      |
| ---------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Package/runtime        | `package.json`, `package-lock.json`, `.nvmrc`; no `.npmrc` | Add Husky/lint-staged, `prepare`, engines, strict npm policy, and lockfile entries. |
| Local automation       | no `.husky/` directory                                     | Add executable `.husky/pre-commit` that runs lint-staged; no legacy bootstrap.      |
| Quality workflow       | `.github/workflows/quality.yml`                            | Split authoritative gates and add a required aggregator.                            |
| Documentation workflow | `.github/workflows/documentation-gate.yml`                 | Keep its independent status and disable Husky in CI.                                |
| Release workflow       | `.github/workflows/plugin-release.yml`                     | Separate validate/draft/publish permissions and add release smoke gates.            |
| Security workflow      | absent                                                     | Add dependency review, CodeQL, and workflow linting with least privilege.           |
| Contracts/tests        | `templates/`, `scripts/`, `tests/`                         | Add contract tests for package, hooks, workflow YAML, and documentation policy.     |
| Durable decisions      | `docs/decisions/`                                          | Add an ADR for the hook and gate architecture.                                      |
| Maintenance            | `docs/maintenance/pending-debt.md` and `resolved-debt.md`  | Track GitHub-side configuration that cannot be verified locally.                    |

## Evidence and Version-Baseline Checks

Before changing version-sensitive files, retrieve the current data again and record the date in the implementation notes:

- Husky official docs and releases: [get started](https://github.com/typicode/husky/blob/main/docs/get-started.md), [how-to](https://github.com/typicode/husky/blob/main/docs/how-to.md), [releases](https://github.com/typicode/husky/releases). Confirm the latest published version and that no v10 release exists.
- Prettier pre-commit guidance: [precommit.md](https://github.com/prettier/prettier/blob/main/docs/precommit.md).
- ESLint flat configuration and CLI behavior: [official documentation](https://eslint.org/docs/latest/use/configure/configuration-files) and [releases](https://github.com/eslint/eslint/releases).
- TypeScript compiler/API split: [TypeScript 7 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0) and [releases](https://github.com/microsoft/TypeScript/releases).
- GitHub Actions used by the workflows: [checkout releases](https://github.com/actions/checkout/releases), [setup-node releases](https://github.com/actions/setup-node/releases), [dependency-review releases](https://github.com/actions/dependency-review-action/releases), [CodeQL releases](https://github.com/github/codeql-action/releases), and [actionlint releases](https://github.com/rhysd/actionlint/releases).

The currently verified pins to retain unless a fresh retrieval finds a newer approved release are checkout `3d3c42e5aac5ba805825da76410c181273ba90b1`, setup-node `820762786026740c76f36085b0efc47a31fe5020`, dependency-review v5.0.0 `a1d282b36b6f3519aa1f3fc636f609c47dddb294`, and actionlint v1.7.7 `03d0035246f3e81f36aed592ffb4bebf33a03106`. Resolve the CodeQL tag to its underlying commit SHA at implementation time because its current tag is annotated.

## Implementation Tasks

### Task 0: Establish a safe implementation baseline

**Files:** no product files; implementation branch/worktree only.

- [ ] Run `git status --short --branch`, `git diff --stat`, and `git diff --name-only` to identify the existing user changes listed in the repository context.
- [ ] Confirm `git remote -v` and GitHub repository state before assuming branch protection, environments, or required checks exist. The repository currently has no configured remote.
- [ ] Create an isolated branch such as `feat/husky-quality-gates` only after confirming the current branch contains no uncommitted work owned by this task.
- [ ] Re-fetch versions with `npm view husky version`, `npm view lint-staged version`, and the GitHub release/API commands documented above; record any changed pins in the plan execution notes.
- [ ] Do not commit or stage the existing dirty workflow, documentation, or test files until their ownership is confirmed.

### Task 1: Define the dependency and configuration contract (TDD)

**Files:** `tests/husky-config.test.ts` (new), `package.json`, `package-lock.json`, `.npmrc` (new), `.nvmrc` (verify only).

- [ ] Write failing Vitest tests first. Read JSON as `unknown`, narrow it with explicit type guards, and assert: `engines.node` is `>=24`; `scripts.prepare` is exactly `husky`; `devDependencies.husky` is `9.1.7` (or the freshly verified compatible range); `lint-staged` is declared; the lint-staged patterns cover authored JS/CJS/MJS, TS, JSON/JSONC, YAML, and Markdown; and `.npmrc` contains `engine-strict=true`.
- [ ] Run `npm test -- tests/husky-config.test.ts`; verify it fails because Husky, lint-staged, `.npmrc`, and/or `prepare` are absent.
- [ ] Install with the project manager: `npm install --save-dev husky@9.1.7 lint-staged`.
- [ ] Add the `prepare` script and a JSON `lint-staged` configuration that runs `prettier --write` on supported authored files and `eslint --fix --max-warnings=0` only on lintable JS-family files. Do not make lint-staged the authoritative typecheck.
- [ ] Add `.npmrc` with only `engine-strict=true`; retain `.nvmrc` at `24.19.0` and add/align `package.json` engines.
- [ ] Run the focused test again, then `npm install --package-lock-only` if needed to normalize the lockfile. Commit only these explicit files with `build: configure node and staged-file tooling`.

### Task 2: Add the Husky pre-commit hook (TDD)

**Files:** `tests/husky-hook.test.ts` (new), `.husky/pre-commit` (new).

- [ ] Write a failing test that verifies `.husky/pre-commit` exists, is executable, contains a POSIX-compatible direct invocation (`npx --no-install lint-staged`), and does not source `_/husky.sh`, use `HUSKY_SKIP_HOOKS`, or contain a network-install fallback.
- [ ] Run the focused test to capture the expected missing-hook failure.
- [ ] Run `npx husky init` only if it is needed to create the directory, then replace the generated example with a two-line executable hook: `#!/usr/bin/env sh` followed by `npx --no-install lint-staged` (no deprecated shim).
- [ ] Verify GUI/nvm behavior through documentation rather than committing a user-specific `~/.config/husky/init.sh`; document that developers may source their own nvm initialization there.
- [ ] Test the hook without creating a commit by temporarily appending `exit 1` in a disposable copy or using a temporary test repository, then remove the temporary change. Verify a normal staged-file run with `npx lint-staged --debug`.
- [ ] Run the focused tests and `git diff --check`; commit `.husky/pre-commit` and its test with `feat: add husky pre-commit gate`.

### Task 3: Refactor CI quality into independently required gates (TDD)

**Files:** `tests/workflow-contracts.test.ts` (new or extend existing), `.github/workflows/quality.yml`.

- [ ] Add failing YAML contract tests using the existing `yaml` dependency. Assert every job checks out with the pinned checkout action, sets up Node `24` with the pinned setup-node action and npm cache, runs `npm ci`, sets `HUSKY: "0"`, and has no `pull_request_target` trigger. Assert action references are full 40-character SHAs.
- [ ] Assert the quality workflow exposes separate jobs for format, lint, native typecheck, script typecheck, TypeScript 6 API compatibility, tests/coverage, manifest validation, and a final `required` aggregator with `if: always()` that fails when any required job is not successful.
- [ ] Run `npm test -- tests/workflow-contracts.test.ts`; verify the current single-job workflow fails these assertions.
- [ ] Rewrite `quality.yml` with `push` and `pull_request` triggers, a concurrency group that cancels superseded runs, read-only contents permission, and one job per gate. Use exact commands: `npm run format:check`, `npm run lint -- --max-warnings=0`, `npm run typecheck`, `npm run typecheck:scripts`, `npx tsc6 --noEmit`, `npm test`, and `npm run validate:all`.
- [ ] Make each job upload only the artifacts needed to diagnose failures; do not grant write permissions. Keep the aggregator explicit so branch protection can require one stable check while still exposing each detailed job.
- [ ] Run the contract tests, `actionlint .github/workflows/*.yml`, and `npm run format:check`; commit only the workflow and contract test with `ci: split quality gates by concern`.

### Task 4: Harden the documentation gate and add repository contract coverage (TDD)

**Files:** `tests/documentation-contract.test.ts` (new or extend workflow tests), `.github/workflows/documentation-gate.yml`, `scripts/documentation_gate.cjs` only if a failing contract exposes a real defect.

- [ ] Write failing tests for the documentation workflow: PR-only event types (`opened`, `synchronize`, `reopened`), fetch-depth sufficient for base/head comparison, Node 24, `HUSKY=0`, minimal read permission, and execution of `npm run validate:all` plus `npm run documentation:gate` with explicit base/head environment variables.
- [ ] Run the focused tests and record the failure before implementation.
- [ ] Add only the missing environment/permission/contract details; preserve the existing initial-commit handling already fixed in `scripts/documentation_gate.cjs`.
- [ ] Add tests for the documentation synchronization policy: every plugin must keep `README.md`, `CHANGELOG.md`, `.codex-plugin/plugin.json`, and marketplace registration aligned; an empty `plugins/` directory remains valid.
- [ ] Run focused tests and `npm run documentation:gate`; commit with `ci: enforce documentation synchronization gate`.

### Task 5: Add least-privilege security workflow (TDD)

**Files:** `tests/security-workflow.test.ts` (new or extend workflow tests), `.github/workflows/security.yml` (new), `docs/agent-guidelines/security.md` only for synchronized policy text.

- [ ] Write failing tests that require: Node 24 for JavaScript action jobs, full SHA pins, `contents: read` by default, `pull-requests: read` only where dependency review needs it, `security-events: write` only for CodeQL, no secrets on fork-triggered PR jobs, dependency review, CodeQL initialization/analyze, and actionlint coverage.
- [ ] Resolve the current CodeQL release tag to a commit SHA with the GitHub API. If the ref is annotated, resolve the tag object to the underlying commit before writing YAML. Record the release label beside the SHA.
- [ ] Implement `security.yml` with separate dependency-review, CodeQL, and workflow-lint jobs. Use the verified dependency-review and actionlint SHAs unless fresh retrieval requires an update; run `actionlint` against all workflow files and keep CodeQL permissions scoped to its job.
- [ ] Add `HUSKY=0` to any job that runs npm installation. Avoid publishing SARIF or modifying repository state from PR jobs beyond the CodeQL security-events permission.
- [ ] Run the security contract tests and `actionlint`; commit with `ci: add dependency and workflow security gates`.

### Task 6: Make release automation promotion-safe (TDD)

**Files:** `tests/release-workflow.test.ts` (new or extend workflow tests), `.github/workflows/plugin-release.yml`.

- [ ] Write failing tests asserting the tag/manual triggers, exact tag validation, Node 24 and npm lockfile install, `HUSKY=0`, complete manifest/documentation validation before release creation, `npm pack --dry-run` or equivalent distributable smoke test, and permission separation: validation is read-only, draft creation has only contents write, and publish requires an explicit protected `release` environment.
- [ ] Run focused tests to prove the current workflow lacks at least one required boundary.
- [ ] Refactor into `validate`, `draft`, and `publish` jobs. Keep `release-changelog-builder` SHA-pinned, use `needs` plus `if: success()`, prevent duplicate tag releases, and make the publish job manual through the protected environment rather than an implicit write on every tag push.
- [ ] Ensure the release job records the exact plugin version, generated changelog source, artifact checksum, and rollback instruction in the release metadata. Do not put credentials in logs; use `${VAR}` placeholders in documentation.
- [ ] Run release contract tests and `npm run validate:release`; commit with `ci: gate plugin promotion and release permissions`.

### Task 7: Document the operating model and unresolved GitHub-side setup (TDD)

**Files:** `docs/decisions/adr-0005-hooks-and-quality-gates.md` (new), `docs/agent-guidelines/quality.md`, `docs/agent-guidelines/tooling.md`, `README.md`, `docs/maintenance/pending-debt.md`, `tests/documentation-contract.test.ts`.

- [ ] Add failing documentation tests for required headings and policy phrases: local hooks are advisory, CI is authoritative, `HUSKY=0` in CI, Node 24, full SHA pins, TypeScript 7/6 side-by-side roles, branch-protection required checks, release environment approval, rollback, and the Husky v10-compatible no-shim rule.
- [ ] Write ADR-0005 with Context, Decision, Alternatives, Consequences, Security/permissions, Compatibility, Rollback, and Verification sections. State the verified date and link official sources; do not claim Husky 10 has shipped.
- [ ] Update contributor docs with exact commands (`npm run format:check`, `npm run lint -- --max-warnings=0`, `npm run typecheck`, `npm run typecheck:scripts`, `npx tsc6 --noEmit`, `npm test`, `npm run validate:all`, `actionlint`). Explain how to bypass a local hook only for an authorized emergency (`HUSKY=0` or `--no-verify`) and that CI remains mandatory.
- [ ] Update `README.md` installation/contributor sections and keep product documentation in English. Include the repository URL once it exists; until then, document that no remote is configured.
- [ ] Add a dated pending-debt entry for creating the GitHub remote, configuring branch protection with the required check names, creating the protected `release` environment, and verifying Dependabot/security settings. Move it to `resolved-debt.md` only after a live GitHub verification.
- [ ] Run documentation tests and `npm run documentation:gate`; commit with `docs: document hooks and quality gate policy`.

### Task 8: Run the complete verification matrix and handoff

**Files:** no new implementation files; update `docs/maintenance/resolved-debt.md` only for checks actually completed.

- [ ] Run exactly: `npm run format`, `npm run format:check`, `npm run lint -- --max-warnings=0`, `npm run typecheck`, `npm run typecheck:scripts`, `npx tsc6 --noEmit`, `npm test`, `npm run validate:all`, `npm run validate:release`, `npx tsc --project tsconfig.diagnostics.json`, `actionlint .github/workflows/*.yml`, and `git diff --check`.
- [ ] Run `npm pack --dry-run` for the root package and the repository’s plugin packaging smoke path, if a plugin exists. An empty `plugins/` directory must remain a passing case.
- [ ] Review Vitest coverage output and confirm every changed internal file meets the 96% per-file threshold; add branch tests rather than weakening thresholds.
- [ ] Inspect `git status --short`, `git diff --stat`, and the final list of staged paths. Verify no secret file, generated cache, or unrelated user change is staged.
- [ ] Record every skipped check, unresolved diagnostic, missing external configuration, and residual risk. Do not mark the work complete while a required gate is red or a diagnostic is unexplained.
- [ ] After all checks pass, run the repository’s review/finishing workflow and create a final commit only from explicit task commits. Do not push because the repository currently has no configured remote unless Nery authorizes and configures one.

## Definition of Done

- Local commits run the modern Husky hook without the deprecated bootstrap and can be bypassed only deliberately.
- Every CI job runs on Node 24, installs reproducibly with npm, disables Husky, uses least privilege, and pins third-party actions to full SHAs.
- Required checks separately expose formatting, lint, both TypeScript compilers, tests/coverage, manifests, documentation, security, and release validation.
- Release writes are isolated behind a protected environment and can be traced and rolled back.
- Tests are TypeScript-only, contain no `any` or magic strings, cover changed branches at least 96% per file, and validate the actual repository contracts.
- ADR, contributor guidance, README, changelog/manifest policy, and maintenance debt are synchronized with the implemented behavior.
