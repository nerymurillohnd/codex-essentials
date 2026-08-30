# 🧠 Codex Memory Audit

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[← Back to Codex Essentials](../../README.md)

> Audit Codex memories with evidence before changing them.

**Explore:** [Install](#-quick-start) · [Capabilities](#-what-it-does) ·
[Requirements](#-requirements-and-compatibility) · [Safety](#-behavior-and-boundaries) ·
[Docs](#-documentation-and-support)

Codex Memory Audit is installed as `optimize-memories`. It audits and reconciles
Codex memory artifacts across project and global scopes, verifies claims against
current authority, and prepares a complete proposal before any approved change.

| Version source                                           | Release history                                                                | Install ref |
| -------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------- |
| [`.codex-plugin/plugin.json`](.codex-plugin/plugin.json) | [Plugin releases](https://github.com/nerymurillohnd/codex-essentials/releases) | `main`      |

> [!CAUTION]
> Discovery, verification, and reporting are non-mutating. Memory changes occur
> only after explicit approval of the complete proposed change set.

## 🎯 Purpose

Use Codex Memory Audit when project or global memory needs evidence-based review,
reconciliation, or a controlled correction proposal.

## ⚡ Quick start

Add the marketplace and install the plugin:

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add optimize-memories@codex-essentials
codex plugin list
```

Then ask Codex to audit one supported scope:

```text
Audit Codex memories in project, global, or complete scope; verify claims and await approval before changes.
```

## 🎯 Use cases

| Scenario                                     | How this plugin helps                                                                                                     | Expected result                                   |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Project memory may contain stale claims.     | Reconciles claims with [current project evidence](skills/audit-and-cure-memories/SKILL.md).                               | A scoped audit ledger identifies verified drift.  |
| Global memory mixes policy and observations. | Checks authority and separates memory from instructions in the [audit workflow](skills/audit-and-cure-memories/SKILL.md). | A proposed cleanup preserves unresolved facts.    |
| A memory correction needs review first.      | Produces complete diffs before applying anything in the [approval workflow](skills/audit-and-cure-memories/SKILL.md).     | The user approves or rejects an auditable change. |

**Not a fit when:** the requested task is to change instructions, configuration,
skills, repositories, branches, or remote services instead of memory artifacts.

## 🎯 What it does

- Supports exactly `project`, `global`, and `complete` audit modes.
- Maintains scope records, authority registers, claim ledgers, and evidence matrices.
- Verifies Codex behavior against official sources and project claims against local authority.
- Stops on unresolved conflicts, target drift, missing approval, or failed verification.

## 🧰 Included Components

| Component                                                                                                | Purpose                                               |
| -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| [`.codex-plugin/plugin.json`](.codex-plugin/plugin.json)                                                 | Plugin identity, version, and component declarations. |
| [`skills/audit-and-cure-memories/SKILL.md`](skills/audit-and-cure-memories/SKILL.md)                     | Phase-gated audit and approval workflow.              |
| [`skills/audit-and-cure-memories/agents/openai.yaml`](skills/audit-and-cure-memories/agents/openai.yaml) | Codex-facing skill metadata and invocation prompt.    |
| [`CHANGELOG.md`](CHANGELOG.md)                                                                           | User-facing release history.                          |
| [`LICENSE.md`](LICENSE.md)                                                                               | MIT license terms.                                    |

No hooks, scripts, MCP servers, apps, or runtime dependencies are bundled.

## 🖥️ Requirements and compatibility

## Supported Environments

| Requirement   | Supported value or behavior                                                    |
| ------------- | ------------------------------------------------------------------------------ |
| Codex surface | Codex sessions with filesystem access to the selected scope.                   |
| Runtime/tools | Filesystem inspection, Git, local shell, and available source retrieval.       |
| Project types | Project memory, global cross-project memory, or both.                          |
| Credentials   | None for local inspection; authorized private sources may require credentials. |
| Network       | Optional read access for official documentation or GitHub evidence.            |
| Last verified | `2026-08-30` against the package manifest, skill, and repository contract.     |

## 🧩 Required Tools and Credentials

Local memory inspection requires filesystem access and bounded shell or Git
inspection. No credential is required for local work; authorized private sources
may require credentials and read access.

The current environment must determine memory roots and supported formats; the
workflow must not assume a fixed path or format.

## 🔐 Behavior and boundaries

## Inputs and Outputs

**Inputs:** Selected scope, resolved roots, memory candidates, current state,
authority sources, and user observations about findings.
**Outputs:** Scope record, authority register, inventory, claim ledger, evidence
matrix, consolidated approval report, and—only after approval—closure report.

## Permissions and Side Effects

| Access or effect | What this plugin may do                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------- |
| Read             | Inspect memory artifacts, Codex configuration, repository state, and authoritative sources. |
| Write            | Modify only memory artifacts in the explicitly approved consolidated change set.            |
| Process          | Run bounded local inspection and verification commands through Codex.                       |
| Network          | Retrieve official documentation or authorized source evidence as read-only work.            |
| Authentication   | Not required for local work; authorized private evidence may require it.                    |

Installation changes Codex-managed plugin state only. It does not inspect,
rewrite, delete, or migrate memory artifacts.

## Human Approval Boundaries

Discovery, inventory, verification, and reporting are read-only. The workflow
must stop before mutation until the report includes exact proposed diffs and the
user explicitly approves the complete change set. It never authorizes changes to
instructions, configuration, skills, repositories, branches, issues, pull
requests, or remote services.

## 📦 Installation Behavior

Installation changes Codex-managed plugin state only. It does not inspect,
rewrite, delete, or migrate memory artifacts.

## 🔁 Update, Remove, and Uninstall and Rollback Behavior

Refresh the configured marketplace:

```bash
codex plugin marketplace upgrade codex-essentials
codex plugin list
```

Remove only this plugin:

```bash
codex plugin remove optimize-memories@codex-essentials
```

Removing the plugin stops future use of its instructions; it does not revert
previously approved memory changes. Roll back through the backup, version-control
diff, or other recovery record produced by the surrounding workflow.

## ✅ Verification

From the marketplace repository, run the read-only package check:

```bash
npm run marketplace:check
```

`npm run marketplace:build` is the mutating package pipeline: it regenerates the
catalog after validation. Use it only when a catalog-affecting change is intended.
For a skill audit, verify every ledger task, evidence reference, proposed diff,
approval state, and final verification result; a tool invocation alone is not evidence.

## 🚧 Known Limitations

- Token usage and task outcomes are not measured by the package itself.
- Official source retrieval depends on tools and network access available in the session.
- Memory roots and formats must be discovered from current state.
- The workflow stops on unresolved conflicts, missing approval, target drift, or failed gates.
- Pre-write fingerprints identify target state but are not a complete before-image.
- For a write that needs guaranteed rollback, verify a full backup or before-image first;
  if none is available, stop and report that recovery is unavailable.

## 🩺 Failure and Recovery

If scope, roots, authority, permissions, or target identity cannot be established,
stop and report the blocker. If a write fails or drift is detected, use the
existing backup, before-image, version-control diff, or recovery record. Do not
represent fingerprints or a proposed diff as recovery of untouched original bytes;
if no recoverable record exists, report that limitation instead of promising safe
recovery.

## ❓ FAQ

<details>
<summary>Does installing Codex Memory Audit change my memories?</summary>

No. Installation changes Codex-managed plugin state. Discovery and reporting are
read-only, and memory mutation requires explicit approval of the full proposal.
</details>

<details>
<summary>Which memory scope should I choose?</summary>

Choose `project` for active-project memories, `global` for cross-project memories,
or `complete` for both. The workflow supports exactly those three modes.
</details>

<details>
<summary>How do I roll back an approved memory change?</summary>

Use the backup, version-control diff, or recovery record created by the workflow.
If no recoverable record exists, report that limitation instead of inventing prior content.
</details>

## 📚 Documentation and support

- [Authoritative skill](skills/audit-and-cure-memories/SKILL.md)
- [Agent metadata](skills/audit-and-cure-memories/agents/openai.yaml)
- [Changelog](CHANGELOG.md)
- [Codex Essentials marketplace](../../README.md)
- [Plugin contribution guidelines](../../docs/contributing/plugins.md)
- [Issues](https://github.com/nerymurillohnd/codex-essentials/issues)
- [License](LICENSE.md)

Codex Memory Audit is community-maintained and is not an official OpenAI or
Codex infrastructure module.

## 📄 License

MIT. See [LICENSE.md](LICENSE.md).
