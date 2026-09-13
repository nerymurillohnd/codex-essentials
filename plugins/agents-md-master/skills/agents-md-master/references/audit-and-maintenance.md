# AGENTS.md Audit and Maintenance

Use this reference when an instruction hierarchy already exists, a root file is
too broad, a command may be stale, a recurring failure is reported, or a
rewrite requires an approval-gated proposal.

## Audit inventory

Collect only evidence that can affect the requested decision:

1. Repository root, current directory, branch, working tree, and target subtree.
2. Every applicable global and repository instruction file, including overrides
   and configured fallback names where discoverable.
3. Referenced local documents, skills, schemas, scripts, workflow files,
   configuration, permission profiles, hooks, and generated artifacts.
4. Source-of-truth commands from manifests, task runners, CI, and current tool
   output.
5. Official current documentation and release evidence for material Codex claims.

Record each atomic claim with its location, scope, evidence source, status,
impact, and proposed disposition. Read selected instruction files completely;
do not audit from a filename, heading, or search snippet alone.

## Finding taxonomy

| Finding                     | Meaning                                                                            | Required response                                                                            |
| --------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Ambiguous                   | More than one reasonable interpretation changes the action.                        | Clarify wording, scope, owner, or stop condition.                                            |
| Contradictory               | Two applicable instructions or sources prescribe incompatible behavior.            | Apply authority and scope analysis; retain an unresolved conflict as a blocker.              |
| Stale                       | A command, path, capability, or assumption conflicts with current evidence.        | Cite the current owner and propose the smallest correction.                                  |
| Duplicated                  | Equivalent policy exists in multiple active locations.                             | Keep one authoritative owner and replace duplicates with a pointer when appropriate.         |
| Scope-misplaced             | A valid rule resides at the wrong hierarchy level.                                 | Move it to the narrowest applicable durable layer.                                           |
| Enforcement gap             | Prose claims to constrain an action that requires a runtime or repository control. | Route to permissions, configuration, schemas, tests, CI, or hooks; do not imply enforcement. |
| Untestable completion claim | A definition of done lacks observable evidence.                                    | Add source-owned validation and label unavailable checks honestly.                           |
| Broken reference            | A local path, anchor, command, or external source no longer resolves.              | Repair, remove, or mark the evidence unavailable.                                            |

## Refactor without losing policy

Do not split a file merely because it is long. First map every statement to its
scope, durability, source owner, enforcement owner, and task trigger. Retain
root material only when most repository tasks need it. Move conditional
material only when the target layer is discoverable and has a real owner.

For every proposed removal or move, preserve a traceability row:

| Existing material | Evidence of need | Proposed destination | Why the destination is safer | Validation |
| ----------------- | ---------------- | -------------------- | ---------------------------- | ---------- |
|                   |                  |                      |                              |            |

Never discard a mandatory approval boundary, release constraint, security
invariant, or source-of-truth command merely to reduce length. Do not create a
large documentation tree that depends on undocumented automatic loading.

## Maintain from demonstrated friction

A recurring failure can justify an update only when the record identifies:

- the task and repository revision;
- the observed agent or operator failure;
- evidence of the root cause;
- why an instruction-system change, rather than code/configuration/tool repair,
  is the correct response;
- the smallest affected scope;
- the expected future verification; and
- the owner and trigger for revisiting the rule.

One-off failures, transient outages, vague dissatisfaction, and unsupported
memory should remain findings rather than permanent policy. Do not turn a past
example into a universal rule without demonstrated recurrence or durable value.

## Proposal and approval gate

For a consequential rewrite, produce a complete proposal before mutation. It
must state scope, exclusions, evidence, effective hierarchy, findings,
placement decisions, complete diffs or before/after content, validation,
recovery, risks, and the exact approval needed.

After approval, re-read and re-identify every target immediately before writing.
If the instruction chain, source evidence, target content, or authorization has
drifted, stop and regenerate the proposal. Apply only the approved set and
report every deviation.
