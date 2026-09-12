---
status: accepted
date: 2026-09-12
decision-makers: Nery Samuel Murillo, Codex
consulted: Semantic Versioning 2.0.0, GitHub release documentation
informed: Repository contributors and plugin consumers
---

# Use v-prefixed SemVer tags for repository and plugin releases

## Context and Problem Statement

Codex Essentials is a Git-backed public marketplace for reusable Codex plugins
and skills. The repository needs a release and tag convention that is readable
in GitHub Releases, sortable by semantic version, compatible with plugin
manifests, and explicit about prerelease status.

Semantic Versioning 2.0.0 defines versions as `MAJOR.MINOR.PATCH` and states
that a leading `v` is a tag-name convention rather than part of the semantic
version. GitHub Releases can create releases from existing or new tags, mark
releases as prereleases, and determine the latest release from semantic version
ordering when the latest flag is not selected manually. GitHub also supports
prepopulating the release form with URL query parameters and generating release
notes from merged pull requests, contributors, labels, and a full changelog link.

At the time of this decision, the root package version is `0.1.0`, the visible
local tag list is empty, and repository policy already states that Release
Please may create plugin tags and GitHub Releases but must not publish packages
or upload release assets.

## Decision Outcome

Repository release tags use a leading `v` followed by a valid Semantic
Versioning 2.0.0 version:

```text
vMAJOR.MINOR.PATCH
```

The semantic version stored in `package.json`, `plugins/<plugin-id>/plugin.json`,
or other version fields excludes the leading `v`:

```text
MAJOR.MINOR.PATCH
```

Prerelease tags use SemVer prerelease identifiers and are marked as prereleases
in GitHub:

```text
vMAJOR.MINOR.PATCH-alpha.N
vMAJOR.MINOR.PATCH-beta.N
vMAJOR.MINOR.PATCH-rc.N
```

Whole-marketplace releases use root tags:

```text
v0.2.0
```

Independently released plugins may use plugin-scoped tags:

```text
plugin/<plugin-id>/v0.2.0
```

Published release contents are immutable from a policy perspective. Corrective
changes require a new version. GitHub Releases for this marketplace do not
upload package artifacts, publish packages, or attach generated release assets
unless a later accepted decision explicitly changes that policy.

## Consequences

- Git tags are readable in GitHub while version fields remain valid SemVer.
- Prerelease status is represented both in the tag name and GitHub release
  metadata.
- Repository and plugin release lines can coexist without overloading a single
  tag namespace.
- Plugin-scoped tags keep the existing `plugin/<plugin-id>/v<semver>` Release
  Please namespace used by contributor guidance.
- The repository retains its current no-package-publication and no-release-asset
  constraint.
- Release automation must validate both tag shape and manifest version shape
  when it creates or checks releases.
- Release notes should use GitHub's generated release notes support configured
  by `.github/release.yml`, then be reviewed before publication.

## Confirmation

Before creating any release tag, run the repository gate and inspect the release
target:

```bash
npm run check
git status --short --branch
git log --oneline -1
```

For Python-adjacent release tooling changes, also run:

```bash
basedpyright $(rg --files -g '*.py')
```

## Sources Verified

- Semantic Versioning 2.0.0, accessed 2026-09-12:
  <https://semver.org/>
- GitHub Docs, "Managing releases in a repository", accessed 2026-09-12:
  <https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository>
- GitHub Docs, "Automation for release forms with query parameters", accessed
  2026-09-12:
  <https://docs.github.com/en/repositories/releasing-projects-on-github/automation-for-release-forms-with-query-parameters>
- GitHub Docs, "Automatically generated release notes", accessed 2026-09-12:
  <https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes>
