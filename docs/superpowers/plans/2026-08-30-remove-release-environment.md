# Remove Release Environment Approval Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the manual GitHub Actions environment approval from plugin publication while preserving all automated release, artifact, tag, and content validation gates.

**Architecture:** The existing Release Please flow remains the release engine. The final publication job will run after its existing `needs` dependencies and verification steps, without referencing the protected `release` environment. Current policy and decision records will describe the merged Release Please PR as the final human authorization point.

**Tech Stack:** GitHub Actions YAML, Markdown ADR/policy documentation, Node.js validation scripts, Vitest, actionlint.

**Spec:** User-approved request in the current task: retire the `release` environment and remove its manual approval gate.

## Global Constraints

- Keep Release Please, exact tag validation, deterministic archive creation, checksum validation, draft asset upload, and final draft verification unchanged.
- Do not change GitHub App credential handling or commit any credential values.
- Do not rewrite historical audit or resolved-maintenance records; record the superseding decision separately.
- Do not delete the remote GitHub environment until the workflow change is integrated and no active workflow reference remains.

### Task 1: Remove the workflow gate

**Files:**

- Modify: `.github/workflows/release-please.yml:319-320`

- [x] Rename `approve-and-publish` to `publish-releases` and remove only the
      `environment: name: release` block.
- [x] Preserve the job dependencies, least-privilege permissions, draft verification, and publication commands.
- [x] Validate the workflow with `actionlint` and `npm run validate:release-workflow`.

### Task 2: Update active policy and decision records

**Files:**

- Modify: `AGENTS.md`
- Create: `docs/decisions/adr-0010-release-publication-without-environment.md`
- Modify: `.nvmrc`

- [x] State that publication follows the merged Release Please PR and all automated release gates.
- [x] State that the former environment approval is intentionally removed, while tag protection and artifact validation remain.
- [x] Record consequences and rollback in ADR-0010 without rewriting historical ADR rationale.

### Task 3: Verify and inspect the resulting scope

**Files:**

- Test: `.github/workflows/release-please.yml`
- Test: `AGENTS.md`
- Test: `docs/decisions/adr-0010-release-publication-without-environment.md`

- [x] Align `.nvmrc` with the installed project runtime at `24.20.0`.
- [x] Run `npm run check`.
- [x] Run `npm run documentation:gate -- --base main --head HEAD`.
- [x] Run `actionlint`.
- [x] Search active workflow and policy files for stale `environment: release` requirements.
- [x] Confirm `git diff --check` and report that remote environment deletion remains a separate post-integration action.

### Task 4: Remove the remote environment after integration

**Files:**

- Remote resource: GitHub environment `release` in `nerymurillohnd/codex-essentials`

- [x] After this workflow change is merged and `main` no longer references the
      environment, delete the remote `release` environment through the GitHub
      repository settings/API and verify that the environment no longer exists.
      The final GitHub API verification returned `404 Not Found`.
