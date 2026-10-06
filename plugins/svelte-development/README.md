<!-- plugin-meta:start -->
# Svelte Development

Develop, migrate, navigate, and audit Svelte and SvelteKit projects with current documentation, the Svelte autofixer, and project checks.

[![Version: 0.1.0](https://img.shields.io/badge/version-0.1.0-blue)](CHANGELOG.md) [![License: Apache-2.0](https://img.shields.io/badge/license-Apache-2.0-green)](LICENSE) [![Skills: 5](https://img.shields.io/badge/skills-5-informational)](#capabilities) [![MCP: included](https://img.shields.io/badge/MCP-included-brightgreen)](mcp.json)
<!-- plugin-meta:end -->

## Overview

Svelte Development helps Codex change and review Svelte code against the version actually installed in a project. It combines task-specific skills with the Svelte team's official documentation and autofixer. It also offers local semantic navigation through `svelteserver` when that program is installed. SvelteKit migrations, Astro islands, and Tailwind CSS are covered when relevant to the project.

This is an independent Codex Essentials plugin. It is not affiliated with or endorsed by the Svelte project. It uses the Svelte team's published MCP service; the skills, navigation client, and assets in this package were authored for Codex Essentials. Its test fixtures stay in the repository and are excluded from the release ZIP.

## Capabilities

<!-- plugin-capabilities:start -->
| Skill | Workflow |
| --- | --- |
| [svelte-best-practices](skills/svelte-best-practices/SKILL.md) | Use when implementing, reviewing, or migrating Svelte components, SvelteKit routes, Svelte CLI setup, Astro Svelte islands, or Tailwind styling in a Svelte project. |
| [svelte-code-auditor](skills/svelte-code-auditor/SKILL.md) | Use when reviewing or auditing Svelte or SvelteKit code, a pull request, a migration, or framework-related security and accessibility concerns without editing source files. |
| [svelte-code-navigation](skills/svelte-code-navigation/SKILL.md) | Use when locating Svelte symbol definitions or references, tracing callers, checking types or diagnostics, or assessing a Svelte rename or deletion. |
| [svelte-component-editor](skills/svelte-component-editor/SKILL.md) | Use when creating, editing, fixing, or migrating Svelte components, Svelte modules, SvelteKit routes, forms, loads, hooks, or related integration code. |
| [svelte-docs-and-autofixer](skills/svelte-docs-and-autofixer/SKILL.md) | Use when a Svelte or SvelteKit task needs current official API documentation, a Svelte compiler check, autofixer feedback, or a Svelte playground link. |

**MCP connection:** [svelte](mcp.json).
<!-- plugin-capabilities:end -->

The editing and auditing workflows are separate: ask Codex to change code for the former or to review without edits for the latter. Navigation uses the packaged Node.js client because a Claude Code `.lsp.json` file does not configure Codex's tool surface.

## Requirements

- **Client:** Codex CLI 0.160.0 is the local client used to verify this package. Other Codex surfaces require their own installation and behavior check.
- **Project:** A Svelte project with its dependencies installed. SvelteKit, Astro, and Tailwind are needed only for their respective tasks. The plugin follows the project's installed versions and package manager.
- **For semantic navigation:** Node.js and `svelteserver` from `svelte-language-server` on `PATH`. The other skills and MCP tools work without it. Install it through a Node manager appropriate to your machine; the plugin never installs software automatically.
- **For local/offline autofixing:** the optional `svelte-mcp` CLI from `@sveltejs/mcp`. The remote MCP server needs network access but no local package.
- **For checks:** use the project's installed `svelte-check` or its `check` script. No dependency is downloaded by the plugin.

## Installation

From the Codex Essentials repository root, register the local marketplace and install the plugin in Codex CLI:

```sh
codex plugin marketplace add .
codex plugin add svelte-development@codex-essentials
```

Check `codex plugin marketplace list` and `codex plugin list --marketplace codex-essentials`, then begin a new Codex session in the Svelte project. The local marketplace file makes the plugin discoverable; it does not install the plugin by itself. A GitHub release or public directory listing is not implied by this checkout.

The official Svelte marketplace also provides a `svelte` plugin. Avoid enabling both for the same session unless you deliberately want overlapping skills and MCP connections. [Svelte documents its Codex plugin](https://svelte.dev/docs/ai/codex-plugin).

## Usage

```text
Create a SvelteKit form for this project. Check its installed versions, read the current documentation, run the Svelte autofixer, and run the project's check script.
```

Codex should inspect the project first, edit the requested files, and report the documentation and checks actually used. For a read-only review:

```text
Audit src/routes/account for SvelteKit version mistakes, server/client leaks, and accessibility warnings. Do not edit files. Report confirmed findings with file and line evidence.
```

For a symbol question, Codex can use the local navigation client:

```text
Find the references to this prop before renaming it. Check route paths and string-based uses as well as language-server references.
```

## Permissions and effects

- The bundled MCP connection reaches `https://mcp.svelte.dev/mcp`. Documentation requests send section identifiers; the autofixer sends the full source text passed to it. A playground link includes supplied code in its URL. [Svelte states](https://svelte.dev/docs/ai/remote-setup) that it does not log, store, or inspect code sent to its remote server.
- The navigation client starts a locally installed `svelteserver`, reads the named `.svelte` file, and returns JSON. It does not edit the project or send code to the Svelte MCP server.
- An editing task changes only files within the requested scope. The auditor does not edit source files. A project's check script or SvelteKit sync can regenerate ignored `.svelte-kit` output; inspect that script before running it.
- Documentation and changelog lookups use network access. Existing Codex tool and command approvals remain in force.

## Verification

Ask Codex to name one skill explicitly and then try a natural Svelte task. Confirm it fetches current documentation, checks the installed version, uses the autofixer on code rather than a filename, and reports the project's check result. For navigation, try `document-symbols` on a real `.svelte` file and verify that a missing `svelteserver` is reported clearly. A passing structural validator does not prove any of these runtime behaviors.

## Updates and removal

For this local checkout, the marketplace points at the working repository; after a package change, remove and add the plugin to refresh its installed copy, then start a new Codex session. `codex plugin marketplace upgrade` refreshes Git marketplace snapshots, not this local source. To remove this plugin from Codex CLI, run:

```sh
codex plugin remove svelte-development@codex-essentials
```

Removing the plugin does not change a Svelte project's source or dependencies. To stop tracking the whole Codex Essentials marketplace, use `codex plugin marketplace remove codex-essentials` after removing any plugins you still need from it.

## Limitations

- The MCP server needs network access; the local `svelte-mcp` CLI is optional and is not installed by this package.
- The navigation client begins from `.svelte` files. Its diagnostics concern an opened file; the project check is the whole-project gate. Filename conventions, paths in strings, glob patterns, and class names need text inspection as well.
- Instructions cannot guarantee that a project compiles, passes tests, or behaves correctly in a browser. The plugin reports the checks it actually ran and any unavailable tools.
- Neither local installation nor package preflight establishes acceptance by the public OpenAI Plugins Directory.

## License

The plugin is released under the [Apache 2.0 license](LICENSE).

## Related

See the [changelog](CHANGELOG.md), [repository catalog](../../README.md), and [bug report form](../../.github/ISSUE_TEMPLATE/bug_report.yml).
