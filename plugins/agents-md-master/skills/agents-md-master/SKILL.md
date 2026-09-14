---
name: agents-md-master
description: Use when creating, auditing, refactoring, maintaining, or governing Codex AGENTS.md instruction hierarchies, including nested placement, policy routing, approval-gated rewrites, and scenario-based evaluation. Do not use for generic Markdown editing, enforcement implementation, or unrelated repository documentation.
---

# AGENTS.md Master

Build instruction systems that improve retrieval and execution decisions, not
larger Markdown files. `AGENTS.md` is guidance only; enforcement belongs in
permissions, configuration, schemas, hooks, CI, or repository protection.

## Always Do

- Pick the mode from the request and evidence: **create**, **topology**,
  **audit**, **refactor**, **maintain**, **semantic-governance**, or
  **evaluate**. Ask only when a missing mode materially changes the outcome.
- Inspect the real repository, CWD, Git state, effective instruction chain,
  generated artifacts, commands, docs, and configuration before claims.
- Keep discovery, audits, and proposals read-only. Do not edit `AGENTS.md`,
  global config, hooks, permissions, consumer projects, tags, releases, PRs, or
  deployments without separate authority.
- Preserve user, platform, developer, repository, and nested-instruction
  authority. Report conflicts instead of silently choosing a winner.
- Never read or use `.claude/`. Never expose secrets; write variables as
  `${VAR}`.

## Reference Loading

Load at most one primary mode reference by default. Read a second reference only when
the user request or discovered evidence requires both procedures, and state why.
Do not load the README, every reference, or templates by default.

- create or topology -> `references/architecture-and-placement.md`: read before
  designing root/nested placement, source-of-truth command routing, enforcement
  ownership, or contradiction resolution.
- audit, refactor, or maintain -> `references/audit-and-maintenance.md`: read
  before auditing an existing hierarchy, investigating stale guidance or
  recurring failure, or preparing an approval-gated rewrite proposal.
- semantic-governance -> `references/semantic-governance.md`: read before
  classifying duplication, contradiction, deletion candidates, density, writing
  quality, or link integrity. Add audit or architecture only when needed.
- evaluate -> `references/evaluation-protocol.md`: read before comparing a
  baseline and candidate or claiming an instruction change improves outcomes.

Use `assets/templates/agents-md-change-proposal.md` only for complete
proposals. Use `assets/templates/evaluation-record.md` only for evaluations.

## Evidence Route

1. Establish target repository root, subtree, current Git state, and authorized
   scope.
2. Discover applicable `AGENTS.override.md` and `AGENTS.md` files from Codex
   home and repo root through the target directory. Record order and scope.
3. Verify material claims against the competent owner: repository files and
   commands for implementation facts; configuration, permissions, hooks, CI, or
   protections for controls; current official OpenAI documentation for Codex
   behavior or compatibility.
4. Classify claims as verified, partly verified, stale, false, ambiguous,
   duplicated, scope-misplaced, unsupported, or unverifiable.

## Output

- For create/topology, propose the smallest instruction hierarchy that makes
  task-specific detail discoverable and routes controls to their real owners.
- For audit/refactor/maintain/semantic-governance, produce the needed evidence
  ledger, chain map, placement decisions, conflicts, and reviewable proposal.
  Preserve mandatory policy and identify what is retained, moved, corrected, or
  left unresolved.
- For evaluate, compare baseline and candidate under the same revision, task,
  permissions, host conditions, and rubric. Do not treat shorter, cleaner, or
  parser-valid prose as outcome evidence.
- Before reporting, verify paths, command owners, generated ownership, source
  dates, contradictions, and validation. A green check proves only its contract.
- Stop and report the exact blocker when target scope, authority, source of
  truth, current Codex behavior, approval, identity, or recovery is materially
  unresolved.

When useful, report in this order: Result; Scope and Authority; Evidence and
Effective System; Findings and Placement Decisions; Proposed or Applied Changes;
Validation and Evaluation; Recovery, Risks, and Next Step.
