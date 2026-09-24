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
evidence of the diagnosed drift, not treated as a passing gate. A new candidate
SHA must pass remote Quality before cutover.

## Current remote preflight and remaining gates

The GitHub repository was public with default branch `main`, no open PRs, no
repository rulesets, and no candidate branch at this snapshot. Private
vulnerability reporting returned `{ "enabled": true }`. Six labels referenced by
the new label contract were absent and must be created before the new issue
forms are considered ready.

Still required before an outcome claim: independent review findings resolved;
candidate push; exact-SHA Quality workflow success; Git-backed installation and
file comparison; a controlled no-force branch rename that leaves old history at
remote `deprecated`; active effective branch/tag rules; a complete
20-tag/20-Release bootstrap; old-tag preservation; and final installation and
topology checks. The former `deprecated` branch must not be deleted without a
later user decision.

Sources checked on 2026-09-24:
[OpenAI plugin packaging](https://developers.openai.com/plugins/build/plugins),
[Agent Plugins specification](https://agent-plugins.org/specification),
[OpenAI prompting guidance](https://developers.openai.com/api/docs/guides/prompting),
[GitHub branch rename API](https://docs.github.com/en/rest/branches/branches#rename-a-branch),
[GitHub ruleset API](https://docs.github.com/en/rest/repos/rules), and
[GitHub release API](https://docs.github.com/en/rest/releases/releases).
