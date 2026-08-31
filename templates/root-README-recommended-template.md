# 🧩 Codex Essentials

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)

> A curated repository marketplace for reusable Codex plugins.

**Explore:** [Plugins](#-plugin-catalog) · [Install](#-quick-start) ·
[Documentation](#-documentation-map) · [Contribute](#-contributing) ·
[Support](#-support-and-project-links)

Codex Essentials packages practical skills and integrations for repeatable
development workflows. The repository contains the plugin catalog, package
manifests, validation, documentation, and maintenance records.

> [!IMPORTANT]
> This is a repo/CLI distribution source for a curated collection. It is not, by
> itself, evidence that these plugins are listed in the universal public Plugins
> Directory. Supported surfaces and availability can vary by Codex host.

> [!TIP]
> Start with a [use case](#-choose-by-use-case), inspect the linked plugin README,
> then install only the plugin that matches your need.

## 🧩 Plugin catalog

| Plugin                                                       | Best for                                                               | Install ID            |
| ------------------------------------------------------------ | ---------------------------------------------------------------------- | --------------------- |
| [Astro Commands](plugins/astro-cli-commands/README.md)       | Astro CLI discovery, project checks, preview, and server coordination. | `astro-cli-commands`  |
| [Prettier After Edit](plugins/prettier-after-edit/README.md) | Formatting edited files with project-local or PATH Prettier.           | `prettier-after-edit` |
| [DocKeeper](plugins/doc-keeper/README.md)                    | Evidence-based changelog and ADR maintenance.                          | `doc-keeper`          |
| [Optimize Memories](plugins/optimize-memories/README.md)     | Auditing and reconciling Codex memory artifacts.                       | `optimize-memories`   |

_Choose a plugin by outcome, then open its linked README for requirements,
permissions, side effects, and examples._

## 🎯 Choose by use case

| If you need to...                                      | Start with...                                                |
| ------------------------------------------------------ | ------------------------------------------------------------ |
| Discover and install curated Codex plugins             | [Plugin catalog](#-plugin-catalog)                           |
| Plan, check, preview, or coordinate an Astro project   | [Astro Commands](plugins/astro-cli-commands/README.md)       |
| Format files automatically after Codex edits           | [Prettier After Edit](plugins/prettier-after-edit/README.md) |
| Create or repair changelogs and architecture decisions | [DocKeeper](plugins/doc-keeper/README.md)                    |
| Audit or reconcile project and global Codex memories   | [Optimize Memories](plugins/optimize-memories/README.md)     |

_Use cases describe the user's starting problem; the linked plugin README explains
the behavior, requirements, boundaries, and expected result._

**Explore by keyword:** [Codex plugins](https://developers.openai.com/plugins/build/plugins)
· [Astro CLI](plugins/astro-cli-commands/README.md) ·
[Prettier hooks](plugins/prettier-after-edit/README.md) ·
[Changelog and ADRs](plugins/doc-keeper/README.md) ·
[Memory audit](plugins/optimize-memories/README.md)

## ⚡ Quick start

Add the marketplace and install the plugin you need:

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add <plugin-id>@codex-essentials
codex plugin list
```

`main` exposes the current catalog and is the repository's distribution reference.

Read the linked plugin README before installing a plugin with hooks, file writes,
network access, or other side effects.

## 🔁 Update or remove

Refresh a configured marketplace:

```bash
codex plugin marketplace upgrade codex-essentials
```

Remove a plugin without removing the marketplace:

```bash
codex plugin remove <plugin-id>@codex-essentials
```

Remove the marketplace registration after its plugins are removed:

```bash
codex plugin marketplace remove codex-essentials
```

See the [official Codex plugin packaging guide](https://developers.openai.com/plugins/build/plugins)
for current host, marketplace, manifest, and distribution behavior.

## 📦 What is included

| Path                                  | Role                                                                           |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| `.agents/plugins/marketplace.json`    | Generated catalog and plugin ordering.                                         |
| `plugins/<plugin-id>/`                | Self-contained distributable plugin packages.                                  |
| `plugins/*/.codex-plugin/plugin.json` | Authored plugin identity, version, and component declarations.                 |
| `docs/`                               | Maintainer architecture, contributor, operational, and decision documentation. |
| `schemas/`, `scripts/`, `tests/`      | Repository schemas, generators, validators, tests, and quality tooling.        |
| `.github/`                            | Repository contribution and issue configuration.                               |

The repository does not install its own npm dependencies into a user's project.
Each plugin declares its own behavior, requirements, permissions, and side effects
in its product README and authoritative skill documents.

## 🧭 Documentation map

| Need                                 | Start here                                                             |
| ------------------------------------ | ---------------------------------------------------------------------- |
| Choose or install a plugin           | This README and the plugin catalog above.                              |
| Understand plugin behavior           | The plugin's `README.md`, then its `SKILL.md`.                         |
| Read detailed references or examples | The links in the plugin README.                                        |
| Contribute or maintain packages      | [Plugin submission guidelines](docs/contributing/plugins.md).          |
| Review repository rules              | [AGENTS.md](AGENTS.md) and [documentation guidelines](docs/AGENTS.md). |
| Review decisions and maintenance     | [Decisions](docs/decisions/) and [maintenance](docs/maintenance/).     |

## 🤝 Contributing

```bash
npm install
npm run check
```

For a plugin change, update its manifest, README, and changelog together, then
run the repository marketplace checks. The catalog is generated from validated
package manifests; do not hand-edit generated metadata.

See [AGENTS.md](AGENTS.md) for the complete contributor contract and validation
details.

## 🏷️ Repository metadata

- GitHub **topics** such as `codex`, `codex-plugins`, `mcp`, and
  `plugin-marketplace` are repository discovery metadata; the README links to
  plugins by intent rather than duplicating a tag cloud.
- GitHub **issue labels** support maintainer triage and are managed in Issues and
  contribution templates, not as product documentation.

## ❓ FAQ

<details>
<summary>Is this the universal public Plugins Directory?</summary>

No. This is a curated repository/CLI marketplace. Availability in a particular
Codex or ChatGPT surface depends on that host's current support.
</details>

<details>
<summary>Does installing a plugin install npm dependencies into my project?</summary>

No. The marketplace manages plugin packages in Codex. A plugin may still declare
its own project-level requirements or side effects; read its README first.
</details>

<details>
<summary>Which plugin should I install?</summary>

Start with [Choose by use case](#-choose-by-use-case), then follow the plugin link
for requirements, permissions, and verification.
</details>

## 🆘 Support and project links

- [Issues](https://github.com/nerymurillohnd/codex-essentials/issues)
- [Discussions](https://github.com/nerymurillohnd/codex-essentials/discussions)
- [Roadmap](AGENTS.md#roadmap)
- [MIT License](LICENSE.md)

Codex Essentials is community-maintained and is not an official OpenAI, Codex,
Astro, or Prettier product.
