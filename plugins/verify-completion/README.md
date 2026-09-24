# Verify Completion

Verify Completion is a Codex skill for a task that is about to be described as
complete, correct, verified, or ready. It checks the actual acceptance criteria
and reports the evidence and gaps behind that conclusion. It does not authorize
an action or replace a project's own quality gate.

## Install and use

```sh
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add verify-completion@codex-essentials
```

Then ask:
`Use $verify-completion to check the evidence before I call this work complete.`
The package contains one skill at
[`skills/verify-completion/SKILL.md`](skills/verify-completion/SKILL.md) and
Codex presentation metadata at
[`skills/verify-completion/agents/openai.yaml`](skills/verify-completion/agents/openai.yaml).

## Inputs and result

Give Codex the stated requirement and access to the relevant files, tests, logs,
check runs, artifacts, or external state. The skill identifies the exact claim,
checks the real outcome and relevant receiving and failure paths, then returns
either an evidence-backed completion summary or a specific verification gap. It
may exclude a check only when that check does not apply to the stated
requirement and the reason is recorded.

## Requirements and boundaries

- Supported host: Codex clients that load installed Agent Skills. The skill
  needs no bundled runtime, MCP server, hook, API key, or network service.
- Installation changes Codex-managed plugin state only. It does not alter a
  consumer repository or enable a hook.
- The skill can read user-authorized evidence and run checks already authorized
  for the active task. Verification does not grant authority to commit, push,
  merge, publish, deploy, change configuration, or contact another person.
- A green formatter, test, or CI badge does not prove an untested runtime path
  or a different SHA. Missing evidence is reported rather than fabricated.

## Update, removal, and recovery

```sh
codex plugin marketplace upgrade codex-essentials
codex plugin add verify-completion@codex-essentials
codex plugin list --json
codex plugin remove verify-completion@codex-essentials
```

This clean-history package begins at `0.1.0`. If an older installation shows a
higher version from the former marketplace history, refresh the Git marketplace
and explicitly reinstall this plugin. Start a new Codex session to verify that
the current skill is available. Removal does not reverse earlier user work.

If a verification check fails or cannot run, resolve the cause within the active
task's authority and repeat the affected checks. The skill must not soften a
control to make a completion claim possible.

## Maintainer verification

From the marketplace root, run `npm run check` and a clean Codex installation
smoke test. A realistic matching prompt should produce an evidence inventory and
a clear pass or gap; a nearby progress-only prompt should not trigger a
completion audit. Structural validation alone does not prove invocation quality.

See the [changelog](CHANGELOG.md) and [MIT license](LICENSE.md). This is an
independent community plugin, not an OpenAI product.
