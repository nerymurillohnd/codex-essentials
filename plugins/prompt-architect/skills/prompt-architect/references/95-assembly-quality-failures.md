# Assembly Method, Quality Checklist, And Common Failures

Use this reference before final delivery and when auditing an existing prompt.

## Assembly Method

Build the prompt in this order:

1. Classify the task.
2. Determine risk level.
3. Select template depth.
4. Define success.
5. Define authority.
6. Define output.
7. Define verification.

## Task Classification

Classify the primary domain and any important secondary domain:

- writing;
- coding or debugging;
- Git or repository work;
- research;
- strategy;
- compliance or public claims;
- production or infrastructure;
- data analysis;
- document editing;
- external communication.

## Risk Level

Use the highest applicable level.

Low risk:

- drafting;
- brainstorming;
- formatting;
- simple explanation.

Medium risk:

- code edits;
- business recommendations;
- document changes;
- public-facing claims.

High risk:

- Git mutation;
- dependency changes;
- production systems;
- legal, compliance, or financial decisions;
- customer-facing communications;
- deletion;
- deployment;
- credentials.

## Template Depth

- Low risk: compact template.
- Medium risk: compact or structured template plus relevant domain add-on.
- High risk: operational or critical template plus relevant domain add-ons,
  explicit stop conditions, authority gates, and verification.

## Success, Authority, Output, Verification

Before writing the prompt, complete these statements:

```text
This task is done when...
The agent may...
The agent must not...
The agent must stop if...
The final answer must include...
The deliverable must be...
The agent must not finish without...
Before finalizing, verify...
```

If these statements are materially vague, the prompt is not ready.

## Quality Checklist

Before delivery, score each applicable item Pass / N/A / Fix:

- role is specific enough to shape judgment;
- mission is outcome-based;
- success state is testable;
- verified and historical context are not conflated;
- assumptions are declared;
- inputs and source of truth are clear;
- scope is explicit and prevents drift;
- authority granted is explicit where consequential;
- authority withheld and gated actions are explicit where consequential;
- destructive or external actions are gated;
- workflow is appropriate and no more detailed than needed;
- tool use is controlled;
- volatile capability claims are fresh when material;
- density level matches task risk and ambiguity;
- parallelism is considered, not blindly enabled;
- shared-state writes are safely coordinated;
- validation is proportional to risk;
- output contract defines the usable deliverable;
- completion contract prevents false completion;
- stop conditions cover real blockers without encouraging unnecessary pauses;
- verification is proportional and direct;
- deviations will be visible;
- final report format is clear when reporting matters;
- unrelated work is protected;
- recoverability is preserved where relevant;
- no requirement belongs more reliably in schema, config, permissions, or code;
- no redundant examples, rules, or generic caution remain;
- final prompt is complete and copy-ready.

If any critical item is Fix, revise before delivery.

## Common Failures

### No Definition Of Done

Weak:

```text
Fix this issue.
```

Strong:

```text
Fix the issue so that the login flow succeeds locally, the failing test passes, no unrelated files are changed, and the final report includes root cause, files changed, and validation results.
```

### No Authority Boundary

Weak:

```text
Clean up the repo.
```

Strong:

```text
Clean up only temporary files created by this task. Do not delete branches, stashes, ignored files, or user work unless explicitly authorized after inspection.
```

### No Output Contract

Weak:

```text
Improve this document.
```

Strong:

```text
Return the complete revised document, ready to send, preserving the original intent and improving structure, clarity, tone, and factual accuracy.
```

### No Verification

Weak:

```text
Update dependencies.
```

Strong:

```text
Update only the specified dependency, preserve lockfile integrity, run install validation, typecheck, and targeted tests, and report compatibility notes from official changelogs.
```

### Overly Broad Autonomy

Weak:

```text
Do whatever is necessary.
```

Strong:

```text
Complete all reversible and authorized steps. Stop before external, destructive, irreversible, production-impacting, or unauthorized actions.
```

### Historical Context Treated As Current Truth

Weak:

```text
The previous session found X. Use that.
```

Strong:

```text
The previous session found X. Treat it as historical evidence and reverify before acting on it.
```

## Final Rule

A production-grade prompt answers these seven questions:

1. Who is the agent acting as?
2. What outcome must exist?
3. What context matters?
4. What is inside and outside scope?
5. What can the agent do without asking?
6. What must the agent not do?
7. How will completion be verified and reported?

If any of these are missing, the prompt may still work, but it is not
production-grade.
