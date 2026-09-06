# 🔎 Live Research

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[← Back to Codex Essentials](../../README.md)

> Verify change-sensitive claims with current authoritative evidence.

**Explore:** [Install](#-quick-start) · [Capabilities](#-included-components) ·
[Requirements](#supported-environments) · [Safety](#-behavior-and-boundaries) ·
[Docs](#-documentation-and-support)

Live Research is installed as `live-research`. Its single self-contained
`SKILL.md` tells Codex when a response depends on facts that may have changed,
defines required and optional inputs, prioritizes callable MCPs, plugins, apps,
standalone skills, and authoritative sources already available in the session,
and makes the evidence, date, uncertainty, conflicts, and limitations auditable.

The current plugin version is recorded in `.codex-plugin/plugin.json`. Install
the package from the repository's `main` catalog.

## 🎯 Purpose

Use this plugin before answering, recommending, planning, configuring, or
modifying anything whose correctness depends on time-sensitive or
change-sensitive information. It covers software, APIs, integrations,
regulations, standards, statistics, people, products, infrastructure,
compatibility, prices, schedules, and current events.

## ⚡ Quick start

Add the marketplace and install the plugin:

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add live-research@codex-essentials
codex plugin list
```

Then ask Codex to verify a request:

```text
Use Live Research to verify the current facts, cite authoritative sources, and separate verified evidence from inference.
```

## 🎯 Use cases

| Scenario                                                                     | How this plugin helps                                                                               | Expected result                                                |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| A library, API, CLI, or platform may have changed.                           | Checks current official documentation, releases, versions, and material compatibility dependencies. | A cited answer with the exact versions and dates checked.      |
| A recommendation depends on current prices, availability, safety, or policy. | Uses authoritative sources and reports scope, methodology, uncertainty, and limitations.            | An evidence-backed recommendation with uncertainty called out. |
| Local instructions conflict with current external evidence.                  | Compares project authority, user instructions, and primary sources before affected work continues.  | The conflict is surfaced before a risky change is applied.     |

**Not a fit when:** the task is pure mathematics, literal translation,
mechanical transformation, creative writing without external claims, or a
summary fully grounded in content already supplied by the user.

## 🧰 Included Components

| Component                                                                            | Purpose                                                                                               |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| [`.codex-plugin/plugin.json`](.codex-plugin/plugin.json)                             | Plugin identity, version, and component declarations.                                                 |
| [`skills/live-research/SKILL.md`](skills/live-research/SKILL.md)                     | Complete live-evidence routing, verification, grounding, citations, checklist, and recovery contract. |
| [`skills/live-research/agents/openai.yaml`](skills/live-research/agents/openai.yaml) | Codex-facing display metadata and invocation prompt.                                                  |
| [`CHANGELOG.md`](CHANGELOG.md)                                                       | User-facing change history.                                                                           |
| [`LICENSE.md`](LICENSE.md)                                                           | MIT license terms.                                                                                    |

No hooks, scripts, MCP servers, apps, assets, references, or runtime dependencies
are bundled; all behavior is defined by the single distributed skill document.

## 🖥️ Requirements and compatibility

## Supported Environments

| Requirement   | Supported value or behavior                                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Codex surface | Codex hosts that support installed skills and the available retrieval tools.                                                                      |
| Runtime/tools | Codex file and shell access; prefer any callable specialized MCP, plugin, skill, app, or domain retrieval route already available in the session. |
| Project types | Software repositories, infrastructure, research, operations, business, and general fact-checking workflows.                                       |
| Credentials   | None required by the plugin. A target source may require user-managed credentials; never expose them to a remote tool.                            |
| Network       | Required for live retrieval; the workflow falls back to the strongest available read-only source when a preferred route is unavailable.           |
| Last verified | `2026-09-06` against the package manifest, skill metadata, and marketplace contract.                                                              |

Current project files, lockfiles, official documentation, and source release
notes take precedence over static compatibility claims in this package.

When another installed plugin, MCP, app, or standalone skill provides a
specialized retrieval route, Live Research uses it when the current session
confirms that it is callable and suitable. The package remains self-contained:
it does not require a particular companion capability or install one on behalf
of the user.

## Required Tools and Credentials

Codex must have filesystem and shell access plus a suitable read-only retrieval
route, such as official web or documentation search. No credential is required
by this plugin; a target source may require user-managed credentials.

## 🔐 Behavior and boundaries

## Inputs and Outputs

**Inputs:** the user's request is required. Useful optional inputs include
jurisdiction, version, product edition, deployment environment, date range,
budget, risk tolerance, local project evidence, tool output, and explicitly
authorized private evidence.

**Outputs:** cited findings, exact dates or versions checked, evidence-chain
summaries, compatibility notes, conflicts, assumptions, limitations, commands,
residual-risk or recovery notes, and the conditions that required asking,
stopping, or declining when applicable.

## Permissions

The plugin may read project files, configuration, metadata, diagnostics, and
public or explicitly authorized sources. It may run bounded project-native
checks and read-only retrieval helpers. It may use only credentials already
authorized for the selected source, with values masked as `${VAR}`.

## Side Effects

| Access or effect | What this plugin may do                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| Read             | Inspect project files, configuration, metadata, diagnostics, and public or explicitly authorized sources. |
| Write            | Edit files only when the user separately requests implementation or repair work.                          |
| Process          | Run bounded project-native checks and retrieval helpers.                                                  |
| Network          | Make read-only requests to authoritative sources and specialized retrieval services.                      |
| Authentication   | Use only credentials already authorized for the selected source; keep values masked as `${VAR}`.          |

Research itself is read-only. It does not publish, deploy, send messages,
modify accounts, install dependencies, change credentials, or alter project
files without a separate authorized request.

## Human Approval Boundaries

- File changes, dependency installation, migrations, deployments, releases, and
  remote mutations require separate explicit authorization.
- If sensitive code or data would be sent to a remote source and the user has
  not authorized that transfer, stop and use local evidence instead.
- Do not turn an inference, search snippet, stale cache, or unverified claim into
  a confirmed fact.
- Do not continue when missing evidence or ambiguous tool results would make the
  conclusion misleading.

## 📦 Installation Behavior

Installation changes Codex-managed plugin state only. It does not install npm
packages into a target project, change its files, or automatically enable
remote credentials.

Refresh the configured marketplace and inspect available plugins:

```bash
codex plugin marketplace upgrade codex-essentials
codex plugin list
```

## 🔁 Uninstall and Rollback Behavior

Remove only this plugin:

```bash
codex plugin remove live-research@codex-essentials
```

Uninstalling removes the plugin from Codex-managed configuration and cache. It
does not revert project edits made during earlier sessions; use the target
repository's Git history or its documented recovery process for those changes.

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
Use Live Research to identify which claims may have changed, retrieve the strongest available sources, and return citations with dates, uncertainty, and limitations.
```

## 🚧 Known Limitations

- Retrieval quality and availability depend on the tools, network, source
  access, and permissions available in the current Codex session.
- A current undated page may need dated release notes, tags, or announcements
  before it can establish a version-sensitive conclusion.
- No source result proves that an unobserved system is unchanged or compatible;
  absence of a published change is reported as a limitation.
- The plugin does not replace legal, medical, financial, security, or other
  domain-specific professional review.

## 🩺 Failure and Recovery

- If a preferred retrieval route is unavailable, report the routing deviation
  and use the strongest safe alternative; do not silently substitute training
  data.
- If sources disagree, lead with the most authoritative source and disclose
  the conflict, date, and practical impact.
- If environment or project evidence is missing, state the narrow assumption or
  stop and request the missing evidence.
- If a command, source, or verification gate fails, preserve the exact failure
  that affects the conclusion and report what remains unverified.

## ❓ FAQ

<details>
<summary>Does Live Research browse for every request?</summary>

No. It activates for claims that may have changed and skips genuinely stable,
fully user-provided, or purely mechanical content.

</details>

<details>
<summary>Can it change my project after researching it?</summary>

No. Research is read-only. A separate user request and approval are required
before edits, dependency changes, deployments, or other mutations.

</details>

<details>
<summary>What if the official source is unavailable?</summary>

The plugin reports the unavailable route, uses the strongest safe alternative
when possible, and labels the result and remaining uncertainty.

</details>

## 📚 Documentation and support

- [Live Research skill](skills/live-research/SKILL.md)
- [Codex Essentials marketplace](../../README.md)
- [OpenAI plugin documentation](https://developers.openai.com/plugins/build/plugins)
- [Issues](https://github.com/nerymurillohnd/codex-essentials/issues)
- [License](LICENSE.md)

## 📄 License

MIT. See [LICENSE.md](LICENSE.md).

Live Research is an independent community plugin and is not affiliated with or
endorsed by OpenAI or any source it may consult.
