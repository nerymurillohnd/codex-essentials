---
name: skill-design-standards
description: Design, audit, or improve Agent Skills and Codex skills, including plugin-bundled skills. Use when reviewing or changing SKILL.md structure, workflow instructions, supporting resources, or agents/openai.yaml.
---

# Skill Design Standards

Use this standard to make skills discoverable, focused, portable, and verifiable.
Apply it with `skill-creator` for authoring when available. Use specialized plugin
creation or lifecycle skills only when the requested task includes that work.
An audit alone does not authorize edits, installation, or publication.

## Establish the contract

Read the target skill and applicable local instructions before changing it. Identify
the user goal, intended host, essential inputs, expected output, and existing resources.
Preserve the requested location, supported metadata, invocation policy, and unrelated work.
Ask only when missing information materially blocks correct completion.

Separate three kinds of findings:

- **Format requirements:** Check [format rules](references/format.md) for frontmatter,
  naming, directory structure, and portability.
- **Design recommendations:** Apply the workflow below in proportion to the task.
  Recommendations are not parser requirements.
- **Host or package requirements:** Read [Codex configuration](references/codex.md)
  when working on `agents/openai.yaml`, invocation, MCP dependencies, or Codex packaging.
  Identify the actual consuming host or repository gate before imposing its rules.

When refreshing external standards, fetch the [documentation index](https://agentskills.io/llms.txt)
first, then open only the relevant pages. Distinguish verified requirements from
local conventions and unresolved host compatibility.

## Design the workflow

1. Anchor the skill in a concrete request and observable result. For broader changes,
   include representative matching and nearby non-matching requests; do not demand
   an arbitrary number of examples for a narrow edit.
2. Write a concise description stating the capability and when to use it. Front-load
   useful trigger words. Add exclusions only to prevent plausible misrouting.
   Read [description evaluation](references/descriptions.md) when refining activation
   boundaries, investigating missed or unwanted triggers, or measuring trigger accuracy.
3. Keep one coherent job per skill. Use references for conditional detail; split
   skills when triggers, operations, or boundaries materially differ.
4. Write direct instructions with the inputs, decisions, and outputs the task needs.
   Preserve non-obvious invariants. Specify exact tools or ordering where correctness
   depends on them; leave reasonable implementation choices open elsewhere.
5. Define missing-input handling, evidence limits, stopping conditions, and bounded
   retries where relevant. Carry forward existing authorization. Pause only the
   dependent action when authorization is missing; continue independent permitted work.
   Route out-of-scope work appropriately instead of treating scope mismatch as refusal.
6. Keep shared instructions in `SKILL.md`. Read supporting files only for the branch
   that needs them. Link references directly and explain when to read them. Document
   how scripts and assets are invoked or consumed; inspect callers before removal.
7. Add resources only when they improve execution: references for conditional knowledge,
   assets for reusable output resources, and scripts for repeated mechanics or reliable
   tool operations. Document script inputs, dependencies, results, and failure behavior.
   Read [script design](references/scripts.md) when adding or reviewing executable
   helpers or one-off commands; apply relevant script-engineering guidance if available.
8. Preserve essential safety and completion checks without adding generic ask, stop,
   decline, or output-template sections to every skill. Do not duplicate host policy,
   specialized skill procedures, or manuals that do not change the agent's decisions.

## Validate the result

Use [validation guidance](references/validation.md) for commands, validator limits,
and behavioral checks. Verify the changed files, resource paths, and actual consumer
contract. Treat successful parsing as evidence of format validity only.

Read [output-quality evaluation](references/evaluation.md) when measuring task
quality, comparing skill versions, or running systematic improvement iterations.
Keep those evaluations separate from implicit-trigger measurements.

Exercise relevant positive and negative cases when testing a gate or workflow change.
Inspect failures and skipped paths before accepting a green result. For substantial
or risky revisions, use an independent behavioral evaluation when delegation is
available and authorized; inspect its evidence before accepting its conclusions.

## Deliver

For an audit, report actionable findings with location, evidence, impact, and the
requirement or recommendation involved. For edits, provide the changed file links,
important decisions, validation evidence, and remaining limitations. Return complete
file contents when requested or when files cannot be delivered directly.

Explicitly mark applicable completion checks as passed, failed, or not applicable:
format, resource integrity, host configuration, behavioral validation, and scope
preservation. Do not claim runtime discovery or correct invocation without observing it.
