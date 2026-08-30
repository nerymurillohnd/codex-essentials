# Optimize Memories

![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)

> Audit Codex memories with evidence before changing them.

Optimize Memories is a Codex plugin for evidence-based auditing and controlled
maintenance of Codex memory artifacts. It helps Codex distinguish durable
memory from instructions and configuration, verify claims against authoritative
sources and current state, and prepare a complete change proposal before any
memory is changed.

## 🎯 Purpose

Use this plugin when you need to audit, reconcile, correct, or update Codex
memories at project scope, global cross-project scope, or both. The workflow is
phase-gated and preserves an explicit audit ledger, evidence references, scope
boundaries, unresolved findings, and approval status.

The skill supports exactly these modes:

- `project` — inspect memories associated with the active project.
- `global` — inspect global cross-project Codex memories.
- `complete` — inspect both project and global memory scopes.

The operating rule is:

```text
Resolve scope -> establish authority -> inventory -> verify -> propose -> approve -> apply -> verify
```

## ⚡ Quick Start

Add the marketplace and install the plugin:

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add optimize-memories@codex-essentials
```

Confirm the installation:

```bash
codex plugin marketplace list
codex plugin list
```

Then open the project or Codex environment whose memories you want to review
and ask Codex to audit them in `project`, `global`, or `complete` scope.

## 🧰 Included Components

| Component                                           | Purpose                                                    |
| --------------------------------------------------- | ---------------------------------------------------------- |
| `.codex-plugin/plugin.json`                         | Marketplace manifest and product metadata.                 |
| `skills/audit-and-cure-memories/SKILL.md`           | Phase-gated memory audit and approval workflow.            |
| `skills/audit-and-cure-memories/agents/openai.yaml` | Codex agent label, catalog summary, and invocation prompt. |
| `README.md`                                         | Plugin purpose, limits, verification, and operations.      |
| `CHANGELOG.md`                                      | User-facing change history.                                |
| `LICENSE.md`                                        | MIT license terms for the package.                         |

No hooks, scripts, MCP servers, apps, or runtime dependencies are bundled.

## 📚 Reference Library

| Read this                                                          | What it provides                                                              |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| [`SKILL.md`](skills/audit-and-cure-memories/SKILL.md)              | Complete audit phases, gates, evidence requirements, and approval boundaries. |
| [`openai.yaml`](skills/audit-and-cure-memories/agents/openai.yaml) | Codex-facing skill metadata and the concise initial task prompt.              |
| [`LICENSE.md`](LICENSE.md)                                         | MIT license terms for this package.                                           |

## 🖥️ Supported Environments

The plugin is intended for Codex sessions with access to the local filesystem
and the project or user scope being audited. The workflow can use local shell
commands, `rg`, filesystem inspection, and `git` for local evidence.

When available, the workflow uses official OpenAI and Codex documentation for
authority checks. GitHub read access may be used when it is available and
essential to verify repository or source evidence.

## 🔄 Maintenance Model

The package is maintained in this marketplace repository. Its plugin manifest
is the source of truth for identity and installation metadata; the marketplace
catalog is generated from validated package manifests.

Maintenance should preserve the phase order, evidence ledger, explicit approval
boundary, and complete post-change verification. Changes to the skill or its
metadata should update this README and the changelog in the same product
change.

## 🔁 Inputs and Outputs

Inputs include the requested memory scope, the resolved project and Codex
roots, memory candidate files, current repository or host state, official
documentation, and any user observations about findings.

The workflow produces:

- a scope record and resolved-root evidence;
- an authority register with source and retrieval details;
- a complete memory inventory and atomic claim ledger;
- a verification matrix with classified findings;
- a consolidated approval report with complete proposed diffs; and
- an applied or closure report only after an explicitly approved change set.

## 🧩 Required Tools and Credentials

No credential is required for local memory inspection or report generation.
The workflow requires a Codex environment with filesystem access. Official
documentation retrieval and GitHub inspection are optional and must use only
available, authorized read access.

The skill must not invent tool results or add tool dependencies merely because
a tool is mentioned. If a required tool, connection, or permission is
unavailable, the affected task is recorded as `BLOCKED` and the limitation is
reported.

## 🔐 Permissions

The workflow may need:

| Access                     | Reason                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| Read                       | Inspect memory artifacts, repository state, Codex configuration, and authoritative sources. |
| Process or shell execution | Run bounded local inspection and verification commands.                                     |
| Network read               | Retrieve required official documentation or source evidence when available.                 |
| Write                      | Apply only the final, explicitly approved memory changes.                                   |

The plugin does not authorize changes to instructions, configuration, skills,
repositories, branches, issues, pull requests, or remote services.

## ⚠️ Side Effects

Discovery, inventory, verification, and reporting are non-mutating. Official
documentation retrieval and local inspection may produce normal command or
network logs outside the memory artifacts.

During the approved application phase, the workflow may modify only the
memory artifacts included in the approved consolidated change set. It must
re-read and re-fingerprint every target immediately before writing and must
stop if scope or target state has drifted.

## 🛡️ Human Approval Boundaries

The plugin is proposal-first. It must stop for missing approval, unresolved
authority conflicts, target drift, failed verification gates, or ambiguous
scope. A complete approval report, including the exact proposed diffs, is
required before any memory mutation.

User observations are evaluated as evidence, not accepted automatically. If an
observation changes the proposed set, the report and approval status are
regenerated.

## 📦 Installation Behavior

Install or update from the marketplace:

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add optimize-memories@codex-essentials
```

Installation adds the manifest, skill instructions, and agent metadata to
Codex. It does not inspect, rewrite, delete, or migrate any memory artifacts.
The skill acts only when invoked for a memory task.

### 🔄 Update

```bash
codex plugin marketplace update codex-essentials
codex plugin list
```

### 🧹 Remove

```bash
codex plugin remove optimize-memories@codex-essentials
```

To remove the marketplace registration after removing its plugins:

```bash
codex plugin marketplace remove codex-essentials
```

## ↩️ Uninstall and Rollback Behavior

Removing the plugin stops future use of its instructions but does not
automatically revert memory changes previously approved and applied by a user.

To roll back an approved memory change, use the backup, version-control diff,
or other recovery record produced by the surrounding workflow. If no
recoverable record exists, the skill must report that limitation instead of
inventing prior content.

## ✅ Verification

For a local package check, run the repository validation pipeline:

```bash
npm run marketplace:build
npm run marketplace:check
```

For the skill itself, inspect the full audit ledger, evidence references,
proposed diffs, approval state, and final verification result. A tool invocation
alone is not evidence of task completion; each `PASS` requires concrete
evidence.

## 🚧 Known Limitations

- Real-world token usage and task outcomes are not measured by the package
  itself.
- Official source retrieval depends on the tools and network access available
  in the current Codex session.
- Global memory roots and supported memory formats must be discovered from the
  current environment; the workflow must not assume a fixed path or format.
- The workflow intentionally stops on unresolved conflicts, missing approval,
  target drift, or failed verification gates.

## 🩺 Failure and Recovery

If scope, roots, authority, permissions, or target identity cannot be
established, stop and report the blocker. Mark unavailable tasks `BLOCKED` and
continue only where the remaining evidence is sufficient.

If a verification task fails, preserve the failure in the ledger, resolve or
explicitly report it, and do not advance through the failed gate. If a write
fails or drift is detected, stop, report the resulting state, and use the
recorded pre-write fingerprints and proposed diffs to determine a safe recovery
path.

## 🌐 Documentation and Attribution

The skill's authority workflow is based on the official Codex and OpenAI
documentation sources identified in `SKILL.md`. Repository behavior and package
validation are defined by the Codex Essentials marketplace contract.

This package is community-maintained and is not an official OpenAI or Codex
infrastructure module.
