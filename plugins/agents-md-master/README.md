# 🧭 AGENTS.md Master

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[← Back to Codex Essentials](../../README.md)

> Create and govern Codex `AGENTS.md` systems from evidence, not generic templates.

**Explore:** [Install](#-quick-start) · [Purpose](#-purpose) ·
[Environments](#supported-environments) · [Safety](#-behavior-and-boundaries) ·
[Docs](#-documentation-and-support)

AGENTS.md Master is a Codex plugin for experienced operators and engineering
teams that create, audit, refactor, maintain, or evaluate Codex instruction
systems. It maps effective instruction scope, routes policy to the right durable
layer, and prepares a reviewable proposal before consequential rewrites.

The current plugin version is recorded in `plugin.json`. Install the package
from the repository's `main` catalog.

> [!CAUTION]
> `AGENTS.md` provides agent guidance; it does not itself enforce runtime
> permissions, approval policies, hooks, CI, repository protection, or secrets
> handling. Those controls belong to their owning runtime or repository layer.

## ⚡ Quick start

Add the marketplace and install the plugin:

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add agents-md-master@codex-essentials
codex plugin list
```

Then start with a read-only audit:

```text
Use $agents-md-master to audit this repository's AGENTS.md hierarchy.
Inspect actual commands, scope, sources of truth, and enforcement layers.
Produce a proposal without editing files.
```

## 🎯 Use cases

| Scenario                                                    | How this plugin helps                                                                       | Expected result                                                      |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| A repository has no instruction system.                     | Uses real repository evidence to design the smallest useful hierarchy.                      | A scoped root/nested proposal with command and ownership evidence.   |
| A root file has become a ball of mud.                       | Maps each statement to scope, owner, and durable layer before refactoring.                  | Progressive disclosure without losing mandatory policy.              |
| Instructions conflict or claim to enforce runtime controls. | Builds an authority matrix and routes controls to permissions, configuration, CI, or hooks. | Findings with correct enforcement ownership and approval boundaries. |
| A team wants to prove a proposed change helps.              | Defines a baseline/candidate comparison and negative controls.                              | A reproducible evaluation record with limitations.                   |

**Not a fit when:** the task is ordinary Markdown editing, a request to install
or configure an enforcement control directly, or unrelated repository
documentation work.

## 🎯 Purpose

- Create `AGENTS.md` systems from repository facts rather than generic boilerplate.
- Audit ambiguity, contradictions, stale commands, duplicated policy, misplaced
  scope, unsafe authority, and unsupported completion claims.
- Use nested instructions, documentation, skills, schemas, scripts,
  configuration, permissions, tests, CI, and hooks according to their actual
  ownership.
- Require explicit proposals and evidence before consequential instruction rewrites.

## 🧰 Included components

| Component                                                                                               | Purpose                                                     |
| ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [`plugin.json`](plugin.json)                                                                            | Portable plugin identity, version, and component metadata.  |
| [`SKILL.md`](skills/agents-md-master/SKILL.md)                                                          | Authoritative workflow and approval boundaries.             |
| [`agents/openai.yaml`](skills/agents-md-master/agents/openai.yaml)                                      | Codex-facing label and invocation metadata.                 |
| [`architecture-and-placement.md`](skills/agents-md-master/references/architecture-and-placement.md)     | Scope, placement, authority, and enforcement-routing rules. |
| [`audit-and-maintenance.md`](skills/agents-md-master/references/audit-and-maintenance.md)               | Existing-system audit, refactor, and maintenance procedure. |
| [`evaluation-protocol.md`](skills/agents-md-master/references/evaluation-protocol.md)                   | Quality rubric and reproducible manual fixtures.            |
| [`agents-md-change-proposal.md`](skills/agents-md-master/assets/templates/agents-md-change-proposal.md) | Reviewable change-proposal output template.                 |
| [`evaluation-record.md`](skills/agents-md-master/assets/templates/evaluation-record.md)                 | Baseline/candidate evidence-record template.                |
| [`CHANGELOG.md`](CHANGELOG.md)                                                                          | User-facing product change history.                         |
| [`LICENSE.md`](LICENSE.md)                                                                              | License terms.                                              |

## 🖥️ Requirements and compatibility

## Supported environments

| Requirement   | Supported value or behavior                                                                                                 |
| ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Codex surface | A host that supports marketplace plugins and Agent Skills.                                                                  |
| Runtime/tools | No bundled runtime or executable helper; audits use the target repository's available tools.                                |
| Project types | Repositories with or without existing `AGENTS.md` files, including monorepos.                                               |
| Credentials   | None required by this package.                                                                                              |
| Network       | Not required for local inspection; current official documentation requires an available read-only retrieval route.          |
| Compatibility | Inspect the current host, repository configuration, and official Codex documentation before making change-sensitive claims. |

The target host, current official documentation, repository implementation, and
effective instruction chain take precedence over this package's static guidance.

## 🔐 Behavior and boundaries

## Inputs and outputs

**Inputs:** A user goal, target repository or supplied instruction files,
current instruction/configuration evidence, relevant command owners, and
optional incident or evaluation artifacts.
**Outputs:** An effective-chain map, evidence ledger, findings, placement
decisions, approval-gated proposal, or evaluation record. No outcome is claimed
merely because a file parses or formats successfully.

## Required tools and credentials

No MCP server, app, executable helper, credential, or external skill is a
package dependency. When a current Codex claim is material, the workflow uses an
available official documentation route; if none is available, it reports the
limitation instead of inventing compatibility.

## Permissions

| Access or effect | What this plugin may do                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| Read             | Inspect authorized repository instructions, documentation, configuration, commands, and public official sources. |
| Write            | Prepare edits only after explicit approval of the exact scoped proposal.                                         |
| Process          | Run applicable available inspection and validation commands within the approved scope.                           |
| Network          | Retrieve public official documentation when available and relevant.                                              |
| Authentication   | Not required by the plugin; target workflows retain their own authorization boundaries.                          |

## Side effects

Installing the plugin changes only Codex-managed plugin state. It does not
modify a consumer repository, global configuration, permissions, hooks, CI,
secrets, branch state, or external service. An authorized application can edit
only the approved instruction-system targets.

## Human approval boundaries

Discovery, audit, research, and proposal work are read-only. A consequential
rewrite requires explicit approval of the complete proposal. Installation does
not authorize global configuration, consumer configuration, permissions, hooks,
credentials, commits, pushes, pull requests, releases, publication, or
deployment.

## Installation behavior

Installation makes this packaged skill discoverable according to the host's
plugin settings. It does not install dependencies, register a marketplace,
enable a hook, create an `AGENTS.md`, or rewrite any target project file.

## 🔁 Uninstall and rollback behavior

Refresh a configured marketplace:

```bash
codex plugin marketplace upgrade codex-essentials
codex plugin list
```

Remove only this plugin:

```bash
codex plugin remove agents-md-master@codex-essentials
```

Removing the plugin stops future use of its workflow; it does not revert an
instruction-system change previously approved and applied by another task. Use
the target repository's Git history, approved diff, or documented backup as the
recovery record.

## ✅ Verification

Maintainers run the repository package checks from the marketplace root:

```bash
npm run marketplace:check
npm run check
git diff --check
```

For a consumer smoke test, start a new Codex thread in a non-production
repository and request a read-only audit. Confirm that the report identifies the
effective instruction chain and does not claim runtime enforcement from prose.
This smoke test checks workflow behavior; it does not prove universal outcome
improvement.

## 🚧 Known limitations

- This package is instruction and evidence guidance, not an enforcement engine,
  parser, hook, or automatic evaluator.
- Current Codex behavior, host capabilities, and retrieval routes can change;
  material compatibility must be reverified.
- Quality scores support structured review but do not replace human judgment.
- Outcome, token, cost, and timing claims require captured baseline/candidate
  evidence under comparable conditions.

## Failure and recovery

If the target scope, source of truth, current compatibility, approval, or
recovery record cannot be established, stop the dependent action and report the
exact limitation. If a linked document or command is stale, preserve the finding
and identify the competent owner. Never repair a missing control by merely
adding stronger prose to `AGENTS.md`.

## 📚 Documentation and support

- [Authoritative skill](skills/agents-md-master/SKILL.md)
- [Architecture and placement](skills/agents-md-master/references/architecture-and-placement.md)
- [Audit and maintenance](skills/agents-md-master/references/audit-and-maintenance.md)
- [Evaluation protocol](skills/agents-md-master/references/evaluation-protocol.md)
- [OpenAI AGENTS.md documentation](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
- [OpenAI plugin packaging documentation](https://developers.openai.com/plugins/build/plugins)
- [Changelog](CHANGELOG.md)
- [Codex Essentials marketplace](../../README.md)
- [Issues](https://github.com/nerymurillohnd/codex-essentials/issues)
- [License](LICENSE.md)

AGENTS.md Master is community-maintained and is not an official OpenAI or Codex
enforcement product.

## 📄 License

MIT. See [LICENSE.md](LICENSE.md).
