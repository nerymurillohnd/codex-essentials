# Prompt Architect Skill Package

A governed prompt-authoring skill that converts vague intent into risk-calibrated, verifiable prompts while dynamically validating current model/tool guidance when relevant.

## Core design

- `SKILL.md` is the control plane and orchestration contract.
- `references/` contains normative procedures and domain rules.
- `templates/` contains density-calibrated prompt shells.
- `examples/` calibrates behavior and boundaries.
- `source/prompt-editor.md` preserves the original long-form canon supplied by the user.
- `tests/` contains pressure scenarios; `scripts/validate_skill.py` performs structural checks.

## Install

Copy the `prompt-architect/` directory into a skills directory recognized by your runtime. Cross-runtime agent environments commonly recognize `~/.agents/skills/`.

## Invocation examples

- “Use prompt-architect to write a Codex prompt for recovering this repository.”
- “Audit this prompt and make it production-grade.”
- “Help me turn this vague goal into the right agent prompt.”

The skill deliberately does **not** hard-code current model capability claims as permanent truth. It validates volatile facts against current official sources when they materially affect the prompt or execution recommendation.
