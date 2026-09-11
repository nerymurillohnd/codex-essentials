# 🧡 Svelte Development

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[← Back to Codex Essentials](../../README.md)

**Explore:** [Install](#-quick-start) · [Purpose](#-purpose) ·
[Environments](#supported-environments) · [Safety](#-behavior-and-boundaries) ·
[Docs](#-documentation-and-support)

Svelte Development gives Codex a focused operating contract for serious Svelte
5 and SvelteKit work. It combines current official Svelte MCP access with
original architecture, implementation, and verification instructions for agents
that need to behave like senior Svelte engineers.

The current plugin version is recorded in `.codex-plugin/plugin.json`. Install
the package from the repository's `main` catalog.

> [!CAUTION]
> The bundled MCP configuration points to the official remote Svelte MCP server.
> MCP requests may send framework questions and selected source snippets to
> `https://mcp.svelte.dev/mcp`. Never send secrets or private credentials.

## ⚡ Quick Start

Add the marketplace and install the plugin:

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add svelte-development@codex-essentials
codex plugin list
```

Then open a Svelte or SvelteKit project and ask Codex:

```text
Use Svelte Development to design and implement this feature with MCP-backed docs.
```

## 🎯 Use Cases

| Scenario                                      | How this plugin helps                                                 | Expected result                    |
| --------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------- |
| Starting a Svelte 5 app or major feature      | Separates architecture choices from component implementation          | A clear plan before code changes   |
| Editing complex `.svelte` files               | Routes the agent to runes, props, events, snippets, and a11y guidance | Smaller, idiomatic components      |
| Working in SvelteKit routes or server modules | Covers load functions, actions, hooks, cookies, env, and adapters     | Correct client/server boundaries   |
| Finalizing a change                           | Uses MCP docs, autofixer when appropriate, and project-native gates   | Verifiable implementation evidence |

**Not a fit when:** the target project is not Svelte, SvelteKit, or a migration
that intentionally produces Svelte code.

## 🎯 Purpose

- Make Codex consult current Svelte documentation before version-sensitive
  decisions.
- Give agents a clear route for architecture, components, SvelteKit surfaces,
  and verification instead of one overloaded instruction blob.
- Keep implicit skill activation precise across architecture planning,
  component work, SvelteKit route/server work, and final verification.
- Keep source generation original and license-clean while using public Svelte
  tools and documentation as evidence.

## 🧰 Included Components

| Component                                                                                                    | Purpose                                                                              |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| [`.codex-plugin/plugin.json`](.codex-plugin/plugin.json)                                                     | Plugin identity, version, and component declarations.                                |
| [`.mcp.json`](.mcp.json)                                                                                     | Documented direct-map Svelte MCP declaration.                                        |
| [`skills/svelte-architect/SKILL.md`](skills/svelte-architect/SKILL.md)                                       | Planning contract for Svelte and SvelteKit architecture.                             |
| [`skills/svelte-architect/agents/openai.yaml`](skills/svelte-architect/agents/openai.yaml)                   | Codex-facing display metadata and automatic invocation policy for architecture work. |
| [`skills/svelte-component-engineer/SKILL.md`](skills/svelte-component-engineer/SKILL.md)                     | Component and Svelte 5 implementation contract.                                      |
| [`skills/svelte-component-engineer/agents/openai.yaml`](skills/svelte-component-engineer/agents/openai.yaml) | Codex-facing display metadata and automatic invocation policy for component work.    |
| [`skills/sveltekit-engineer/SKILL.md`](skills/sveltekit-engineer/SKILL.md)                                   | SvelteKit route, server, action, and adapter contract.                               |
| [`skills/sveltekit-engineer/agents/openai.yaml`](skills/sveltekit-engineer/agents/openai.yaml)               | Codex-facing display metadata and automatic invocation policy for SvelteKit work.    |
| [`skills/svelte-verification/SKILL.md`](skills/svelte-verification/SKILL.md)                                 | MCP, CLI, test, build, and browser verification contract.                            |
| [`skills/svelte-verification/agents/openai.yaml`](skills/svelte-verification/agents/openai.yaml)             | Codex-facing display metadata and automatic invocation policy for verification work. |
| [`CHANGELOG.md`](CHANGELOG.md)                                                                               | User-facing change history.                                                          |
| [`LICENSE.md`](LICENSE.md)                                                                                   | License terms.                                                                       |

## 🖥️ Requirements and Compatibility

## Supported Environments

| Requirement   | Supported value or behavior                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| Codex surface | Codex CLI and Codex plugin hosts that load skills and MCP declarations.                              |
| Runtime/tools | Project-local npm, Node.js, Svelte, SvelteKit, and `sv`/`@sveltejs/mcp` when the project uses them.  |
| Project types | Svelte 5 applications, SvelteKit applications, libraries, and migrations into Svelte.                |
| Credentials   | None required by this plugin. Target projects may have their own secrets; do not expose them to MCP. |
| Network       | Required for the remote Svelte MCP endpoint and optional live documentation checks.                  |
| Last verified | `2026-09-02` against Codex 0.152.1 direct-map loading and the official Svelte MCP endpoint.          |

The installed project, lockfile, and current official documentation take
precedence over static compatibility claims in this package.

## 🔐 Behavior and Boundaries

## Inputs and Outputs

**Inputs:** user requests, existing project files, package metadata, Svelte MCP
documentation responses, selected source snippets, CLI output, diagnostics,
test results, and browser observations when applicable.

**Outputs:** plans, code edits, review notes, MCP-backed citations or summaries,
commands executed, verification evidence, and residual risk notes.

## 🧩 Required Tools and Credentials

No credential is required by this plugin.

Expected tools are:

- Codex with plugin and MCP support.
- npm and Node.js for Svelte project commands.
- Project-local Svelte/SvelteKit dependencies.
- Optional `sv` and `@sveltejs/mcp` CLI access for project creation,
  add-ons, migration, MCP subcommands, and local fallback checks.

## Permissions

| Access or effect | What this plugin may do                                                                                           |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| Read             | Inspect Svelte project files, package metadata, config, docs, tests, and diagnostics.                             |
| Write            | Edit project files only when the user has requested implementation or repair work.                                |
| Process          | Run project-native npm scripts, `sv` commands, Svelte checks, tests, builds, and dev/preview servers when needed. |
| Network          | Contact `https://mcp.svelte.dev/mcp` and official documentation sources for current Svelte guidance.              |
| Authentication   | Not required by this plugin. Project-specific services may still require user-managed credentials.                |

## Side Effects

Installing the plugin changes Codex-managed plugin state and exposes the remote
Svelte MCP declaration to hosts that support it. It does not modify a target
Svelte project, install dependencies, update lockfiles, start servers, or write
application code by itself.

Implementation tasks may modify source files, package files, test files, and
configuration only within the scope approved by the user and repository policy.

## Human Approval Boundaries

- File edits require an implementation, refactor, migration, or repair request.
- Dependency installation, project creation, lockfile changes, migrations, and
  destructive cleanup require explicit user authorization.
- Remote source analysis must never include secrets. If code is sensitive and
  the user has not authorized remote transfer, skip remote autofix/source
  analysis and use local checks instead.
- Production deploys, releases, merges, pushes, and external account mutations
  require separate explicit authorization.

## 📦 Installation Behavior

Installation adds this plugin's four skills and its `svelte` remote MCP server
connection to Codex-managed state. When the plugin is enabled, a new Codex
session loads both the skills and the remote MCP tools. Installation does not
run `sv`, install Svelte packages, create a project, or change application
repositories.

## 🔁 Uninstall and Rollback Behavior

Refresh the configured marketplace with the current Codex command:

```bash
codex plugin marketplace upgrade codex-essentials
codex plugin list
```

Remove only this plugin:

```bash
codex plugin remove svelte-development@codex-essentials
```

Uninstalling removes the Codex plugin from the local Codex configuration and
cache. It does not revert source files that were changed during previous
development sessions; use the target repository's Git history for that rollback.

## ✅ Verification

Maintainers can run the canonical package checks from the marketplace
repository:

```bash
npm run validate:plugins
npm run marketplace:build
npm run marketplace:check
npm run documentation:gate -- --base main --head HEAD
npm run check
```

Consumer smoke test from a Svelte or SvelteKit project:

```text
Use Svelte Verification to inspect the current project and tell me which
Svelte MCP docs, CLI commands, and project gates you need before editing.
```

That smoke test is read-only until the user approves file changes or commands
that mutate dependencies, lockfiles, generated files, or project state.

## 🚧 Known Limitations

- Remote MCP availability depends on network access, Codex MCP support, and the
  official Svelte endpoint.
- Static skill instructions may lag behind new Svelte releases; use MCP docs
  or official Svelte sources before relying on version-sensitive details.
- The plugin is framework-specific and intentionally does not cover unrelated
  frontend stacks beyond Svelte integration boundaries.

## 🩺 Failure and Recovery

- If MCP tools are unavailable, verify the configured `.mcp.json`, confirm
  network access, restart Codex to open a fresh session, and fall back to
  official Svelte documentation or local project checks.
- If `sv`, Svelte, or SvelteKit commands are missing, inspect `package.json`
  and the lockfile before installing anything. Report the missing executable and
  ask for authorization before dependency changes.
- If verification fails, preserve the exact command output that affects the
  conclusion and fix the root cause before claiming completion.

Stop and report the state when required permissions, scope, authority, or a
verification gate is unavailable. Do not invent missing evidence or silently
perform a remote mutation.

## ❓ FAQ

<details>
<summary>Does installing this plugin modify the target project?</summary>

No. Installation changes Codex plugin state only. Project files change only
after a separate implementation request.

</details>

<details>
<summary>What permissions or side effects should I review?</summary>

Review the remote MCP network boundary and the rule that secrets must not be
sent to remote tools.

</details>

<details>
<summary>How do I update, remove, or roll back this plugin?</summary>

Use the uninstall and rollback commands above. Source edits made during prior
sessions are reverted through the target project's Git history.

</details>

## 📚 Documentation and Support

- [Official Svelte AI tools](https://svelte.dev/docs/ai/overview)
- [Remote Svelte MCP setup](https://svelte.dev/docs/ai/remote-setup)
- [Svelte CLI AI tools](https://github.com/sveltejs/cli/blob/main/documentation/docs/30-add-ons/01-ai-tools.md)
- [Architecture skill](skills/svelte-architect/SKILL.md)
- [Component skill](skills/svelte-component-engineer/SKILL.md)
- [SvelteKit skill](skills/sveltekit-engineer/SKILL.md)
- [Verification skill](skills/svelte-verification/SKILL.md)
- [Changelog](CHANGELOG.md)
- [Codex Essentials marketplace](../../README.md)
- [Issues](https://github.com/nerymurillohnd/codex-essentials/issues)
- [License](LICENSE.md)

## 📄 License

MIT. See [LICENSE.md](LICENSE.md).

Svelte is an open source project owned by its contributors. This plugin is an
independent integration package and is not affiliated with or endorsed by the
Svelte project.
