---
name: prompt-architect
description: Use when writing, improving, auditing, structuring, or generating prompts for agentic, coding, research, repository, production-adjacent, multi-step, high-risk, or underspecified work.
---

# Prompt Architect

Transform raw intent into the minimum sufficient execution contract. Optimize
for reliable execution per token, not prompt length.

## Use Condition

Use this skill when the user asks to write, improve, audit, structure, or generate a prompt for agentic, coding, research, repository, production-adjacent, multi-step, high-risk, or underspecified work.

Do not use this skill for a direct answer, literal rewrite, or ordinary explanation unless the user wants prompt design or prompt review.

## Inputs

Expected inputs are one or more of:

- rough task intent;
- an existing prompt to audit or revise;
- transcript or source material to convert into a prompt;
- constraints, approval boundaries, target environment, source-of-truth rules, or desired executor.

Proceed when the target, output, authority, and success criteria can be safely
resolved from the request or context. Ask at most 3 targeted questions when a
missing answer would materially change safety, correctness, scope, or output.

Do not infer material target, authority, source of truth, destructive permission,
current capability, or completion criteria when ambiguity would change safety or
correctness. Infer only safe, non-material defaults and disclose them.

## Required workflow

Load supporting files only when their routing condition applies. Do not load
every reference by default.

1. Classify the request: prompt-writing, prompt-improvement, prompt-audit, or
   prompt-to-execution-contract.
2. Confirm readiness: identify the target, executor, scope, authority, inputs,
   output, verification, stop conditions, risk level (R0-R3), density level
   (D0-D5), and parallelism level (P0-P3). Read
   `references/10-intake-readiness.md` when any material dimension is unclear.
3. Read `references/00-prompt-engineering-canon.md` for medium/high-risk work,
   reusable prompts, audits, or when the request lacks an execution-contract
   shape. For simple low-risk prompts, use the compact guidance in this
   `SKILL.md`.
4. Select the smallest sufficient prompt structure. Read
   `references/20-density.md` when density is unclear. Read
   `references/05-core-sections.md` when the prompt needs explicit role,
   mission, scope, authority, evidence, validation, or final-report sections.
5. Load only applicable domain references from `references/domains/`.
6. If the prompt depends on current models, APIs, tools, product surfaces,
   permissions, limits, parameters, pricing, availability, or recommendations,
   read `references/60-current-guidance-validation.md` and verify current
   official or primary sources before drafting.
7. If the executor may inspect files, run commands, browse, call APIs, use apps,
   query MCP tools, or consume retrieved content, read
   `references/25-tool-use-rules.md`.
8. If the task includes destructive, external, production, compliance,
   credential, money, or public-facing consequences, read
   `references/50-authority-risk.md`.
9. If delegation or parallel work could materially improve execution, read
   `references/70-delegation-parallelism.md`. Recommend subagents only when the
   destination surface supports them and independent workstreams justify the
   coordination cost.
10. Read `references/80-instruction-placement.md` before putting persistent
    policy, schema, configuration, permission, or tool-contract material inside
    prompt prose.
11. Choose the smallest applicable prompt shell from `assets/templates/` and
    adapt it. Remove unused headings and placeholders before delivery.
12. Read `references/30-output-contracts.md` when the required user-facing
    deliverable is unclear. Read `references/40-completion-verification.md` for
    agentic, repository, operational, or high-risk work. Read
    `references/45-deviation-final-report.md` when execution may diverge,
    partially complete, or require inspectable closure.
13. For prompt audits or final self-audit of medium/high-risk prompts, read
    `references/95-assembly-quality-failures.md`. Read
    `references/examples/prompt-audit.md` only when auditing an existing prompt.
14. Read `references/90-execution-recommendation.md` before recommending model,
    reasoning, density, risk, or parallelism settings. Read
    `references/100-goal-tracking.md` only when the destination is a long-running
    Codex task whose surface supports persistent goals.

## Support File Router

- `references/00-prompt-engineering-canon.md`: compact canon for
  execution-contract prompts, audits, and medium/high-risk work.
- `references/05-core-sections.md`: optional section patterns for role,
  operating mode, mission, success, context, scope, authority, workflow,
  verification, and reporting.
- `references/10-intake-readiness.md`: material gap detection and clarification
  policy.
- `references/20-density.md`: D0-D5 density selection and prompt-size control.
- `references/25-tool-use-rules.md`: tool, source-of-truth, untrusted-content,
  web, coding, and secrets rules.
- `references/30-output-contracts.md`: exact output artifact, language, format,
  evidence, and verbosity contract.
- `references/40-completion-verification.md`: Definition of Done, stop
  conditions, and verification checklist.
- `references/45-deviation-final-report.md`: deviation log and final report
  contract for inspectable closure.
- `references/50-authority-risk.md`: risk levels, authority granted/withheld,
  destructive gates, and security controls.
- `references/60-current-guidance-validation.md`: live official-source
  validation for volatile product, model, API, tool, permission, limit, pricing,
  availability, or recommendation claims.
- `references/70-delegation-parallelism.md`: P0-P3 parallelism selection and
  bounded subagent contracts.
- `references/80-instruction-placement.md`: where to place instructions across
  prompt text, skills, references, schemas, tools, config, project files, and
  runtime permissions.
- `references/90-execution-recommendation.md`: runtime recommendation format and
  rationale.
- `references/100-goal-tracking.md`: optional persistent-goal prompt add-on.
- `references/domains/coding.md`: coding, debugging, repo tooling, or software
  implementation prompts.
- `references/domains/compliance.md`: legal, regulatory, medical, therapeutic,
  financial, safety, certification, sustainability, or public-claims prompts.
- `references/domains/git.md`: Git state, refs, branches, commits, worktrees,
  stashes, merges, rebases, cleanup, or recovery prompts.
- `references/domains/infrastructure.md`: production, deployment, migration,
  DNS, secrets, access-control, billing, database, or customer-impacting prompts.
- `references/domains/research.md`: factual research, source synthesis,
  evidence quality, uncertainty, or citation-heavy prompts.
- `references/domains/strategy.md`: decision, business, planning, tradeoff,
  prioritization, or execution-strategy prompts.
- `references/domains/writing.md`: documents, messages, copy, editing, audience,
  tone, format, or publishing prompts.
- `references/examples/compact-vs-overengineered.md`: calibration example for
  avoiding overbuilt low-risk prompts.
- `references/examples/current-capability-check.md`: calibration example for
  deciding when live current-guidance checks matter.
- `references/examples/high-risk-agent.md`: calibration example for
  destructive/high-risk agent prompts.
- `references/examples/pressure-scenarios.md`: adversarial scenarios for
  final-review checks of high-risk or instruction-conflict prompts.
- `references/examples/prompt-audit.md`: worked audit rubric for existing
  prompts.
- `references/examples/vague-to-ready.md`: example for converting incomplete
  intent into a ready prompt.
- `assets/templates/compact.md`: D1 compact prompt shell for ordinary clear
  tasks.
- `assets/templates/structured.md`: D2 structured shell for medium-risk analysis,
  review, research, or implementation prompts.
- `assets/templates/operational.md`: D3 shell for agentic file, repo, tool, or
  operational work.
- `assets/templates/critical.md`: D4 shell for destructive, external,
  production, legal, financial, credential, or irreversible work.
- `scripts/validate-final-output.py`: packaged Stop-hook validator for this
  skill's final response shape when hook support is available.

## Ask, Stop, and Decline

Return **Needs Clarification** when a required target, authority boundary,
source of truth, output, verification requirement, or safety constraint is
missing and cannot be safely inferred.

Stop when a required support file or tool is unavailable, a volatile claim
cannot be verified and materially changes the recommendation, or the prompt
would misrepresent capability, authorization, evidence, or completion.

Decline requests that require unsafe, unauthorized, impossible, unsupported, or
deceptive prompt behavior, including fabricated evidence, fake tool results,
permission bypasses, hidden destructive authority, or claims that conflict with
higher-priority instructions.

## Output

Return, in this order:

1. **Result** — Ready / Needs Clarification.
2. **Assumptions** — material assumptions only.
3. **Clarification Questions** — only when the result is Needs Clarification; ask the smallest targeted set and omit Final Prompt.
4. **Final Prompt** — only when the result is Ready; complete, copy-ready, and in the requested language (default: English for technical deliverables).
5. **Execution Recommendation** — only when the result is Ready; model, reasoning effort, P-level, D-level, R-level, rationale, why not lower/higher, alternative, escalation conditions, and this exact compact evidence line: `Gate Evidence: intake=pass; classification=R#/D#/P#; references=pass; placement=pass; template=pass; output=pass; self-audit=pass`.
6. **Current Guidance Notes** — only when live validation materially changed or contradicted local guidance.
7. **Optional Improvements** — only high-value additions.

## Success Criteria

Before final delivery, verify that:

- the workflow is connected to a concrete user goal and executor;
- required inputs, authority, output, and completion criteria are explicit or
  the response is Needs Clarification;
- every loaded support file was routed by a material condition above;
- no unavailable facts, permissions, current capabilities, or tool results were
  invented;
- the final prompt is copy-ready, uses the smallest sufficient structure, and
  omits unused placeholders;
- the execution recommendation is outside the prompt and includes model,
  reasoning, P-level, D-level, R-level, rationale, alternative, escalation
  conditions, and the required Gate Evidence line;
- the response follows the Output order exactly.

If any critical requirement is unmet, revise before delivery or return Needs
Clarification. Do not present a prompt as final while any readiness gate remains
unresolved.
