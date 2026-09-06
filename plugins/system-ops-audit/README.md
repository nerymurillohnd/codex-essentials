# 🖥️ System Ops Audit

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[← Back to Codex Essentials](../../README.md)

> Design and analyze read-only macOS operational baseline audits without collecting secrets or mutating the system.

**Explore:** [Install](#-quick-start) · [Purpose](#-purpose) ·
[Environments](#supported-environments) · [Safety](#-behavior-and-boundaries) ·
[Docs](#-documentation-and-support)

System Ops Audit is a Codex plugin for local macOS operational baseline audit
work. It prepares a fixed System-Ops workspace workflow, requires script design
before implementation or execution, and keeps baseline collection separate from
repair.

The current plugin version is recorded in `.codex-plugin/plugin.json`. Install
the package from the repository's `main` catalog.

> [!CAUTION]
> Baseline collection is observation, not repair. Do not write scripts, run
> audit commands, collect sensitive data, or remediate findings without a
> separate explicit user approval boundary.

## ⚡ Quick start

Add the marketplace and install the plugin:

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add system-ops-audit@codex-essentials
codex plugin list
```

Then ask Codex:

```text
Use System Ops Audit to prepare the System-Ops workspace and design a read-only macOS baseline audit script for approval.
```

Read the boundaries below before creating workspaces, writing scripts, running
commands, collecting outputs, or recommending remediation.

The skill metadata is scoped to local macOS operational baselines, including
installed application metadata, and excludes repository,
application-development, and product-development audits.

## 🎯 Use cases

| Scenario                                                       | How this plugin helps                                       | Expected result                                          |
| -------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------- |
| You need a baseline view of a local macOS workstation.         | Frames a read-only audit plan before any script is written. | A scoped audit design ready for approval.                |
| You want to keep system diagnostics separate from remediation. | Preserves an explicit observation-only boundary.            | Findings and recommendations remain separate from fixes. |
| You have audit output to interpret.                            | Guides secret-safe analysis and residual-risk reporting.    | A structured summary without exposing credentials.       |

**Not a fit when:** the task requires automatic repair, privileged system
changes, remote fleet management, or collecting secrets.

## 🎯 Purpose

- Prepare or validate the required `System-Ops` workspace contract.
- Design read-only audit scripts before writing or executing them.
- Analyze approved audit output without exposing secrets or mutating the host.
- Separate verified observations, excluded data, assumptions, risks, and
  recommendations.

## 🧰 Included Components

| Component                                                                                                                            | Purpose                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| [`.codex-plugin/plugin.json`](.codex-plugin/plugin.json)                                                                             | Plugin identity, version, marketplace metadata, and bundled components. |
| [`skills/system-ops-audit/SKILL.md`](skills/system-ops-audit/SKILL.md)                                                               | Authoritative operating workflow for safe macOS baseline audit work.    |
| [`skills/system-ops-audit/agents/openai.yaml`](skills/system-ops-audit/agents/openai.yaml)                                           | Codex-facing display metadata and invocation prompt.                    |
| [`skills/system-ops-audit/assets/system-ops-workspace-tree.txt`](skills/system-ops-audit/assets/system-ops-workspace-tree.txt)       | Reference workspace tree for the expected System-Ops layout.            |
| [`skills/system-ops-audit/references/macos-baseline-audit-spec.md`](skills/system-ops-audit/references/macos-baseline-audit-spec.md) | Audit scope and evidence model for macOS baseline checks.               |
| [`skills/system-ops-audit/references/safety-policy.md`](skills/system-ops-audit/references/safety-policy.md)                         | Safety, privacy, and approval boundaries.                               |
| [`skills/system-ops-audit/references/script-design-template.md`](skills/system-ops-audit/references/script-design-template.md)       | Template for presenting audit script designs before implementation.     |
| [`skills/system-ops-audit/references/test-scenarios.md`](skills/system-ops-audit/references/test-scenarios.md)                       | Verification scenarios for generated audit scripts and analysis.        |
| [`skills/system-ops-audit/references/workspace-contract.md`](skills/system-ops-audit/references/workspace-contract.md)               | Filesystem contract for the local System-Ops workspace.                 |
| [`CHANGELOG.md`](CHANGELOG.md)                                                                                                       | User-facing change history.                                             |
| [`LICENSE.md`](LICENSE.md)                                                                                                           | MIT license terms.                                                      |

This package intentionally ships with no executable audit collector script, no
hooks, no MCP server, no app manifest, and no bundled credentials.

## 🖥️ Requirements and compatibility

## Supported Environments

| Requirement   | Supported value or behavior                                                            |
| ------------- | -------------------------------------------------------------------------------------- |
| Codex surface | Codex hosts that support installed skills and local filesystem and shell access.       |
| Runtime/tools | Shell access for approved local diagnostics; no package manager dependency is bundled. |
| Project types | Local macOS operational audit workspaces and evidence review sessions.                 |
| Credentials   | None required by the plugin; do not collect or print secret values.                    |
| Network       | Not required for the packaged skill itself.                                            |
| Last verified | `2026-09-05` against the package manifest and marketplace validator.                   |

The current installed project, local operating-system state, and current Codex
behavior take precedence over static compatibility claims in this package.

## 🔐 Behavior and boundaries

## Inputs and Outputs

**Inputs:** the user's audit request, System-Ops workspace state, approved
script design, read-only command output, and explicitly provided evidence.

**Outputs:** script-design proposals, approved audit scripts when requested,
read-only diagnostic output, findings summaries, risks, assumptions, and
follow-up recommendations.

## Required Tools and Credentials

Codex needs local filesystem and shell access for approved audit-script work.
No credential is required by this plugin. Any credential-like value discovered
in evidence must remain masked as `${VAR}` or be omitted.

## Permissions

| Access or effect | What this plugin may do                                                    |
| ---------------- | -------------------------------------------------------------------------- |
| Read             | Inspect local workspace files and approved read-only macOS command output. |
| Write            | Write audit scripts or reports only after separate explicit user approval. |
| Process          | Run read-only local commands only after the audit design is approved.      |
| Network          | Not used by default.                                                       |
| Authentication   | Not required.                                                              |

## Side Effects

Installing the plugin changes Codex-managed plugin state only. The packaged
skill does not modify the target project, install dependencies, change system
settings, start background services, publish data, or run audit commands by
itself.

## Human Approval Boundaries

The skill requires the agent to present the script design first and wait for
explicit user approval before writing or executing any script. Baseline
collection is observation, not repair. Findings may lead to recommendations,
but remediation requires a separate explicit approval boundary.

## Installation Behavior

Installation registers the packaged skill with Codex through the marketplace.
It does not create the System-Ops workspace, add shell scripts to a target
directory, grant privileged access, or configure credentials.

## 🔁 Uninstall and Rollback Behavior

Refresh the configured marketplace with the current Codex command:

```bash
codex plugin marketplace upgrade codex-essentials
codex plugin list
```

Remove only this plugin:

```bash
codex plugin remove system-ops-audit@codex-essentials
```

Uninstalling removes the plugin from Codex-managed configuration and cache. It
does not delete System-Ops workspaces, generated audit designs, scripts,
reports, or repository changes created during earlier approved sessions. Use
the target workspace or repository history for rollback.

## ✅ Verification

Maintainers can run the canonical marketplace checks:

```bash
npm run validate:plugins
npm run marketplace:build
npm run marketplace:check
npm run documentation:gate -- --base main --head HEAD
npm run check
```

Consumer smoke test:

```text
Use System Ops Audit to prepare a read-only macOS baseline audit plan and stop before writing any script.
```

## 🚧 Known Limitations

- The plugin provides workflow guidance, references, and metadata; it does not
  include an executable collector.
- Audit coverage depends on the approved script design, the local macOS host,
  and the evidence the user authorizes Codex to inspect.
- Read-only findings do not prove that an unobserved system, account, service,
  or device is healthy.

## 🩺 Failure and Recovery

- If the System-Ops workspace is missing, prepare or request the required
  workspace path before writing any audit artifact.
- If a command would require elevated privileges, network transfer, credential
  exposure, or mutation, stop and ask for a separate approval or redesign the
  check as read-only.
- If validation fails, report the exact failing gate and keep the package,
  README, changelog, and manifest synchronized before release.

Stop and report the state when required permissions, scope, authority, or a
verification gate is unavailable. Do not invent missing evidence or silently
perform a remote mutation.

## ❓ FAQ

<details>
<summary>Does installing this plugin modify the target project or Mac?</summary>

No. Installation changes Codex-managed plugin state only. Workspace creation,
script writing, command execution, and remediation each require separate user
approval.

</details>

<details>
<summary>What permissions or side effects should I review?</summary>

Review the permissions and side-effects sections above. The important boundary
is that the workflow may inspect approved local evidence, but it must not
collect secrets, mutate the host, or perform repairs as part of baseline
collection.

</details>

<details>
<summary>How do I update, remove, or roll back this plugin?</summary>

Use the [uninstall and rollback](#-uninstall-and-rollback-behavior)
instructions above. Generated workspaces, scripts, reports, or repository edits
are outside Codex-managed plugin state and should be handled through their own
workspace or Git history.

</details>

## 📚 Documentation and support

- [System Ops Audit skill](skills/system-ops-audit/SKILL.md)
- [Workspace contract](skills/system-ops-audit/references/workspace-contract.md)
- [Safety policy](skills/system-ops-audit/references/safety-policy.md)
- [macOS baseline audit spec](skills/system-ops-audit/references/macos-baseline-audit-spec.md)
- [Changelog](CHANGELOG.md)
- [Codex Essentials marketplace](../../README.md)
- [Issues](https://github.com/nerymurillohnd/codex-essentials/issues)
- [License](LICENSE.md)

## 📄 License

MIT. See [LICENSE.md](LICENSE.md).
