# DocKeeper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the distributable `doc-keeper` plugin with one routed skill and two complete maintenance references for changelogs and ADRs.

**Architecture:** `SKILL.md` owns implicit closeout, shared intake, evidence, authorization, and routing. Each document type owns one procedure reference and one default output example. Repository metadata registers the package without adding runtime code or external dependencies.

**Tech Stack:** Markdown, JSON, YAML, existing Node.js validation and Vitest gates.

**Spec:** `docs/superpowers/specs/2026-08-28-doc-keeper-design.md`

## Global Constraints

- Package ID, skill ID, and folder name are `doc-keeper`; display name is `DocKeeper`.
- Version is `0.1.0`; author is `Nery Samuel Murillo`; license is the repository MIT license.
- The plugin contains no scripts, hooks, MCP servers, apps, credentials, or runtime dependencies.
- Author fixed metadata in `lib/source.json` and use the repository synchronizer for derived artifacts.
- Do not copy `.DS_Store`, proposal marketplace files, placeholder URLs, email addresses, or `just-for-codex` metadata.
- Do not commit, push, tag, publish, or modify remote state without separate authorization.

---

### Task 1: Author the DocKeeper operating contract

**Files:**

- Create: `plugins/doc-keeper/skills/doc-keeper/SKILL.md`
- Create: `plugins/doc-keeper/skills/doc-keeper/references/changelog-maintenance.md`
- Create: `plugins/doc-keeper/skills/doc-keeper/references/adr-maintenance.md`
- Create: `plugins/doc-keeper/skills/doc-keeper/outputs/changelog-example.md`
- Create: `plugins/doc-keeper/skills/doc-keeper/outputs/adr-example.md`

**Interfaces:**

- Consumes: approved design and the three proposal packages.
- Produces: one router and two independently readable document contracts.

- [x] Write `SKILL.md` with discriminating frontmatter, exact routing, five modes, evidence precedence, authorization boundaries, save rules, and completion report.
- [x] Write `changelog-maintenance.md` with deterministic update/non-update, create, complete, audit, update, rollover, repair, validation, save, private-repository, monorepo, and automation procedures; keep its default shape in `outputs/changelog-example.md`.
- [x] Write `adr-maintenance.md` with deterministic significance, location, numbering, naming, states, creation, completion, audit, update, supersession, repair, validation, save, categorized-directory, and AD Guidance Tool procedures; keep its default shape in `outputs/adr-example.md`.
- [x] Ensure each reference credits every source it uses and contains no instruction placeholder outside fenced template examples.
- [x] Run `uv run --with pyyaml python /Users/nerymurillohnd/.codex/skills/.system/skill-creator/scripts/quick_validate.py plugins/doc-keeper/skills/doc-keeper` and require exit 0.

### Task 2: Author the distributable package and repository metadata

**Files:**

- Create: `plugins/doc-keeper/README.md`
- Create: `plugins/doc-keeper/CHANGELOG.md`
- Create: `plugins/doc-keeper/LICENSE.md`
- Modify: `lib/source.json`
- Create: `plugins/doc-keeper/.codex-plugin/plugin.json`
- Create: `plugins/doc-keeper/skills/doc-keeper/agents/openai.yaml`
- Modify: `.agents/plugins/marketplace.json`
- Modify: `README.md`
- Modify: `lib/core/source.test.ts`
- Modify: `lib/sync/render.test.ts`

**Interfaces:**

- Consumes: Task 1 paths and behavior.
- Produces: a self-contained package and catalog registration matching `lib/source.json`.

- [x] Add the `doc-keeper` source record after existing plugins with version `0.1.0`, repository identity, Developer Tools category, skills metadata, and AVAILABLE/ON_INSTALL marketplace policy.
- [x] Run the repository synchronizer to emit `plugin.json`, `openai.yaml`, and the marketplace entry from the source record.
- [x] Copy root `LICENSE.md` byte-for-byte to the package.
- [x] Write a concise product README covering purpose, components, environments, inputs, outputs, tools, permissions, side effects, approval boundaries, installation, removal, verification, limitations, recovery, extensibility, and complete attribution.
- [x] Write the initial plugin changelog with `Unreleased`, release `0.1.0` dated `2026-08-28`, and confirmed package contents.
- [x] Update the marketplace README from two to three plugins, add DocKeeper to the product table, install commands, usage guidance, product README links, and status statement.
- [x] Update the exact plugin-list expectations in source and rendering tests.

### Task 3: Verify source, package, documentation, and release readiness

**Files:**

- Verify all Task 1 and Task 2 paths.

**Interfaces:**

- Consumes: complete package and metadata.
- Produces: fresh evidence for distribution readiness.

- [x] Run Prettier on the exact changed JSON, YAML, and Markdown paths.
- [x] Run `npm run sync:check`; require no derived drift.
- [x] Run `npm run validate:all`; require `Validation passed`.
- [x] Run `npm run check`; require formatting, lint, both typecheck paths, 56 or more passing tests, coverage above repository thresholds, and validation success.
- [x] Run `npm run validate:release -- plugin/doc-keeper/v0.1.0`; require `Release validation passed: doc-keeper 0.1.0`.
- [x] Compare root and package licenses with `cmp`; require exit 0.
- [x] Check all changed local Markdown links and confirm no `.DS_Store`, placeholder owner/repository URLs, external package paths, or symlinks entered the package.
- [x] Inspect `git diff --check`, the complete diff, and `git status --short --branch`; report all results without committing or publishing.

### Behavioral forward-evaluation

On 2026-08-28, independent agents ran paired control and DocKeeper passes in
isolated temporary Git repositories:

- [x] A user-facing CLI flag rename updated the implementation and existing
      `Unreleased` changelog in both passes. DocKeeper selected changelog `Update`
      and loaded no ADR material.
- [x] An explicitly accepted tenant-isolation decision created the next ADR in
      both passes. DocKeeper selected ADR `Create`, preserved the local convention,
      and did not request redundant evidence.
- [x] A README typo produced the same one-line fix in both passes. DocKeeper
      loaded no reference and made no changelog or ADR edit.
- [x] A planned release owned by release-please produced no manual diff in
      either pass. DocKeeper selected release preflight and changelog `Update`, then
      preserved the configured owner's lifecycle instead of recreating its output.

These forward-evaluations prove routing, scope, ownership, and negative-control
behavior in a pre-publication environment. They do not replace the required
remote consumer test.

- [ ] After authorized publication, add the published remote marketplace,
      install `doc-keeper` as an independent consumer, and repeat the behavioral
      matrix from the installed snapshot.
