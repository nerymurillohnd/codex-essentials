# Automatic PR Lifecycle

Automatic PR Lifecycle coordinates a user-authorized GitHub pull request from
local scope through required checks, review repair, protected merge, and local
synchronization. Its state is tied to the current PR head SHA, so a new push
requires new check and review evidence.

## Install and use

```sh
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add automatic-pr-lifecycle@codex-essentials
```

Ask:
`Use $automatic-pr-lifecycle to take this PR through its normal protected merge and verify the final state.`
The package contains one [skill](skills/automatic-pr-lifecycle/SKILL.md) and
[Codex presentation metadata](skills/automatic-pr-lifecycle/agents/openai.yaml).
It bundles no GitHub MCP server, script, hook, or credential.

## Inputs and result

Provide the repository and authorized change or PR. The skill inspects local Git
state, repository instructions, branch rules, CI, review threads, and the
current head SHA. It can validate, commit, push, create or update the PR, repair
task-related failures, reply to reviews, merge through the normal protected
path, and sync local `main`. It reports the PR URL, final SHAs, checks, review
state, merge outcome, cleanup, and any blocker.

GitHub MCP is the preferred remote interface when callable; an authenticated
`gh` CLI is a scoped fallback for a missing operation. Local Git and the target
repository's own quality tools are required. The plugin supplies no credentials
and does not configure GitHub access.

## Authority and side effects

Installation changes Codex-managed plugin state only. During an authorized PR
task, the workflow may create commits and branches, push normally, write PR
metadata, respond to review threads, request a protected merge, and remove a
verified merged task branch. It preserves unrelated user changes.

An explicit instruction to create or finish the PR authorizes that normal
lifecycle without repeated approval prompts. It does not authorize production
deployment, unrelated cleanup, credential changes, force push, admin override,
or weakened hooks and checks. A head or policy change triggers revalidation; an
uncertain remote result triggers a read before any retry.

## Update, removal, and recovery

```sh
codex plugin marketplace upgrade codex-essentials
codex plugin add automatic-pr-lifecycle@codex-essentials
codex plugin list --json
codex plugin remove automatic-pr-lifecycle@codex-essentials
```

This clean-history package begins at `0.1.0`; explicitly reinstall after
refreshing the Git marketplace if an older cached version remains. Start a new
session to inspect current capabilities. Removing the plugin cannot undo a
commit, PR comment, label, merge, or branch deletion performed earlier; use the
target repository's recovery process and GitHub audit trail.

## Maintainer verification

Run `npm run check` and install the package in a clean Codex home. In a
read-only PR scenario, confirm the skill identifies the head SHA and required
checks. In an authorized repair scenario, a pushed fix must invalidate prior
readiness evidence. The workflow must refuse force push and admin bypass, and
must not report queue enrollment as a completed merge.

See the [changelog](CHANGELOG.md) and [MIT license](LICENSE.md). This is an
independent community plugin, not an OpenAI or GitHub product.
