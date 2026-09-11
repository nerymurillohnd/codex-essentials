# Evaluating Output Quality

Source: [Evaluating skill output quality](https://agentskills.io/skill-creation/evaluating-skills),
checked 2026-09-06. Use the [documentation index](https://agentskills.io/llms.txt)
before exploring updated guidance.

## Define cases and the comparison

Use realistic prompts, a human-readable success description, and necessary input
files. Two or three varied cases, including a meaningful boundary, are a useful
initial scope. Add coverage based on observed failures rather than an arbitrary quota.

For sustained evaluation, store authored cases in `evals/evals.json` under the skill:

```json
{
  "skill_name": "skill-design-standards",
  "evals": [
    {
      "id": 1,
      "prompt": "Audit the supplied skill for portable format compliance; do not edit it.",
      "expected_output": "Evidence-backed findings distinguishing format errors from host-specific restrictions, without modifying the input.",
      "files": ["evals/files/sample-skill/SKILL.md"]
    }
  ]
}
```

This is an illustrative schema and path, not a bundled fixture or a format requirement.
Create actual fixtures only when running or maintaining the evaluation. Map prompt
paths to the real supplied files; never rely on a user's machine-specific location.

For new skills, compare with and without the skill. For updates, snapshot the whole
previous skill and its resources before editing and compare against that snapshot.
Keep model, tools, instructions, fixtures, and settings equivalent except for the
tested skill. Ensure the baseline cannot implicitly discover the candidate or inherit
its instructions. Omitting a skill path alone does not establish a clean baseline.

## Run in isolation and capture evidence

Use fresh sessions or authorized subagents with minimum raw task context, separate
output directories, and independent copies of mutable fixtures. Verify isolation;
subagents may inherit conversation state or share a filesystem. Give the runner the
prompt, inputs, output directory, and relevant skill version, without desired answers
or grader assertions. Output-quality tests may load the skill explicitly.

Store results outside the distributed skill, for example:

```text
skill-workspace/iteration-1/eval-1/with_skill/outputs/
skill-workspace/iteration-1/eval-1/old_skill/outputs/
```

Use `without_skill/` for an unassisted baseline. Preserve transcripts and configuration
or revision identifiers. Record observed token counts and duration in `timing.json`
when the host exposes them. Use null or an explicit unavailable status for missing
metrics; do not estimate token counts from file size or invent host telemetry.

Set an execution budget and side-effect boundary. Use temporary fixtures or safe
substitutes where possible; do not run live mutations merely to grade a skill.

## Grade actual outcomes

After the exploratory run, add objective assertions to each case. Freeze the rubric
for a comparison and apply it equally to both configurations. If it changes, regrade
both outputs or rerun as needed. Check requirements and meaningful outcomes, not
incidental wording, headings, or invented quotas unrelated to the task.

Use deterministic checks for mechanical facts and evidence-based judgment for
qualitative criteria. Inspect files and relevant execution traces: a filename or
section heading alone does not prove substantive correctness. Record assertion text,
pass/fail, and concrete evidence in `grading.json`. Distinguish execution or grading
errors from observed quality failures; missing evidence cannot support a pass.

For holistic comparisons, blind the judge to version identity where practical and
vary presentation order. Review the judge's evidence rather than accepting its verdict.
Present outputs alongside grades for human review when useful. Record actionable
feedback and explicit review status in `feedback.json`; empty or absent feedback
does not prove review occurred, satisfaction, or authorization.

## Compare and improve

Aggregate per-configuration results in `benchmark.json`, retaining per-case counts,
sample sizes, missing or failed runs, and measured timing/token data. Define the
aggregation denominator. Compare pass rates and cost deltas; use repeated runs to
assess variability and avoid reliability claims from a few single runs. A 0.50
pass-rate increase is 50 percentage points, not necessarily a 50 percent relative gain.

Investigate patterns with the artifacts and transcripts:

- Checks that pass in both versions may be regression or safety controls. Retain
  meaningful invariants; distinguish them from checks that measure incremental value.
- Failures in both versions can reflect genuine defects, invalid fixtures, unsupported
  capabilities, or faulty assertions. Diagnose before changing expectations.
- Candidate-only passes suggest useful guidance; examine the trace to understand why.
- Inconsistent outcomes and cost outliers warrant trace inspection before adding rules.

Revise underlying guidance using failed assertions, explicit human feedback, and
execution traces. Remove demonstrated unnecessary work; preserve operational controls.
Bundle repeated mechanics only when the reuse justifies a maintained helper. Avoid
teaching specific fixture answers. Rerun relevant cases in a new `iteration-N/`,
then grade with the same rubric and check fresh cases for generalization.

Stop at the agreed quality target, budget, or a meaningful improvement plateau.
Report the best supported version, remaining failures, cost tradeoffs, and which
checks were actually executed. Integrating this method into a skill does not mean
a comparative benchmark has been run or an improvement has been statistically proven.
