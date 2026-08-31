# {{Emoji}} {{Display Name}}

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[← Back to Codex Essentials](../../README.md)

> {{One-sentence outcome in the user's language.}}

**Explore:** [Install](#-quick-start) · [Capabilities](#-what-it-does) ·
[Requirements](#-requirements-and-compatibility) · [Safety](#-behavior-and-boundaries) ·
[Docs](#-documentation-and-support)

{{Plugin name}} is a Codex plugin for {{target users and task}}. It {{primary
behavior}} and does not {{important non-goal or boundary}}.

The current plugin version is recorded in `.codex-plugin/plugin.json`. Install
the package from the repository's `main` catalog.

> [!CAUTION]
> {{One concise statement of the most important permission, hook, write, network,
> or data-loss boundary. Omit this alert only when the plugin has no meaningful
> risk beyond ordinary read-only operation.}}

## ⚡ Quick start

Add the marketplace and install the plugin:

```bash
codex plugin marketplace add {{owner/repository}} --ref main
codex plugin add {{plugin-id}}@{{marketplace-name}}
codex plugin list
```

Then open {{target project or Codex surface}} and ask Codex:

```text
{{One canonical example prompt or action.}}
```

Read the boundaries below before enabling automatic hooks, file writes, process
execution, network access, or authentication.

## 🎯 Use cases

| Scenario                                 | How this plugin helps                        | Expected result         |
| ---------------------------------------- | -------------------------------------------- | ----------------------- |
| {{User starts with a concrete problem.}} | {{Plugin behavior applied to that problem.}} | {{Observable outcome.}} |
| {{Second realistic scenario.}}           | {{Relevant workflow or capability.}}         | {{Observable outcome.}} |
| {{Third realistic scenario.}}            | {{Relevant workflow or capability.}}         | {{Observable outcome.}} |

**Not a fit when:** {{one clear non-use case or boundary.}}

## 🎯 What it does

- {{Outcome 1.}}
- {{Outcome 2.}}
- {{Outcome 3.}}

Use cases should describe the user's starting situation, not repeat the component
inventory or implementation details.

## 🧰 Included components

List only paths that actually exist in this package. Link each navigable path.

| Component                                                                              | Purpose                                               |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| [`.codex-plugin/plugin.json`](.codex-plugin/plugin.json)                               | Plugin identity, version, and component declarations. |
| [`skills/{{skill-name}}/SKILL.md`](skills/{{skill-name}}/SKILL.md)                     | Authoritative behavior and workflow contract.         |
| [`skills/{{skill-name}}/agents/openai.yaml`](skills/{{skill-name}}/agents/openai.yaml) | Codex-facing label and concise invocation metadata.   |
| [`CHANGELOG.md`](CHANGELOG.md)                                                         | User-facing change history.                           |
| [`LICENSE.md`](LICENSE.md)                                                             | License terms.                                        |

{{Add rows for hooks, MCP/app manifests, references, examples, or assets only
when they are present and supported by this plugin.}}

## 🖥️ Requirements and compatibility

| Requirement   | Supported value or behavior                             |
| ------------- | ------------------------------------------------------- |
| Codex surface | {{CLI, desktop, IDE, or other supported host}}          |
| Runtime/tools | {{Required executables and preferred resolution order}} |
| Project types | {{Supported project or repository types}}               |
| Credentials   | {{None, or exact credential purpose and boundary}}      |
| Network       | {{Not used, optional read, or required operation}}      |
| Last verified | `{{YYYY-MM-DD}}` against `{{version/source}}`           |

The installed project, its lockfile, and current official documentation take
precedence over static compatibility claims in this package.

## 🔐 Behavior and boundaries

### Inputs and outputs

**Inputs:** {{user request, event payload, files, configuration, or evidence}}  
**Outputs:** {{files, messages, reports, commands, or verification results}}

### Permissions and side effects

| Access or effect | What this plugin may do                                      |
| ---------------- | ------------------------------------------------------------ |
| Read             | {{Exact paths, payloads, or project data read.}}             |
| Write            | {{Exact files or target scope written; say “none” if none.}} |
| Process          | {{Commands or servers started; say “none” if none.}}         |
| Network          | {{Destinations and purpose; say “not used” if none.}}        |
| Authentication   | {{Install/first-use behavior; say “not required” if none.}}  |

{{State whether installation changes the target project, lockfiles, caches, or
Codex managed plugin state.}}

### Human approval

{{State what is read-only and what requires explicit approval. For hooks, state
that users should review and trust the current hook implementation before enabling
it in a critical repository.}}

## 🔁 Update, remove, and rollback

Refresh the configured marketplace with the current Codex command:

```bash
codex plugin marketplace upgrade {{marketplace-name}}
codex plugin list
```

Remove only this plugin:

```bash
codex plugin remove {{plugin-id}}@{{marketplace-name}}
```

{{Explain what uninstall does not delete or revert. Describe the recoverable record
for rollback, such as Git history, backups, generated reports, or a prior package.}}

## ✅ Verification

Maintainers can run the canonical package checks from the marketplace repository:

```bash
npm run marketplace:check
```

{{Add one consumer smoke test that is runnable from an explicitly stated working
directory. If a command mutates files, say so and provide a read-only alternative
where possible.}}

## 🚧 Limitations and recovery

- {{Known limitation 1 and the observable symptom.}}
- {{Known limitation 2 and the safe diagnostic step.}}
- {{Failure message and recovery action.}}

Stop and report the state when required permissions, scope, authority, or a
verification gate is unavailable. Do not invent missing evidence or silently
perform a remote mutation.

## ❓ FAQ

<details>
<summary>Does installing this plugin modify the target project?</summary>

{{Answer precisely what installation changes and what it does not change.}}
</details>

<details>
<summary>What permissions or side effects should I review?</summary>

{{Point to the permissions and side-effects table above and summarize the most
important boundary in one sentence.}}
</details>

<details>
<summary>How do I update, remove, or roll back this plugin?</summary>

Use the [update, remove, and rollback](#-update-remove-and-rollback) instructions
above. {{Add any plugin-specific recovery detail.}}
</details>

## 📚 Documentation and support

- [Authoritative skill](skills/{{skill-name}}/SKILL.md)
- {{Reference or example link 1}}
- {{Reference or example link 2}}
- [Changelog](CHANGELOG.md)
- [Codex Essentials marketplace](../../README.md)
- [Issues](https://github.com/{{owner}}/{{repository}}/issues)
- [License](LICENSE.md)

{{Use Markdown links for every repository path. Keep detailed procedures in the
skill or reference files instead of duplicating them here.}}

## 📄 License

MIT. See [LICENSE.md](LICENSE.md).

{{Add an attribution and non-affiliation statement for third-party projects when
the plugin references or integrates with them.}}
