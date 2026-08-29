# Release Please Manifest Migration Plan

## Goal

Adopt Release Please manifest mode for independent plugin versions while
retaining only Codex-specific validation, deterministic packaging, checksums,
asset upload, and protected publication logic.

## Architecture

Release Please owns version calculation, plugin-local changelogs, release PRs,
tags, and draft GitHub Releases. `scripts/capture-release-please-outputs.cjs`
records one explicit JSON field per action output. `scripts/prepare-release-plan.cjs`
normalizes those exact per-component outputs. `scripts/package-plugin.cjs`
creates archives from exact tags. `scripts/validate-release-set.cjs` validates
release invariants and archive contents without calculating versions or
discovering previous releases.

## Tech stack

Release Please manifest mode, GitHub Actions, Node.js 24, the existing Node
scripts and marketplace validators, `git archive`, Node `crypto`, GNU/BSD tar
listing, `gh`, and GitHub's protected `release` environment.

## Global constraints

- Work only in the isolated migration worktree.
- Use `plugin/<plugin-id>/v<semver>` tags and keep plugin manifests as the
  authored runtime source of truth.
- Use the built-in changelog-only strategy plus JSON `extra-files`; never
  introduce a fake package model or `version.txt`. The current Release Please
  implementation calls that built-in strategy `go`; `simple` is not viable
  without its mandatory `version.txt` update.
- Package exact release tags, never the mutable worktree.
- Normalize only the exact Release Please outputs for the current push; do not
  census unrelated draft releases.
- Use full SHA pins for GitHub Actions.
- Use the official Release Please action commit for v5.0.0:
  `45996ed1f6d02564a971a2fa1b5860e934307cf7`.
- Create an ephemeral GitHub App installation token in each job that mutates
  repository releases or pull requests; do not depend on a personal token.
- Do not create commits, tags, releases, pushes, or repository settings.
- Run formatting, lint, both typechecks, tests, manifest validation,
  `actionlint`, and `git diff --check` before handoff.

## Implementation tasks

### 1. Lock the Release Please contract

- Add `release-please-config.json` for the three plugin paths with
  `bump-minor-pre-major: true`, visible `feat`, `fix`, `docs`, and `deps`
  sections, but no docs-only bump policy.
- Add `.release-please-manifest.json` with values reconciled against published
  history; document the DocKeeper first-release discrepancy if it cannot be
  resolved without remote mutation.
- Verify the changelog-only strategy with JSON `extra-files`, local changelog
  paths, component tags, draft releases, and forced tag creation using a pinned
  Release Please CLI dry run or equivalent local fixture. Record why `simple`
  was rejected: it requires `version.txt` in the current Release Please
  implementation.

### 2. Test output capture and release-plan normalization first

- Add tests covering explicit action outputs, exact tag/sha consumption,
  malformed tags, missing manifests, manifest name/version mismatches, stale
  SHAs, and empty plans.
- Implement `scripts/capture-release-please-outputs.cjs` and
  `scripts/prepare-release-plan.cjs`; no draft census is the source protocol.

### 3. Test deterministic packaging first

- Add tests covering archive naming, exact-tag packaging, checksum generation,
  path containment, and failure for unresolved tags or mismatched manifests.
- Implement `scripts/package-plugin.cjs` using `git archive` and actual
  `gzip -n` deterministic output. Emit one `release-artifacts.json` plan for
  later jobs.

### 4. Replace release validation with domain invariants

- Replace the old single-tag validator contract with release-plan validation in
  `scripts/validate-release-set.cjs`.
- Preserve SemVer/tag shape and manifest/changelog consistency as invariants,
  but remove manual version calculation, previous-tag discovery, and release-note
  extraction.
- Add archive member and symlink checks, sensitive-path rejection, checksum
  verification, and all-entry preflight validation.

### 5. Replace the workflow

- Remove the manual `workflow_dispatch` and tag-triggered workflow.
- Add one push-to-main workflow using the official pinned
  `googleapis/release-please-action` v5.0.0 and a GitHub App installation token.
- Record action outputs as an artifact, build the normalized plan from exact
  per-component outputs, package exact tags, upload assets, then pause at the
  protected `release` environment.
- Verify every draft and asset before publishing any release.
- Avoid invalid heredoc/output redirections and avoid a second workflow trigger.

### 6. Update repository guidance and tests

- Update package scripts and root/release documentation to describe Release
  Please, Conventional Commit PR titles, the existing non-squash policy, plan normalization,
  deterministic artifacts, and the DocKeeper migration caveat.
- Add a quality gate for Conventional Commit PR titles and package preflight;
  document that repository branch protection must require the aggregator.
- Update quality guidance and release references so they no longer describe the
  old manual tag workflow.
- Keep plugin documentation unchanged unless a product behavior changes.

### 7. Verify and hand off

- Run the focused release tests while implementing each script.
- Run the full repository checks plus `actionlint` and `git diff --check`.
- Inspect the complete diff and report changed files, observed results, skipped
  live migration verification, and the required next step for remote
  branch/PR testing.
