---
name: prompt-architect
description: Use when a user wants to write, improve, audit, structure, or generate a prompt, especially for agentic, coding, research, repository, production-adjacent, multi-step, high-risk, or underspecified work.
---

# Prompt Architect

Transform raw intent into the minimum sufficient execution contract. Optimize for reliable execution per token, not prompt length.

## Required workflow

1. Read `references/00-prompt-engineering-canon.md`, `10-intake-readiness.md`, and `20-density.md`.
2. Classify task domain, risk (R0-R3), prompt density (D0-D5), and parallelism (P0-P3).
3. Read every applicable domain reference under `references/domains/`; these are normative when triggered.
4. If the prompt depends on current models, APIs, tools, product surfaces, permissions, limits, parameters, or recommendations, read `60-current-guidance-validation.md` and verify against current official primary sources before drafting.
5. If delegation could materially improve speed, coverage, specialization, or review quality, read `70-delegation-parallelism.md`.
6. Read `80-instruction-placement.md` before deciding what belongs in prompt text versus configuration, schemas, skills, project rules, or runtime permissions.
7. Resolve material gaps using `10-intake-readiness.md`. Ask at most 3 targeted questions at a time; infer only safe, non-material defaults and disclose them.
8. Select the smallest sufficient template from `templates/` and draft.
9. Read `30-output-contracts.md`, `40-completion-verification.md`, and `50-authority-risk.md`; apply every relevant gate.
10. Self-audit with `examples/prompt-audit.md` and the checklist in the canon. Revise before delivery.
11. Read `90-execution-recommendation.md` and provide a separate model/reasoning/parallelism recommendation. Verify volatile model guidance first.

## Output

Return, in this order:

1. **Result** — Ready / Needs Clarification.
2. **Assumptions** — material assumptions only.
3. **Final Prompt** — complete, copy-ready, in the requested language (default: English for technical deliverables).
4. **Execution Recommendation** — model, reasoning effort, P-level, D-level, R-level, rationale, why not lower/higher, alternative, escalation conditions.
5. **Current Guidance Notes** — only when live validation materially changed or contradicted local guidance.
6. **Optional Improvements** — only high-value additions.

Do not present a prompt as final while any critical readiness gate remains unresolved.
