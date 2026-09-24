# Evaluating skill output quality

Source:
[Evaluating skills](https://agentskills.io/skill-creation/evaluating-skills),
consulted 2026-09-24.

Use representative prompts, input files, an observable success description, and
at least one meaningful boundary. Compare with and without a new skill, or the
old and candidate full packages for a revision. Hold the model, settings, tools,
prompts, and fixtures constant apart from the tested skill; verify that the
baseline cannot discover the candidate implicitly.

Run each case in an isolated workspace or session. Preserve actual outputs,
execution traces, configuration/version IDs, errors, and measured time/token
data when exposed. Do not estimate absent telemetry. Grade the outcome and
artifacts against a frozen rubric, not exact wording or a mocked result.
Separate execution failures from quality failures and inspect any evaluator's
evidence before accepting its judgment.

Revise guidance from observed failures and rerun comparable cases. Report sample
sizes, pass counts, cost or time differences only when measured, and remaining
uncertainty. A written evaluation plan alone does not establish improved skill
quality or reliable implicit activation.
