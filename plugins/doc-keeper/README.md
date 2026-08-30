# 🗂️ DocKeeper

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[← Back to Codex Essentials](../../README.md)

> Keep changelogs and architecture decisions aligned with evidence.

**Explore:** [Install](#-quick-start) · [Capabilities](#-what-it-does) ·
[Requirements](#-requirements-and-compatibility) · [Safety](#-behavior-and-boundaries) ·
[Docs](#-documentation-and-support)

DocKeeper is a Codex plugin for maintaining `CHANGELOG.md` files, curated
release history, and architecture decision records. It preserves existing
infrastructure, writes only confirmed facts, and does not publish or mutate
remote state.

| Version source                                           | Release history                                                                | Install ref |
| -------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------- |
| [`.codex-plugin/plugin.json`](.codex-plugin/plugin.json) | [Plugin releases](https://github.com/nerymurillohnd/codex-essentials/releases) | `main`      |

> [!CAUTION]
> DocKeeper never invents history or simulates an owning release/ADR mechanism
> when required evidence or authority is unavailable.

## 🎯 Purpose

Use DocKeeper when a changelog or architecture decision record must be prepared
or checked from repository evidence without inventing history.

## ⚡ Quick start

Add the marketplace and install the plugin:

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add doc-keeper@codex-essentials
codex plugin list
```

Then ask Codex for a bounded document operation:

```text
Use DocKeeper to audit CHANGELOG.md without editing it.
```

Read the boundaries below before authorizing document writes or any related
release operation.

## 🎯 Use cases

| Scenario                                    | How this plugin helps                                                                                               | Expected result                                   |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| A completed change needs release history.   | Checks impact and [existing changelog conventions](skills/doc-keeper/references/changelog-maintenance.md).          | A concise, evidence-backed entry is prepared.     |
| A durable architecture choice was accepted. | Routes the decision through the [repository ADR format](skills/doc-keeper/references/adr-maintenance.md).           | A traceable ADR records context and consequences. |
| A release is being prepared.                | Detects native release ownership and [preflights documents](skills/doc-keeper/references/changelog-maintenance.md). | Release history is ready without remote mutation. |

**Not a fit when:** the task is routine implementation, formatting-only work,
test-only work, or an unrelated README edit.

## 🎯 What it does

- Creates, completes, audits, updates, and repairs changelogs and ADRs.
- Detects repository conventions, release tooling, and document ownership first.
- Preserves history, labels inferences, and reports missing or conflicting evidence.
- Leaves commits, tags, releases, issues, pull requests, and publication to their owners.

## 🧰 Included Components

| Component                                                                                                        | Purpose                                               |
| ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| [`.codex-plugin/plugin.json`](.codex-plugin/plugin.json)                                                         | Plugin identity, version, and component declarations. |
| [`skills/doc-keeper/SKILL.md`](skills/doc-keeper/SKILL.md)                                                       | Authoritative routing and evidence contract.          |
| [`skills/doc-keeper/agents/openai.yaml`](skills/doc-keeper/agents/openai.yaml)                                   | Codex-facing skill metadata and invocation prompt.    |
| [`skills/doc-keeper/references/changelog-maintenance.md`](skills/doc-keeper/references/changelog-maintenance.md) | Changelog procedures.                                 |
| [`skills/doc-keeper/references/adr-maintenance.md`](skills/doc-keeper/references/adr-maintenance.md)             | ADR procedures.                                       |
| [`skills/doc-keeper/outputs/changelog-example.md`](skills/doc-keeper/outputs/changelog-example.md)               | Default changelog output shape.                       |
| [`skills/doc-keeper/outputs/adr-example.md`](skills/doc-keeper/outputs/adr-example.md)                           | Default ADR output shape.                             |
| [`CHANGELOG.md`](CHANGELOG.md)                                                                                   | User-facing release history.                          |
| [`LICENSE.md`](LICENSE.md)                                                                                       | MIT license terms.                                    |

The package contains no scripts, hooks, apps, MCP servers, credentials, or
runtime dependencies.

## 🖥️ Requirements and compatibility

## Supported Environments

| Requirement   | Supported value or behavior                                                                    |
| ------------- | ---------------------------------------------------------------------------------------------- |
| Codex surface | Codex sessions with filesystem and repository access.                                          |
| Runtime/tools | Available file, Git, repository, and authorized remote inspection tools.                       |
| Project types | Single-package repositories, monorepos, generated changelogs, and categorized ADR directories. |
| Credentials   | None for local work; authorized private evidence may require credentials.                      |
| Network       | Not required for local work; optional for authorized private evidence.                         |
| Last verified | `2026-08-30` against the package manifest, skill, references, and repository contract.         |

## 🧩 Required Tools and Credentials

DocKeeper requires only the file, Git, repository, and authorized remote
inspection tools already available to Codex. It does not install or require a
release tool. Credentials are needed only for authorized private evidence.

Existing repository instructions and document conventions take precedence over
the default examples in this package.

## 🔐 Behavior and boundaries

## Inputs and Outputs

**Inputs:** Document type, mode (`create`, `complete`, `audit`, `update`, or
`repair`), repository scope, release or decision context, and required evidence.
**Outputs:** An audit report or authorized local changes to a changelog, ADR,
index, and required reciprocal links.

## Permissions and Side Effects

| Access or effect | What this plugin may do                                                                |
| ---------------- | -------------------------------------------------------------------------------------- |
| Read             | Inspect in-scope files, Git history, repository configuration, and authorized sources. |
| Write            | Edit only the requested local documentation paths in an authorized mode.               |
| Process          | Use bounded local inspection commands through Codex; no bundled process runs.          |
| Network          | Read private or upstream evidence only when available and authorized.                  |
| Authentication   | Not required for local work; never invent or request credentials outside scope.        |

Installation changes Codex-managed plugin state only. It does not modify the
target project or publish any document.

## Human Approval Boundaries

Audit mode is read-only. A document request authorizes relevant local files, but
does not authorize commits, pushes, tags, releases, issues, pull requests,
comments, tool installation, or other remote mutations. DocKeeper stops when
authority, evidence, scope, or a required owner is unavailable.

## 📦 Installation Behavior

Installation changes Codex-managed plugin state only. It does not modify the
target project or publish any document.

## 🔁 Update, Remove, and Uninstall and Rollback Behavior

Refresh the configured marketplace:

```bash
codex plugin marketplace upgrade codex-essentials
codex plugin list
```

Remove only this plugin:

```bash
codex plugin remove doc-keeper@codex-essentials
```

Removing DocKeeper does not revert documents it changed. Review the repository
diff and use the project's normal version-control process to restore an earlier
document version. Remove the marketplace only after its remaining plugins are
removed.

## ✅ Verification

From the marketplace repository, maintainers can run:

```bash
npm run marketplace:check
```

After installation, ask for a read-only audit and verify that the result states
the selected mode, evidence, validation, unresolved facts, and remote actions
not performed. A notable change should trigger changelog closeout; an explicit
durable decision should trigger ADR closeout; typo-only, formatting-only, and
test-only changes should not trigger document edits.

## 🚧 Known Limitations

- Missing repository history or authorized external evidence cannot be recovered; gaps remain reported.
- Decision approval cannot be inferred from implementation alone.
- DocKeeper does not replace release automation, versioning policy, or governance.
- Implicit activation is semantic and not deterministic.
- If an owning mechanism is unavailable or prohibited, the operation is reported as blocked rather than simulated.

## 🩺 Failure and Recovery

If evidence conflicts or validation fails, preserve the valid state, report the
conflict, correct only the authorized local files, and validate again before any
commit or publication.

## ❓ FAQ

<details>
<summary>Does installing DocKeeper modify my project?</summary>

No. Installation changes Codex-managed plugin state. Document writes happen only
in an authorized local document operation. A notable implementation request may
also authorize the relevant local changelog or ADR companion closeout when its
threshold is met; neither path authorizes remote mutations.
</details>

<details>
<summary>Does DocKeeper publish releases or create ADRs without approval?</summary>

No. It prepares or verifies documents and leaves remote publication to the
owning workflow. It stops when required authority or approval is missing.
</details>

<details>
<summary>How do I recover from an incorrect document change?</summary>

Review the final diff and restore the prior version through the repository's
normal version-control process. Preserve the evidence conflict if one caused the error.
</details>

## 📚 Documentation and support

- [Authoritative skill](skills/doc-keeper/SKILL.md)
- [Changelog maintenance](skills/doc-keeper/references/changelog-maintenance.md)
- [ADR maintenance](skills/doc-keeper/references/adr-maintenance.md)
- [Changelog example](skills/doc-keeper/outputs/changelog-example.md)
- [ADR example](skills/doc-keeper/outputs/adr-example.md)
- [Changelog](CHANGELOG.md)
- [Codex Essentials marketplace](../../README.md)
- [Plugin contribution guidelines](../../docs/contributing/plugins.md)
- [Issues](https://github.com/nerymurillohnd/codex-essentials/issues)
- [License](LICENSE.md)

DocKeeper is independent and is not affiliated with MADR, Keep a Changelog,
Semantic Versioning, GitHub, release-please, or semantic-release.

## 📄 License

MIT. See [LICENSE.md](LICENSE.md).
