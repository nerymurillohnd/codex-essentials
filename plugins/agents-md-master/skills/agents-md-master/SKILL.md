---
name: agents-md-master
description:
  Use when creating, auditing, refactoring, maintaining, or evaluating Codex
  AGENTS.md instruction hierarchies. Do not use for ordinary Markdown edits,
  non-Codex documentation, or implementing enforcement controls.
---

# AGENTS.md Master

Design instruction systems that help Codex retrieve the right guidance at the
right scope. Treat `AGENTS.md` as agent guidance, not as an enforcement layer.

## Operating Rules

- Start from the user's authorized scope: create, audit, refactor, maintain, or
  evaluate. Ask only when a missing target, authority, or output format would
  materially change the result.
- Inspect the actual repository, current directory, Git state, effective
  instruction chain, relevant docs, commands, config, generated files, and
  validation owners before making findings or proposals.
- Keep discovery, audits, and proposals read-only. A direct request to create,
  refactor, or maintain an instruction file authorizes that scoped edit; it does
  not by itself authorize config changes, hooks, commits, pushes, deployment, or
  unrelated external mutations.
- Preserve platform, developer, user, repository, and nested instruction
  authority. Report unresolved contradictions instead of silently choosing a
  convenient interpretation.
- Never claim prose enforces a runtime boundary. Route controls to their real
  owners: permissions, configuration, hooks, schemas, tests, CI, repository
  protection, or deployment policy.
- Verify current Codex behavior from official OpenAI documentation before
  stating compatibility, discovery, or injection details.

## Reference Routing

Read one primary reference by default:

- For new systems, nested placement, authority, or enforcement routing, read
  [architecture-and-placement.md](references/architecture-and-placement.md).
- For existing hierarchy audits, stale commands, duplication, scope drift,
  maintenance, or requested rewrites, read
  [audit-and-refactor.md](references/audit-and-refactor.md).
- For baseline/candidate comparisons, behavioral tests, scoring, or claims that
  a proposal improves outcomes, read [evaluation.md](references/evaluation.md).

Read a second reference only when the request or evidence spans both workflows,
and state why it was needed.

## Evidence Standard

Record the source and status of every material claim:

- verified: directly supported by repository files, command output,
  configuration, CI, or current official documentation;
- stale or false: contradicted by a stronger current source;
- ambiguous: multiple interpretations would change the action;
- unsupported: plausible but not proven by the available evidence;
- out of scope: valid concern owned by another repository layer or user
  decision.

For command or validation claims, identify the owner, working directory,
preconditions, expected evidence, and whether the check is focused or
full-repository. A passing formatter, validator, or parser proves only that
tool's contract.

## Outputs

For creation or topology work, return the smallest useful instruction hierarchy,
where each rule belongs, what source supports it, and which controls must live
outside `AGENTS.md`.

For audits, return findings with evidence, impact, disposition, and a reviewable
proposal without editing. For authorized refactors, provide the changed files,
checks, and unresolved risks; do not insert another routine approval checkpoint.

For evaluation, compare baseline and candidate under the same repository
revision, task, tools, permissions, and rubric. Do not treat shorter prose,
cleaner formatting, or parser validity as outcome evidence.
