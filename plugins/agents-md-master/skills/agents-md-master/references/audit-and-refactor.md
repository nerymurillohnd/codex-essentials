# Audit and Refactor

Use this reference for existing instruction systems, stale claims, duplicated
rules, bloated roots, maintenance after demonstrated failures, or a requested
rewrite proposal.

## Audit Map

Build a concise evidence ledger. For each material instruction, record:

- location and scope;
- actor, action, target, condition, and phase;
- source owner and enforcement owner;
- whether the rule is verified, stale, duplicated, scope-misplaced, unsupported,
  ambiguous, contradictory, or intentionally reinforced;
- impact and proposed disposition.

Do not infer duplication from similar wording alone. Two rules duplicate each
other only when they govern the same decision for the same actor, condition, and
scope without a meaningful differential.

## Common Findings

| Finding                   | Meaning                                                       | Disposition                              |
| ------------------------- | ------------------------------------------------------------- | ---------------------------------------- |
| Stale command             | Current package scripts, CI, or tool output contradicts prose | Correct to the source owner              |
| Misplaced scope           | A valid rule lives too high or low in the hierarchy           | Move to the narrowest discoverable layer |
| Enforcement gap           | Prose claims to prevent behavior that needs a control         | Route to the control owner               |
| Duplicate                 | Same rule repeated without new condition or retrieval need    | Consolidate or replace with a pointer    |
| Intentional reinforcement | A short repeat is needed near a high-risk local action        | Keep with rationale                      |
| Ambiguous rule            | More than one interpretation changes behavior                 | Clarify or ask                           |
| Broken reference          | Path, anchor, command, or linked owner is missing or stale    | Repair, remove, or mark unavailable      |

## Refactor Rules

Refactor only after preserving traceability. Never remove a mandatory approval
boundary, security invariant, validation command, release rule, or source of
truth just to make an instruction file shorter.

Before proposing edits, identify:

- what stays at the same layer;
- what moves and where;
- what is replaced by a pointer;
- what is corrected against current evidence;
- what remains unresolved for user decision;
- what validation proves the proposal's file paths, commands, and generated
  ownership.

If edits are authorized, use a reviewable diff and keep unrelated files out of
scope. Authorization to edit instruction files is not authorization to commit,
push, merge, tag, release, deploy, publish, install hooks, or alter runtime
permissions.

## Maintenance From Incidents

Add durable instruction only when a repeated failure has evidence of:

- the task and repository revision;
- the observed failure;
- root cause;
- why an instruction change is the right control;
- smallest affected scope;
- expected future verification;
- owner and review trigger.

One-off frustration, memory without evidence, or a transient tool failure should
remain an audit note or product issue, not permanent repository policy.
