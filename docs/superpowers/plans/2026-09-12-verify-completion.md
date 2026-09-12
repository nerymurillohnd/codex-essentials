# Verify Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans
> to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for
> tracking.

**Goal:** Deliver a public, skills-only `verify-completion` marketplace plugin
that requires evidence-backed completion claims through six applicable gates.

**Architecture:** A portable root `plugin.json` supplies plugin identity and
interface metadata; the repository generator discovers one bundled skill in
`skills/`. The skill owns the gate protocol and evidence-summary contract; its
agent manifest owns concise presentation and implicit-invocation metadata. Package
documentation owns installation, permissions, limitations, and recovery claims;
the repository generator derives the marketplace entry.

**Tech Stack:** Markdown, JSON, YAML, the repository Python marketplace
generator, Prettier, Ruff, shfmt, ShellCheck, and the bundled skill validator.

**Spec:**
[`docs/superpowers/specs/2026-09-12-verify-completion-design.md`](../specs/2026-09-12-verify-completion-design.md)

## Global Constraints

- Package identifier, folder, root manifest name, marketplace entry, and skill
  identifier are exactly `verify-completion`.
- Use the repository portable `plugins/<plugin-id>/plugin.json` contract; do
  not create `.codex-plugin/plugin.json`.
- Include no hooks, scripts, MCP servers, apps, runtime dependencies,
  credentials, network operations, or external assets.
- Keep `allow_implicit_invocation: true`; activation is limited to completion,
  correctness, verification, handoff, commit, and pull-request conclusions.
- A skipped verification gate requires a demonstrable applicability reason;
  failures stop the completion conclusion and repair restarts the protocol.
- Do not make commits with verification or signing bypass flags.

---

### Task 1: Establish the package identity and public documentation

**Files:**

- Create: `plugins/verify-completion/plugin.json`
- Create: `plugins/verify-completion/README.md`
- Create: `plugins/verify-completion/CHANGELOG.md`
- Create: `plugins/verify-completion/LICENSE.md`

**Interfaces:**

- Consumes: repository templates, the approved design specification, and the
  marketplace generator's portable root-manifest contract.
- Produces: a self-contained plugin root and accurately documented user
  boundaries; the following task supplies its discovered skill component.

- [x] **Step 1: Inspect the baseline contract**

  Run:

  ```bash
  rg --files plugins/verify-completion
  npm run marketplace:check
  ```

  Expected: the plugin does not exist and the existing generated catalog is
  valid.

- [x] **Step 2: Create the portable manifest and package documents**

  Use the repository templates. The manifest must declare `name` as
  `verify-completion`, version `1.0.0`, category `Developer Tools`, and no
  unsupported component. The README must state that
  installation affects only Codex-managed plugin state and never grants commit,
  remote-mutation, dependency-installation, or configuration-change authority.
  Add an initial dated `1.0.0` changelog entry and the MIT license for Nery
  Samuel Murillo.

- [x] **Step 3: Prove incomplete package rejection**

  Run:

  ```bash
  npm run marketplace:check
  ```

  Expected: before the skill exists, the generator fails because the declared
  skill directory or required files are missing. Preserve the output as
  red-phase evidence; do not weaken the manifest or validator.

### Task 2: Author the completion-verification skill and presentation metadata

**Files:**

- Create: `plugins/verify-completion/skills/verify-completion/SKILL.md`
- Create: `plugins/verify-completion/skills/verify-completion/agents/openai.yaml`

**Interfaces:**

- Consumes: the package root and the approved six-gate protocol.
- Produces: a discoverable skill whose `SKILL.md` governs execution and whose
  `openai.yaml` governs display and automatic invocation.

- [x] **Step 1: Write the skill contract**

  Use this frontmatter:

  ```yaml
  ---
  name: verify-completion
  description: Use when claiming work is complete, correct, verified, ready for handoff, ready to commit, or ready for a pull request. Require evidence for applicable adversarial review, outcome, counterpart, false-positive, positive-negative, and evidence-record gates before the claim.
  ---
  ```

  The body must require an exact requirement, applicability inventory, the six
  gates in order, concrete evidence, stop-and-restart after authorized repair,
  and the final verification summary. It must exclude ordinary intermediate
  progress, exploratory delegation, and casual positive comments, and it must
  state that the protocol grants no new execution authority.

- [x] **Step 2: Write agent metadata**

  ```yaml
  interface:
    display_name: "Verify Completion"
    short_description: "Require evidence-backed verification before completion claims"
    default_prompt: "Use $verify-completion to verify the applicable gates before I claim this work is complete."

  policy:
    allow_implicit_invocation: true
  ```

- [x] **Step 3: Validate the skill and its activation boundary**

  Run:

  ```bash
  python3 /Users/nerymurillohnd/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
    plugins/verify-completion/skills/verify-completion
  ```

  Confirm manually that "Verify the release gates before saying the migration is
  complete" and "Can I open the PR now?" match; "Delegate a read-only inventory
  of source files" and "Implement a small parser function" do not match solely
  because of ordinary work or delegation.

### Task 3: Integrate the public catalog and generated marketplace metadata

**Files:**

- Modify: `README.md`
- Modify: `.agents/plugins/marketplace.json` (generated only)

**Interfaces:**

- Consumes: the validated package root manifest and package README.
- Produces: a root catalog row and generated local marketplace entry at
  `./plugins/verify-completion`.

- [x] **Step 1: Update the root catalog**

  Add one catalog row linking `plugins/verify-completion/README.md`, with the
  outcome "Evidence-backed completion and release-readiness verification" and
  install ID `verify-completion`. Add a matching choose-by-use-case row and
  keyword link following the existing root README structure.

- [x] **Step 2: Generate and inspect the marketplace entry**

  Run:

  ```bash
  npm run marketplace:build
  npm run marketplace:check
  rg -n -C 4 'verify-completion' .agents/plugins/marketplace.json README.md
  ```

  Expected: the generator, not an authored edit, creates a `Developer Tools`
  entry with source path `./plugins/verify-completion`, `AVAILABLE` installation
  policy, and `ON_INSTALL` authentication policy.

### Task 4: Run the full verification and prepare the reviewable change

**Files:**

- Modify: `docs/superpowers/plans/2026-09-12-verify-completion.md` (checkmarks
  only during execution)
- Include: the approved specification, package files, root catalog, and
  generated marketplace catalog from prior tasks.

**Interfaces:**

- Consumes: all prior tasks.
- Produces: a complete, validated, documented plugin ready for normal Git
  commit and pull-request review.

- [x] **Step 1: Review exact scope**

  ```bash
  git diff --check
  git status --short
  git diff -- README.md plugins/verify-completion docs/superpowers
  git diff -- .agents/plugins/marketplace.json
  ```

  Expected: only design, plan, package, root catalog, and generated catalog
  change; no secret, debug, unrelated, hook, or dependency artifact exists.

- [x] **Step 2: Run focused and complete gates**

  ```bash
  python3 /Users/nerymurillohnd/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
    plugins/verify-completion/skills/verify-completion
  npm run marketplace:build
  npm run marketplace:check
  npm run marketplace:test
  npm run check
  ```

  Expected: every command passes after the package is complete, with no bypass,
  suppression, or altered control.

- [x] **Step 3: Perform the six-gate completion review**

  Reinspect final files and outputs independently; verify specification behavior
  rather than only parser success; confirm the generator consumes the portable
  root manifest and rejected the incomplete package; inspect stale catalog,
  skipped tests, unsupported components, broad triggering, weak assertions, and
  absent non-trigger examples; prove both matching and nearby non-matching
  prompts; retain all commands, relevant outputs, diffs, and exclusions.

- [x] **Step 4: Commit the reviewed change**

  ```bash
  git add README.md .agents/plugins/marketplace.json docs/superpowers plugins/verify-completion
  git diff --cached --check
  git diff --cached --stat
  git commit -m "feat(plugins): add verify completion gates"
  git status --short --branch
  ```

  Expected: one conventional commit without `--no-verify`, `--no-gpg-sign`, a
  signing override, force operation, or uncommitted task file.
