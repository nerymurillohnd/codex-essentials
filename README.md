# Codex Essentials

**A public marketplace and distribution hub for Codex extensions.** Built for developers, advanced users, and the broader Codex community to discover, install, use, and contribute reusable capabilities that improve everyday Codex workflows.

The intended scope includes model behavior, memory management, workflows, debugging, code quality, linting, formatting, testing, automation, developer productivity, agent coordination, and external integrations. Each released capability is packaged as an installable plugin with its own purpose, requirements, version, changelog, and usage guidance. These areas describe where the project is headed; the catalog below shows what actually exists.

[![License: Apache 2.0](https://img.shields.io/badge/license-Apache%202.0-blue)](LICENSE)

[Catalog](#plugin-catalog) · [How it works](#how-it-works) · [Create a plugin](#create-a-plugin) · [Contribute](CONTRIBUTING.md)

Browse the catalog for a workflow, or use the scaffold below to contribute one. A listing in this repository does not imply endorsement or publication in OpenAI's public Plugins Directory.

## Plugin catalog

<!-- catalog:start -->
![Plugins: 0](https://img.shields.io/badge/plugins-0-informational)

No plugins have been added yet.
<!-- catalog:end -->

The catalog is generated from each plugin's manifest. Each entry links to a README explaining the plugin's purpose, practical behavior, requirements, installation, usage, permissions, verification, maintenance, and limits.

## How it works

| Part | Role |
| --- | --- |
| [Plugin packages](plugins/README.md) | Hold a portable `plugin.json`, skills and/or MCP configuration, assets, a README, and a changelog. |
| [Repository marketplace](.agents/plugins/marketplace.json) | Defines local discovery for plugin entries when packages are added. |
| [GitHub releases](docs/releasing.md) | Defines the reviewed tag and ZIP workflow; remote activation and release verification are tracked in the release guide. |
| [OpenAI public Plugins Directory](docs/official-guidance.md#distribution-channels) | Has a separate upload, validation, review, and publication process. |

The human catalog, plugin README metadata, and local marketplace entries are generated from package files. [The README guide](docs/readmes.md) explains which content authors write and which content is generated.

## Create a plugin

From the repository root, start with the skills-only scaffold. This example uses `sample-plugin` as a name to replace:

```sh
python3 scripts/new_plugin.py sample-plugin \
  --display-name "Sample Plugin" \
  --short-description "A concise workflow" \
  --description "Describe the specific user goal." \
  --author "Your name or team"
```

Then replace the example skill, complete its README, and run the local checks:

```sh
python3 scripts/sync_catalog.py --write
python3 scripts/preflight.py pr
```

Follow [the authoring guide](docs/authoring.md) to finish the package and test it in a supported client before a pull request. The local checks verify structure and generated content; they do not verify that a plugin's workflow succeeds in Codex.

## Project guides

| Guide | Use it for |
| --- | --- |
| [Contributing](CONTRIBUTING.md) | Pull requests, review expectations, and licensing. |
| [Plugin authoring](docs/authoring.md) | Package layout, skills, MCP, and local workflow. |
| [README style](docs/readmes.md) | Page hierarchy, links, examples, and drift checks. |
| [Changelogs](docs/changelogs.md) and [releases](docs/releasing.md) | User-facing changes, version bumps, tags, and ZIPs. |
| [OpenAI guidance audit](docs/official-guidance.md) | Dated findings and how to recheck current official documentation. |
| [Architecture decisions](docs/decisions/README.md) | Requested ADRs using the [project template](templates/adr/ADR_YYYY-MM-DD_decision-slug.md). |
| [Issues and labels](docs/issues.md) and [security policy](SECURITY.md) | Structured community feedback, triage, and private vulnerability reporting. |
| [Documentation maintenance](docs/maintenance.md) | Sources of truth, drift checks, and remote-state review. |
| [Repository automation](docs/automation.md) | Codex skill, scaffold, PR preflight, release preflight, and feature decisions. |

The starter files live under `templates/`, outside the plugin catalog.

## License

Repository content is licensed under [Apache License 2.0](LICENSE), unless a plugin directory explicitly states another license.
