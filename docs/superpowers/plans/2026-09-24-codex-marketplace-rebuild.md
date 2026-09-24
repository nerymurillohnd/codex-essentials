# Codex Essentials Marketplace Rebuild Implementation Plan

> **For agentic workers:** Execute this plan task by task in the isolated
> `codex/rebuild-main` worktree. The user approved inline execution and the
> eventual no-force branch cutover. Do not request a routine second approval.

**Goal:** Ship a clean-history, Codex-only Git marketplace containing 20 newly
versioned `0.1.0` plugins while preserving the old default branch as remote
`deprecated`.

**Architecture:** Portable package manifests are authored once. One Node-based
contract layer validates official Agent Plugins schemas plus local policy and
generates the Codex catalog, README inventory, and issue-form choices. A
separate idempotent release workflow creates namespaced plugin tags and GitHub
Releases after distribution through the new `main`.

**Tech Stack:** Codex CLI 0.156.1 baseline; Node.js 24.21.0 and npm 12.0.2; Node
test runner; Ajv and YAML; Biome for supported code/JSON; Prettier for
Markdown/YAML; ShellCheck/shfmt and Ruff/Basedpyright only for actual bundled
shell/Python helpers; GitHub Actions and GitHub REST API.

**Spec:**
`docs/superpowers/specs/2026-09-24-codex-marketplace-rebuild-design.md`

## Global constraints

- Work only in the independent `codex/rebuild-main` worktree until cutover.
- All 20 IDs in the spec must be present at cutover. Each starts at `0.1.0`.
- No Claude distribution, no package registry publication, no release assets.
- The former `main` must become `deprecated` at the same SHA and remain remote.
- No external Git backup or bundle. No force push, history rewrite, or deletion
  of `deprecated`.
- Existing plugin content is a reference to evaluate, not executable tooling to
  copy without review. Reauthor marketplace tooling and release automation.
- Local installed/configured tools are not proof of a healthy remote service or
  an account entitlement. Verify the actual receiving Codex CLI path.
- Do not assume a local green check covers Git-backed install, hooks, MCP,
  release idempotence, or GitHub branch rules.

## Review focus

1. A package has a valid schema but its declared skill or asset is missing from
   the installed copy: reject in a real installation assertion.
2. Two plugin names or sources collide after catalog generation: reject before
   writing derived files.
3. Existing `0.2.0` installation remains cached after the new source advertises
   `0.1.0`: exercise the explicit Git marketplace refresh and reinstall path.
4. A release tag exists at the wrong SHA or its GitHub Release is missing:
   reconcile only the missing counterpart; stop on conflicting evidence.
5. A branch rename finishes asynchronously or redirects old URLs: poll remote
   refs/default branch rather than treating the API response as completion.

## Task 1: Establish the new root and project gate

**Files:** Create `AGENTS.md`, `README.md`, `LICENSE`, `.gitignore`,
`.editorconfig`, `.nvmrc`, `package.json`, `biome.json`, `.prettierrc.json`,
`docs/AGENTS.md`, `plugins/AGENTS.md`, and the lockfile.

**Interfaces:** `npm run check` is the single local and CI gate;
`npm run catalog:build` writes derived metadata; `npm run catalog:check` is
read-only.

- [ ] Author concise new instructions from the approved spec, with routing to
      package and documentation boundaries. Do not copy old process claims.
- [ ] Pin Node/npm and exact formatter/dependency versions. Use Biome for
      JavaScript/JSON and Prettier for Markdown/YAML, as Biome does not format
      Markdown in the verified version.
- [ ] Run `npm install`, then `npm run format:check` and `npm run check`. Record
      expected early failures while downstream commands are not yet implemented;
      do not call the gate green.
- [ ] Commit the root contract before package authoring so later task diffs have
      a clean base.

## Task 2: Portable schemas and package validation

**Files:** Create `vendor/agent-plugins/1.0.0/plugin.schema.json`,
`vendor/agent-plugins/1.0.0/mcp.schema.json`, a source/hash record,
`scripts/validate-packages.mjs`, and `tests/validate-packages.test.mjs`.

**Interfaces:** `validatePackages(root)` returns the sorted validated package
inventory or throws a path-qualified error. No generator writes before this
function succeeds.

- [ ] Write focused tests for a valid portable skill package and invalid
      manifest schema, invalid MCP transport, missing component, duplicate ID,
      traversal/symlink escape, malformed YAML, and missing skill entrypoint.
      Run `node --test tests/validate-packages.test.mjs` and observe each new
      negative case fail for the intended reason before implementation.
- [ ] Pin the actual official schemas with source URLs and SHA-256s. Register
      them in Ajv Draft 2020-12; apply local policy as a distinct second pass.
- [ ] Implement package/resource validation and error boundaries. Run the
      focused test and full `npm test`; inspect the receiving CLI on a fixture.
- [ ] Commit only after positive and negative paths pass.

## Task 3: Deterministic catalog and documentation projections

**Files:** Create `scripts/build-catalog.mjs`, `scripts/check-catalog.mjs`,
`scripts/render-readme.mjs`, `scripts/render-issue-options.mjs`,
`tests/catalog.test.mjs`, `.agents/plugins/marketplace.json`, and root README
generated markers.

**Interfaces:** All three outputs consume `validatePackages(root)` and are
stable under repeated generation. Check mode compares bytes and writes nothing.

- [ ] Test sorted, unique local sources `./plugins/<id>`, category/policy, root
      README rows, issue options, missing package, and stale output. Observe RED
      before writing the generator.
- [ ] Implement atomic generated-file writes and a read-only freshness check.
- [ ] Run `npm run catalog:build`, `npm run catalog:check`, `npm test`, and
      `git diff --check`; inspect actual output against OpenAI's marketplace
      path and source rules.

## Task 4: Release, labels, issue forms, and security controls

**Files:** Create `scripts/release-plan.mjs`, `scripts/publish-release.mjs`,
`tests/release.test.mjs`, `.github/workflows/quality.yml`,
`.github/workflows/release.yml`,
`.github/ISSUE_TEMPLATE/{bug,feature,plugin-request,config}.yml`,
`.github/label-contract.json`, `.github/SECURITY.md`, and release/cutover
runbooks under `docs/operations/`.

**Interfaces:** Release planning emits plugin ID, `0.1.0` version, new tag
`codex-essentials/<id>/v0.1.0`, and target commit SHA. Publishing checks
existing tag and release state before a write. CI runs `npm run check` on the
candidate branch and on PRs to the future `main`.

- [ ] Test fresh tag creation, idempotent retry, tag at wrong SHA, release
      missing after tag creation, duplicate historical namespace, and a
      non-releasable documentation-only change. Observe RED before code.
- [ ] Implement release planning and publishing with scoped GitHub token
      references; never print credential values or move an immutable tag.
- [ ] Author issue forms and a private vulnerability route. Generate plugin
      choices rather than editing 20 options by hand. Validate label references.
- [ ] Run focused tests and `npm run check`. Review workflow permissions, branch
      triggers, token recursion, and release dispatch behavior.

## Tasks 5–24: Recreate the 20 products

Each row is one task and must end with a complete, independently installable
package at `plugins/<id>/`: portable `plugin.json` at version `0.1.0`, fresh
`CHANGELOG.md`, README, license, supported skills/resources, and a current
`agents/openai.yaml` where presentation or invocation policy needs it. The
package's skill text is reauthored against its intended user outcome and current
official dependencies; old files are read as historical input. For each task,
run package-focused validation, a real local install fixture, `npm run check`,
and `git diff --check` before committing. Test behavioral boundaries and any
executable helper rather than mirroring prose.

| Task | Package                  | Required distinguishing proof                                    |
| ---- | ------------------------ | ---------------------------------------------------------------- |
| 5    | `agents-md-master`       | Routing, authority, and safe AGENTS edits                        |
| 6    | `astro-cli-commands`     | Installed Astro CLI version and command selection                |
| 7    | `automatic-pr-lifecycle` | SHA-specific CI/review/merge and blocker behavior                |
| 8    | `block-no-verify`        | Consumer-owned hook approval; bypass rejection test              |
| 9    | `configure-prettier`     | Project-first config, editor/CLI parity, supported files         |
| 10   | `doc-keeper`             | Changelog/ADR evidence and no invented release history           |
| 11   | `hook-creator`           | Current Codex hook event contract and trust boundary             |
| 12   | `live-research`          | Primary-source routing and citation/evidence limits              |
| 13   | `optimize-memories`      | Correct memory scope and approval before mutation                |
| 14   | `prettier-after-edit`    | Decide bundled versus consumer-owned hook; exact-file formatting |
| 15   | `prompt-architect`       | Prompt output quality; justify or remove old hook                |
| 16   | `repo-hygiene`           | Routine/deep/debug routing and recoverable cleanup               |
| 17   | `repo-maintenance`       | Record ownership without inventing conventions                   |
| 18   | `ruff-after-edit`        | Ruff policy plus safe consumer hook templates                    |
| 19   | `shellcheck-after-edit`  | ShellCheck/shfmt handler, scope and rollback                     |
| 20   | `skill-design-standards` | Portable skill format and host-specific limits                   |
| 21   | `svelte-development`     | Four skill routes, official MCP transport, degraded path         |
| 22   | `system-ops-audit`       | Read-only macOS diagnostic scope                                 |
| 23   | `typescript-pro`         | Strict typing and external-data boundaries                       |
| 24   | `verify-completion`      | Evidence gate with positive and negative cases                   |

## Task 25: Full candidate qualification

**Files:** Create `tests/smoke-marketplace.mjs` and evidence records under
`docs/audits/`; update only failing package or tooling files supported by test
evidence.

- [ ] Install dependencies reproducibly and run `npm run check` from a clean
      candidate checkout; record versions, command outputs, and failures.
- [ ] Use an isolated Codex home and Git-backed candidate marketplace to list
      and install all 20 packages. Assert manifest version, path, expected
      skills/hooks/MCP, and complete installed resources.
- [ ] In a second isolated home, reproduce the old-version-to-`0.1.0` upgrade
      with the same marketplace ID and an explicit reinstall. Verify the new
      cache and a new-session capability inventory.
- [ ] Run bounded behavioral scenarios where structural checks cannot prove the
      product outcome. Classify every failure and resolve relevant ones.
- [ ] Push only the candidate branch after the local gate passes. Inspect the
      remote Quality run for its exact head SHA.

## Task 26: Protected branch switch and release bootstrap

**Files:** Update cutover evidence in `docs/audits/` only if it can be committed
to the new history before switch; remote branch/ruleset/release mutations are
the controlled output of this task.

- [ ] Re-enumerate GitHub branches, default branch, rulesets, open PRs,
      candidate checks, and old `main` SHA. Stop if any writer or mismatch is
      present.
- [ ] Switch the default branch to the candidate, rename old `main` to
      `deprecated`, and rename the candidate to `main`. Poll each operation to
      settled refs; do not force push or delete old history.
- [ ] Apply active `main`, `deprecated`, and tag rules. Query effective rules
      and prove the required Quality check is the expected check source.
- [ ] Dispatch the initial release workflow against the exact new `main` SHA.
      Confirm 20 namespaced tags and 20 GitHub Releases, each pointing to that
      SHA with version `0.1.0`; retain the old tag/release unchanged.
- [ ] Run clean Git-backed install verification from final `main`, compare
      installed package inventory to the spec, inspect Git topology and
      worktrees, and deliver a requirement-by-requirement evidence report.
- [ ] If cutover verification fails, restore the default branch using the
      preserved old SHA/ref and report the incident. Do not delete either
      history or conceal partial releases.
