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

> **Current status:** the marketplace publishes two installable plugins:
> `Astro Commands` (`astro-cli-commands`) and `Prettier After Edit`
> (`prettier-after-edit`).

## ✨ Start Here

Codex Essentials is the distribution layer. Its own `npm` dependencies maintain
the catalog and quality gates; they are **not installed into every user's
Astro project**. Users add the remote marketplace and install only the plugins
they need.

| Product                 | Purpose                                                                                          | Install ID            |
| ----------------------- | ------------------------------------------------------------------------------------------------ | --------------------- |
| **Astro Commands**      | Helps Codex discover and use Astro's official CLI capabilities before creating custom workflows. | `astro-cli-commands`  |
| **Prettier After Edit** | Automatically formats edited files with local or PATH Prettier using a Codex post-edit hook.     | `prettier-after-edit` |

### Install the Marketplace

For normal use, pin the marketplace to the first stable Astro Commands release:

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref plugin/astro-cli-commands/v0.1.0
codex plugin marketplace list
```

Use `main` only when you intentionally want the latest development state:

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin marketplace list
```

### Install marketplace plugins

```bash
codex plugin add astro-cli-commands@codex-essentials
codex plugin add prettier-after-edit@codex-essentials
codex plugin list
```

Then open the target project in Codex and use the appropriate plugin explicitly.

- Use **Astro Commands** for project planning, checks, preview, and CLI coordination.
- Use **Prettier After Edit** to auto-format changed files in Codex editing flows.

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
codex plugin marketplace add nerymurillohnd/codex-essentials --ref plugin/astro-cli-commands/v0.1.0
codex plugin marketplace list
```

The stable release tag is recommended for normal installation. The `main`
branch remains available for contributors and early adopters who intentionally
track unreleased marketplace changes.

Open the Plugins Directory in the ChatGPT desktop app, select **Codex
Essentials**, and install **Astro Commands** (`astro-cli-commands`) or
**Prettier After Edit** (`prettier-after-edit`).

Refresh the marketplace metadata when you want to discover catalog changes:

```bash
codex plugin marketplace update codex-essentials
```

Remove only the plugin:

```bash
codex plugin remove astro-cli-commands@codex-essentials
codex plugin remove prettier-after-edit@codex-essentials
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

## 🗂️ Directory Reference

| Path                               | Purpose                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| `.agents/plugins/marketplace.json` | Required marketplace catalog and plugin ordering.                              |
| `plugins/<plugin-id>/`             | Plugin packages; each requires `.codex-plugin/plugin.json`.                    |
| `templates/`                       | JSON/YAML schemas and product-documentation templates.                         |
| `.github/`                         | Issue forms, pull-request contract, release categories, and CI gates.          |
| `scripts/`                         | CommonJS validators, generators, and typecheck wrapper.                        |
| `tsconfig.scripts.json`            | Dedicated `checkJs` project for JavaScript, CJS, and MJS sources.              |
| `scripts/tsconfig.json`            | Editor-discoverable config for files inside `scripts/`.                        |
| `types/`                           | TypeScript contracts and declaration-only interfaces.                          |
| `tests/`                           | TypeScript Vitest tests and configuration boundary checks.                     |
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

The current manifest schema validates skills, apps, MCP integrations, and
interface assets. Top-level `hooks` are intentionally outside this schema until
the repository validator and the supported Codex packaging contract are aligned.

## 🛠️ For Contributors

The repository includes local generators, validators, documentation gates, and
release checks for maintaining marketplace products. Start with:

```bash
npm install
npm run check
```

Before submitting a plugin change, update its manifest, README, changelog, and
marketplace entry together. The complete contributor workflow and operational
rules live in [AGENTS.md](AGENTS.md) and the linked [quality guidelines](docs/agent-guidelines/quality.md).

The repository runs on Node 24 and keeps TypeScript 7 and TypeScript 6
compatibility checks. CI is authoritative, uses full SHA pins, and protects
branch-required checks with release environment approval. Local hooks are
no-shim and advisory; `HUSKY=0` is used in CI, while authorized local emergency
bypasses use `HUSKY=0` or `--no-verify`. The contributor quality vocabulary is:
`npm run format:check`, `npm run lint -- --max-warnings=0`, `npm run typecheck`,
`npm run typecheck:scripts`, `npx tsc6 --noEmit`, `npm test`, `npm run
validate:all`, and `actionlint`. Rollback means restoring prior marketplace
metadata and removing the corresponding release artifacts.

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

## 🤝 Contribution Style

Use clear Markdown, semantic headings, restrained emoji, and descriptive file
names. Keep plugin paths relative and `./`-prefixed, avoid `any` and magic
strings, never commit credentials, and include validation evidence in pull
requests. All repository artifacts are written in English; conversation and
issue coordination may use Spanish.
