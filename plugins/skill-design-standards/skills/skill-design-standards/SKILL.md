---
name: skill-design-standards
description:
  Use when creating, reviewing, improving, or evaluating an Agent Skill or Codex
  skill, including SKILL.md structure, supporting resources, agents/openai.yaml,
  invocation descriptions, scripts, and behavioral evidence.
---

# Skill Design Standards

Ground a skill in the user's actual task and target host. Inspect the existing
skill, its resources, callers, local instructions, and realistic user requests
before changing it. An audit is read-only; a request to create or edit a skill
authorizes that scoped work, not publication, installation, or unrelated
configuration.

Separate three classes of finding:

1. **Portable format:** Read [format](references/format.md) for Agent Skills
   frontmatter, directory names, and progressive disclosure.
2. **Host/package contract:** Read [Codex metadata](references/codex.md) when
   `agents/openai.yaml`, invocation policy, MCP dependency declarations, or
   plugin packaging are involved.
3. **Design quality:** Ask whether an instruction changes agent decisions or
   outcomes. Keep one coherent job per skill, route conditional detail to
   directly linked references, and remove generic policy repetition.

Read [descriptions](references/descriptions.md) when a skill misses relevant
requests or activates on nearby irrelevant ones. Read
[scripts](references/scripts.md) when adding or changing an executable helper.
Read [validation](references/validation.md) before claiming a skill is valid.
Read [evaluation](references/evaluation.md) for systematic output-quality
comparisons; activation and task quality are different measurements.

Keep the `SKILL.md` entrypoint as short as useful without losing non-obvious
operating constraints. State inputs, decisions, output, missing-input handling,
and real failure boundaries. Add resources only when they improve a repeated
mechanic or conditional knowledge path. Preserve the user's authorization and
the target host's actual requirements; a tool mention is not a dependency or
permission grant.

Validate format, resource links, host metadata, and the consuming host's
behavior separately. A passing parser does not prove that the skill was
discovered, invoked at the right time, or useful. For a changed workflow, try a
realistic matching request and a near-miss; inspect resulting artifacts and
trace when available. Report what ran, what failed, and what remains
unobservable instead of upgrading an assumption to a pass.
