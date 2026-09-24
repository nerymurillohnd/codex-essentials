---
name: verify-completion
description:
  Use before claiming that a change, task, release, commit, or pull request is
  complete, correct, or ready. Check the required outcome and its evidence,
  including relevant negative cases and receiving contracts.
---

# Verify Completion

Use this skill when the next action or message would rely on a completion,
correctness, readiness, or handoff conclusion. Do not activate it for an
ordinary progress update that makes no such claim. Verification never grants
permission to perform a write, merge, release, deployment, or other action.

## Establish the claim

State the exact requirement and the evidence that would prove it. Include the
actual target SHA, environment, artifact, version, or external resource when
those identify what was tested. Read the current artifact and applicable
controls instead of trusting earlier summaries or green badges.

## Check the relevant boundaries

1. **Outcome:** Run or inspect the path the user actually requested. A passing
   test of a narrower path cannot prove a broader result.
2. **Counterpart:** Where another component or host consumes the result, show
   that it accepts valid input and rejects the missing, malformed, or bypassed
   case. If there is no counterpart, say why.
3. **False positives:** Look for skipped tests, stale generated files, disabled
   controls, untested branches, mock-only assertions, and checks tied to the
   wrong SHA or environment.
4. **Positive and negative proof:** Exercise a valid case and the failure case
   most likely to invalidate the claim when both apply. Record why a direction
   is inapplicable rather than silently omitting it.
5. **Independent review:** For material changes, inspect the diff, runtime
   behavior, and external state separately from the implementation narrative.
   Use a fresh reviewer when one is available and authorized; inspect their
   evidence rather than treating their verdict as proof.

Stop the completion claim when required evidence is absent or a control fails.
Repair only within the user's existing authorization, then rerun the affected
checks and any broader gate they could invalidate. Do not weaken a hook, test,
signature, review rule, or branch protection to obtain green output.

## Report

Summarize the requirement, the exact commands or inspections performed, their
results, the counterpart and failure cases checked, and any exclusions with
reasons. Give the observed SHA, run URL, artifact path, or other stable evidence
identifier when relevant. Name every failed or unrun gate. Make the completion
claim only when the evidence covers the full requested outcome.
