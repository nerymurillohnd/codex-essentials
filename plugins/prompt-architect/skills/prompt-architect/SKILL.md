---
name: prompt-architect
description: Use when writing, improving, auditing, structuring, or generating prompts for agentic, coding, research, repository, production-adjacent, multi-step, high-risk, or underspecified work.
---

# Prompt Architect

Transform raw intent into the minimum sufficient execution contract. Optimize for reliable execution per token, not prompt length.

## Required workflow

1. Read `references/00-prompt-engineering-canon.md`, `references/10-intake-readiness.md`, and `references/20-density.md`.
2. Classify task domain, risk (R0-R3), prompt density (D0-D5), and parallelism (P0-P3).
3. Read every applicable domain reference under `references/domains/`; these are normative when triggered.
4. If the prompt depends on current models, APIs, tools, product surfaces, permissions, limits, parameters, or recommendations, read `references/60-current-guidance-validation.md` and verify against current official primary sources before drafting.
5. If delegation could materially improve speed, coverage, specialization, or review quality, read `references/70-delegation-parallelism.md`.
6. Read `references/80-instruction-placement.md` before deciding what belongs in prompt text versus configuration, schemas, skills, project rules, or runtime permissions.
7. Resolve material gaps using `references/10-intake-readiness.md`. Ask at most 3 targeted questions at a time; infer only safe, non-material defaults and disclose them.
8. Select the smallest sufficient template from `templates/` and draft.
9. Read `references/30-output-contracts.md`, `references/40-completion-verification.md`, and `references/50-authority-risk.md`; apply every relevant gate.
10. Self-audit with `examples/prompt-audit.md` and the checklist in the canon. Revise before delivery.
11. Read `references/90-execution-recommendation.md` and provide a separate model/reasoning/parallelism recommendation. Verify volatile model guidance first.
12. If the destination is a long-running Codex task whose surface supports persistent goals, read `references/100-goal-tracking.md`. Include goal setup only when it materially improves completion tracking; otherwise use the completion-verification procedure.

## Output

Return, in this order:

1. **Result** — Ready / Needs Clarification.
2. **Assumptions** — material assumptions only.
3. **Clarification Questions** — only when the result is Needs Clarification; ask the smallest targeted set and omit Final Prompt.
4. **Final Prompt** — only when the result is Ready; complete, copy-ready, and in the requested language (default: English for technical deliverables).
5. **Execution Recommendation** — only when the result is Ready; model, reasoning effort, P-level, D-level, R-level, rationale, why not lower/higher, alternative, escalation conditions.
6. **Current Guidance Notes** — only when live validation materially changed or contradicted local guidance.
7. **Optional Improvements** — only high-value additions.

Do not present a prompt as final while any critical readiness gate remains unresolved.
