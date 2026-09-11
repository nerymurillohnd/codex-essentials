# Completion, Verification, and Stop Conditions

## Completion contract

The task is complete only when the requested final state exists, has been verified, and all material exceptions are disclosed.

Diagnosis, proposal, partial implementation, or an unverified result is not completion.

## Definition of Done

Require, as applicable:

- stated objective fulfilled;
- all authorized in-scope work completed;
- required deliverables present;
- current state checked against original success state;
- validation performed proportionally to risk;
- deviations disclosed;
- skipped/failed/blocked/out-of-scope items disclosed;
- final state stable, inspectable, and recoverable where relevant;
- real remaining risks listed.

If a required condition is missing, status must be Partially Complete, Blocked, Failed, or Awaiting Approval — never Complete.

## Stop conditions

Stop before completion only when continuing would be unauthorized, destructive without required gates, materially ambiguous, impossible because of unavailable dependencies/permissions, contrary to governing instructions, or blocked by validation that cannot be resolved in scope.

When stopping early, report: blocker, completed work, remaining work, and exact next required action.

## Verification checklist

Before final response:

- compare result to original objective;
- check every in-scope requirement and prohibition;
- verify artifact/final state directly;
- run risk-proportional checks;
- identify deviations and unexpected findings;
- distinguish facts, assumptions, inferences, unknowns;
- check for unrelated damage or scope drift.
