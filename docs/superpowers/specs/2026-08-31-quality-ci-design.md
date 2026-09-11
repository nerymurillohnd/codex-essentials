# Quality CI Design

## Status

Approved in conversation on 2026-08-31. This specification defines the
follow-up to PR #35; it does not alter that merged change.

## Purpose

Restore one minimal, authoritative GitHub Actions quality check after the
repository deliberately retired its former multi-workflow release and policy
system. The workflow must execute the same local gate maintainers use, add the
plugin documentation gate for pull requests, and create a stable check name
that can later be selected by branch protection.

## Scope

Create one workflow at `.github/workflows/quality.yml` and one contract test at
`tests/quality-workflow.test.ts`. Update the coverage profile so the new test
can run without requiring unrelated script coverage.

The workflow runs for:

- every pull request event that changes the candidate merge result;
- every push to `main`.

The workflow does not publish packages, create releases, write repository
content, use credentials beyond the default read-only GitHub token, change
branch protection, restore retired release automation, or reproduce the former
PR-title, label, scope, packaging, or release gates.

## Design

### Workflow topology

Use a single job named `Required quality gates` on `ubuntu-latest`, with a
15-minute timeout. A single job avoids repeated installs and keeps the remote
check aligned with the canonical local command instead of maintaining a second
job graph that can drift from `npm run check`.

The workflow sequence is:

1. Check out the exact event revision with full history.
2. Install the repository's `.nvmrc` Node version through `actions/setup-node`.
3. Restore the npm download cache keyed by `package-lock.json`.
4. Install locked dependencies with `HUSKY=0 npm ci`.
5. Run `npm run check`.
6. On pull requests only, run `npm run documentation:gate` with the event's
   base and head SHAs passed through environment variables.

The pull-request job uses `fetch-depth: 0` because the documentation gate
executes a Git diff between the event revisions. Context values are assigned to
environment variables and quoted in the shell command; they are not
interpolated directly into executable shell text.

### Action and runtime integrity

Pin every third-party action to an immutable commit SHA and retain the release
tag in an adjacent comment:

- `actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1`
  (`v7.0.1`);
- `actions/setup-node@820762786026740c76f36085b0efc47a31fe5020`
  (`v7.0.0`).

Configure `actions/setup-node` with:

- `node-version-file: .nvmrc`;
- `cache: npm`;
- `cache-dependency-path: package-lock.json`.

The repository `.nvmrc` remains the exact Node version authority. The workflow
must not duplicate `24.20.0` as an independent mutable value.

### Permissions and concurrency

Set workflow-level permissions to `contents: read`. Do not grant write,
pull-request, action, package, identity-token, or security-event permissions.

Use a concurrency key derived from the workflow name and pull-request number
or Git ref, with `cancel-in-progress: true`. A newer commit supersedes an older
run for the same pull request or branch without canceling unrelated runs.

### Failure behavior

Any checkout, runtime setup, dependency installation, quality gate, or
documentation-gate failure fails `Required quality gates`. There is no
`continue-on-error`, conditional success aggregator, retry loop, or skip path
for a failed required command.

The documentation step is skipped only for non-pull-request events because its
base/head contract is PR-specific. `npm run check` remains required for both
pull requests and `main` pushes.

## Contract test

`tests/quality-workflow.test.ts` parses the workflow with the existing `yaml`
dependency and asserts the externally important contract:

- triggers include `pull_request` and `push` limited to `main`;
- workflow permissions are exactly `contents: read`;
- concurrency cancellation is enabled;
- the only job is named `Required quality gates`, uses `ubuntu-latest`, and has
  a 15-minute timeout;
- checkout and setup-node use the approved immutable SHAs;
- checkout requests full history;
- setup-node reads `.nvmrc` and enables npm caching from `package-lock.json`;
- install uses `HUSKY=0 npm ci`;
- `npm run check` is unconditional;
- the documentation gate is PR-only and consumes quoted base/head environment
  variables;
- no step uses `continue-on-error`.

The test is written and observed failing because the workflow is absent before
the workflow is added. `coverage-profiles.ts` maps this test to an empty source
profile because it validates YAML configuration rather than a production CJS
module; the existing inventory test continues to prove every CJS module is
covered exactly once.

## Validation

Local validation requires:

```bash
npx vitest run tests/quality-workflow.test.ts
npm run format:check
npm run lint -- --max-warnings=0
npm run typecheck
npm run check
```

If `actionlint` is available, run it against `.github/workflows/quality.yml` and
report it separately. Do not install a global validator or add a dependency
solely for this workflow.

Remote validation requires publishing the follow-up branch, opening a pull
request against `main`, and observing `Required quality gates` complete
successfully for that PR. A local green run is not remote proof.

## Acceptance criteria

- A pull request receives one `Required quality gates` check that runs the
  canonical repository and plugin-documentation gates.
- A push to `main` receives the same check without the PR-only documentation
  step.
- Node, npm cache inputs, action versions, permissions, and event SHAs are
  deterministic and contract-tested.
- No retired release or policy automation is restored.
- Local gates pass, the follow-up PR reports a successful remote check, and the
  worktree remains clean.
