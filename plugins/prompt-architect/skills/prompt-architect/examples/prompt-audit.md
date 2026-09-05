# Prompt Audit Checklist

Before delivery, score each applicable item Pass / N/A / Fix:

- Role is specific enough to shape judgment.
- Mission is outcome-based.
- Success state is testable.
- Verified and historical context are not conflated.
- Inputs/source of truth are clear.
- Scope prevents drift.
- Authority granted is explicit where consequential.
- Authority withheld/gated actions are explicit where consequential.
- Workflow is no more detailed than needed.
- Tool/capability claims are fresh when volatile.
- Density level matches task risk/ambiguity.
- Parallelism is considered, not blindly enabled.
- Shared-state writes are safely coordinated.
- Output contract defines the usable deliverable.
- Completion contract prevents false completion.
- Stop conditions cover real blockers without encouraging unnecessary pauses.
- Verification is proportional and direct.
- Deviations will be visible.
- No requirement belongs more reliably in schema/config/permissions instead of prompt text.
- No redundant examples/rules remain.
- Final prompt is copy-ready.

If any critical item is `Fix`, revise before delivery.
