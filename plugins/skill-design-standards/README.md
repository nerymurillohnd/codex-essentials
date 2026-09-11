# 📐 Skill Design Standards

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[← Back to Codex Essentials](../../README.md)

> Build focused, portable agent skills and evaluate them with observable evidence.

**Explore:** [Install](#-quick-start) · [Purpose](#-purpose) ·
[Environments](#supported-environments) · [Safety](#-behavior-and-boundaries) ·
[Docs](#-documentation-and-support)

Skill Design Standards is a Codex plugin for skill authors, maintainers, and
operators. It guides design, audit, improvement, and evaluation of skills while
preserving the user's scope and the target host's requirements.

The current plugin version is recorded in `.codex-plugin/plugin.json`. Install
from the repository's `main` catalog. This Git-backed marketplace is a community
distribution source; it does not imply universal Plugins Directory publication.

## ⚡ Quick start

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add skill-design-standards@codex-essentials
codex plugin list
```

If the marketplace is already configured, refresh it with
`codex plugin marketplace upgrade codex-essentials` before installing. Start a
new Codex thread after installation and ask:

```text
Use $skill-design-standards to audit the skill at <skill-directory>.
Report format errors, design recommendations, and validation evidence. Do not edit files.
```

## 🎯 Use cases

| Scenario                                                       | How this plugin helps                                             | Expected result                                                                   |
| -------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| A skill has grown into a long, rigid checklist.                | Separate essential workflow from conditional references.          | A focused entrypoint and explicit resource routing.                               |
| A skill activates on unrelated requests or misses useful ones. | Design realistic positive and near-miss trigger queries.          | A bounded evaluation plan with observable activation evidence.                    |
| A new version seems better but has not been compared.          | Isolate baseline and candidate runs with shared grading criteria. | Evidence-backed quality and cost comparisons, with unavailable metrics disclosed. |

**Not a fit when:** the task is ordinary domain work without skill authoring,
review, or evaluation. Use the corresponding domain workflow directly.

## 🎯 Purpose

- Distinguish format requirements, design recommendations, and host/package rules.
- Keep skills self-contained and load supporting detail only when needed.
- Review script interfaces, permissions, evidence, and failure handling.
- Evaluate activation separately from the quality of completed work.

## 🧰 Included Components

| Component                                                                     | Purpose                                             |
| ----------------------------------------------------------------------------- | --------------------------------------------------- |
| [`.codex-plugin/plugin.json`](.codex-plugin/plugin.json)                      | Identity, version, and skills declaration.          |
| [`SKILL.md`](skills/skill-design-standards/SKILL.md)                          | Main design and audit workflow.                     |
| [`agents/openai.yaml`](skills/skill-design-standards/agents/openai.yaml)      | Skill presentation and automatic invocation policy. |
| [`format.md`](skills/skill-design-standards/references/format.md)             | Agent Skills format and resource layout.            |
| [`codex.md`](skills/skill-design-standards/references/codex.md)               | Host metadata, invocation, and dependencies.        |
| [`scripts.md`](skills/skill-design-standards/references/scripts.md)           | Commands and agent-facing script interfaces.        |
| [`descriptions.md`](skills/skill-design-standards/references/descriptions.md) | Description design and trigger evaluation.          |
| [`evaluation.md`](skills/skill-design-standards/references/evaluation.md)     | Baselines, output grading, and iteration.           |
| [`validation.md`](skills/skill-design-standards/references/validation.md)     | Format checks, evidence, and validator limits.      |
| [`CHANGELOG.md`](CHANGELOG.md)                                                | Product change history.                             |
| [`LICENSE.md`](LICENSE.md)                                                    | MIT license terms.                                  |

## 🖥️ Requirements and compatibility

## Supported Environments

| Requirement   | Supported value or behavior                                                                                      |
| ------------- | ---------------------------------------------------------------------------------------------------------------- |
| Codex surface | A host supporting marketplace plugins and skill loading; CLI commands checked with Codex CLI 0.153.4.            |
| Runtime/tools | No bundled runtime; file access for local audits. Existing validators and project tools are used when available. |
| Project types | Standalone and plugin-bundled Agent Skills; Codex extensions are identified separately.                          |
| Credentials   | None required by this plugin.                                                                                    |
| Network       | Needed for installation and refreshing official documentation; not needed to read bundled guidance.              |
| Last verified | 2026-09-06 against the local package contract and official Agent Skills/Codex documentation.                     |

The target host, project tooling, and current official documentation take
precedence over static compatibility notes. Other creator and domain skills are
optional companions, not installation dependencies.

## 🔐 Behavior and boundaries

## Inputs and Outputs

**Inputs:** A skill directory or supplied skill content, task objective, target
host, and optional fixtures or evaluation artifacts.

**Outputs:** Findings with evidence, requested skill edits, or evaluation plans
and observed results. No benchmark is claimed merely because a plan exists.

## Required Tools and Credentials

No MCP server, app, credential, or external skill is required. Automated
validation uses tools already available or an explicitly selected isolated
execution environment under the user's dependency policy. The reference
validator is optional; unavailable automated checks are reported explicitly.

## Permissions

| Access or effect | What this plugin may do                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| Read             | Inspect the supplied skill, relevant local instructions, and evaluation inputs.                    |
| Write            | Edit the requested skill or create scoped evaluation artifacts only when that work is authorized.  |
| Process          | Run relevant available validation or evaluation tools within the requested scope.                  |
| Network          | Retrieve official documentation and, when authorized, dependencies needed for the selected checks. |
| Authentication   | None required; target workflows keep their own authorization boundaries.                           |

## Side Effects

Installation stores the package and plugin state in Codex-managed locations.
There are no hooks, background jobs, bundled executable helpers, or automatic
project/configuration edits. Running an explicitly requested improvement or
evaluation can write target files or temporary artifacts as documented above.

## Human Approval Boundaries

An audit is read-only. A request to edit a skill authorizes that scoped edit;
it does not authorize installation, publication, production actions, or expanded
permissions. Preserve existing authorization and ask only for missing decisions
or permissions that materially block a dependent action.

## Installation Behavior

Installing enables discovery of the bundled skill according to host settings.
It does not remove a standalone copy, install another plugin, provision tools,
or rewrite a user's global configuration outside normal plugin-managed state.

If migrating from a standalone `skill-design-standards`, compare and preserve any
local changes first. Verify that the remote `main` catalog contains this package,
then move the standalone copy outside all skill-discovery directories or remove
that exact copy after preserving a recoverable backup. Install this plugin and
check a fresh thread. Avoid keeping two discoverable copies with the same name.

## 🔁 Uninstall and Rollback Behavior

```bash
codex plugin marketplace upgrade codex-essentials
codex plugin list
codex plugin remove skill-design-standards@codex-essentials
```

Uninstall removes this plugin's managed installation; it does not undo authored
skill edits, delete evaluation outputs, or restore a removed standalone copy.
Recover earlier content from Git history or your migration backup. Restore only
one discoverable installation and verify it in a fresh thread.

## ✅ Verification

From the marketplace repository, maintainers can run:

```bash
npm run marketplace:check
```

These repository checks are maintenance tooling and are not plugin dependencies.
For a consumer smoke test, start a new thread in a temporary directory, supply
this minimal skill as text, and request an audit without edits:

```markdown
---
name: sample-skill
description: Summarize a supplied text into three bullet points.
---

Read the supplied text and return three concise bullet points.
```

State that its folder is named `sample-skill`. Expect no claim that optional
`agents/openai.yaml` is required by the base format. Repeat with `sample--skill`
as the name and folder: expect rejection of consecutive hyphens. Inspect the
trace to confirm the installed skill was loaded; these examples do not measure
implicit-trigger accuracy or prove a full benchmark.

## 🚧 Known Limitations

- This is instructional guidance, not a blocking hook, parser, or eval runner.
- Host discovery, tool availability, and telemetry vary; missing evidence is
  reported rather than inferred. External validators can diverge from the spec.
- Evaluation counts and thresholds are starting points, not universal gates.
- Static reference dates can become stale; refresh the official index before
  relying on changed external requirements.

## Failure and Recovery

If a resource is missing, verify the installed package and refresh/reinstall it.
If a tool is unavailable, use applicable manual checks and label automated
validation as unavailable. If a validator conflicts with the specification,
record a minimal example and inspect the actual consumer before changing fields.
For a failed evaluation, preserve traces, separate execution errors from quality
failures, and diagnose before retrying. Never invent a successful check.

## 📚 Documentation and support

- [Skill workflow](skills/skill-design-standards/SKILL.md)
- [Agent Skills documentation index](https://agentskills.io/llms.txt)
- [OpenAI plugin documentation](https://developers.openai.com/plugins/build/plugins)
- [Issues](https://github.com/nerymurillohnd/codex-essentials/issues)

## 📄 License

MIT. See [LICENSE.md](LICENSE.md). This independent community plugin is not
endorsed by OpenAI or Agent Skills. Reference documents link their upstream sources.
