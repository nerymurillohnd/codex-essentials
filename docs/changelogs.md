# Plugin changelogs

Use the canonical [CHANGELOG.md template](../templates/changelog/CHANGELOG.md) for every plugin. It follows [Keep a Changelog 1.1](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html). Recheck these sources before changing the format.

## Authoring rules

- Write for plugin users: record notable behavior, compatibility, permissions, migration steps, and security implications. A commit list is not a changelog.
- Keep `## [Unreleased]` first and collect changes there before a version bump. Group only applicable changes under `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, and `Security`; omit empty categories.
- Keep dated version sections newest first, using `## [X.Y.Z] - YYYY-MM-DD`. The date is the release date, in ISO format. Review the date when publishing if the release occurs after the bump.
- Every manifest version needs a matching dated section. Do not silently edit the meaning of a published release; add a correction note when material information was omitted.
- Name breaking changes and migration steps explicitly. A major bump alone does not tell users what to do.

## Release workflow

Add user-facing notes under `Unreleased`, then run `python3 scripts/bump_version.py <plugin> <major|minor|patch>`. The command moves those notes to a dated version section, resets `Unreleased`, updates the manifest, and refreshes generated catalog metadata. If no notes are staged, `--summary "..."` supplies one `Changed` bullet; this shortcut is for a single simple change. The command rejects a summary when `Unreleased` already contains notes to avoid duplication.

The GitHub release workflow extracts only the matching version section, not the full changelog. Inspect the resulting notes and ZIP before pushing a release tag.
