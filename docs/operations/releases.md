# Release operations

This runbook covers the new Codex Essentials Git lineage. The former release
history belongs to remote `deprecated` and is not a version baseline for this
branch.

## Source and version boundary

`main` is the distributed Git marketplace. A product PR must carry the package
change, a new SemVer value in `plugins/<id>/plugin.json`, a matching
`CHANGELOG.md` section, affected README and skill documentation, and generated
catalog/README/form output in the same reviewable change. Run:

```sh
npm ci
npm run catalog:build
npm run check
git diff --check
```

An initial package version is `0.1.0`. New tags have the shape
`codex-essentials/<plugin-id>/v<semver>`. Historical tags named
`plugin/<plugin-id>/v<semver>` remain untouched; this separate namespace is
necessary because an immutable historical release already uses
`plugin/agents-md-master/v0.2.0`. GitHub documents that a tag name associated
with an immutable release cannot be reused, even after deletion:
<https://docs.github.com/en/code-security/concepts/supply-chain-security/immutable-releases>.

## Before publication

Confirm the local branch, target SHA, clean checkout, package versions, catalog,
and remote default branch. `npm run release:plan` is read-only: it queries
GitHub tags and Releases and prints the intended actions. It must not be used as
evidence of a successful remote write.

The release workflow has `contents: write` and runs the full local gate before
calling `scripts/publish-release.mjs --apply`. That script permits writes only
inside GitHub Actions for `refs/heads/main`, checks the workflow SHA against the
remote `main`, validates all package and changelog inputs, and plans all
releases before its first write. It uses the repository-provided `${GH_TOKEN}`;
never print the token value.

## Initial clean-line releases

After the branch switch and verification of all 20 packages at `0.1.0`, invoke
the initial workflow against `main`:

```sh
gh workflow run release.yml --ref main -f bootstrap=true
```

Observe the run and its exact head SHA. Verify that each of the 20 new tags
points to that SHA, that each GitHub Release names its package and `0.1.0`, and
that the historical release and tag are unchanged. The job is idempotent for a
partially completed initial run: a correct existing tag/release is skipped; a
tag without its Release gets the missing Release; a conflicting tag SHA stops
the run. Do not move or delete a tag to make it pass.

## Later releases and recovery

Later merges to `main` trigger the release workflow. A package with no new
version does not receive a new tag. The first commit carrying a new version is
the release target; if an untagged version survives into a later unrelated
commit, the workflow fails rather than silently tagging the wrong SHA.

When a run fails, inspect its head SHA, package versions, tags, and Releases. If
`main` still points to the same SHA, retry the workflow from `main`. If the
branch advanced, stop and reconcile the exact unreleased commit before any new
tag or Release. Never force-push or recreate an immutable tag. Report any
partial release state explicitly.

GitHub's `latest` Release label is repository-wide, while versions here are per
plugin. The publisher therefore sets `make_latest=false` for every plugin
Release. Do not use a generic latest-version badge as the marketplace's version;
link directly to the relevant plugin Release instead. See
<https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository>.

No release job publishes npm packages or uploads assets. GitHub's automatic
source archive links are platform-generated and are not repository-uploaded
release artifacts.
