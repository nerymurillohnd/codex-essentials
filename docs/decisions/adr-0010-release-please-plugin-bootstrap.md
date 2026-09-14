---
status: accepted
date: 2026-09-13
decision-makers: Nery Samuel Murillo, Codex
consulted: Release Please manifest documentation, GitHub Actions permissions
informed: Marketplace contributors and plugin consumers
---

# Bootstrap Release Please for independently versioned plugins

## Context and Problem Statement

The marketplace documented independently versioned plugins and Release Please,
but had no active release configuration, version manifest, workflow, or local
contract validation. A releasable `feat` for `agents-md-master` therefore merged
without a release pull request, manifest bump, tag, or GitHub Release.

How should the repository bootstrap reliable releases for all current plugins
without inventing historical tags, publishing packages, or releasing every
component at once?

## Decision Drivers

- Keep each root `plugins/<plugin-id>/plugin.json` as the version source.
- Create immutable `plugin/<plugin-id>/v<semver>` tags and GitHub Releases only
  through reviewed Release Please release pull requests.
- Bootstrap the current component versions without backfilling historical tags.
- Release only `agents-md-master` from the first bootstrap run.
- Use only `${GITHUB_TOKEN}` and create no new release credentials or assets.

## Decision Outcome

Use Release Please manifest mode with one `go` component for every current
plugin path. The `go` strategy updates only the package-local `CHANGELOG.md`
when no version file is configured; JSON `extra-files` update the root
`plugin.json` `$.version` field without introducing a second version source.
Component names use `plugin/<plugin-id>`; component tags use `/` as the
separator and retain the `v` prefix.

The initial manifest records the current version of every plugin. The root
`bootstrap-sha` is
`86127842c7629bd1a4c38b4113e8d034f346ff4f`, immediately before the semantic
governance feature. This limits the first generated release pull request to
`agents-md-master`, whose `feat` commit is the only releasable plugin change
after that baseline. Release Please ignores the bootstrap value after its first
generated release pull request merges.

The workflow runs on pushes to `main` and manual dispatch. It has only the
permissions needed to create release pull requests, tags, and GitHub Releases:
`contents: write`, `issues: write`, and `pull-requests: write`. It does not
install packages, publish registries, build archives, upload assets, or use a
PAT/GitHub App credential. It pins `googleapis/release-please-action@v5`, whose
released runtime is Node 24; do not use the deprecated Node 20-based v4 action.

## Consequences

- Good, because every current plugin has a mechanically checked release
  component and manifest baseline.
- Good, because the first release does not fabricate historical releases or
  release unrelated plugins.
- Good, because normal plugin changes remain reviewable before manifest and
  changelog version updates land.
- Bad, because release pull requests created with `${GITHUB_TOKEN}` do not
  trigger the existing `pull_request` Quality workflow automatically; operators
  must validate generated release pull requests through the normal lifecycle.
- Bad, because the repository still has no branch protection/ruleset enforcing
  that lifecycle; this remains independent maintenance work.

## Confirmation

Run `npm run validate:release-contract`, `npm run release-contract:test`, and
`npm run check`. Confirm the release configuration covers every plugin exactly,
the bootstrap manifest matches current package versions, tags match
`plugin/<plugin-id>/v<semver>`, and the workflow contains no package publication
or asset-upload step.

After the bootstrap configuration merges, observe the generated
`agents-md-master` release pull request. Before it lands, confirm its exact head
SHA, run `npm run check`, inspect the manifest/changelog changes, and use the
normal protected lifecycle. After it merges, verify the version, tag, GitHub
Release, and zero uploaded assets through the release runbook.
