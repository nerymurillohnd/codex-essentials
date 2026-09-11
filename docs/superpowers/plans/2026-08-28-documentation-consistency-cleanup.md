# Documentation Consistency Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align repository documentation with the manifest-first marketplace architecture and remove misleading current instructions from historical artifacts.

**Architecture:** Historical design and implementation documents remain immutable records of the earlier pipeline, but each receives a visible superseded notice that points readers to ADR-0007 and the current contributor guidance. Current README and plugin changelog text is corrected in place without changing plugin versions or runtime behavior.

**Tech Stack:** Markdown, repository npm validation scripts, Prettier, Vitest, JSON Schema validation.

**Spec:** User-provided cleanup requirements in the current task, interpreted with `docs/decisions/adr-0007-plugin-manifest-marketplace-contract.md` as the current architectural authority.

## Global Constraints

- `plugins/<plugin-id>/.codex-plugin/plugin.json` remains the authored source of truth for each distributable plugin.
- `npm run marketplace:build` is the complete writable generation pipeline; `npm run marketplace:check` is the read-only catalog validation command.
- Do not bump plugin versions or create versioned changelog sections for this documentation-only cleanup.
- Preserve historical document content; add status context instead of rewriting the superseded designs.
- Do not modify production resources, credentials, marketplace release tags, or remote state.

---

### Task 1: Mark historical plans and specs as superseded

**Files:**

- Modify: `docs/superpowers/plans/2026-08-27-declarative-plugin-architecture.md`
- Modify: `docs/superpowers/plans/2026-08-27-documentation-maintenance-automation.md`
- Modify: `docs/superpowers/plans/2026-08-27-prettier-after-edit.md`
- Modify: `docs/superpowers/plans/2026-08-27-skill-agent-manifests.md`
- Modify: `docs/superpowers/plans/2026-08-28-doc-keeper.md`
- Modify: `docs/superpowers/specs/2026-08-27-declarative-plugin-architecture-design.md`
- Modify: `docs/superpowers/specs/2026-08-28-doc-keeper-design.md`

- [x] Add the same notice immediately below each document title, stating that the document is a historical record superseded by ADR-0007 and that its source-of-truth, synchronization, validation, and release commands are not current instructions.
- [x] Point the notice to `docs/decisions/adr-0007-plugin-manifest-marketplace-contract.md` and `AGENTS.md` for current rules.
- [x] Preserve the original plan/spec requirements and examples below the notice so the files remain useful historical records.

### Task 2: Correct the Astro Commands changelog command reference

**Files:**

- Modify: `plugins/astro-cli-commands/CHANGELOG.md:57-63`

- [x] Replace the removed `npm run validate:all` reference with the current split between `npm run validate:plugins` for package validation and `npm run marketplace:check` for catalog drift, while retaining the canonical `npm run check` guidance and optional external checker note.
- [x] Keep the existing `0.1.0` version and all other historical release notes unchanged.

### Task 3: Correct README architecture and Markdown formatting

**Files:**

- Modify: `README.md:128`
- Modify: `README.md:176-181`

- [x] Describe `lib/` as bounded domain modules and tests plus repository maintenance support, not as the declarative source of truth.
- [x] Repair the contributor command list so each command has a complete inline-code span and the documentation gate command is represented exactly once.
- [x] Keep the command vocabulary aligned with `npm run check`, `npm run marketplace:check`, and `npm run documentation:gate`.

### Task 4: Verify documentation consistency and repository health

**Files:**

- Test: repository-wide Markdown and npm validation commands; no test source changes expected.

- [x] Search all non-historical current documentation for removed `validate:all`, `sync:all`, and `lib/source.json` instructions.
- [x] Run `npm run format:check` and `npm run check` from the repository root.
- [x] Inspect the final diff and confirm `git status --short --branch` reports only the intended documentation files.
