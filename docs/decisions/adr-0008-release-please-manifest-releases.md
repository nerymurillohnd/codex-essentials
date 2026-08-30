---
status: accepted
date: 2026-08-28
decision-makers: Nery Samuel Murillo, Codex
consulted: Release Please and GitHub Actions documentation
informed: Codex Essentials contributors and plugin consumers
---

# Use Release Please manifest mode for plugin releases

## Context and Problem Statement

Codex Essentials has independently versioned plugin packages whose runtime
metadata lives in plugins/<plugin-id>/.codex-plugin/plugin.json. The previous
release workflow combined manual version selection, changelog promotion,
tagging, release creation, and custom validation. That duplicated standard
release-engine behavior and made the release protocol fragile.

How should the repository automate component versioning and GitHub Releases
without introducing a fictitious package model or moving plugin-specific
artifact validation into a generic release tool?

## Decision Drivers

- Keep plugin.json as the sole authored plugin version source.
- Use a maintained, documented release engine for SemVer, changelogs, tags, and
  GitHub Releases.
- Preserve independent plugin paths and the existing tag contract.
- Validate and package only the exact released source before publication.
- Make release outputs explicit and auditable across workflow jobs.
- Keep human approval at the final publication boundary.

## Considered Options

- Maintain the custom version/tag/changelog controller.
- Use Changesets and introduce package.json files for non-npm plugins.
- Use Release Please manifest mode with a custom Release Please strategy.
- Use Release Please manifest mode with its native changelog-only strategy and
  JSON extra-files.

## Decision Outcome

Chosen option: "Release Please manifest mode with native changelog-only
configuration".

Release Please owns Conventional Commit analysis, SemVer calculation, the
combined Release PR, plugin-local changelogs, component tags, and draft GitHub
Releases. Each configured package path remains independently versioned.

The configuration uses release-type: "go" without version-file. This is a
deliberate operational use of the native changelog-only behavior: it does not
mean these plugins are Go modules. The current simple strategy always adds a
version.txt update, which would create an unwanted second version source.
Each component instead uses a JSON extra-files updater at
.codex-plugin/plugin.json with $.version.

The configuration also sets bump-minor-pre-major: true, because these
components are still in 0.x: a pre-1.0 breaking change must not skip directly
to 1.0.0 under this release policy.

## Release Protocol

The official Action is pinned to commit
45996ed1f6d02564a971a2fa1b5860e934307cf7 (v5.0.0). That action release embeds
Release Please 17.6.0; the separately newer CLI version is not assumed to be
present in the action. The pinned action version is the version used for the
migration dry-run and production workflow.

The workflow writes dist/release-please-outputs.json immediately after the
action. It records one explicit field per documented global and component
output, including paths_released, each release_created, exact tag_name,
version, and sha. This artifact is the cross-job contract; GitHub Actions
output maps are not serialized wholesale.

The normalization step consumes that artifact and rejects missing or malformed
component outputs, stale SHAs, missing manifests, and mismatches between the
action's exact tag, SHA, and plugin metadata. It never rebuilds a tag from a
plugin name and version. The required tag shape is
plugin/<plugin-id>/v<semver>, and the action's tag_name is the source of truth.

Release Please runs in the same workflow as post-release validation and
packaging. No push-tag or release workflow is used, because events generated
with GITHUB_TOKEN do not reliably create a second workflow run. The
post-release jobs first validate the exact release set, then use git archive at
each exact tag and gzip -n semantics to produce tracked, deterministic
archives. SHA-256 files contain only the archive basename. Archives are
inspected for traversal, symlinks, credentials, and generated content before
assets are uploaded.

## Pre-merge and Publication Controls

The normal quality workflow requires Conventional Commit PR-title and
non-merge commit-subject validation, marketplace/domain validation, and package
preflight before a Release Please PR can merge. The subject check covers the
actual `<base>...<head>` range, because this repository integrates with merge
commits and Release Please analyzes the subjects that reach `main`. The
post-release path repeats validation as defense in depth.
The protected release environment is reached only after every draft has the
expected tag and both expected assets; all drafts are verified before any are
published with --latest=false.

The documentation gate keeps validating the current plugin README and
CHANGELOG, but does not require a README diff for a generated Release Please
PR. That narrow exception requires the pull request event to identify a Bot,
use a release title, and carry Release Please's maintainer-controlled
autorelease label. A contributor cannot obtain the exception by choosing a
release-shaped title alone.

Release Please uses an ephemeral GitHub App installation token rather than a
personal token. The App must have repository-scoped Contents write, Pull
requests write, and Issues write permissions. The App ID, private key, branch
protection, required checks, and protected environment are repository settings
that must be configured separately; this repository change does not mutate
remote settings. Until the App ID and private key exist, the workflow exits
successfully with an explicit skip notice rather than failing every push to
`main`.

## Commit and Documentation Policy

Conventional Commit subjects in the commits that reach main determine release
intent. The scope is descriptive; changed paths determine component membership.
Product PRs should affect one releasable plugin. Coordinated multi-plugin
changes require explicit review and should normally be split. The repository's
existing policy does not require squash merging, so this ADR does not silently
change that policy.

The one-time migration PR may carry the maintainer-controlled
`release-migration` label because it removes stale version claims from more
than one plugin README. The scope gate accepts that label as a narrow,
explicitly reviewable exception; a release-shaped title alone never bypasses
the gate.

docs: is visible in changelog sections but does not create a release by itself
under the default analyzer. Distributed documentation that deserves a patch
release uses fix(docs): ... while touching the plugin path, or an explicit
Release-As footer. The first migration does not add a custom versioning
strategy solely to make docs: bump versions.

## Consequences

- Good, because standard release machinery is delegated to Release Please.
- Good, because plugin manifests remain the runtime source of truth and no
  package.json or version.txt is introduced into packages.
- Good, because artifacts are tied to exact tags and the output contract is
  testable without querying a census of unrelated drafts.
- Bad, because the GitHub App and protected environment require one-time
  repository administration outside this change.
- Bad, because shared files outside a plugin path do not automatically imply
  releases for every plugin.
- Good, because DocKeeper's absent published baseline is represented honestly
  as 0.0.0 while its configured initial release remains 0.1.0. A future
  releasable DocKeeper change can therefore create its first release without
  pretending that 0.1.0 already exists remotely.

## Confirmation

- release-please-config.json uses go, bump-minor-pre-major, visible changelog
  sections, local changelogs, and JSON extra-files.
- release-pipeline.test.ts tests output capture, exact tag/SHA normalization,
  stale output rejection, tag-based packaging, checksum safety, archive
  inspection, and untracked-file exclusion.
- npm run package:preflight validates every current plugin from the candidate
  commit before release.
- The migration branch must run the pinned action against a real path-changing
  Conventional Commit in an isolated test repository or explicitly configured
  migration target before production activation.

## More Information

- [Release Please manifest mode](https://github.com/googleapis/release-please/blob/main/docs/manifest-releaser.md)
- [Release Please configuration](https://github.com/googleapis/release-please/blob/main/docs/customizing.md)
- [GitHub Actions GITHUB_TOKEN](https://docs.github.com/en/actions/concepts/security/github_token)
