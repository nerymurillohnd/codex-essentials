# Codex Essentials clean-history marketplace design

Status: approved for execution on 2026-09-24. This specification records the
user-approved conversation plan and its later corrections. It does not certify
implementation.

## Objective

Replace the current repository default branch with a new `main` whose first
commit has no ancestor in the former `main`. Recreate the same 20 named Codex
plugins as newly versioned products, backed by current official contracts and
observable installation tests. Preserve the former `main` in a remote branch
named `deprecated` until the user separately decides whether to delete it.

## Scope and identity

- This is a Codex-only Git-backed marketplace. Do not author a Claude catalog,
  Claude plugin manifests, or Claude validation workflows.
- Retain the repository and marketplace name `codex-essentials` and the 20
  plugin IDs listed below. Package behavior must be reassessed rather than
  copied uncritically from the old history.
- The new branch starts with an independent root commit. Its manifests begin at
  `0.1.0`; package changelogs begin with the new line only. The old branch,
  tags, GitHub Releases, issues, and pull requests remain historical records.
- The new release-tag namespace is `codex-essentials/<plugin-id>/v<semver>`.
  Never reuse or mutate the old `plugin/<plugin-id>/v<semver>` namespace.
- Do not create an external Git bundle or backup. Preserve the old commit
  through the `deprecated` branch and verify its exact SHA before and after the
  branch switch. Do not delete `deprecated` under this authorization.
- Do not publish npm packages, attach generated release assets, or deploy a
  production service.

## Product inventory

The launch set is exactly:

| Plugin ID                | Intended capability                          | Existing component class to reassess |
| ------------------------ | -------------------------------------------- | ------------------------------------ |
| `agents-md-master`       | AGENTS.md instruction governance             | Skill                                |
| `astro-cli-commands`     | Astro CLI operating guidance                 | Skill                                |
| `automatic-pr-lifecycle` | Protected GitHub PR delivery                 | Skill                                |
| `block-no-verify`        | Explicit consumer Git verification policy    | Skill and templates                  |
| `configure-prettier`     | Prettier configuration assessment and repair | Skill                                |
| `doc-keeper`             | Changelog and ADR maintenance                | Skill                                |
| `hook-creator`           | Codex lifecycle hook engineering             | Skill                                |
| `live-research`          | Current evidence research                    | Skill                                |
| `optimize-memories`      | Codex memory audit and correction            | Skill                                |
| `prettier-after-edit`    | Prettier edit formatting                     | Skill; old package has a hook        |
| `prompt-architect`       | Agentic prompt design                        | Skill; old package has a hook        |
| `repo-hygiene`           | Scoped Git hygiene                           | Three skills                         |
| `repo-maintenance`       | Repository maintenance records               | Skill                                |
| `ruff-after-edit`        | Ruff guidance and consumer hook setup        | Skill and templates                  |
| `shellcheck-after-edit`  | ShellCheck and shfmt consumer hook setup     | Skill and templates                  |
| `skill-design-standards` | Agent Skill authoring standards              | Skill                                |
| `svelte-development`     | Svelte/SvelteKit engineering                 | Four skills and remote MCP           |
| `system-ops-audit`       | Read-only macOS baseline audit               | Skill                                |
| `typescript-pro`         | Strict TypeScript engineering                | Skill                                |
| `verify-completion`      | Evidence-backed completion verification      | Skill                                |

## Package and catalog contract

- Each distributable package lives at `plugins/<id>/` with portable root
  `plugin.json`, README, CHANGELOG, and license. Skills live at
  `skills/<skill-id>/SKILL.md`; only relevant package assets and helpers are
  included. The root manifest owns name, version, publisher, and OpenAI
  presentation metadata.
- `.agents/plugins/marketplace.json` is generated from root manifests. It points
  to `./plugins/<id>` relative to the marketplace root. The root README
  inventory and issue-form plugin options are generated from the same source. No
  parallel inventory YAML or second version file is authoritative.
- Validate portable manifests and MCP files against pinned copies of Agent
  Plugins 1.0.0 schemas, then apply explicit repository rules. A local green
  result must not claim broader conformance than its actual checks prove.
- Every package must contain a useful component, be self-contained after
  installation, and have no executable or symlink escape from its root.
- Bundled hooks must be justified per product, must not be trusted or executed
  merely by installation, and require both structural and runtime tests.
  Consumer-owned hook reference packages must not register or enable hooks.
- The Svelte MCP package requires official endpoint/transport verification and a
  separate missing or unavailable MCP behavior test.

## Releases and update behavior

- A product-changing PR carries its version, changelog, affected product
  documentation, and generated catalog together. The default branch is the Git
  distribution channel, so no package behavior enters `main` under an old
  manifest version while waiting for a separate release PR.
- A release workflow creates an immutable plugin tag and GitHub Release for each
  newly published version at the verified `main` SHA. It is idempotent: existing
  matching records are skipped; a conflicting tag, SHA, or release stops the
  workflow for investigation. The first release run after cutover creates the 20
  initial `0.1.0` records.
- Existing installations with the same plugin and marketplace IDs may retain old
  cache content. Document marketplace refresh plus explicit reinstall, and prove
  the upgrade from old Git marketplace to new Git marketplace in an isolated
  Codex environment before cutover. Do not infer this result from a
  local-marketplace fixture alone.
- GitHub `latest` is repository-wide. Do not use a generic latest-version badge
  as the version of all plugins. Link each package to its own release history.

## Intake, security, and governance

- Provide issue forms for bugs, features, and new-plugin requests. Route
  vulnerabilities to private reporting rather than a public issue form.
- Keep a version-controlled label contract. Generate plugin choices from the
  manifests. Automation may perform deterministic mapping but must not close
  substantive reports or invent an issue-to-release association.
- Protect the new `main` with PR, required quality check, and conversation
  resolution rules; block force pushes and deletion. Protect `deprecated`
  against updates and deletion. Do not require a GitHub review that the sole
  operator cannot provide to their own PR.
- Keep documentation and contributor instructions concise, current, and linked.
  Record release and cutover commands, rollback conditions, and authoritative
  SHA evidence.

## Verification and cutover

1. Confirm the old default `main` SHA, clean worktree, no active writers or open
   PRs affecting the cutover, historical tag/release inventory, and exact remote
   permissions.
2. Build the independent candidate branch. Run deterministic format, lint, type,
   schema, catalog, documentation, label, release, and negative tests.
3. On a clean runner, add the candidate Git marketplace and install every
   advertised plugin. Assert ID, version `0.1.0`, origin, installed contents,
   skill inventory, and relevant MCP/hook behavior. Prove an old installed
   version can be replaced by the new line without hidden cache state.
4. Publish the candidate branch and verify its checks and exact SHA. An orphan
   branch cannot be merged as an ordinary PR against the old unrelated `main`;
   preserve its review evidence separately.
5. In a no-writer window, change the default branch to the candidate, rename the
   former `main` to `deprecated`, then rename the candidate to `main`. Poll each
   GitHub rename to completion and verify refs after every step. Never
   force-push or rewrite the old branch.
6. Verify `default_branch=main`, the new root commit and SHA, the old SHA at
   `deprecated`, active rulesets, all 20 remote installations, release tags and
   GitHub Releases, and clean local worktrees. If any cutover invariant fails,
   restore the old default branch through the preserved ref and report the
   incident. Do not delete either history.

## Non-goals and limits

- Universal public Plugins Directory submission is a separate process.
- No Claude Code compatibility target is claimed.
- No automatic reduction of the current operator's local Codex capabilities.
- Historical repository CI, a schema-only check, or a local marketplace smoke
  test cannot certify the new Git distribution.
- Deleting `deprecated` requires a later explicit user decision.
