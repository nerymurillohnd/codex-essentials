# ✨ Configure Prettier

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[← Back to Codex Essentials](../../README.md)

> Audit Prettier and code-quality tooling before proposing a complete,
> repository-specific, approval-gated implementation plan.

**Explore:** [Quick start](#-quick-start) ·
[Purpose](#-purpose) ·
[Environments](#supported-environments) ·
[Safety](#-behavior-and-boundaries) ·
[Documentation](#-documentation-and-support)

Configure Prettier is a Codex plugin for auditing, recommending, configuring,
and maintaining Prettier across a repository, workspace, or explicitly declared
multi-repository scope. It produces evidence-based plans and complete diffs; it
does not install packages, modify configuration, format files, or change
automation without explicit approval.

> [!CAUTION]
> The plugin is read-only until the user explicitly approves one or more
> previously displayed recommendation items. Approval for one item does not
> authorize dependency, lockfile, source-formatting, editor, hook, or CI
> changes outside that item.

## ⚡ Quick start

Add the marketplace and install the plugin:

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add configure-prettier@codex-essentials
codex plugin list
```

Start a new Codex session, then ask:

```text
Use $configure-prettier to audit this repository and propose a complete Prettier plan. Do not make changes.
```

In Codex CLI, `/plugins` provides the interactive plugin browser. Plugins are
available in supported ChatGPT and Codex plugin surfaces, but not in the Codex
IDE extension itself. The skill can still audit and propose VS Code workspace
settings for the target repository. See the official [Plugins
documentation](https://learn.chatgpt.com/docs/plugins).

## 🎯 Use cases

| Scenario                                                                                                 | How this plugin helps                                                                                                                      | Expected result                                                                       |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| A JavaScript or TypeScript repository has no reliable Prettier setup.                                    | Audits the stack, conventions, file types, runtime, package manager, IDE, and automation before proposing the smallest reproducible setup. | A complete approval-gated plan for local CLI and IDE consistency.                     |
| A workspace uses Prettier but formatting differs between VS Code, terminal commands, and CI.             | Resolves effective configuration, binary, parser/plugin, ignore, and editor paths for each execution context.                              | A conflict report and precise parity proposal.                                        |
| A repository uses Astro, Svelte, Tailwind, MDX, Vue, GraphQL, YAML, TOML, or another specialized format. | Evaluates built-in parser coverage and strategically assesses compatible Prettier plugins.                                                 | Only justified plugin recommendations, with exact versions and full diffs.            |
| A project has quality gaps or conflicting formatting tools.                                              | Assesses ESLint, Biome, Oxlint/OXC, Stylelint, framework-native tooling, and existing formatters without assuming more tools are better.   | A coherent quality-stack recommendation or an evidence-based decision to add nothing. |
| A monorepo needs an update or consistency review.                                                        | Audits workspace-level and package-level configuration, lockfile state, scripts, CI, hooks, and applicable parent configuration.           | Independently approvable recommendations per package or workspace layer.              |

**Not a fit when:** you want silent dependency upgrades, automatic formatting,
or a global personal style to override an established repository contract.

## 🎯 Purpose

- Performs a read-only audit before every recommendation.
- Infers formatting conventions from repository-local evidence and documented
  precedence.
- Verifies current official Prettier, plugin, linter, editor, and package
  information before recommending versions or behavior.
- Assesses absent adjacent quality tooling at a high level and escalates it only
  when audit evidence establishes a concrete, material gap.
- Verifies that the approved CLI and VS Code paths resolve the same
  repository-local Prettier contract.
- Detects conflicting configs, formatters, lint rules, ignores, lockfiles,
  plugins, hooks, CI behavior, line endings, and generated-file risks.
- Produces complete diffs or full replacement files, exact post-approval
  commands, evidence, risks, alternatives, and granular approval items.
- Applies only explicitly approved changes and stops if new material conflicts
  require a revised plan.

## 🧰 Included Components

| Component                                                                                                                            | Purpose                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| [`.codex-plugin/plugin.json`](.codex-plugin/plugin.json)                                                                             | Plugin identity, version, and component declarations.                 |
| [`skills/configure-prettier/SKILL.md`](skills/configure-prettier/SKILL.md)                                                           | Authoritative audit-first and approval-gated workflow contract.       |
| [`skills/configure-prettier/agents/openai.yaml`](skills/configure-prettier/agents/openai.yaml)                                       | Codex-facing label, description, and invocation metadata.             |
| [`skills/configure-prettier/references/audit-scope.md`](skills/configure-prettier/references/audit-scope.md)                         | Scope controls and read-only discovery requirements.                  |
| [`skills/configure-prettier/references/convention-resolution.md`](skills/configure-prettier/references/convention-resolution.md)     | Repository-first convention precedence and uncertainty rules.         |
| [`skills/configure-prettier/references/quality-integration.md`](skills/configure-prettier/references/quality-integration.md)         | Strategic Prettier plugin and linter assessment.                      |
| [`skills/configure-prettier/references/source-verification.md`](skills/configure-prettier/references/source-verification.md)         | Official-source, release, registry, and compatibility verification.   |
| [`skills/configure-prettier/references/ide-cli-parity.md`](skills/configure-prettier/references/ide-cli-parity.md)                   | CLI and VS Code resolution-parity requirements.                       |
| [`skills/configure-prettier/references/recommendation-report.md`](skills/configure-prettier/references/recommendation-report.md)     | Required evidence, recommendation, diff, and approval-gate structure. |
| [`skills/configure-prettier/references/implementation-approval.md`](skills/configure-prettier/references/implementation-approval.md) | Exact-scope implementation rules after approval.                      |
| [`skills/configure-prettier/references/templates.md`](skills/configure-prettier/references/templates.md)                             | Evidence-conditioned configuration, IDE, hook, and CI patterns.       |
| [`CHANGELOG.md`](CHANGELOG.md)                                                                                                       | User-facing release history.                                          |
| [`LICENSE.md`](LICENSE.md)                                                                                                           | License terms.                                                        |

## 🖥️ Requirements and compatibility

## Supported Environments

| Requirement         | Supported value or behavior                                                                                                                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Codex surface       | Codex CLI and supported ChatGPT/Codex plugin surfaces. The Codex IDE extension does not load plugins directly.                                                                                                                       |
| Project types       | JavaScript/TypeScript repositories, monorepos, and repositories containing Prettier-supported or plugin-supported file types.                                                                                                        |
| Runtime/tools       | Uses the repository’s declared package manager, runtime, workspace model, scripts, and task runner when present.                                                                                                                     |
| Prettier dependency | Propose an exact repository-local dependency only when the local dependency decision is satisfied.                                                                                                                                   |
| IDE support         | Audits and can propose VS Code workspace settings; it does not require format-on-save or personal settings by default.                                                                                                               |
| Credentials         | Not required.                                                                                                                                                                                                                        |
| Network             | Read-only access to official documentation, releases, and package-registry metadata is required when validating current behavior or versions.                                                                                        |
| Last verified       | `2026-08-31` against [official Codex plugin documentation](https://learn.chatgpt.com/docs/plugins), [Prettier installation](https://prettier.io/docs/install), and [Prettier configuration](https://prettier.io/docs/configuration). |

The target repository’s documented support policy, local lockfile, package
manager, runtime constraints, and current official documentation take precedence
over any versioned example in this package.

## 🔐 Behavior and boundaries

## Inputs and Outputs

**Inputs:** user request; declared repository/workspace scope; repository files,
configuration, scripts, lockfiles, automation, editor settings, installed
tooling, and current official source material.
**Outputs:** a read-only inventory; detected conventions; conflict and risk
assessment; prioritized recommendations; complete diffs or replacement files;
exact proposed commands; evidence; and an approval gate.

## Required Tools and Credentials

The target repository determines the required package manager, runtime, and
task runner. The audit can inspect an existing local or PATH-visible Prettier
binary, but requires no credentials.

## Permissions

| Access or effect | What this plugin may do                                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Read             | Inspect only relevant files and locations inside the declared scope, plus current official documentation, releases, and registry metadata when needed. |
| Write            | None before explicit approval. After approval, only the exact files and changes previously approved.                                                   |
| Process          | Run read-only discovery and verification commands before approval. After approval, run only the planned implementation and validation commands.        |
| Network          | Read official documentation, changelogs, release notes, package metadata, and official plugin/linter compatibility information.                        |
| Authentication   | Not required.                                                                                                                                          |

## Side Effects

Installing the plugin changes Codex-managed plugin state and its local plugin
cache. It does not modify the target repository, package manifests, lockfiles,
editor settings, hooks, CI, or source files. Discovery remains read-only; each
approved implementation item can have only the side effects displayed in its
approved diff and command list.

## Human Approval Boundaries

All discovery and planning are read-only. Before any mutation, Configure
Prettier presents independently actionable items and complete proposed changes.
The user may approve selected items, reject items, or request a revised plan.

Examples of valid approval include:

```text
Approve items 1 and 3 only.
Approve only the configuration diff.
Apply the approved dependency and CLI changes, but do not touch CI.
Proceed with exactly the displayed diff.
```

The plugin does not treat ambiguous language as approval and does not expand an
approved scope when it discovers additional improvements.

## Installation Behavior

Installation makes the skill available through the configured Codex marketplace.
It changes only Codex-managed plugin state and cache, not the target repository.

## 🔁 Uninstall and Rollback Behavior

Refresh the configured marketplace only after its source has moved to an
approved newer release:

```bash
codex plugin marketplace upgrade codex-essentials
codex plugin list
```

Remove only this plugin:

```bash
codex plugin remove configure-prettier@codex-essentials
```

Uninstalling removes the installed plugin from Codex-managed configuration and
cache. It does not revert changes that a user previously approved in a target
repository. Repository changes remain recoverable through the repository’s own
Git history and review process.

## ✅ Verification

Maintainers run the canonical marketplace validation from the Codex Essentials
repository:

```bash
npm run marketplace:check
```

After installation, verify that Codex recognizes the plugin:

```bash
codex plugin list --json
```

Then start a new Codex session and run a read-only smoke test:

```text
Use $configure-prettier to inventory this repository. Do not modify files or run installation commands.
```

## 🚧 Known Limitations

- The plugin cannot infer a repository’s intended style when evidence is
  absent or materially conflicting; it labels uncertainty and requests a
  decision instead of inventing rules.
- The plugin does not guarantee plugin compatibility from version numbers
  alone. It verifies current official compatibility information and
  repository-specific constraints before proposing integration.
- A globally installed Prettier binary can hide a missing local dependency.
  The audit reports this as a reproducibility risk rather than treating the
  global binary as project authority.
- A broad formatting pass can create large churn. The plugin separates it from
  configuration, dependency, CI, hook, and editor changes as an independently
  approved write operation.

## Failure and Recovery

If scope, authority, official verification, or an approved validation command
is unavailable, the plugin stops and reports the limitation. Resolve the missing
prerequisite or request a revised, explicit approval before retrying.

## ❓ FAQ

<details>
<summary>Does installing this plugin modify the target project?</summary>

No. Installation changes only Codex-managed plugin state and cache. The plugin
performs a read-only audit until you approve specific proposed changes.
</details>

<details>
<summary>Will it add ESLint, Biome, Oxlint, Stylelint, or Prettier plugins automatically?</summary>

No. It evaluates those tools strategically against the repository’s languages,
frameworks, quality gaps, existing tooling, compatibility, and maintenance
cost. Every recommendation is optional unless it is required for demonstrated
correctness, and every implementation requires approval.
</details>

<details>
<summary>How does it keep terminal and VS Code formatting consistent?</summary>

It audits both resolution paths and proposes a repository-local contract for
the Prettier version, configuration, ignores, parsers, and plugins. It reports
any remaining divergence rather than claiming consistency without evidence.
</details>

<details>
<summary>Does it force scripts, format-on-save, hooks, or CI?</summary>

No. It evaluates whether Prettier belongs in existing scripts or task runners,
needs a dedicated command, or should remain directly invocable. Hooks, CI, and
editor behavior are separately approved recommendations.
</details>

<details>
<summary>How do I update, remove, or roll back this plugin?</summary>

Use the [uninstall and rollback](#-uninstall-and-rollback-behavior)
instructions above. Target-repository changes are not reverted by plugin
removal; use the repository’s own Git history or approved change process.
</details>

## 📚 Documentation and support

- [Authoritative skill](skills/configure-prettier/SKILL.md)
- [Audit scope](skills/configure-prettier/references/audit-scope.md)
- [Convention resolution](skills/configure-prettier/references/convention-resolution.md)
- [Quality integration](skills/configure-prettier/references/quality-integration.md)
- [Source verification](skills/configure-prettier/references/source-verification.md)
- [IDE and CLI parity](skills/configure-prettier/references/ide-cli-parity.md)
- [Recommendation report](skills/configure-prettier/references/recommendation-report.md)
- [Implementation approval](skills/configure-prettier/references/implementation-approval.md)
- [Templates](skills/configure-prettier/references/templates.md)
- [Changelog](CHANGELOG.md)
- [Codex Essentials marketplace](../../README.md)
- [Issues](https://github.com/nerymurillohnd/codex-essentials/issues)
- [License](LICENSE.md)

Prettier is an independent open-source project. This plugin is not affiliated
with or endorsed by the Prettier project, the Visual Studio Code extension, or
any third-party linter or plugin project.

## 📄 License

MIT. See [LICENSE.md](LICENSE.md).
