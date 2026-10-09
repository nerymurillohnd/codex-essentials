<!-- plugin-meta:start -->
# LSP Intelligence

Query local language servers from any Codex CLI workspace with isolated mcpls backends, explicit diagnostic state, and preview-only refactorings.

[![Version: 0.1.0](https://img.shields.io/badge/version-0.1.0-blue)](CHANGELOG.md) [![License: Apache-2.0](https://img.shields.io/badge/license-Apache-2.0-green)](LICENSE) [![Skills: 3](https://img.shields.io/badge/skills-3-informational)](#capabilities) [![MCP: included](https://img.shields.io/badge/MCP-included-brightgreen)](mcp.json)
<!-- plugin-meta:end -->

[Overview](#overview) · [Capabilities](#capabilities) · [Requirements](#requirements) · [Installation](#installation) · [Usage](#usage) · [Verification](#verification) · [Updates and removal](#updates-and-removal) · [Limitations](#limitations) · [License](#license)

## Overview

Get definitions, references, types, symbols, and diagnostics during terminal-based coding sessions without opening an IDE. Install this plugin globally once. Each call carries the authorized project's absolute root; the plugin never treats its own installation directory as your project.

A small local MCP adapter delegates to the official mcpls 0.7.0 binary. It isolates backends by canonical workspace and language profile, starts them on demand, keeps at most eight, and closes idle backends after five minutes. Its refactoring and formatting tools return proposed edits; they do not apply them to source files.

## Capabilities

<!-- plugin-capabilities:start -->
| Skill | Workflow |
| --- | --- |
| [lsp-diagnostics](skills/lsp-diagnostics/SKILL.md) | Use when checking language-server diagnostics after edits, investigating type or syntax failures, or assessing whether an LSP result supports a clean-code claim. |
| [lsp-navigation](skills/lsp-navigation/SKILL.md) | Use when locating definitions, finding semantic references, reading hover types, searching symbols, or previewing imports and refactorings through local language servers in Codex CLI. |
| [lsp-setup](skills/lsp-setup/SKILL.md) | Use when installing, verifying, updating, or troubleshooting the LSP Intelligence plugin and its local mcpls language-server runtime. |

**MCP connection:** [lsp-intelligence](mcp.json).
<!-- plugin-capabilities:end -->

The server exposes all 31 pinned mcpls tools with an `lsp_` prefix, plus `lsp_status`. Inputs retain the upstream contract and add `workspace_root` and, for tools without a source file, `profile`. Read the supplied tool schema for exact arguments. No account or credential is required by the plugin.

| Profile | Language servers | Scope |
| --- | --- | --- |
| TypeScript/JavaScript | typescript-language-server 6.0.2, TypeScript 6.0.3 | TS, TSX, JS, JSX, MTS, CTS, MJS, CJS |
| Svelte | svelte-language-server 0.18.4 | Svelte files and references from them |
| Astro | @astrojs/language-server 2.17.2 | Astro files; explicit JavaScript TypeScript SDK |
| Python | basedpyright 1.40.2 and Ruff 0.16.10 | Basedpyright navigation/types; Ruff code actions and format proposals |
| Bash | bash-language-server 5.8.1 and ShellCheck | Bash/POSIX shell scripts; not Zsh |

## Requirements

- **Client:** Codex CLI 0.162.0 is the acceptance baseline. Other clients and versions require independent verification.
- **Platform:** macOS ARM64 and Linux x64 are the initial targets. See [verification evidence](references/verification.md) for executed versus pending checks.
- **Runtime:** Node 24 or newer managed by nvm; Python tools installed through uv. The packaged JavaScript runs without installing the repository's development dependencies.
- **Permissions and effects:** The adapter validates explicitly targeted source paths, rejects secret-file targets, starts local child processes, and writes its own runtime/configuration data. Language servers run without filesystem isolation and may read workspace configuration, imports and other files; these input checks are not a whole-process access guarantee. Only explicit `install` or `update` commands download dependencies. The adapter does not modify project configuration or install software during startup.
- **ShellCheck:** Install it through your platform's trusted package manager before preparing the Bash profile. It is an external dependency, not bundled here.

## Installation

For a checkout of this marketplace:

```sh
codex plugin marketplace add /absolute/path/to/codex-essentials
codex plugin add lsp-intelligence@codex-essentials
```

After the reviewed changes have been published to the repository, the equivalent Git source is `nerymurillohnd/codex-essentials`. Do not expect an unpublished plugin to exist in the remote catalog.

Resolve the installed plugin root from the skill location or the plugin listing, then prepare the user runtime once:

```sh
node <plugin-root>/scripts/runtime.mjs install --profile all
node <plugin-root>/scripts/runtime.mjs doctor
```

The runtime lives at `~/.local/share/codex-essentials/lsp-runtime`, outside the plugin and your projects. Existing unrelated global language servers and project dependencies are not replaced. Start a new Codex conversation after installation to load the MCP tools.

## Usage

```text
Find the definition and all references of this function in the current project.
Check the diagnostics after my edit and explain whether the result is current.
Preview the organize-imports action for this file, then review the proposed diff.
```

The agent passes the current task's root, for example:

```json
{
  "workspace_root": "/absolute/path/to/project",
  "file_path": "/absolute/path/to/project/src/main.ts",
  "line": 12,
  "character": 8
}
```

For `lsp_workspace_symbol_search`, pass `profile` (`typescript`, `svelte`, `astro`, `python`, or `bash`) and `query`. Positions are one-based UTF-16. The native code-action schema uses the lowercase filter `source.organizeimports`; the returned action kind uses LSP's canonical spelling.

## Verification

Ask for `lsp_status`, then run a definition, hover, and diagnostic query against a known source file. Status describes installed prerequisites; it is not a workspace type check.

Treat `availability: pending` or `evicted`, indexing in progress, degraded push notifications, truncation, and failed requests as incomplete evidence. Even a published push-cache result may be stale immediately after an edit. Recheck until the expected change is reflected and run the project's actual type, lint, and test gates before claiming clean code.

From this repository, maintainers run:

```sh
npm ci
npm run check:lsp
npm run test:lsp
npm run test:lsp:integration
uv run python scripts/preflight.py pr
```

The integration suite requires an explicitly installed test runtime. It does not skip missing dependencies silently. Details are in [verification evidence](references/verification.md).

## Updates and removal

- **Plugin update:** Refresh its marketplace source and use the supported Codex installation flow. Start a new conversation afterward.
- **Runtime update:** Run `node <plugin-root>/scripts/runtime.mjs update --profile all`. This installs the version pinned by this plugin, not an unreviewed latest bridge.
- **Bridge rollback:** Run `node <plugin-root>/scripts/runtime.mjs rollback`. This restores the immediately previous managed bridge, not language-server package versions.
- **Plugin removal:** Run `codex plugin remove lsp-intelligence@codex-essentials`. Runtime data remains so removing the plugin does not remove tools used elsewhere.
- **Runtime removal:** Review and explicitly remove the plugin-owned runtime directory above only when no installation uses it. The plugin does not delete unrelated global tools.

## Limitations

- The shipped backend baseline is JavaScript TypeScript 6. Projects pinned to TypeScript 7 require separate native-server acceptance; do not substitute an older checker for their project gates.
- Python's diagnostic route uses Basedpyright. Run Ruff's actual project checks for its full lint results.
- Not every server supports every tool or offers every code action. Check `lsp_get_tool_support`; an empty references result alone never proves a symbol is unused.
- Code actions and renames can contain incomplete or dropped edits. Review these flags and do not apply incomplete transformations.
- The adapter cannot guarantee that a model invokes LSP after every edit. Skills provide the workflow; project checks provide the completion gate.
- Language servers may execute project tooling. Analyze only projects authorized by the task.
- No remote server, editor UI, background hook, Windows support claim, or public OpenAI directory publication is included.

## License

See [LICENSE](LICENSE), [third-party notices](THIRD_PARTY_NOTICES.md), and the [upstream schema license](assets/MCPLS-LICENSE-MIT.txt). mcpls and language-server binaries are external upstream dependencies.

## Related

- [Changelog](CHANGELOG.md)
- [Source and dependency record](references/sources.md)
- [Verification evidence](references/verification.md)
- [Repository catalog](../../README.md)
- [Bug report template](../../.github/ISSUE_TEMPLATE/bug_report.yml)
