# Verify Completion

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[Back to Codex Essentials](../../README.md)

> Require independently reviewable evidence before claiming work is complete.

**Explore:** [Quick start](#quick-start) · [Purpose](#purpose) ·
[Boundaries](#behavior-and-boundaries) · [Verification](#verification) ·
[Support](#documentation-and-support)

Verify Completion is a Codex plugin for work that is about to be described as
complete, correct, verified, ready for handoff, ready to commit, or ready for a
pull request. Its skill requires evidence for every applicable completion gate;
it does not grant authority to commit, push, create a pull request, alter
configuration, install dependencies, or bypass a project control.

The plugin version is recorded in `plugin.json`. Install the package from the
repository's `main` catalog.

> [!CAUTION]
> A verification protocol cannot make an unauthorized action authorized. Review
> the target project's controls and obtain the required user approval before any
> write, commit, remote mutation, or configuration change.

## Quick start

Add the marketplace and install the plugin:

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add verify-completion@codex-essentials
codex plugin list
```

Before a completion claim, ask Codex:

```text
Use $verify-completion to verify the applicable gates before I claim this work is complete.
```

Codex 0.154.0 refreshes newly installed plugin tools and skills in existing
sessions. If another Codex host does not expose the installed skill, start a
new conversation before using it.

## Recommended AGENTS.md wiring

**Recommended placement:** Add this to a project's `AGENTS.md` when it needs a
durable completion standard. Put it in a global `AGENTS.md` only when the same
evidence requirement is intended for every workspace; individual projects still
own their acceptance criteria and validation commands.

After installing the plugin, add this block to the selected instruction file:

```md
## Completion claims

- Use Verify Completion before declaring work complete, correct, verified,
  ready for handoff, ready to commit, or ready for a pull request.
```

This recommendation preserves existing controls: it does not grant authority to
write, commit, push, deploy, alter configuration, or skip an applicable gate.

## Use cases

| Scenario                                                          | How the plugin helps                                                                                                  | Expected result                                                               |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| A feature's tests are green and a handoff is about to be written. | Separates the required outcome from test success and reviews relevant false-positive vectors.                         | An evidence-backed completion summary or a clearly reported verification gap. |
| A change needs a commit or pull request.                          | Requires the applicable repository controls, artifacts, and negative cases to be identified before a readiness claim. | A readiness statement grounded in commands, diffs, and project controls.      |
| A consumer contract was changed.                                  | Requires verification that the receiving side rejects missing or malformed inputs where a counterpart exists.         | Positive and negative contract evidence.                                      |

**Not a fit when:** ordinary implementation, a casual progress update, or
exploratory delegation does not make a completion or correctness conclusion.

## Purpose

- Make completion claims traceable to their stated acceptance criteria.
- Require outcome, enforcement, and negative-path evidence alongside green
  commands.
- Preserve authority boundaries while making verification reviewable.

## Included components

| Component                                                     | Purpose                                                              |
| ------------------------------------------------------------- | -------------------------------------------------------------------- |
| [Plugin manifest](plugin.json)                                | Portable identity and public interface metadata.                     |
| [Verification skill](skills/verify-completion/SKILL.md)       | The authoritative six-gate workflow and completion-summary contract. |
| [Skill metadata](skills/verify-completion/agents/openai.yaml) | Codex-facing presentation and implicit invocation policy.            |
| [Changelog](CHANGELOG.md)                                     | User-facing package history.                                         |
| [License](LICENSE.md)                                         | MIT terms.                                                           |

## Supported environments

| Requirement   | Supported behavior                                                                           |
| ------------- | -------------------------------------------------------------------------------------------- |
| Codex surface | Hosts that support installed Codex skills and explicit skill invocation.                     |
| Runtime/tools | No package runtime dependency; the target project supplies applicable verification commands. |
| Project types | Any project or operational task with stated completion criteria.                             |
| Credentials   | None.                                                                                        |
| Network       | Not used by the plugin itself.                                                               |
| Last verified | 2026-09-12 against the repository marketplace contract.                                      |

The target project's instructions, controls, tooling, and user authorization
remain authoritative.

## Behavior and boundaries

## Inputs and outputs

**Inputs:** a stated requirement or acceptance criteria; relevant artifacts,
commands, contracts, controls, tests, logs, diffs, and authority boundaries.

**Outputs:** an applicability inventory, evidence for each applicable gate,
clearly stated failures or limitations, and — only when justified — a concise
verification summary supporting a completion claim.

## Required tools and credentials

No tool, credential, network service, hook, script, MCP server, or application
is bundled. The skill selects verification appropriate to the target project;
it must not install or substitute tools without separate authorization.

## Permissions

| Access or effect | What the plugin may do                                                         |
| ---------------- | ------------------------------------------------------------------------------ |
| Read             | Inspect user-authorized requirements, artifacts, diffs, outputs, and controls. |
| Write            | None during installation; any later write remains separately authorized.       |
| Process          | Suggest or run only commands authorized for the active task.                   |
| Network          | Not used by the plugin itself.                                                 |
| Authentication   | Not required.                                                                  |

## Side effects

Installation changes Codex-managed plugin state only. The plugin does not
modify a target project, install dependencies, register hooks, trust a hook,
start a process, send network traffic, or configure credentials.

## Human approval boundaries

Verification is not permission. The skill must pause the dependent action when
the task lacks authority, required evidence, a prerequisite tool, or an
applicable control. A user must separately approve consequential writes,
commits, pushes, pull requests, deployments, configuration changes, and remote
operations.

## Installation behavior

Installation adds the skill to Codex-managed plugin state. It does not alter
the working directory, repository files, lockfiles, system configuration,
project configuration, or any target environment.

## Uninstall and rollback behavior

Refresh the marketplace when needed:

```bash
codex plugin marketplace upgrade codex-essentials
codex plugin list
```

Remove only this plugin:

```bash
codex plugin remove verify-completion@codex-essentials
```

Removal stops future skill availability but does not delete user-created
evidence, reverse prior authorized actions, or modify target-project history.
Use the target project's own recovery mechanisms for those actions.

## Verification

Maintainers run the repository checks from the marketplace root:

```bash
npm run marketplace:check
npm run check
```

Consumer smoke test: in a new Codex conversation, ask for a verification before
claiming a task complete. Confirm that the skill requests the requirement,
applicability inventory, positive and negative evidence, and a gate-by-gate
summary; then ask for an ordinary implementation task and confirm that no
completion claim is being evaluated solely from that wording.

## Known limitations

- The skill cannot manufacture missing acceptance criteria, consumer behavior,
  negative cases, or command output.
- Applicability depends on the actual task: a documentation-only conclusion may
  have no runtime counterpart, while a changed integration normally does.
- The skill improves the quality of a conclusion but cannot prove unobserved
  external state or override target-project governance.

## Failure and recovery

If a gate fails, evidence is unavailable, or an authority boundary is missing,
the skill must report the gap and avoid the completion claim. Repair the
underlying issue only when authorized, then repeat every applicable gate from
the beginning. Do not weaken a test, control, or hook merely to obtain a
passing result.

## FAQ

<details>
<summary>Does installing Verify Completion modify my repository?</summary>

No. Installation changes only Codex-managed plugin state. Any target-project
read, command, or write remains governed by the active task and its user
authorization.
</details>

<details>
<summary>Does the plugin automatically run tests or create a pull request?</summary>

No. It contains no hook, script, MCP server, or external automation. It
structures verification when a completion conclusion is being considered.
</details>

<details>
<summary>Can a gate be skipped?</summary>

Only when it is demonstrably inapplicable to the stated requirement. The final
verification summary must name the excluded gate and explain why it did not
apply.
</details>

## Documentation and support

- [Verification skill](skills/verify-completion/SKILL.md)
- [Changelog](CHANGELOG.md)
- [Codex Essentials marketplace](../../README.md)
- [Issues](https://github.com/nerymurillohnd/codex-essentials/issues)
- [License](LICENSE.md)

Verify Completion is an independent community plugin and is not affiliated with
or endorsed by OpenAI.

## License

MIT. See [LICENSE.md](LICENSE.md).
