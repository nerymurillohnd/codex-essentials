---
status: accepted
date: 2026-08-30
decision-makers: Nery Samuel Murillo
consulted: Codex
informed: Repository contributors
---

# Direct Push and Pull Request Routing

## Context

The repository needs a low-friction path for small documentation and guidance
updates while retaining pull-request review for changes that can affect
plugins, releases, validation, security, or compatibility. GitHub branch
protection does not provide a native path-conditional combination of direct
pushes and required pull requests or status checks.

## Decision

Allow direct pushes to `main` only for `docs/**`, the root `AGENTS.md`, and the
root `README.md`. Enforce the path boundary in `.husky/pre-push` with the
tested `lib/quality/direct-push-policy.cjs` classifier, and run the complete
`npm run check` gate for accepted direct pushes.

Require pull requests for plugin packages, manifests, catalog data, scripts,
tests, schemas, workflows, release behavior, permissions, security controls,
refactors, and substantive plugin changes. Run all GitHub Actions workflows on
pull-request events only; release processing runs after a merged pull request
to `main`.

Remove the global required-status-check and required-pull-request-review
requirements that would block the direct documentation lane, while retaining
branch force-push, deletion, administrator, and conversation-resolution
controls. Treat the local classifier and pull-request review process as the
path-aware integration controls.

## Implementation record

- Implemented on 2026-08-30 through [PR #25](https://github.com/nerymurillohnd/codex-essentials/pull/25), merged as `9bd8100`.
- The remote `main` protection now has no global pull-request or required-status-check rules.
- Force-push, branch deletion, administrator enforcement, and conversation-resolution protections remain enabled.
- The four repository workflows now trigger only from pull-request events, with release processing limited to merged pull requests targeting `main`.
- The local pre-push classifier accepts the documented paths and rejects product, tooling, workflow, security, and other non-documentation paths.
- Verification completed with `npm run check`, `actionlint`, `shellcheck .husky/pre-push`, the documentation gate, and a successful `git push origin main` after the remote change.

## Consequences

- Small documentation updates can be committed and pushed directly after the
  complete local check passes.
- Significant changes retain a pull-request review and validation path.
- Direct pushes do not receive GitHub Actions validation automatically.
- A local hook bypass is an explicit emergency exception and requires manual
  follow-up.
- Remote branch protection cannot independently enforce the path distinction.

## Rollback

Restore the previous workflow triggers and required branch checks, remove the
direct-push hook and classifier, and update the root and operational guidance
to describe the restored PR-only integration model.

## Verification

Verify the classifier with its Vitest tests, run `npm run check`, validate every
workflow with `actionlint`, inspect the protected `main` branch settings, and
perform one controlled direct documentation push and one rejected non-document
push before declaring the policy operational.
