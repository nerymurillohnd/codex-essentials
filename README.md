# Codex Essentials

A Git-backed marketplace for reusable Codex plugins. This is a repository
distribution source, not a claim of listing in OpenAI's universal public Plugins
Directory.

## Install

```sh
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add <plugin-id>@codex-essentials
```

Read the selected plugin's README before installation, especially when it uses
MCP servers, hooks, credentials, or writes to external systems. Start a new
Codex session after installing a plugin to inspect its available capabilities.

## Plugins

<!-- generated:plugins:start -->

| Plugin                                                             | Version | Summary                                           |
| ------------------------------------------------------------------ | ------- | ------------------------------------------------- |
| [AGENTS.md Master](plugins/agents-md-master/README.md)             | 0.1.0   | Design and audit Codex instruction systems.       |
| [Astro CLI Commands](plugins/astro-cli-commands/README.md)         | 0.1.0   | Run Astro CLI tasks with current practice.        |
| [Automatic PR Lifecycle](plugins/automatic-pr-lifecycle/README.md) | 0.1.0   | Carry authorized PRs through protected merge.     |
| [Block No Verify](plugins/block-no-verify/README.md)               | 0.1.0   | Block Git verification bypass flags.              |
| [Configure Prettier](plugins/configure-prettier/README.md)         | 0.1.0   | Audit Prettier before changing formatting.        |
| [DocKeeper](plugins/doc-keeper/README.md)                          | 0.1.0   | Keep changelogs and ADRs evidence-backed.         |
| [Hook Creator](plugins/hook-creator/README.md)                     | 0.1.0   | Design and verify Codex lifecycle hooks.          |
| [Live Research](plugins/live-research/README.md)                   | 0.1.0   | Verify changing facts against current sources.    |
| [Codex Memory Audit](plugins/optimize-memories/README.md)          | 0.1.0   | Audit memories and prepare evidence-backed fixes. |
| [Prettier After Edit](plugins/prettier-after-edit/README.md)       | 0.1.0   | Format edited files with local Prettier.          |
| [Prompt Architect](plugins/prompt-architect/README.md)             | 0.1.0   | Write concise, executable agent prompts.          |
| [Repo Hygiene](plugins/repo-hygiene/README.md)                     | 0.1.0   | Inspect Git cleanup and recovery safely.          |
| [Repository Maintenance](plugins/repo-maintenance/README.md)       | 0.1.0   | Maintain repository records from evidence.        |
| [Ruff After Edit](plugins/ruff-after-edit/README.md)               | 0.1.0   | Use Ruff and prepare edit hooks.                  |
| [ShellCheck After Edit](plugins/shellcheck-after-edit/README.md)   | 0.1.0   | Format and lint shell edits.                      |
| [Skill Design Standards](plugins/skill-design-standards/README.md) | 0.1.0   | Design and assess focused Agent Skills.           |
| [Svelte Development](plugins/svelte-development/README.md)         | 0.1.0   | Engineer Svelte with current MCP guidance.        |
| [System Ops Audit](plugins/system-ops-audit/README.md)             | 0.1.0   | Inspect one Mac without changing it.              |
| [TypeScript Pro](plugins/typescript-pro/README.md)                 | 0.1.0   | Prove types at runtime boundaries.                |
| [Verify Completion](plugins/verify-completion/README.md)           | 0.1.0   | Require evidence before declaring work complete.  |

<!-- generated:plugins:end -->

## Update

```sh
codex plugin marketplace upgrade codex-essentials
codex plugin add <plugin-id>@codex-essentials
codex plugin list --json
```

The new `main` has an independent Git history and its plugin versions begin at
`0.1.0`. Existing installations from the former `main` may report higher version
numbers until refreshed and explicitly reinstalled. The former source history
remains available in the `deprecated` branch.

## Contribute

```sh
npm install
npm run check
```

The package manifest is authored; the catalog and inventory are generated. See
[repository instructions](AGENTS.md), [package instructions](plugins/AGENTS.md),
and [documentation instructions](docs/AGENTS.md).

## License

[MIT](LICENSE).
