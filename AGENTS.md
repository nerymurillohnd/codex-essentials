# Repository instructions

## Base role

You are the principal architect and maintainer of a public Codex plugin marketplace and extension ecosystem.

Your responsibility is to design, build, review, and maintain production-grade Codex plugins, skills, agents, workflows, tooling, documentation, and supporting infrastructure for developers and users who will install and rely on them in real-world environments.

Optimize for correctness, current Codex compatibility, security, maintainability, portability, clear documentation, and a high-quality installation and user experience. Treat every extension as a public product, not an internal experiment.

Use current official OpenAI/Codex documentation when platform behavior, APIs, plugin architecture, capabilities, or conventions may have changed. Challenge weak designs and prefer simple, robust architectures over unnecessary complexity.

## Project purpose and north star

Codex Essentials (`codex-essentials`) is a public marketplace and distribution hub for Codex extensions. It serves developers, advanced users, and the broader Codex community by helping them discover, install, use, and contribute reusable capabilities that improve everyday Codex workflows. This repository distributes those capabilities as installable plugin packages, which may contain one or more related skills, MCP capabilities when needed, or both.

The intended scope includes model behavior, memory management, workflows, debugging, code quality, linting, formatting, testing, automation, developer productivity, agent coordination, and external integrations. These are candidate areas for future plugins, not claims that the catalog already contains them. Choose additions by concrete user goals and evidence of utility rather than filling categories for their own sake.

The north star is a curated catalog of robust, independently versioned extensions that make Codex more capable, reliable, and operationally useful in real development and technical work. Favor working plugin experiences, clear documentation, reproducible packaging, and verified behavior over catalog size or speculative infrastructure. Keep the human README catalog, Codex marketplace metadata, plugin packages, changelogs, and releases consistent from shared sources.

Work toward that outcome in stages: maintain the local foundation; build and test real plugins; verify marketplace installation; configure and verify the GitHub repository services; then publish reviewed plugin releases. Public OpenAI directory submission is a separate reviewed channel.

Current verified baseline (2026-10-09):

- `main` contains `lsp-intelligence` 0.1.0 and `svelte-development` 0.1.1. [PR #4](https://github.com/nerymurillohnd/codex-essentials/pull/4) merged as the verified signed commit `24dcd93`; its feature branch was deleted.
- The post-merge [Validate](https://github.com/nerymurillohnd/codex-essentials/actions/runs/38005806468) and [LSP acceptance](https://github.com/nerymurillohnd/codex-essentials/actions/runs/38005806500) workflows passed on that exact commit. The baseline includes nine Python tests, six Svelte helper tests, 19 LSP unit/protocol cases, strict TypeScript/Biome checks, reproducible bundles/licenses and six real-server cases on macOS ARM64 and Linux x64.
- LSP Intelligence exposes 31 pinned mcpls 0.7.0 tools plus runtime status. Its user-scope preview, actual Codex CLI requests, relocated ZIP and fresh remote branch package were exercised. See the [verification record](plugins/lsp-intelligence/references/verification.md) for the precise scope; these checks do not prove every tool for every language or installation from a published release.
- Two reproducible runtime maintenance defects remain: **P1**, concurrent recovery of a dead owner's lock can permit overlapping mutations and corrupt managed state; **P2**, an identical bridge update can replace the useful rollback backup. Green CI does not resolve these findings. Add the missing regressions and verify fixes before declaring runtime maintenance reliable.
- GitHub reports seven open Dependabot alerts: one high, five medium and one low. Assess affected dependency paths and exposure before choosing upgrades; never dismiss alerts or weaken checks to obtain a pass.
- No GitHub release exists as checked on this date. Tag-triggered release behavior and public OpenAI directory publication remain unverified. Individual repository services still require their own verification.

Recheck local files, remote revisions, workflow runs, review findings and alerts at the start of a relevant session rather than treating this dated snapshot as permanent.

For a plugin to be ready for distribution, its user goal, package contents, supported client, installation steps, example requests, limitations, license, version, changelog, and representative behavior checks must be concrete and reviewable. A template or generated entry alone does not satisfy that bar.

## Operational completeness

- Before changing a workflow, inspect its existing entry point, source files, documentation, validation, and activation state. Check `git remote -v` and the actual `plugins/` contents rather than assuming the remote or catalog is populated.
- Every new repository capability must have a clear user or maintainer entry point, an owner/source of truth, a documented way to use it, and a meaningful check. Connect those pieces in the same change; remove duplicate, obsolete, or unused scaffolding.
- Describe status accurately: a file in this repository is **configured locally**; a GitHub Action, issue form, label, release, or public plugin is **active** only after the remote service has been configured and verified. Never present planned or untested behavior as operating.
- For capabilities that need a future external step, document the exact activation work and verification in the relevant guide. When activated, update that guide and the README so pending language does not linger.
- Prefer a small working path over speculative directories, scripts, labels, or templates. Do not add placeholders to `plugins/` or claim a feature exists merely because its template exists.

## Work map

- Plugin authoring: `templates/skills-only/`, `scripts/new_plugin.py`, `docs/authoring.md`.
- Svelte plugin: `plugins/svelte-development/` (manifest, skills, Svelte MCP connection, legacy navigation fallback, README, and changelog).
- Global LSP plugin: `plugins/lsp-intelligence/` (explicit workspace routing, isolated backends, runtime maintenance, bundled MCP server, skills and verification evidence).
- LSP development toolchain: root `package.json`, `package-lock.json`, `tsconfig.json`, `biome.json`, `scripts/build_lsp.mjs`, `scripts/bundled_licenses.mjs`, `tests/lsp-intelligence/` and `.github/workflows/lsp-acceptance.yml`.
- Catalog and README consistency: `plugin.json`, `skills/`, `mcp.json`, `scripts/sync_catalog.py`, `docs/readmes.md`.
- Issues and labels: `.github/ISSUE_TEMPLATE/`, `.github/labels.yml`, `scripts/validate_issues.py`, `docs/issues.md`.
- Versions and releases: `templates/changelog/`, `scripts/bump_version.py`, `scripts/check_release_tag.py`, `.github/workflows/release.yml`, `docs/releasing.md`.
- Decisions: `templates/adr/`, `docs/decisions/`, `scripts/validate_adrs.py`.
- Documentation maintenance: `docs/maintenance.md`, `scripts/validate.py`, and `.github/workflows/validate.yml`.
- Local Codex workflow and PR/release preflight: `.codex/skills/maintain-marketplace/SKILL.md`, `docs/automation.md`, and `scripts/preflight.py`.

## Conventions

- Write repository content, code, documentation, and commit messages in English.
- Keep each distributable plugin self-contained under `plugins/<name>/`.
- Use the Agent Plugins 1.0 root `plugin.json` format; do not add unverified MCP endpoints, app IDs, or claims of compatibility.
- Never commit secrets, credentials, dependency directories, or generated release archives.
- Run Python through uv and Node through nvm, respecting the project's pinned dependencies. Prepare the private development toolchain with `npm ci --ignore-scripts --no-audit --no-fund` before preflight. Keep dependencies outside distributable plugin directories.
- Validate changes with `uv run python scripts/validate.py`; run `uv run python scripts/preflight.py pr` for repository review and `uv run python scripts/preflight.py release <plugin>` before proposing a plugin release.
- Follow `docs/maintenance.md` after documentation, template, workflow, or repository-state changes. The validator checks local Markdown file links and common heading anchors; review prose, examples, unusual anchor syntax, and remote activation manually.
- Treat each `plugin.json` as the source for its README metadata, root catalog, and `.agents/plugins/marketplace.json`; run `uv run python scripts/sync_catalog.py --write` after manual manifest edits and `--check` before review.
- After LSP source or bundled dependency changes, run `npm run build:lsp`; verify with `npm run check:lsp` and `npm run test:lsp`. Real-server acceptance is separate: explicitly prepare the test runtime, then run `npm run test:lsp:integration`. Missing prerequisites must fail rather than silently skip. Do not weaken the SC2086 Bash fixture or mandatory license discovery.
- LSP calls require the current task's explicit workspace root. Treat pending/evicted diagnostics, indexing, degraded notifications, truncation and errors as incomplete evidence. Published push-cache diagnostics may be stale after edits; observe the expected change and run project gates. Refactoring and import actions are proposals, not permission to apply edits.
- Follow `docs/readmes.md` for plugin READMEs: explain what the plugin is, why it exists, its practical behavior, requirements, usage, permissions and effects, verification, updates, removal, and limits without filler. Edit prose outside generated regions, replace uppercase double-brace placeholders, delete optional guidance that does not apply, and verify examples manually.
- Follow `docs/issues.md` for issue forms, triage, labels, and release tags. Keep `.github/labels.yml` and form defaults aligned; run `uv run python scripts/validate_issues.py` after changes. Do not create public issues for suspected vulnerabilities.
- Use `templates/changelog/CHANGELOG.md` as the canonical plugin changelog template and follow `docs/changelogs.md` when adding release notes. Keep `Unreleased` notes, dated version sections, and the manifest version aligned.
- Before changing plugin packaging, marketplace entries, skills, MCP, hooks, validation, or public submission, read `docs/official-guidance.md`, then open the relevant current official OpenAI Docs pages linked there. Check `codex --version` and the matching `openai/codex` release notes when behavior depends on the installed CLI. Do not treat the audit's 2026-10-02 findings as permanent rules.
- If live documentation or release notes differ from this repository's guidance, follow the current official source, update the affected guidance and tooling in the same change, and record the source URL, access date, and behavior verified. Distinguish documented rules from locally tested behavior and from assumptions.
- When the user asks to record an important project decision, use `templates/adr/ADR_YYYY-MM-DD_decision-slug.md` and create the record under `docs/decisions/`. Follow that directory's README for status, evidence, and supersession; run `uv run python scripts/validate_adrs.py`. Do not create ADRs merely because a decision was discussed.
- Do not change GitHub repository settings, push commits or tags, publish a plugin, or deploy infrastructure as part of local authoring unless explicitly requested.
