---
status: accepted
date: 2026-08-27
decision-makers: Nery Samuel Murillo
consulted: Codex
informed: Repository contributors
---

# Hooks and Quality Gates

## Context

Codex Essentials is a plugin marketplace and data repository, not a web
application. It needs fast local feedback for contributors and independently
observable CI gates for protected branches, releases, documentation, and
security. Local developer environments may vary, so local hooks are advisory
and CI is authoritative.

Version-sensitive facts were checked on 2026-08-27. Husky 9.1.7 is the current
published Husky release, lint-staged 17.4.1 is the current published
lint-staged release, and Husky 10 has not shipped. The repository uses Node 24
with npm lockfile installation and keeps TypeScript 7 and TypeScript 6 checks
side by side.

## Decision

Use Husky 9.1.7 for the local `pre-commit` hook and run lint-staged directly
with `npx --no-install lint-staged`. The hook intentionally uses minimal POSIX
shell with `#!/usr/bin/env sh` and the no-shim format. It does not source
`_/husky.sh`, so it is compatible with Husky's documented removal of the legacy
shim in a future major release.

Treat `.husky/_/*` as generated Husky infrastructure, not authored repository
hook logic. Do not edit `.husky/_/husky.sh` to satisfy linters; exclude
`.husky/_/` from linting and formatting scopes while keeping generated internals
ignored by Git. Lint only the authored hook files such as `.husky/pre-commit`.

CI remains the source of truth. The quality workflow exposes separate gates for
formatting, ESLint, TypeScript 7 native typechecking, script typechecking,
TypeScript 6 compatibility, Vitest coverage, and manifest validation, plus a
stable `required` aggregator for branch-protection required checks. CI jobs set
HUSKY=0 in CI so npm installation does not install or run local hooks.

Security and release automation are separate workflows. The security workflow
runs dependency review, CodeQL, and actionlint with least privilege. Release
workflow details are defined by ADR-0008: Release Please creates the exact
component tags and drafts, the same workflow validates and packages those tags,
and publication requires approval through the protected `release` environment.

## Alternatives

- Keep a single `npm run check` CI job. This is simpler, but it hides which
  gate failed and makes branch protection less precise.
- Use only CI and no local hooks. This avoids local setup, but contributors lose
  fast staged-file feedback before commits.
- Use pre-commit or another cross-language hook manager. That would work, but it
  adds another tool manager to a repository already standardized on npm for
  project-owned Node tooling.

## Consequences

- Good: contributors get fast local formatting/lint feedback while CI remains
  independently reproducible.
- Good: the authored hook stays portable and ShellCheck-clean without modifying
  generated Husky internals.
- Good: protected branches can require one stable aggregator while still showing
  detailed job results.
- Good: release validation is tied to the exact tag being published, and the
  draft release records source commit, plugin tree, archive, and archive
  checksum.
- Trade-off: CI repeats `npm ci` across independent jobs to keep each gate
  observable and independently rerunnable.
- Trade-off: branch protection, the protected release environment, and
  Dependabot/security settings remain GitHub-side configuration until a remote
  is configured and verified.

## Security and Permissions

Workflows default to `contents: read`. Dependency review adds only
`pull-requests: read`, CodeQL adds only `security-events: write`, and release
write permissions are limited to draft/publish jobs. Draft creation is an
unpublished write used to attach the plugin archive and release notes; final
publication is gated by the protected `release` environment. Pull-request
workflows do not use secrets, and release documentation uses `${VAR}`
placeholders rather than credential values.

## Compatibility

Node 24 is selected explicitly in GitHub Actions. The root package enforces
`engines.node` `>=24` with npm `engine-strict=true`. TypeScript 7 is the native
compiler path through `npm run typecheck`; TypeScript 6 remains available
through `npx tsc6 --noEmit` for compiler-API compatibility.

## Rollback

Disable the local hook by reverting `.husky/pre-commit`, removing the
`prepare` script, and removing Husky/lint-staged dependencies. Roll back CI by
reverting the workflow commits or temporarily removing the affected check from
branch protection. Roll back a plugin release by restoring the previous
marketplace metadata, deleting the GitHub release, and deleting the release tag.
Generated `.husky/_/*` files can be recreated by rerunning the Husky `prepare`
step.

## Verification

The implementation is covered by Vitest contract tests for package
configuration, Husky hooks, workflow YAML, release-plan validation, archive
packaging, and documentation policy. The required local verification commands
are `npm run format:check`, `npm run lint -- --max-warnings=0`,
`npm run typecheck`, `npm run typecheck:scripts`, `npx tsc6 --noEmit`,
`npm test`, `npm run marketplace:check`, `npm run validate:release-workflow`,
`npm run package:preflight`, `actionlint`, and `git diff --check`.

References:

- <https://github.com/typicode/husky/releases>
- <https://github.com/typicode/husky/blob/main/docs/get-started.md>
- <https://github.com/typicode/husky/blob/main/docs/how-to.md>
- <https://github.com/lint-staged/lint-staged>
- <https://github.com/prettier/prettier/blob/main/docs/precommit.md>
- <https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0>
