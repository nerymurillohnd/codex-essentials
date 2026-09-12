---
name: verify-completion
description: Use when claiming work is complete, correct, verified, ready for handoff, ready to commit, or ready for a pull request. Require evidence for applicable adversarial review, outcome, counterpart, false-positive, positive-negative, and evidence-record gates before the claim.
---

# Verify Completion

Do not make a completion, correctness, readiness, handoff, commit, or
pull-request claim until the applicable verification protocol below has passed
with recorded evidence. This protocol improves a conclusion; it does not grant
new authority for a command, write, commit, remote mutation, or configuration
change.

## When to apply

Apply this skill when the next response or action would communicate, record, or
rely on a conclusion that work is complete, correct, verified, ready for
handoff, ready to commit, or ready for a pull request.

Do not apply it solely because work is in progress, an agent is delegating
exploration, a task moves between intermediate steps, or a response makes an
ordinary non-conclusive positive comment.

## Required protocol

1. State the exact requirement or acceptance criteria being verified.
2. Inventory applicable artifacts, code paths, tests, contracts, controls,
   hooks, commands, consumers, and evidence sources.
3. Execute the six gates in order. A gate may be excluded only when it is
   demonstrably inapplicable to the stated requirement; record the reason.
4. Record concrete evidence for every applied gate: exact commands, relevant
   outputs, inspected diffs, assertions, logs, or observable artifacts.
5. If a gate fails, do not make the completion claim. Repair the underlying
   cause only when authorized, then restart the complete protocol from Gate 1.
6. Make the claim only after every applicable gate has passed and the final
   verification summary is present.

## The six gates

### 1. Adversarial review

Treat every prior summary, subagent result, tool success message, and green
check as a claim rather than proof. Independently inspect critical source files,
artifacts, diffs, command output, and supporting evidence. Re-run critical
commands when feasible within the active authority.

### 2. Validate the outcome

Confirm that the behavior or artifact satisfies the stated requirement. Verify
that the exercised path is the required one; a passing command on an unrelated
or incomplete path does not satisfy this gate.

### 3. Verify the counterpart

When a receiving or consuming side exists, confirm it requires, validates, and
enforces the expected contract. Demonstrate that relevant missing, malformed,
incorrect, or bypassed input is rejected for the expected reason. If no
counterpart exists, record the concrete reason this gate is inapplicable.

### 4. Distrust the green

Actively inspect plausible false-positive vectors relevant to the work:

- Bypassed, disabled, skipped, conditionally ignored, or weak controls.
- Uncovered required paths, missing negative cases, silent failures, or
  swallowed errors.
- Tautological assertions, excessive mocks, or mocks that hide the real path.
- Stale generated artifacts, mismatched targets, or coverage gaps that leave
  critical behavior untested.

Record each examined vector and its result. A green check without this review is
not sufficient evidence.

### 5. Positive and negative proof

Demonstrate both directions when they apply:

- **Positive:** the intended behavior succeeds under the required conditions.
- **Negative:** the targeted invalid, incomplete, malformed, or malicious
  behavior fails or is rejected for the expected reason.

Success in only one direction is insufficient. If a direction is demonstrably
inapplicable, record why and identify the nearest meaningful boundary tested.

### 6. Show the evidence

Preserve enough observable evidence for an independent reviewer to reach the
same conclusion without trusting the summary: commands, relevant outputs,
diffs, assertions, logs, inspected artifacts, and justified exclusions. Do not
invent evidence, infer an unobserved result, or replace a required control with
a weaker one.

## Final verification summary

Before making the conclusion, provide a concise summary containing:

1. The requirement or acceptance criteria under test.
2. Each applied gate and its key evidence.
3. Every excluded gate and its demonstrable inapplicability reason.
4. Confirmation that no applicable gate was skipped and that no control was
   weakened, disabled, or bypassed to obtain the result.

If this summary cannot be supported, report the missing evidence or failed gate
instead of claiming completion.
