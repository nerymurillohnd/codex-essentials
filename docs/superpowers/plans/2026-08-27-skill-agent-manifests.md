# Skill Agent Manifests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every distributed plugin skill carry a validated Codex agent manifest and keep package documentation, generators, validators, schemas, tests, versions, and release metadata synchronized.

**Architecture:** `templates/agent.schema.json` is the canonical structural contract for `skills/<id>/agents/openai.yaml`. `scripts/validate_manifests.cjs` parses YAML with the repository's `yaml` dependency, validates it through AJV, verifies the path relationship to `SKILL.md`, and checks optional icon paths. `scripts/generate_manifests.cjs` generates a minimally valid skill-and-agent skeleton; product documentation describes the component and the release validators protect the changed package versions.

**Tech Stack:** Node.js 24, CommonJS, AJV Draft 2020-12, `yaml`, Vitest, JSON Schema, Markdown, YAML.

**Spec:** `docs/decisions/adr-0006-skill-agent-manifests.md`

## Global Constraints

- Every local plugin remains at `plugins/<plugin-id>/` and has `.codex-plugin/plugin.json`.
- Every `SKILL.md` must have exactly one sibling `agents/openai.yaml`.
- `openai.yaml` is metadata and prompt bootstrap, not duplicated behavioral instructions.
- Agent schema fields are `interface.display_name`, `interface.short_description`, optional `interface.default_prompt`, optional icon paths, and optional `policy.allow_implicit_invocation`.
- YAML icons must resolve inside the owning skill directory; no traversal paths or secret values are allowed.
- Plugin README, changelog, manifest, marketplace entry, versioned tag, and release record remain synchronized.

---

### Task 1: Record the decision and contributor contract

**Files:**

- Create: `docs/decisions/adr-0006-skill-agent-manifests.md`
- Modify: `plugins/AGENTS.md`
- Modify: `docs/contributing/plugins.md`
- Modify: `README.md`

**Interfaces:**

- Consumes: installed Codex plugin examples and existing documentation policy.
- Produces: an explicit path, ownership, and validation contract for every skill.

- [ ] **Step 1: Add the accepted ADR**

Document the exact path, required metadata, optional metadata, ownership
boundaries, rejected alternatives, and repository confirmation commands.

- [ ] **Step 2: Extend contributor instructions**

Add `SKILL.md` / `agents/openai.yaml` pairing, schema reference, and the rule
that skill identifiers, agent directory names, and agent assets must remain
inside their owning skill.

- [ ] **Step 3: Update public repository guidance**

Explain that agent manifests are part of the plugin skill surface and link the
new ADR from the documentation index.

- [ ] **Step 4: Commit documentation contract**

```bash
git add docs/decisions/adr-0006-skill-agent-manifests.md docs/superpowers/plans/2026-08-27-skill-agent-manifests.md plugins/AGENTS.md docs/contributing/plugins.md README.md
git commit -m "docs(agents): define skill agent manifest contract"
```

### Task 2: Write failing schema and validator tests

**Files:**

- Modify: `tests/schemas.test.ts`
- Modify: `tests/scripts.coverage.test.ts`
- Modify: `tests/documentation-contract.test.ts`

**Interfaces:**

- Consumes: `templates/agent.schema.json` and validator exports.
- Produces: tests that fail without YAML schema loading, required manifest
  enforcement, invalid YAML rejection, icon containment checks, and canonical
  documentation references.

- [ ] **Step 1: Add schema-contract tests**

Assert Draft 2020-12, required `interface`, required display name and short
description, `additionalProperties: false`, and the allowed optional fields.

- [ ] **Step 2: Add validator behavior tests**

Create temporary plugin fixtures with a skill but no agent manifest, invalid
agent YAML, unsupported fields, and a missing declared icon. Assert each emits
the exact affected path in the errors.

- [ ] **Step 3: Run targeted tests and verify RED**

Run: `npx vitest run tests/schemas.test.ts tests/scripts.coverage.test.ts tests/documentation-contract.test.ts`

Expected: FAIL because the agent schema and validator behavior do not yet
exist.

### Task 3: Implement the schema, parser, validator, and generator

**Files:**

- Create: `templates/agent.schema.json`
- Modify: `scripts/validate_manifests.cjs`
- Modify: `scripts/generate_manifests.cjs`

**Interfaces:**

- Consumes: YAML agent manifests and `templates/agent.schema.json`.
- Produces: `validateSkillAgentManifest()` and a generator-created
  `skills/<skill-id>/agents/openai.yaml` skeleton.

- [ ] **Step 1: Add the canonical schema**

Implement the ADR field contract with strict object shapes, bounded non-empty
strings, strict boolean policy, and `./assets/`-relative icon path validation.

- [ ] **Step 2: Parse and validate agent manifests**

Load the schema together with the existing marketplace and plugin schemas;
discover each `SKILL.md`; require its agent manifest; parse YAML safely;
validate through AJV; and verify optional assets resolve within the skill.

- [ ] **Step 3: Generate a valid agent skeleton**

When generating a plugin, create a named skill directory containing `SKILL.md`
and its `agents/openai.yaml`, with generated display metadata derived from the
plugin identity.

- [ ] **Step 4: Run targeted tests and verify GREEN**

Run: `npx vitest run tests/schemas.test.ts tests/scripts.coverage.test.ts tests/documentation-contract.test.ts`

Expected: PASS with all agent schema and validation scenarios covered.

- [ ] **Step 5: Commit the implementation**

```bash
git add templates/agent.schema.json scripts/validate_manifests.cjs scripts/generate_manifests.cjs tests/schemas.test.ts tests/scripts.coverage.test.ts tests/documentation-contract.test.ts
git commit -m "feat(agents): validate Codex skill agent manifests"
```

### Task 4: Migrate both distributed plugins and synchronize documentation

**Files:**

- Create: `plugins/astro-cli-commands/skills/astro-commands/agents/openai.yaml`
- Create: `plugins/prettier-after-edit/skills/prettier-after-edit/agents/openai.yaml`
- Modify: `plugins/astro-cli-commands/README.md`
- Modify: `plugins/prettier-after-edit/README.md`
- Modify: `plugins/astro-cli-commands/CHANGELOG.md`
- Modify: `plugins/prettier-after-edit/CHANGELOG.md`
- Modify: `plugins/astro-cli-commands/.codex-plugin/plugin.json`
- Modify: `plugins/prettier-after-edit/.codex-plugin/plugin.json`

**Interfaces:**

- Consumes: ADR contract and validated schema.
- Produces: two independently releasable packages whose agent metadata matches
  their skill and product scope.

- [ ] **Step 1: Create each product agent manifest**

Add concise, accurate display names, short descriptions, and default prompts;
do not add icon paths without corresponding assets.

- [ ] **Step 2: Synchronize product READMEs**

List each `agents/openai.yaml` in the component and reference tables, explain
its role, and keep the two README structures identical.

- [ ] **Step 3: Bump patch versions and changelogs**

Update both package manifests from `0.1.0` to `0.1.1` and add user-facing
Unreleased entries for the new agent interface. Move the entries into the
`0.1.1` release section only immediately before creating release tags.

- [ ] **Step 4: Run plugin validation**

Run: `npm run validate:all`

Expected: PASS; both plugin packages, their product documentation, catalog
registration, and required agent manifests validate together.

- [ ] **Step 5: Commit the product migration**

```bash
git add plugins/astro-cli-commands plugins/prettier-after-edit
git commit -m "feat(plugins): expose Codex agent manifests"
```

### Task 5: Verify, publish, review, integrate, and release

**Files:**

- Modify: release sections in both plugin changelogs immediately before tags.

**Interfaces:**

- Consumes: complete branch, both package versions, and GitHub pull-request
  review state.
- Produces: merged `main`, remote and local branch cleanup, synchronized
  checkout, two patch release tags, and published GitHub releases.

- [ ] **Step 1: Run the full quality suite**

Run:

```bash
npm run format:check
npm run lint -- --max-warnings=0
npm run typecheck
npm run typecheck:scripts
npx tsc --noEmit
npx tsc6 --noEmit
npm test
npm run validate:plugins
npm run validate:all
npm run validate:release -- plugin/astro-cli-commands/v0.1.1
npm run validate:release -- plugin/prettier-after-edit/v0.1.1
uv run --with pyyaml python /Users/nerymurillohnd/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/astro-cli-commands
uv run --with pyyaml python /Users/nerymurillohnd/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/prettier-after-edit
git diff --check
```

- [ ] **Step 2: Push branch and create a draft pull request**

Use a conventional title and a description containing objective, agent-manifest
contract, affected artifacts, validation output, compatibility impact, and
release plan.

- [ ] **Step 3: Resolve review and CI findings**

Read every review thread and check. Implement technically valid findings, add
targeted regression coverage, reply with evidence, resolve conversations, and
rerun affected validation before updating the PR description.

- [ ] **Step 4: Merge and clean branches**

Merge with an explicit merge commit, delete the remote branch, remove the local
worktree and local branch, fetch with pruning, fast-forward `main`, and verify
that `git status --short --branch` is clean and synchronized.

- [ ] **Step 5: Tag and publish both patch releases**

Create and push `plugin/astro-cli-commands/v0.1.1` and
`plugin/prettier-after-edit/v0.1.1`, wait for release validation, and publish
the drafts only after their release jobs complete.
