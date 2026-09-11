# Prompt Engineering Canon

This is the mandatory compact canon. The complete original prompt-authoring
contract is preserved in this skill's routed references, packaged templates,
examples, and pressure scenarios. Do not depend on a separate source document at
runtime.

## Core principle

A strong prompt is an execution contract, not merely an instruction.

A production-grade prompt should make materially relevant parts of the following explicit:

- role and operating posture;
- mission and desired final state;
- verified context versus historical/unverified context;
- inputs and source-of-truth rules;
- in-scope and out-of-scope boundaries;
- authority granted and withheld;
- workflow only where it improves execution;
- tool-use and data-handling rules;
- risk controls and destructive-action gates;
- validation policy;
- output contract;
- completion contract / definition of done;
- stop conditions;
- verification checklist;
- deviation reporting;
- final report structure.

## Universal execution sequence

Use only the phases that materially help:

1. Understand the real objective and success state.
2. Inspect current state and authoritative evidence.
3. Diagnose root cause, dependencies, ambiguity, and risk.
4. Plan the smallest safe path.
5. Execute authorized work.
6. Verify against the original objective.
7. Finalize and clean temporary artifacts safely.
8. Report evidence-based closure.

## Prompt quality rules

- Outcome over activity.
- Explicit authority over vague caution.
- Testable success over “do your best.”
- Primary/current sources over memory for volatile facts.
- Minimal sufficient structure over mega-prompts.
- Observable gates over subjective confidence claims.
- Complete deliverable over commentary about what could be done.
- Verified facts, assumptions, inferences, and unknowns must remain distinguishable.

## Modular canon

Use the routed references for complete detail:

- `references/05-core-sections.md`: role, operating mode, mission, success
  state, context, inputs, scope, and instruction hierarchy.
- `references/10-intake-readiness.md`: readiness gates and clarification
  policy.
- `references/20-density.md`: density selection and prompt size control.
- `references/25-tool-use-rules.md`: tool use, source of truth, untrusted
  content, and data handling.
- `references/30-output-contracts.md`: output contract and verbosity.
- `references/40-completion-verification.md`: completion, stop conditions, and
  verification.
- `references/45-deviation-final-report.md`: deviation log and final reporting.
- `references/50-authority-risk.md`: authority, risk, destructive gates, and
  security.
- `references/60-current-guidance-validation.md`: current capability validation.
- `references/70-delegation-parallelism.md`: delegation and multi-agent
  topology.
- `references/80-instruction-placement.md`: prompt versus schema, config,
  permissions, or code.
- `references/90-execution-recommendation.md`: runtime recommendation.
- `references/100-goal-tracking.md`: optional goal tracking.
- `references/domains/`: domain add-ons.
- `assets/templates/`: density-calibrated prompt shells to copy or adapt.
- `references/examples/`: calibration examples, prompt audit example, and
  pressure scenarios.
