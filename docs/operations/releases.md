# Release Operations

This runbook defines the operational release procedure for Codex Essentials.
It implements [ADR-0009](../decisions/adr-0009-release-tagging-policy.md).

## Release tag policy

- Use `vMAJOR.MINOR.PATCH` for whole-marketplace release tags.
- Use `<plugin-id>/vMAJOR.MINOR.PATCH` only when an individual plugin is
  released independently.
- Keep `package.json` and `plugins/<plugin-id>/plugin.json` version fields as
  plain SemVer without the leading `v`.
- Mark `vMAJOR.MINOR.PATCH-alpha.N`, `vMAJOR.MINOR.PATCH-beta.N`, and
  `vMAJOR.MINOR.PATCH-rc.N` releases as GitHub prereleases.
- Do not upload packages, archives, or generated release assets unless a later
  accepted decision explicitly authorizes them.

## Before releasing

Confirm the release target and local state:

```bash
git status --short --branch
git fetch --tags origin
git tag --list --sort=-version:refname
git log --oneline -1
```

Run the repository gate:

```bash
npm run check
```

When release tooling or Python validation code changed, also run:

```bash
basedpyright $(rg --files -g '*.py')
```

## Prepare release notes

GitHub generated release notes include merged pull requests, contributors, and a
full changelog link. This repository categorizes generated release notes with
`.github/release.yml`; labels referenced there are validated by
`npm run validate:github-labels`.

Generate notes through GitHub CLI:

```bash
gh release create v0.2.0 --verify-tag --generate-notes --draft
```

If the generated notes need an explicit lower bound, provide the previous tag:

```bash
gh release create v0.2.0 --verify-tag --generate-notes --notes-start-tag v0.1.0 --draft
```

Review generated notes before publishing. Remove entries that do not belong in
the release notes only by correcting labels or release configuration before
release creation, not by hiding repository changes.

## Prefill the GitHub release form

Use GitHub's release form query parameters when a browser review is useful. The
supported parameters used by this repository are `tag`, `target`, `title`,
`body`, and `prerelease`.

Normal release form:

```text
https://github.com/nerymurillohnd/codex-essentials/releases/new?tag=v0.2.0&target=main&title=v0.2.0
```

Prerelease form:

```text
https://github.com/nerymurillohnd/codex-essentials/releases/new?tag=v0.2.0-rc.1&target=main&title=v0.2.0-rc.1&prerelease=1
```

## Create a normal repository release

Replace `v0.2.0` with the approved tag.

```bash
git tag v0.2.0
git push origin v0.2.0
gh release create v0.2.0 --verify-tag --title "v0.2.0" --generate-notes
```

Do not attach release assets by default.

## Create a prerelease

Replace `v0.2.0-rc.1` with the approved prerelease tag.

```bash
git tag v0.2.0-rc.1
git push origin v0.2.0-rc.1
gh release create v0.2.0-rc.1 --verify-tag --title "v0.2.0-rc.1" --generate-notes --prerelease --latest=false
```

Do not mark prereleases as production-ready.

## Create an independently scoped plugin release

Use this only when the plugin is intentionally released independently from the
whole marketplace.

```bash
git tag ruff-after-edit/v0.2.0
git push origin ruff-after-edit/v0.2.0
gh release create ruff-after-edit/v0.2.0 --verify-tag --title "ruff-after-edit v0.2.0" --generate-notes
```

## After releasing

Verify the release and tag:

```bash
gh release view v0.2.0
git ls-remote --tags origin "refs/tags/v0.2.0"
```

Record any release defects as new maintenance work. Do not move or rewrite a
published release tag to repair a release; publish a corrected version instead.
