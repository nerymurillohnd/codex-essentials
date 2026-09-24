# Skill Design Standards

Skill Design Standards helps authors create, review, and evaluate Agent Skills
without confusing the portable format with Codex-specific metadata or local
repository policy. It separates discovery, invocation, and the quality of the
resulting work.

## Install and use

```sh
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add skill-design-standards@codex-essentials
```

Ask: `Use $skill-design-standards to audit this SKILL.md without editing it.`
The package contains one [skill](skills/skill-design-standards/SKILL.md),
[Codex metadata](skills/skill-design-standards/agents/openai.yaml), and six
conditional references for format, Codex configuration, scripts, descriptions,
validation, and evaluation.

## Inputs and result

Supply the skill directory or content, intended user request, target host,
relevant project instructions, and optional scenarios or evaluation artifacts.
An audit returns location-specific format errors, host constraints, and design
recommendations with evidence. An authorized edit returns a focused skill and
resource changes. A benchmark is reported only when comparable runs and outcomes
were actually observed.

## Requirements and boundaries

- Supported host: Codex clients that load Agent Skills. The plugin bundles no
  hook, script, MCP server, credential, or runtime dependency.
- Installation changes Codex-managed plugin state only. Audits do not edit;
  authoring changes stay within the user's requested skill and resources.
- `agents/openai.yaml` is optional Codex metadata, not a base Agent Skills
  requirement. Invocation policy and tool dependencies describe host behavior;
  they do not grant mutation authority.
- An external validator can verify syntax and naming but cannot prove runtime
  discovery or reliable task completion. Missing or conflicting host evidence
  must be reported.

The [Agent Skills specification](https://agentskills.io/specification) and
[OpenAI skill metadata guidance](https://learn.chatgpt.com/docs/build-skills#optional-metadata)
were consulted on 2026-09-24. Recheck current sources when a requirement may
have changed.

## Update and removal

```sh
codex plugin marketplace upgrade codex-essentials
codex plugin add skill-design-standards@codex-essentials
codex plugin list --json
codex plugin remove skill-design-standards@codex-essentials
```

This clean-history package begins at `0.1.0`; refresh and explicitly reinstall
if an older cached version remains. Start a new session to verify current skill
discovery. Removing the plugin does not revert authored skill edits or
evaluation artifacts.

## Maintainer verification

Run `npm run check` and install in a clean Codex home. Audit a valid skill
without modifying it, then an invalid name with consecutive hyphens; confirm the
response distinguishes base-format failure from optional Codex metadata. Use a
nearby unrelated task to examine over-triggering. Do not claim an
implicit-trigger rate without a trace that shows actual skill loading.

See the [changelog](CHANGELOG.md) and [MIT license](LICENSE.md). This is an
independent community plugin, not an OpenAI or Agent Skills product.
