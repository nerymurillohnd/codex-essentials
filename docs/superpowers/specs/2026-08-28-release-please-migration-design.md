# Release Please Manifest Migration Design

## Status

Approved implementation design for the `codex-essentials` release pipeline.

## Goal

Replace the repository-owned SemVer, tag, changelog, and GitHub Release
orchestration with Release Please manifest mode. Keep repository code focused on
Codex-specific plugin validation, deterministic archive creation, SHA-256
checksums, asset attachment, and the protected publication gate.

## Scope

The repository contains three independently versioned plugin components:

- `plugins/astro-cli-commands`
- `plugins/doc-keeper`
- `plugins/prettier-after-edit`

Release Please owns Conventional Commit analysis, version calculation, local
plugin changelog updates, release PRs, tags, and draft GitHub Releases. Each
plugin's `.codex-plugin/plugin.json` remains the authored runtime source of
truth for its identity and version. Release Please updates its `$.version`
field through a JSON `extra-files` updater.

## Release flow

```text
push to main
  -> Release Please creates or updates one combined Release PR
  -> merge Release PR
  -> Release Please creates tags and draft GitHub Releases
  -> same workflow records the action outputs as JSON
  -> normalize the exact per-component tag_name and sha outputs
  -> validate the release plan and current plugin contract
  -> git archive each exact tag and create deterministic tar.gz + SHA-256
  -> validate archive contents and attach assets to matching drafts
  -> protected release environment pauses the workflow
  -> verify every draft and required asset
  -> publish every verified draft
```

The workflow has no `release`, `create`, or tag-push trigger. This avoids
depending on a second workflow run caused by a `GITHUB_TOKEN` event.

## Release Please configuration

Use manifest mode with the built-in changelog-only behavior, one combined
Release PR, plugin-local changelogs, and tags in the existing contract:

```text
plugin/<plugin-id>/v<semver>
```

The Release Please 17.x implementation of `release-type: "simple"`
always adds a required `version.txt` update. Because these plugins deliberately
have neither `version.txt` nor a fictitious package file, the configuration uses
the `go` strategy with no `version-file`. In this configuration `go` is used
only for its changelog-only update behavior; plugin versions are still updated
by the JSON `extra-files` entries. This is an implementation constraint, not a
claim that the plugins are Go modules. The manifest stores the last released
version per component and must be bootstrapped from published tag/release
history, not from an unverified working tree version. The pinned action embeds
Release Please 17.6.0; a newer standalone CLI is not assumed to match it. The
current repository history has no published DocKeeper tag or release, so that component requires an
explicit migration decision before the first production Release Please run.

## Release-plan protocol

The action's documented `releases_created` output is the only gate for whether
the downstream jobs run. Immediately after the action, the workflow writes one
explicit `dist/release-please-outputs.json` field at a time, including
`paths_released` and every configured path's `tag_name`, `version`, `sha`, and
`release_created` output. The artifact is the cross-job protocol; the workflow
does not attempt to serialize the Actions output map as an expression.

The prepare job consumes that artifact, validates each exact `tag_name` and
`sha` against the current push and the plugin manifest, and writes a normalized
`dist/release-plan.json`. It rejects malformed tags, missing manifests,
name/version mismatches, stale tag SHAs, and an empty result when Release Please
reports a release. It never reconstructs a tag from a plugin name and version.

## Artifact contract

For every plan entry, packaging uses `git archive` at the exact release tag,
then `gzip -n` semantics, not the mutable checkout tree. The archive has a
deterministic top-level directory `<plugin>-<version>/`, and contains only
tracked files under the plugin path. A sibling `.sha256` file records the
checksum using only the archive basename so `sha256sum -c` works after both
assets are downloaded into one directory. Archive validation rejects absolute
paths, traversal, symlinks, and sensitive or generated content such as
credentials, `.git`, `node_modules`, `coverage`, and build output.

## Pre-merge and post-release validation

The existing quality workflow gains a package preflight which validates the
marketplace and builds/inspects archives from the candidate commit before a
Release PR can merge. The post-release jobs repeat domain validation and build
from the exact tags before uploading assets. Release Please is not used as a
substitute for those checks.

## Publication safety

Asset upload happens before the protected `release` environment. The protected
job first verifies every planned release remotely: exact tag, draft state, and
the two required asset names. Only after all entries pass preflight does it
change any draft to published, preventing a validation failure from publishing
the first entries in a partial batch.

## Non-goals

- Do not add a fictitious `package.json` or `version.txt` to plugin packages.
- Do not preserve custom previous-tag discovery or custom release-note
  extraction.
- Do not publish npm packages.
- Do not create or modify remote tags, releases, branches, or repository
  settings as part of this implementation.
- Do not solve shared-code release intent until a concrete shared-code case
  exists.

## Compatibility and migration

Existing published tags and releases remain immutable. The old manual
`plugin-release.yml` workflow is replaced by the Release Please workflow. The
existing tag format remains the validation contract. The initial Release Please
manifest values must be reconciled with actual published history before merging
the migration; DocKeeper is intentionally called out because its current
working-tree version is not evidence of a published release.

Release Please runs with a dedicated GitHub App installation token created at
workflow time. The App needs repository-scoped Contents write, Pull requests
write, and Issues write permissions. Required CI checks, including Conventional
Commit PR-title validation and package preflight, must be configured as branch
protection rules outside this repository change.

The first cut does not make `docs:` commits independently releasable. A change
to distributed documentation that deserves a patch release uses
`fix(docs): ...` (and touches the plugin path), or an explicit Release-As footer
when a nonstandard bump is required. The `docs` changelog section remains
visible only so those entries are retained when another releasable commit
creates the release.

Product PR policy requires one releasable plugin per PR. The scope in a
Conventional Commit is descriptive; changed paths determine component
membership. Repository guidance records that coordinated multi-plugin changes
must be split unless their shared bump intent is deliberately reviewed.

The repository's existing integration policy prohibits squash merging by
default. Release Please therefore relies on Conventional Commit subjects in
the commits that reach `main`; changing merge strategy is a separate repository
policy decision and is not silently introduced here.
