---
name: prompt-architect
description: Use when writing, improving, auditing, structuring, or generating prompts for agentic, coding, research, repository, production-adjacent, multi-step, high-risk, or underspecified work.
---

# Prompt Architect

Transform raw intent into the minimum sufficient execution contract. Optimize for reliable execution per token, not prompt length.

## Workflow boundary

Use this skill when the user asks to write, improve, audit, structure, or generate a prompt for agentic, coding, research, repository, production-adjacent, multi-step, high-risk, or underspecified work.

Expected inputs are rough tasks, existing prompts, transcripts, source material, constraints, approval boundaries, target-environment notes, or the user's desired executor. Do not use this skill for a direct answer, literal rewrite, or ordinary explanation unless the user wants prompt design or prompt review.

The user should receive either focused clarification questions or a complete, copy-ready final prompt plus a separate execution recommendation. Do not infer material target, authority, source of truth, output, verification, destructive permission, current capability, or completion criteria when ambiguity would change safety or correctness.

Ask at most 3 targeted questions when material gaps remain. Stop or return Needs Clarification when a critical gate cannot be resolved from context. Decline requests that require unsafe, unauthorized, impossible, or unsupported prompt behavior.

This `SKILL.md` is the authoritative workflow and output contract. `references/` contains normative policies, background, domain rules, examples, and quality gates that must be read only when routed below. `assets/templates/` contains prompt shells to copy or adapt, not standalone instructions. The packaged Stop hook runs `scripts/validate-final-output.py` before delivery when hook support is available. This skill has no required MCP tools.

## Required workflow

Do not advance from one phase to the next until its gate passes. If a gate cannot pass, return Needs Clarification or stop instead of drafting around it.

1. Intake gate: read `references/00-prompt-engineering-canon.md`, `references/05-core-sections.md`, `references/10-intake-readiness.md`, and `references/20-density.md`; confirm target, output, authority, sources, and completion criteria are sufficient or ask for the missing material facts.
2. Classification gate: classify task domain, risk (R0-R3), prompt density (D0-D5), and parallelism (P0-P3).
3. Reference gate: read every applicable domain reference under `references/domains/`; if the prompt depends on current models, APIs, tools, product surfaces, permissions, limits, parameters, or recommendations, read `references/60-current-guidance-validation.md` and verify against current official primary sources before drafting.
4. Architecture gate: if delegation could materially improve speed, coverage, specialization, or review quality, read `references/70-delegation-parallelism.md`; read `references/80-instruction-placement.md` before deciding what belongs in prompt text versus configuration, schemas, skills, project rules, or runtime permissions.
5. Draft gate: resolve material gaps using `references/10-intake-readiness.md`; ask at most 3 targeted questions at a time; infer only safe, non-material defaults and disclose them; select the smallest sufficient template from `assets/templates/` and draft.
6. Verification gate: read `references/25-tool-use-rules.md`, `references/30-output-contracts.md`, `references/40-completion-verification.md`, `references/45-deviation-final-report.md`, and `references/50-authority-risk.md`; apply every relevant gate.
7. Delivery gate: self-audit with `references/95-assembly-quality-failures.md` and `references/examples/prompt-audit.md`; read `references/90-execution-recommendation.md`; if the destination is a long-running Codex task whose surface supports persistent goals, read `references/100-goal-tracking.md`.

## Output

Return, in this order:

1. **Result** — Ready / Needs Clarification.
2. **Assumptions** — material assumptions only.
3. **Clarification Questions** — only when the result is Needs Clarification; ask the smallest targeted set and omit Final Prompt.
4. **Final Prompt** — only when the result is Ready; complete, copy-ready, and in the requested language (default: English for technical deliverables).
5. **Execution Recommendation** — only when the result is Ready; model, reasoning effort, P-level, D-level, R-level, rationale, why not lower/higher, alternative, escalation conditions, and this exact compact evidence line: `Gate Evidence: intake=pass; classification=R#/D#/P#; references=pass; placement=pass; template=pass; output=pass; self-audit=pass`.
6. **Current Guidance Notes** — only when live validation materially changed or contradicted local guidance.
7. **Optional Improvements** — only high-value additions.

Before final delivery, verify that every applicable Required workflow step above was completed or explicitly determined N/A. Verify that the response follows this Output order exactly. If any critical workflow or output requirement is unmet, revise before delivery or return Needs Clarification. Do not present a prompt as final while any critical readiness gate remains unresolved.
