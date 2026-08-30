# 🧩 Codex Essentials

[![Quality](https://github.com/nerymurillohnd/codex-essentials/actions/workflows/quality.yml/badge.svg?branch=main)](https://github.com/nerymurillohnd/codex-essentials/actions/workflows/quality.yml)
[![Documentation gate](https://github.com/nerymurillohnd/codex-essentials/actions/workflows/documentation-gate.yml/badge.svg)](https://github.com/nerymurillohnd/codex-essentials/actions/workflows/documentation-gate.yml)
[![Security](https://github.com/nerymurillohnd/codex-essentials/actions/workflows/security.yml/badge.svg?branch=main)](https://github.com/nerymurillohnd/codex-essentials/actions/workflows/security.yml)
[![Latest release](https://img.shields.io/github/v/release/nerymurillohnd/codex-essentials?include_prereleases&sort=semver)](https://github.com/nerymurillohnd/codex-essentials/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)

**Codex Essentials** is a community marketplace and data repository for
distributable Codex plugins. It provides the catalog, schemas, generators,
validators, documentation, and quality gates needed to publish reusable skills,
MCP integrations, and supporting assets.

> **Current status:** the marketplace publishes three installable plugins:
> `Astro Commands` (`astro-cli-commands`), `Prettier After Edit`
> (`prettier-after-edit`), and `DocKeeper` (`doc-keeper`).

## ✨ Start Here

Codex Essentials is the distribution layer. Its own `npm` dependencies maintain
the catalog and quality gates; they are **not installed into every user's
Astro project**. Users add the remote marketplace and install only the plugins
they need.

| Product                 | Purpose                                                                                          | Install ID            |
| ----------------------- | ------------------------------------------------------------------------------------------------ | --------------------- |
| **Astro Commands**      | Helps Codex discover and use Astro's official CLI capabilities before creating custom workflows. | `astro-cli-commands`  |
| **Prettier After Edit** | Automatically formats edited files with local or PATH Prettier using a Codex post-edit hook.     | `prettier-after-edit` |
| **DocKeeper**           | Maintains accurate changelogs and ADRs through evidence-first, authorization-aware procedures.   | `doc-keeper`          |

### Install the Marketplace

Use `main` to install the complete current catalog:

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin marketplace list
```

Use an immutable release tag only after confirming that it contains the plugin
you need. Plugin release tags are marketplace snapshots and can predate other
catalog entries:

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref plugin/astro-cli-commands/v0.1.0
codex plugin marketplace list
```

### Install marketplace plugins

```bash
codex plugin add astro-cli-commands@codex-essentials
codex plugin add prettier-after-edit@codex-essentials
codex plugin add doc-keeper@codex-essentials
codex plugin list
```

Then open the target project in Codex and use the appropriate plugin explicitly.

- Use **Astro Commands** for project planning, checks, preview, and CLI coordination.
- Use **Prettier After Edit** to auto-format changed files in Codex editing flows.
- Use **DocKeeper** to create, complete, audit, update, or repair changelogs and
  ADRs from repository evidence.

## 👤 Ownership and Repository

- **Owner:** Nery Samuel Murillo
- **GitHub:** [@nerymurillohnd](https://github.com/nerymurillohnd)
- **Declared repository:** [nerymurillohnd/codex-essentials](https://github.com/nerymurillohnd/codex-essentials)
- **Configured Git remote:** `https://github.com/nerymurillohnd/codex-essentials.git`.
- **License:** [MIT](LICENSE.md)

## 📦 Marketplace Lifecycle

Codex can track a repository marketplace directly from its Git remote. The
`--ref` option pins the source to a branch or tag:

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin marketplace list
```

The `main` branch exposes the complete current catalog. An immutable plugin
release tag is appropriate when its marketplace snapshot contains every plugin
you intend to install.

Open the Plugins Directory in the ChatGPT desktop app, select **Codex
Essentials**, and install **Astro Commands** (`astro-cli-commands`) or
**Prettier After Edit** (`prettier-after-edit`) or **DocKeeper**
(`doc-keeper`).

Refresh the marketplace metadata when you want to discover catalog changes:

```bash
codex plugin marketplace update codex-essentials
```

Remove only the plugin:

```bash
codex plugin remove astro-cli-commands@codex-essentials
codex plugin remove prettier-after-edit@codex-essentials
codex plugin remove doc-keeper@codex-essentials
```

Remove the marketplace registration:

```bash
codex plugin marketplace remove codex-essentials
```

See the [official Codex plugin packaging guide](https://developers.openai.com/plugins/build/plugins)
for current marketplace, plugin, path, and distribution behavior.

For the complete product explanation, installation guide, references,
approval boundaries, rollback behavior, and troubleshooting:

- [Astro Commands product README](plugins/astro-cli-commands/README.md)
- [Prettier After Edit product README](plugins/prettier-after-edit/README.md)
- [DocKeeper product README](plugins/doc-keeper/README.md)

## 🗂️ Directory Reference

| Path                               | Purpose                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| `.agents/plugins/marketplace.json` | Required marketplace catalog and plugin ordering.                              |
| `plugins/<plugin-id>/`             | Plugin packages; each requires `.codex-plugin/plugin.json`.                    |
| `lib/`                             | Bounded domain modules and colocated tests for repository maintenance.         |
| `.github/`                         | Issue forms, pull-request contract, release categories, and CI gates.          |
| `tsconfig.scripts.json`            | Dedicated `checkJs` project for JavaScript, CJS, and MJS sources.              |
| `types/`                           | TypeScript contracts and declaration-only interfaces.                          |
| `docs/agent-guidelines/`           | Detailed architecture, tooling, security, quality, and communication guidance. |
| `docs/decisions/`                  | Architecture Decision Records and the reusable ADR template.                   |
| `docs/maintenance/`                | Pending and resolved maintenance debt.                                         |
| `docs/operations/`                 | Community GitHub Projects and operational automation guidance.                 |
| `adapters/`, `config/`             | Supporting integration and repository configuration material.                  |

There is intentionally no repository-level `skills/` directory. Skills belong
inside the plugin that distributes them, for example
`plugins/example/skills/example-workflow/SKILL.md`. Every distributed skill
also exposes its Codex agent metadata at
`plugins/example/skills/example-workflow/agents/openai.yaml`; it provides the
skill label, concise catalog description, and optional initial prompt, while
`SKILL.md` remains the behavioral instruction source.

The official Codex packaging contract supports explicit top-level `hooks` and
automatically discovers the conventional `hooks/hooks.json` file when the field
is omitted. Plugins that use the conventional hook file declare
`"hooks": "./hooks/hooks.json"` so their package contract is explicit.

## 🛠️ For Contributors

Each plugin's `.codex-plugin/plugin.json` is its authored source of truth for
identity, version, install metadata, and declared components. Create it from
`templates/codex-plugin-plugin.json`; the repository derives only the catalog,
and never rewrites plugin-owned manifests, skills, README files, or changelogs.
Start with:

```bash
npm install
npm run check
```

Before submitting a plugin change, update its manifest, README, and changelog
together, then run `npm run marketplace:build`. Plugins are self-contained
release packages: no executable, asset, import, or symbolic link may resolve
outside `plugins/<plugin-id>/`, and every plugin must declare at least one
functional component. The complete contributor workflow and operational rules
live in [AGENTS.md](AGENTS.md) and the linked
[quality guidelines](docs/agent-guidelines/quality.md).

The repository runs on Node 24 and keeps TypeScript 7 and TypeScript 6
compatibility checks. GitHub Actions workflows run only for pull requests and
use full SHA pins. The local pre-push hook enforces the direct documentation
lane and runs the complete check before an allowed push to `main`; authorized
emergency bypasses use `HUSKY=0` or `--no-verify` and require manual follow-up.
The contributor quality vocabulary is:
`npm run format:check`, `npm run lint -- --max-warnings=0`, `npm run typecheck`,
`npm run typecheck:scripts`, `npx tsc6 --noEmit`, `npm test`,
`npm run marketplace:check`, `npm run documentation:gate`, and `actionlint`.
Rollback means restoring prior marketplace metadata and removing the
corresponding release artifacts.

### Automated plugin releases

Release Please manifest mode owns Conventional Commit analysis, SemVer,
plugin-local changelogs, the combined Release PR, component tags, and draft
GitHub Releases. It uses the native `go` changelog-only strategy because the
current `simple` strategy requires a `version.txt` file; JSON `extra-files`
updates the real `$.version` field in each plugin manifest. No fictitious
`package.json` or `version.txt` is added to a plugin.

The release workflow records the action's exact per-component `tag_name` and
`sha` outputs in an auditable JSON artifact, packages from those tags with
`git archive`, validates deterministic tarballs and basename-safe SHA-256
files, uploads them to drafts, and pauses at the protected `release`
environment. It does not rely on tag or release events to start a second
workflow.

Use Conventional Commit subjects in commits reaching `main`. A `docs:` commit
does not release by itself; distributed documentation that deserves a patch
uses `fix(docs): ...` (touching the plugin path) or an explicit `Release-As`
footer. Keep product PRs to one releasable plugin. The scope is descriptive;
changed paths determine the Release Please component. The repository policy
does not require squash merging.

## 📚 Documentation

- [Architecture and paths](docs/agent-guidelines/architecture.md)
- [Tooling and runtimes](docs/agent-guidelines/tooling.md)
- [Security and credentials](docs/agent-guidelines/security.md)
- [Quality and maintenance](docs/agent-guidelines/quality.md)
- [Public roadmap](docs/roadmap.md)
- [Plugin submission guidelines](docs/contributing/plugins.md)
- [ADR template](docs/decisions/adr-template.md)
- [TypeScript side-by-side decision](docs/decisions/typescript-side-by-side.md)
- [Maintenance records](docs/maintenance/)
- [GitHub Projects operations](docs/operations/github-project-template.md)
- [Documentation automation decision](docs/decisions/adr-0004-documentation-and-maintenance-automation.md)
- [Hooks and quality gates decision](docs/decisions/adr-0005-hooks-and-quality-gates.md)
- [Skill agent manifests decision](docs/decisions/adr-0006-skill-agent-manifests.md)
- [Release Please manifest releases decision](docs/decisions/adr-0008-release-please-manifest-releases.md)

## 🤝 Contribution Style

Use clear Markdown, semantic headings, restrained emoji, and descriptive file
names. Keep plugin paths relative and `./`-prefixed, avoid `any` and magic
strings, never commit credentials, and include validation evidence in pull
requests. All repository artifacts are written in English; conversation and
issue coordination may use Spanish.
