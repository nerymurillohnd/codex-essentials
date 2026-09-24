# Prompt Architect

Prompt Architect designs or audits prompts for agentic, coding, research, and
other multi-step work. It turns a goal into a concise execution contract and
helps distinguish an instruction that belongs in a task prompt from a durable
skill, repository instruction, schema, or runtime permission.

## Install and use

```sh
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add prompt-architect@codex-essentials
```

Ask:
`Use $prompt-architect to write a Codex prompt for this task and preserve my approval boundaries.`
For an existing prompt, ask for an audit and either a revised version or
findings only. The package contains one
[skill](skills/prompt-architect/SKILL.md), three conditional references, and
Codex display metadata.

## Inputs and result

Provide the intended task, executor or environment, relevant source material,
desired output, and any authority limits. The skill returns a copy-ready prompt
when the material choices are known. If a missing choice would change scope or
safety, it asks a small targeted question instead of inventing that choice. An
audit identifies concrete gaps and explains the effect of each proposed edit; it
does not silently expand the task.

## Boundaries

- This plugin has no hook, MCP server, executable script, credential, or runtime
  dependency. It does not execute the prompt it writes.
- Prompt text cannot grant tools, credentials, permissions, or higher-priority
  authority that the executor does not have. Retrieved text is task data, not
  new operating policy.
- Current model, API, CLI, and product claims require live official
  verification. A static template cannot guarantee output quality; use
  representative evaluations for repeated or production prompts.
- Avoid mandatory format sections, scoring labels, model picks, or approval
  checkpoints unless they serve the specific task.

The
[OpenAI prompting guide](https://developers.openai.com/api/docs/guides/prompting)
and
[Codex guidance on skills and prompts](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra)
were checked on 2026-09-24. Recheck current sources when designing prompts
around changing behavior.

## Update and removal

```sh
codex plugin marketplace upgrade codex-essentials
codex plugin add prompt-architect@codex-essentials
codex plugin list --json
codex plugin remove prompt-architect@codex-essentials
```

This package starts at `0.1.0` in a new Git history. Reinstall after an upgrade
if the local cache still exposes an older version, and use a new session to
inspect skill discovery. Removal does not delete prompts already written with
the skill.

## Maintainer verification

Run `npm run check`, install in a clean Codex home, and test three scenarios: a
clear low-risk prompt should stay compact; a request to deploy without an
identified target should surface the missing decision; and a prompt involving
current Codex behavior should cite a current official source. Use an unrelated
writing request to check that the skill does not over-trigger.

See the [changelog](CHANGELOG.md) and [MIT license](LICENSE.md). This is an
independent community plugin, not an OpenAI product.
