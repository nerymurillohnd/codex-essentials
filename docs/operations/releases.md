# Release Operations

This runbook defines the operational release procedure for Codex Essentials.
It implements [ADR-0009](../decisions/adr-0009-release-tagging-policy.md).

## Release tag policy

- Use `vMAJOR.MINOR.PATCH` for whole-marketplace release tags.
- Use `plugin/<plugin-id>/vMAJOR.MINOR.PATCH` only when an individual plugin is
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
git fetch origin main --tags
git tag --list --sort=-version:refname
git log --oneline -1 origin/main
git rev-parse origin/main
```

Run the repository gate:

```bash
npm run check
```

When release tooling or Python validation code changed, also run:

```bash
basedpyright $(rg --files -g '*.py')
```

Set the approved release tag and release target SHA. Tags must point at the
explicitly verified `origin/main` revision, not at whichever revision is
currently checked out:

```bash
release_tag=v0.2.0
release_target_sha="$(git rev-parse origin/main)"
```

## Prepare release notes

GitHub generated release notes include merged pull requests, contributors, and a
full changelog link. This repository categorizes generated release notes with
`.github/release.yml`; labels referenced there are validated by
`npm run validate:github-labels`.

Preview generated notes before creating a release:

```bash
gh api repos/nerymurillohnd/codex-essentials/releases/generate-notes \
  -f tag_name="${release_tag}" \
  -f target_commitish="${release_target_sha}"
```

If the generated notes need an explicit lower bound, provide the previous tag:

```bash
gh api repos/nerymurillohnd/codex-essentials/releases/generate-notes \
  -f tag_name="${release_tag}" \
  -f target_commitish="${release_target_sha}" \
  -f previous_tag_name=v0.1.0
```

Review generated notes before publishing. Remove entries that do not belong in
the release notes only by correcting labels or release configuration before the
release is created, not by hiding repository changes. Do not create a draft
release before the tag exists; create exactly one release after the tag is
pushed.

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
git tag "${release_tag}" "${release_target_sha}"
git push origin "${release_tag}"
gh release create "${release_tag}" --verify-tag --title "${release_tag}" --generate-notes
```

Do not attach release assets by default.

## Create a prerelease

Replace `v0.2.0-rc.1` with the approved prerelease tag.

```bash
release_tag=v0.2.0-rc.1
git tag "${release_tag}" "${release_target_sha}"
git push origin "${release_tag}"
gh release create "${release_tag}" --verify-tag --title "${release_tag}" --generate-notes --prerelease --latest=false
```

Do not mark prereleases as production-ready.

## Create an independently scoped plugin release

Use this only when the plugin is intentionally released independently from the
whole marketplace.

```bash
release_tag=plugin/ruff-after-edit/v0.2.0
previous_plugin_tag=plugin/ruff-after-edit/v0.1.0
git tag "${release_tag}" "${release_target_sha}"
git push origin "${release_tag}"
gh release create "${release_tag}" \
  --verify-tag \
  --title "ruff-after-edit v0.2.0" \
  --generate-notes \
  --notes-start-tag "${previous_plugin_tag}"
```

For noninitial independent plugin releases, always provide the immediately
preceding tag for that plugin with `--notes-start-tag`. Without that explicit
lower bound, generated notes can compare against an unrelated repository or
plugin release.

## After releasing

Verify the release and tag:

```bash
git ls-remote --tags origin "refs/tags/${release_tag}"
test "$(gh release view "${release_tag}" --json tagName --jq '.tagName')" = "${release_tag}"
test "$(gh release view "${release_tag}" --json isDraft --jq '.isDraft')" = "false"
test "$(gh release view "${release_tag}" --json assets --jq '.assets | length')" = "0"
```

For prereleases, also assert prerelease metadata:

```bash
test "$(gh release view "${release_tag}" --json isPrerelease --jq '.isPrerelease')" = "true"
```

For normal production releases, assert the opposite:

```bash
test "$(gh release view "${release_tag}" --json isPrerelease --jq '.isPrerelease')" = "false"
```

Record any release defects as new maintenance work. Do not move or rewrite a
published release tag to repair a release; publish a corrected version instead.
