# Versioning and releases

## Version policy

Each plugin has its own semantic version in `plugin.json` and a matching section in `CHANGELOG.md`. Use `patch` for compatible fixes, `minor` for compatible additions, and `major` for incompatible changes. A new plugin starts at `0.1.0`. Repository documentation and tooling changes do not change a plugin version unless they alter that plugin's behavior or package.

## Prepare a release PR

1. Add and manually verify the plugin change.
   Re-open the relevant [current OpenAI guidance](official-guidance.md#how-to-keep-this-guidance-current) and check local Codex release notes before relying on the package or public submission rules.
2. Add notable changes under `Unreleased` using [the changelog guide](changelogs.md). Run `python3 scripts/bump_version.py <plugin> <major|minor|patch>` for an existing plugin. If `Unreleased` is empty and the change is simple, use `--summary "What changed"` instead. For an initial plugin, keep `0.1.0` and replace the template's initial-release note with its actual capabilities.
3. Review the dated changelog entry, including the actual release date, migration steps, and security implications as needed.
4. Add packaged `logo` and `composerIcon` assets and manifest paths for Codex distribution, following [current submission guidance](https://developers.openai.com/plugins/deploy/submission#icons-and-screenshots). Run `python3 scripts/preflight.py release <plugin>`; inspect the archive in `dist/`. This gate checks icon paths, filename extensions, and file size, but not image contents, square dimensions, or the 48-pixel minimum; inspect those manually. The local preflight does not replace Codex package validation or portal checks.
5. Open a PR using the repository template. Assign `process: release`, one `type:` label, and one primary `area:` label once labels exist on GitHub. Merge only after review and CI pass.

## Publish from a tag

After the release PR reaches `main`, create an annotated tag named `plugin/<plugin>/v<version>` at the reviewed commit and push that tag. The release workflow checks that the tag version matches the manifest, validates all plugins, packages the tagged plugin, extracts that version's changelog notes, and creates a GitHub release with a ZIP asset. A failed check stops publication. Tags and releases are public actions; verify the exact commit and contents before pushing.

The tag gate also requires an annotated tag, a clean checkout of its commit, and ancestry in `origin/main`. With the checked-in workflow running, a tag on an unmerged commit fails before release creation. This local and workflow rule uses full branch and tag history from `actions/checkout@v7` with `fetch-depth: 0`, following the [checkout documentation](https://github.com/actions/checkout#fetch-all-history-for-all-tags-and-branches) checked on 2026-10-04. Branch and tag rules remain necessary to restrict who can push or change the workflow; this gate does not prove PR review.

Example:

```sh
git switch main
git pull --ff-only origin main
git tag -a plugin/example/v1.2.3 -m "Release example v1.2.3"
python3 scripts/check_release_tag.py plugin/example/v1.2.3
git push origin plugin/example/v1.2.3
```

The tag format is the release identity. Do not reuse or move published tags. The release ZIP contains one top-level plugin directory. The release workflow does not publish to the OpenAI plugin directory or deploy an MCP server.

For public directory submission, separately review the ZIP against [current OpenAI guidance](official-guidance.md). A GitHub release ZIP may contain local-only capabilities such as hooks; current public submission rejects hooks and app references. Do not upload such a ZIP unchanged.

## GitHub activation checklist

The [remote repository](https://github.com/nerymurillohnd/codex-essentials) exists. As checked on 2026-10-04, GitHub recognizes both workflows; the updated `Validate` workflow passed on [PR #1](https://github.com/nerymurillohnd/codex-essentials/actions/runs/37190979560) and on [`main` after merge](https://github.com/nerymurillohnd/codex-essentials/actions/runs/37195715144), while `Release plugin` has no run. The remote still has default labels, and `main` has neither branch protection nor a ruleset. Create the labels listed in `.github/labels.yml`; the file documents label definitions but does not install labels by itself. Follow [the issue setup guide](issues.md#remote-setup). Configure a `main` branch rule requiring the `Validate` check and PR review, plus a tag ruleset restricting creation, updates, and deletion of `plugin/*/v*` to the intended release maintainers; GitHub documents these [ruleset protections](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets). Verify that the contact in [SECURITY.md](../SECURITY.md) is current, then enable and verify private vulnerability reporting if offering it as another reporting route. Review workflow permissions so the release job can create releases. Update this checklist after each remote setting and first release run is verified.
