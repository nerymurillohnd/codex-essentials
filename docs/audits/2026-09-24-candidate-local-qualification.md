# Clean-history candidate: local qualification

Date: 2026-09-24 UTC. This record covers the local candidate before any remote
branch rename or release publication. It is not a certification of the final
GitHub state.

## Lineage and preservation boundary

- Old remote `main` observed at `6e26790e1fc05ecb6500c1903d3225d601c5ebf7` using
  the GitHub branch API and `git ls-remote --heads origin`. The original
  checkout was clean. No external Git backup or bundle was created.
- Candidate `codex/rebuild-main` has orphan root
  `ceeba8c07836c7d65cc3a470936b5afcee816fbc`. It shares no ancestor with the old
  `main` history. Its exact publication SHA must be captured after the final
  audit commit and checked against remote CI before cutover.
- Historical tag `plugin/agents-md-master/v0.2.0` still points at
  `08a9e43eb1e0dc2d68429fc047ab10d785a50fcf`; GitHub Release `388135907` was
  observed as immutable. New releases use the distinct
  `codex-essentials/<id>/v0.1.0` namespace.

## Local contract and receiving CLI

The candidate contains exactly the 20 IDs named in the approved
[implementation plan](../superpowers/plans/2026-09-24-codex-marketplace-rebuild.md),
each with manifest version `0.1.0` and a new changelog entry. Twenty-five skill
entrypoints passed the bundled Codex skill validator. `npm ci` and
`npm run check` passed: 35 Node tests, formatter checks, official pinned Agent
Plugins schema validation, catalog freshness, Ruff formatting and lint,
Basedpyright, shfmt, and ShellCheck. The exact gate is encoded in
[`package.json`](../../package.json); CI now provisions pinned Python and shell
tools before running it.

An isolated `CODEX_HOME` registered this checkout as a local marketplace and
installed all 20 plugins. The smoke test checked each reported name and version,
all expected packaged files byte-for-byte, 25 skills, two packages with bundled
hooks, and one package with a portable MCP declaration. The home was removed in
the test's `finally` block. This proves local CLI packaging, not Git-backed
remote fetch, hook trust, or remote MCP health.

The bootstrap release dry run planned 20 new tags and 20 new Releases without
writing either. It was run before this record was committed; run it again at the
final candidate SHA. No npm registry publication or asset upload is in the
release workflow.

Independent review found a `git commit -n` gap in the bypass guard and missing
hook-resource validation. Both are now covered by negative tests; ordinary
release publication also requires the complete initial tag/Release set before
any later publication. These fixes must still pass the remote exact-SHA gate.

The first remote Quality run for candidate SHA
`c0766349ebad4795774f4e1a3765c786b9f56851` failed Ruff formatting: the developer
machine inherited `line-length = 100` from user-level Ruff configuration while
CI used Ruff's default 88. The candidate now owns a small `ruff.toml` with
`py314`, an explicit 88-character format limit, and lint selection; the Python
handler was reformatted under that project policy. The failed run is retained as
evidence of the diagnosed drift, not treated as a passing gate.

The next Quality run, `35987541223`, passed for
`871a63f31f413329e32309729cd62c09b40b4ad1`. It reported a non-fatal uv cache
warning because this JavaScript repository has no Python lockfile; the workflow
now keys uv's cache from `package.json`, which pins the `uvx` tool versions. The
At that point, the final post-fix SHA still required its own passing run.

## Pre-cutover remote snapshot and gates

The GitHub repository was public with default branch `main`, no open PRs, no
repository rulesets, and no candidate branch at this snapshot. Private
vulnerability reporting returned `{ "enabled": true }`. Six labels referenced by
the new label contract were absent and must be created before the new issue
forms are considered ready.

At that snapshot, still required before an outcome claim: independent review
findings resolved; candidate push; exact-SHA Quality workflow success;
Git-backed installation and file comparison; a controlled no-force branch rename
that leaves old history at remote `deprecated`; active effective branch/tag
rules; a complete 20-tag/20-Release bootstrap; old-tag preservation; and final
installation and topology checks. The former `deprecated` branch must not be
deleted without a later user decision.

## Cutover closeout

The final candidate SHA was `bceb9c875ae02dab6ed8668a3d51454497d05ec2`.
[Quality run 35987738039](https://github.com/nerymurillohnd/codex-essentials/actions/runs/35987738039)
passed its exact `npm run check` job. A fresh Codex home installed the Git
marketplace at that same SHA from `codex/rebuild-main`, then again from final
`main`: each run copied all 20 plugins byte-for-byte, exposing 25 skills, two
bundled-hook packages, and one declared MCP package.

The no-force branch switch left remote `main` at the candidate SHA and remote
`deprecated` at `6e26790e1fc05ecb6500c1903d3225d601c5ebf7`; the latter was not
deleted or updated. The repository default branch is `main`. Active repository
rulesets `23933133`, `23933145`, and `23933152` protect `main`, freeze
`deprecated`, and prevent update/deletion of new release tags. The effective
branch rules were read back from GitHub. The tag rule is active and its
`refs/tags/codex-essentials/**/*` condition matches the new tag shape under
GitHub's documented `fnmatch` syntax; no destructive tag-mutation probe was
performed. `main` requires a PR, conversation resolution, and the
`npm run check` status from GitHub Actions app ID `15368`, with zero required
approvals for this single-operator repository.

All 13 labels in `.github/label-contract.json` were reconciled exactly; 14 other
repository labels were retained. GitHub private vulnerability reporting returned
`{ "enabled": true }` after cutover.

[Bootstrap run 35988945637](https://github.com/nerymurillohnd/codex-essentials/actions/runs/35988945637)
passed the full gate and publication step. All 20 `codex-essentials/<id>/v0.1.0`
tag refs point to the launch SHA, and all 20 GitHub Releases are immutable,
non-draft, non-prerelease, have nonempty notes, and contain no uploaded assets.
Historical Release `388135907` and its tag remain at
`08a9e43eb1e0dc2d68429fc047ab10d785a50fcf`. GitHub's repository-wide latest
Release still points to that historical release, because the publisher did not
mark any individual plugin as globally latest. A normal publisher dry run after
bootstrap planned zero new tags and zero new Releases.

An isolated old-line installation of `agents-md-master 0.2.0` refreshed the same
Git marketplace after cutover and explicitly reinstalled `0.1.0`; its source
resolved to the launch SHA and the installed skill bytes matched the new
package. The temporary Codex home was removed. The auxiliary authoring worktree
was removed after it was clean, and the canonical checkout path was switched to
local `main`; both local branch refs remain. Generated Python bytecode from the
prior checkout was retained, not deleted, and is now ignored by the new
repository policy.

These checks do not auto-trust plugin hooks in consumer sessions. A user's
`/hooks` review remains necessary. They also do not prove every skill's
model-mediated activation or a fresh-session Svelte MCP call; the current
session's remote Svelte MCP was healthy during authoring, while packaged MCP
discovery and Git-backed copying were separately verified.

Sources checked on 2026-09-24:
[OpenAI plugin packaging](https://developers.openai.com/plugins/build/plugins),
[Agent Plugins specification](https://agent-plugins.org/specification),
[OpenAI prompting guidance](https://developers.openai.com/api/docs/guides/prompting),
[GitHub branch rename API](https://docs.github.com/en/rest/branches/branches#rename-a-branch),
[GitHub ruleset API](https://docs.github.com/en/rest/repos/rules),
[GitHub ruleset pattern guidance](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository),
and [GitHub release API](https://docs.github.com/en/rest/releases/releases).
