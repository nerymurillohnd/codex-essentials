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

| Plugin                                                             | Version | Summary                                          |
| ------------------------------------------------------------------ | ------- | ------------------------------------------------ |
| [Automatic PR Lifecycle](plugins/automatic-pr-lifecycle/README.md) | 0.1.0   | Carry authorized PRs through protected merge.    |
| [Live Research](plugins/live-research/README.md)                   | 0.1.0   | Verify changing facts against current sources.   |
| [TypeScript Pro](plugins/typescript-pro/README.md)                 | 0.1.0   | Prove types at runtime boundaries.               |
| [Verify Completion](plugins/verify-completion/README.md)           | 0.1.0   | Require evidence before declaring work complete. |

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
