# 🔁 Automatic PR Lifecycle

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[← Back to Codex Essentials](../../README.md)

> Shepherd protected pull requests from local scope through verified merge or an evidenced blocker.

**Explore:** [Install](#-quick-start) · [Purpose](#-purpose) ·
[Environments](#supported-environments) · [Safety](#-behavior-and-boundaries) ·
[Docs](#-documentation-and-support)

Automatic PR Lifecycle is a GitHub MCP-first Codex plugin for taking pull
requests through scope, local validation, commit, push, PR creation, CI and
review repair, exact-head readiness, explicit landing confirmation, merge
observation, cleanup, and final reporting. It uses `gh` or `gh api` only as a
scoped fallback and never bypasses hooks, branch protection, required checks,
reviews, merge queues, or landing approval.

The current plugin version is recorded in `plugin.json`. Install the package
from the repository's `main` catalog.

> [!CAUTION]
> A landing mutation always requires explicit confirmation for the exact PR and
> current head SHA; installation itself does not modify a target repository.

## ⚡ Quick start

Add the marketplace and install the plugin:

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add automatic-pr-lifecycle@codex-essentials
codex plugin list
```

Then ask Codex:

```text
Use $automatic-pr-lifecycle to take this pull request through its protected lifecycle and report the verified terminal state.
```

Connect GitHub MCP before use when available. Keep an authenticated `gh` CLI
session only when the environment needs the documented fallback.

## 🎯 Use cases

| Scenario                                         | How this plugin helps                                                               | Expected result                                                        |
| ------------------------------------------------ | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| A feature branch needs a complete PR workflow.   | Coordinates local checks and GitHub MCP operations through protected landing.       | A merged PR or an evidenced blocker.                                   |
| CI or review feedback arrives after PR creation. | Reconciles the current head and repairs one validated actionable state at a time.   | Updated commits, checks, and review evidence for the new head.         |
| A PR is ready but landing policy is sensitive.   | Re-reads every gate, binds confirmation to the exact head, and observes the result. | A verified merge, ready-without-approval state, or documented blocker. |

**Not a fit when:** the task is only a local Git change, a casual status
question, or an operation intended to bypass repository controls.

## 🎯 Purpose

- Keep local Git validation and GitHub PR state coordinated.
- Make GitHub MCP the primary interface for PR operations.
- Repair CI, conflict, and review failures without masking them.
- Bind landing confirmation to the exact current head SHA.
- Reconcile external state before retries and completion claims.

## 🧰 Included components

| Component                                                                                              | Purpose                                                                                      |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| [`plugin.json`](plugin.json)                                                                           | Portable plugin identity, version, and public interface metadata.                            |
| [`skills/automatic-pr-lifecycle/SKILL.md`](skills/automatic-pr-lifecycle/SKILL.md)                     | Authoritative lifecycle, MCP routing, state reconciliation, approval, and fallback contract. |
| [`skills/automatic-pr-lifecycle/agents/openai.yaml`](skills/automatic-pr-lifecycle/agents/openai.yaml) | Codex-facing skill label, prompt, and implicit invocation policy.                            |
| [`CHANGELOG.md`](CHANGELOG.md)                                                                         | User-facing package history.                                                                 |
| [`LICENSE.md`](LICENSE.md)                                                                             | MIT license terms.                                                                           |

The plugin intentionally bundles no scripts, hooks, MCP server, app, or
background process.

## 🖥️ Requirements and compatibility

## Supported environments

| Requirement   | Supported value or behavior                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| Codex surface | Hosts that support installed skills and the required GitHub MCP tools.                                 |
| Runtime/tools | Local Git plus GitHub MCP; authenticated `gh` is an optional per-action fallback.                      |
| Project types | Git repositories with GitHub pull requests and repository-level validation controls.                   |
| Credentials   | An authenticated GitHub MCP connection or fallback `gh` session with task-scoped permissions.          |
| Network       | Required for GitHub state, CI, reviews, comments, and landing operations.                              |
| Last verified | `2026-09-12` against the Codex Essentials marketplace contract and official Codex Hooks documentation. |

The target repository's instructions, protections, required checks, merge
policy, credentials, and current GitHub behavior remain authoritative.

## 🔐 Behavior and boundaries

## Inputs and outputs

**Inputs:** a user-authorized PR task; repository instructions; local Git state;
validation commands; GitHub repository, PR, checks, reviews, threads, comments,
merge policy, auto-merge, and merge-queue state.

**Outputs:** local validation evidence; commits and pushed SHAs when authorized;
PR metadata and review actions; an active lifecycle record; exact-head readiness
and landing evidence; and a final state of `merged`,
`ready-without-approval`, `external-auto-merge`, or `blocked`.

## Required tools and credentials

The skill explicitly identifies GitHub MCP tools for repository discovery, PR
inspection and creation, labels, checks, workflow logs, reviews, review threads,
comments, replies, resolutions, auto-merge, and landing.

When GitHub MCP is unavailable or lacks one required operation, use `gh` for
the equivalent normal GitHub operation or `gh api` for the required REST or
GraphQL endpoint. Reconcile current state before and after the fallback.

No credential, token, secret, executable, MCP server, or hook is bundled.

## Permissions

| Access or effect | What the plugin may do                                                                                                        |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Read             | Inspect task-scoped local Git state and GitHub repositories, PRs, diffs, checks, reviews, threads, policies, and merge state. |
| Write            | Create task-scoped commits, pushes, PR metadata, labels, replies, resolutions, or landing requests only when authorized.      |
| Process          | Run validation and local Git commands already authorized by the active task.                                                  |
| Network          | Contact GitHub through the connected GitHub MCP or the scoped CLI fallback.                                                   |
| Authentication   | Reuse an existing authenticated GitHub MCP or `gh` session without reading or embedding plaintext credentials.                |

## Side effects

Installation changes Codex-managed plugin state only. It does not modify a
repository, working tree, lockfile, system configuration, Git hooks, Codex
hooks, GitHub settings, or credentials.

When invoked for an authorized task, the skill may coordinate commits, pushes,
PR creation, labels, review replies, thread resolution, CI reruns, and a
protected landing request. Every effect remains constrained by the active task
and repository policy.

## Human approval boundaries

Routine inspection, validation, monitoring, diagnosis, and repair may proceed
when authorized by the task and repository instructions. Other Git and GitHub
writes require the authority established by that task and policy.

The final landing mutation always requires explicit per-PR confirmation for the
current head SHA. Any push, head change, policy change, readiness change, or
uncertain remote result invalidates the previous landing record.

The plugin never uses admin privileges, force-push, `--no-verify`, protection
bypasses, or weakened checks to force progress.

## Installation behavior

Installation adds only the skill and its presentation metadata to
Codex-managed plugin state. It does not install GitHub MCP, `gh`, credentials,
scripts, hooks, or project configuration.

## Hook behavior

The plugin does not bundle hooks. Official Codex behavior makes MCP tool hooks
useful as optional guardrails, but they reuse an existing MCP connection and do
not block when the server or tool is unavailable. Background command hooks
cannot block, approve, rewrite, or continue the triggering operation.

See the official [Codex Hooks documentation](https://learn.chatgpt.com/docs/hooks)
before designing any later consumer-owned hook.

## 🔁 Uninstall and rollback behavior

Refresh the configured marketplace:

```bash
codex plugin marketplace upgrade codex-essentials
codex plugin list
```

Remove only this plugin:

```bash
codex plugin remove automatic-pr-lifecycle@codex-essentials
```

Removal stops future skill availability but does not revert commits, branches,
PR comments, labels, review resolutions, landing requests, or merged history
created by an authorized task. Use the target repository's normal Git and
GitHub recovery mechanisms for those operations.

## ✅ Verification

Maintainers run the canonical marketplace checks from the repository root:

```bash
npm run marketplace:check
npm run marketplace:test
npm run check
```

Consumer smoke test:

1. Start a new Codex conversation with the plugin installed.
2. Ask the skill to inspect an authorized open PR without mutating it.
3. Confirm that GitHub MCP is selected before `gh`.
4. Confirm that the response records the current head SHA and every readiness gate.
5. Ask for landing and confirm that the skill requests exact-head approval before mutation.
6. Simulate a head change and confirm that the prior approval is rejected as stale.

## 🚧 Known limitations

- GitHub MCP availability and tool coverage depend on the active session.
- The skill has no independent watcher, cursor, NDJSON ledger, or background process.
- Polling continues only while the active Codex task continues.
- State normalization is an agent contract rather than a bundled executable predicate.
- The skill cannot prove GitHub state that the active credentials cannot read.
- Merge-queue operations may require a scoped `gh` or `gh api` fallback when MCP lacks an equivalent tool.

## Failure and recovery

When an MCP action fails or returns an uncertain result, do not infer that the
GitHub action failed. Re-read the repository and PR, compare the current head
SHA, and inspect the affected comments, labels, reviews, checks, or landing
state before retrying.

When the normalized state is `actionable`, repair the reported conflict, CI
failure, review issue, or base condition, then validate, commit, push, and
re-read all state against the new head. When it is `blocked`, preserve the
evidence and escalate only the actual permission, policy, scope, or external
state blocker.

Never use the fallback to bypass branch protection, required checks, reviews,
merge queues, hooks, or exact-head confirmation.

## ❓ FAQ

<details>
<summary>Does installing this plugin modify the target project?</summary>

No. Installation changes only Codex-managed plugin state and does not modify
repositories, credentials, hooks, or project configuration.
</details>

<details>
<summary>Does the plugin include a GitHub MCP server?</summary>

No. It routes to GitHub MCP tools already connected in the consumer's session.
</details>

<details>
<summary>Does the plugin include scripts or hooks?</summary>

No. The lifecycle is implemented as a skill contract. GitHub MCP is primary,
and `gh` or `gh api` is used only as a reconciled per-action fallback.
</details>

<details>
<summary>Can it merge a PR automatically?</summary>

Only after the repository is ready and the user explicitly confirms the exact
PR and head SHA. Auto-merge enrollment or a queue request is not reported as
merged until current GitHub evidence confirms the authorized head was merged.
</details>

<details>
<summary>Can hooks make the MCP-only lifecycle autonomous?</summary>

Not by themselves. Background hooks cannot control the triggering operation,
and an MCP tool hook invokes one connected tool rather than orchestrating the
full multi-step PR state machine.
</details>

## 📚 Documentation and support

- [Authoritative lifecycle skill](skills/automatic-pr-lifecycle/SKILL.md)
- [Official Codex Hooks documentation](https://learn.chatgpt.com/docs/hooks)
- [Changelog](CHANGELOG.md)
- [Codex Essentials marketplace](../../README.md)
- [Issues](https://github.com/nerymurillohnd/codex-essentials/issues)
- [License](LICENSE.md)

Automatic PR Lifecycle is an independent community plugin and is not
affiliated with or endorsed by OpenAI.

## 📄 License

MIT. See [LICENSE.md](LICENSE.md).
