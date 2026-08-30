---
status: accepted
date: 2026-08-30
decision-makers: Nery Samuel Murillo
consulted: Codex
informed: Repository contributors and plugin consumers
---

# Publish Releases Automatically After Release PR Merge

## Context

Codex Essentials uses pull requests for plugin creation and substantive
plugin changes. Release Please then opens a release pull request that records
the version and changelog transition. The repository previously added a
second manual approval through a protected GitHub Actions `release` environment
after the release pull request had already been merged.

The repository is maintained by a single maintainer who decides when product
and release pull requests merge. The extra environment approval duplicated
that decision while delaying publication, without replacing the automated
checks that validate the exact release source and artifacts.

## Decision

Remove the required-reviewer `release` environment from the publication job.
Merging the Release Please release pull request is the final human
authorization point. After that merge, the release workflow publishes only
after all existing automated controls pass:

- Release Please produces the exact component tag and source SHA.
- The normalized release plan matches the action outputs and plugin metadata.
- Marketplace and released-plugin validation pass.
- Deterministic archives and SHA-256 checksums are created from exact tags.
- Archive contents are inspected for traversal, symlinks, credentials, and
  generated content.
- Every draft release has the expected tag and both required assets before any
  draft is published.

The repository's protected plugin-release tag ruleset and GitHub App
credential boundary remain unchanged. Historical design and audit records
retain the rationale that was valid when the environment was selected; this
ADR supersedes that publication-approval choice for the current workflow.

## Alternatives

- Keep the protected environment and require a second approval. This provides
  defense in depth but duplicates the maintainer's release-PR decision and
  adds an avoidable manual pause.
- Remove the Release Please release pull request and publish directly after a
  product PR merge. This would reduce one more step but would weaken the
  explicit review of version and changelog changes, so it is rejected.
- Remove all automated release validation. This would be faster but would
  permit malformed or unintended artifacts, so it is rejected.

## Consequences

- Good: the maintainer has one clear final release decision: merge the Release
  Please release pull request.
- Good: publication becomes automatic and remains auditable through the merged
  release PR, workflow run, exact tag, draft release, and uploaded assets.
- Good: no release-environment configuration is required for the publication
  path.
- Trade-off: a compromised workflow or incorrect release automation could
  publish after the release PR merge; the retained exact-source and artifact
  gates are the compensating controls.
- Trade-off: deleting the remote environment is a separate administrative
  cleanup after this workflow change is integrated.

## Rollback

Restore the `release` environment reference to the publication job, recreate
the required reviewer protection, and restore the active quality and security
policy statements if manual publication approval is required again.

## Verification

Run `actionlint`, `npm run validate:release-workflow`, `npm run format:check`,
`npm test`, and `git diff --check`. Confirm that no active workflow or policy
requires `environment: release` before deleting the remote environment.
