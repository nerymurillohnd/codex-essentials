# Deviation Log And Final Report

Use this reference for operational, agentic, repository, research, production,
external, or high-risk prompts where the executor might diverge from the
original plan or where closure must be inspectable.

## Deviation Log

Deviation reporting prevents hidden scope changes and false closure.

Require a deviation log when execution may involve plans, tool choices,
fallbacks, partial completion, blocked steps, failed checks, changed scope, or
unexpected findings.

Pattern:

```text
If execution differs from the plan or prompt, report:
- what changed;
- why it changed;
- whether it was required;
- whether it was authorized;
- whether it introduced risk, debt, or follow-up work.
```

Good deviation entries are concrete:

```text
Deviation: skipped dependency update because it required a lockfile rewrite outside the authorized scope.
Impact: requested bug fix was completed; dependency debt remains.
```

Do not hide deviations inside a general summary.

## Final Report Format

For operational work, require a final report that makes the final state
inspectable:

```text
## Result
Complete / Partially Complete / Blocked / Failed.

## Delivered Output
Concrete artifact, change, file, commit, backup, document, or final state produced.

## Objective Check
How the original objective was satisfied.

## Verification
Checks performed and outcomes.

## Deviations
Plan changes, skipped items, unexpected findings, or "None."

## Final State
Current repository/system/document/artifact state.

## Remaining Risks or Pending Items
Only real unresolved issues. If none remain, say so.

## Recommended Next Step
One highest-leverage next action, if applicable.
```

For high-risk operational work, add:

```text
## Safety Confirmation
Exact destructive, external, production, credential, or irreversible actions performed or intentionally withheld.
```

## Output Discipline

Do not let the final report replace the requested deliverable. If the user
needs a complete document, prompt, patch, plan, or analysis, the executor must
provide that complete artifact plus the report when warranted.
