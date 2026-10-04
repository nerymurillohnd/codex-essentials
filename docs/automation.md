# Repository automation

The repo-scoped [maintain-marketplace skill](../.codex/skills/maintain-marketplace/SKILL.md) routes Codex to the existing authoring, maintenance, review, and release guides. Its location follows the [OpenAI Docs example for repo-scoped skills](https://developers.openai.com/blog/eval-skills). On 2026-10-04, fresh read-only `codex exec` sessions on CLI 0.160.0 discovered it, used it when explicitly named, and read it for a PR-review request that did not name it. Those checks cover one representative phrasing of each route. The scripts below work without skill activation.

## Entry points

| Goal | Command or source |
| --- | --- |
| Scaffold | `python3 scripts/new_plugin.py <name> --display-name "Name" --short-description "Subtitle" --description "Purpose" --author "Author"`; then follow [authoring](authoring.md). |
| Add a skill | Create `plugins/<plugin>/skills/<skill>/SKILL.md` following [authoring](authoring.md). The installed `$skill-creator` can help when given that exact destination. Confirm frontmatter name, description, workflow behavior, and direct and indirect activation; then regenerate the catalog. |
| Regenerate derived catalog | `python3 scripts/sync_catalog.py --write`; inspect the generated regions and [maintenance](maintenance.md). |
| Check a PR locally | `python3 scripts/preflight.py pr`; inspect the actual diff and any runtime or remote effects manually. |
| Prepare release files | `python3 scripts/bump_version.py <plugin> <major|minor|patch>` for an existing plugin, then `python3 scripts/preflight.py release <plugin>` and inspect the ZIP. Follow [releasing](releasing.md) before any tag. |
| Check a local release tag | After the reviewed commit is on `origin/main` and an annotated tag exists locally, run `python3 scripts/check_release_tag.py plugin/<plugin>/v<version>` before pushing. |

The PR preflight runs package, ADR, issue, catalog, Python syntax, and repository tool checks, including local Markdown links and common heading anchors. Package validation rejects common local secrets, credentials, dependency directories, and generated archives. Release mode also requires packaged `logo` and `composerIcon` paths, checks their supported extensions and 5 MiB limit, extracts the manifest version's notes, and packages the plugin. It fails on a stale generated catalog. Review actual icons for square dimensions and at least 48 by 48 pixels against the [current submission rules](https://developers.openai.com/plugins/deploy/submission#icons-and-screenshots); the local gate does not inspect image dimensions or prove client activation, GitHub labels or branch rules, or public submission. The [Validate workflow](../.github/workflows/validate.yml) uses the PR mode; its new preflight step passed on [PR #1](https://github.com/nerymurillohnd/codex-essentials/actions/runs/37190979560) on 2026-10-04. The [Release plugin workflow](../.github/workflows/release.yml) uses the tag gate and release mode; `actions/checkout@v7` needs `fetch-depth: 0` to inspect branch and tag history, per the [official checkout README](https://github.com/actions/checkout#fetch-all-history-for-all-tags-and-branches). The release path remains unverified remotely until a reviewed plugin tag runs it.

Both workflows use `ubuntu-24.04` and `actions/checkout@v7` as of 2026-10-04. The first PR run on `checkout@v4` warned about its Node 20 runtime; [checkout v7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1) uses Node 24. GitHub announced that `ubuntu-latest` will begin moving to 26.04 on 2026-10-19, so the explicit [24.04 runner label](https://github.com/actions/runner-images/issues/14748) keeps these checks on a known image until a deliberate migration is tested. The updated action and runner settings passed in [the remote PR run](https://github.com/nerymurillohnd/codex-essentials/actions/runs/37190979560); the release path still needs a tag-triggered run.

## Feature choices for Codex 0.160.0

Checked on 2026-10-04 against `codex --version`, the [current plugin package guide](https://developers.openai.com/plugins/build/plugins), and the five most recent stable [Codex releases](https://github.com/openai/codex/releases) at or below the installed version.

| Version | Relevant note | Repository decision |
| --- | --- | --- |
| [0.160.0](https://github.com/openai/codex/releases/tag/rust-v0.160.0) | Plugin manifest loading was optimized; subagent startup errors are surfaced. | Use the portable root manifest already in this repo. No new plugin loader or permanent agent configuration is needed. |
| [0.159.2](https://github.com/openai/codex/releases/tag/rust-v0.159.2) | Windows background process fix. | No macOS workflow change. |
| [0.159.1](https://github.com/openai/codex/releases/tag/rust-v0.159.1) | GPT-6.1 Sol was added to the bundled and Bedrock model catalogs. | Keep the workflow model independent. |
| [0.159.0](https://github.com/openai/codex/releases/tag/rust-v0.159.0) | Steering improved and bundled `plugin-creator` was removed. | Keep the repository scaffold as the stable entry point; an installed Plugin Creator remains optional. |
| [0.158.0](https://github.com/openai/codex/releases/tag/rust-v0.158.0) | MCP OAuth client-secret support and sandbox fixes. | Add MCP only for a concrete verified integration; a skills-only workflow needs no credentials. |

This repository uses a local skill for task-specific guidance and CI for deterministic checks. Hooks would add execution and trust setup to every relevant session without a current event-driven need; [plugin hooks require user trust](https://developers.openai.com/plugins/build/plugins). Agents and subagents are useful for independent investigations or reviews, but no always-on agent configuration is needed for the dependent scaffold and release sequence. The local marketplace currently has no plugin entries, so this maintenance skill is not presented as a distributable plugin.
