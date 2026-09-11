# Goal Tracking

Use this procedure only for a long-running Codex task when persistent goals are
available on the destination surface and continued completion tracking provides
material value.

## Decision

Use goal tracking when the work has a concrete outcome, spans multiple phases,
and can otherwise be mistakenly described as complete before its required
deliverables or verification are done. Do not use it for ordinary answers,
small reversible edits, or surfaces where goal support is unavailable.

## Prompt Add-On

When justified, add a short setup instruction before the executor workflow:

```text
Set the persistent goal to: [CONCRETE OUTCOME].
Keep working until the goal's Definition of Done is satisfied. Do not mark it complete while a required deliverable, validation, or disclosed blocker remains.
```

The executor must use the destination surface's supported goal mechanism. Do
not imply that goal tracking exists, has been activated, or can override
higher-authority instructions when that has not been verified.

## Fallback

When persistent goals are unavailable, keep the same Definition of Done,
verification checklist, stop conditions, and final report contract in the
prompt. State that this is an in-prompt completion loop, not persistent goal
tracking.
