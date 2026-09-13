---
name: agents-md-master
description: Use when creating, auditing, refactoring, maintaining, or governing Codex AGENTS.md instruction hierarchies, including nested placement, policy routing, approval-gated rewrites, and scenario-based evaluation. Do not use for generic Markdown editing, enforcement implementation, or unrelated repository documentation.
---

# AGENTS.md Master

Build instruction systems that improve retrieval and execution decisions, not
larger Markdown files. Treat an `AGENTS.md` hierarchy as guidance for Codex;
it does not itself enforce permissions, approvals, hooks, repository protection,
CI, secrets handling, or runtime behavior.

## Operating contract

- Begin with the requested mode: **create**, **audit**, **refactor**,
  **maintain**, **topology**, or **evaluate**. Ask only when the mode cannot be
  established from the request and repository evidence.
- Inspect the actual repository, current working directory, effective
  instruction chain, configuration, commands, generated artifacts, and existing
  documentation before proposing an instruction change. Never infer a command,
  repository rule, control, or current Codex capability.
- Keep the work read-only through discovery, analysis, and proposal. Before a
  consequential rewrite, provide a complete scoped proposal and wait for explicit
  approval of that proposal. A request to audit does not authorize edits.
- Preserve user, platform, developer, repository, and nested-instruction
  authority. Record conflicts instead of silently resolving them.
- Never read or use files from a `.claude/` directory. Never expose secret
  values; represent required variables as `${VAR}`.
- Do not install, configure, enable, trust, or execute consumer-owned hooks or
  automation. Do not publish, commit, push, merge, tag, release, or deploy
  anything unless the user separately authorizes that operation. Read-only
  inspection and applicable validation commands remain permitted within the
  user's authorized scope.

## Select the evidence route

1. Establish the target repository root, target subtree, current Git state, and
   the user-authorized scope.
2. Discover all applicable `AGENTS.override.md` and `AGENTS.md` files from the
   Codex home and repository root through the target working directory. Record
   the effective order, scope, and any configured fallback instruction names.
3. Inspect the actual owner of every material claim:
   - repository files, package manifests, scripts, CI, and tool output for local
     commands and implementation facts;
   - configuration, permission profiles, hooks, CI, or repository protections
     for enforcement claims;
   - current official OpenAI documentation and relevant release notes for Codex
     behavior, capabilities, configuration, plugins, skills, or compatibility.
4. Label each claim **verified**, **partly verified**, **stale**, **false**,
   **ambiguous**, **duplicated**, **scope-misplaced**, **unsupported**, or
   **unverifiable**. Preserve unknowns as unknowns.
5. Read only the references required by the selected mode and material findings:
   - For root/nested boundaries, contradiction resolution, source-of-truth
     commands, or enforcement placement, read
     [architecture-and-placement.md](references/architecture-and-placement.md).
   - For an existing hierarchy, stale guidance, recurring failures, a proposed
     rewrite, or maintenance triggers, read
     [audit-and-maintenance.md](references/audit-and-maintenance.md).
   - For a claim that an instruction system improves outcomes, read
     [evaluation-protocol.md](references/evaluation-protocol.md).
   - For semantic duplication, contradictions, deletion candidates, root density,
     writing quality, or linked-guidance integrity, read
     [semantic-governance.md](references/semantic-governance.md).
     Also read the audit or architecture reference above when the request needs
     its selected-mode procedure or authority analysis.

## Produce the right result

### Create or topology

Use repository evidence to propose the smallest root instruction file and the
fewest nested boundaries that make task-specific detail discoverable. Do not
turn a repository overview into permanent instructions. Identify linked
documentation, skills, schemas, scripts, configuration, CI, permissions, or
hooks only when they are the competent owner of the material.

### Audit, refactor, or maintain

Produce an evidence ledger, effective-chain map, placement matrix, conflict
dispositions, and a reviewable change proposal. Use
[`agents-md-change-proposal.md`](assets/templates/agents-md-change-proposal.md)
as the output structure when a complete proposal is needed. Preserve mandatory
policy and state exactly what is retained, moved, corrected, or intentionally
left unresolved.

For a semantic-governance request, atomize every material instruction and
compare them in this order: first within each individual instruction file, then
across the effective chain. Classify exact duplicates, partial overlaps,
intentional reinforcements, local refinements, policy-guide-enforcement triads,
contradictions, and lexical-only matches. Never remove a rule merely because it
appears to be common model knowledge: flag deletion candidates for user review,
identify explicit controls, and explain the retrieval rationale for every
retained reinforcement.

When a material contradiction remains after authority and source analysis,
quote both instructions with evidence, state the applicable condition, make a
reasoned recommendation, and ask the user whether one rule takes precedence or
both should become conditional. Do not edit dependent instructions until that
decision is resolved.

### Evaluate

Do not claim that a candidate is better because it is shorter, more detailed,
well formatted, or accepted by a parser. Use the evaluation reference and
[`evaluation-record.md`](assets/templates/evaluation-record.md) to compare a
baseline and candidate under the same repository revision, task, permissions,
host conditions, and rubric. Report unavailable outcome, token, cost, or timing
data explicitly.

## Authority and enforcement boundaries

- Instructions may state intended behavior and approval boundaries; they cannot
  grant or deny runtime access. Route actual control to the narrowest reliable
  enforcement layer.
- Treat an `AGENTS.override.md` as replacing that directory's normal instruction
  file. Treat files from broader directories as earlier guidance and more-local
  files as later guidance. Linked documents are navigation material, not
  automatically loaded higher-precedence instructions.
- Do not make a global or repository-wide policy rewrite, configuration change,
  permissions change, hook installation, or consumer-project change without
  explicit approval of the exact affected targets.
- For a proposed destructive or irreversible operation, require a demonstrated
  recovery record or report that recovery is unavailable.

## Validate and stop honestly

Before reporting a proposal or applied change, verify the effective instruction
chain, referenced paths, current command ownership, contradictions, generated
artifact ownership, source dates, and applicable validation evidence. A passing
formatter, parser, or catalog generator proves only its own narrow contract.

Treat a root file over 60 lines as a review signal, not a failure. For each
retained root inclusion above that signal, explain its repository-wide task
trigger, source owner, retrieval value, and why a narrower layer is not safer.
Verify local link targets and stable heading anchors when present. Linked files
are navigation material, not implicitly loaded instructions; report when a
required linked document is not self-contained for the task it owns.

Stop and report the exact blocker when the target scope, authority, source of
truth, current Codex behavior, approval, target identity, or recovery method is
materially unresolved. Do not retry by weakening the scope, validation, or
controls.

## Report

Return these sections in order when applicable:

1. **Result** — Ready for approval, applied and verified, partially complete, or blocked.
2. **Scope and Authority** — selected mode, targets, exclusions, and approval state.
3. **Evidence and Effective System** — instruction chain, source ledger, and command owners.
4. **Findings and Placement Decisions** — facts, conflicts, duplications, and enforcement routing.
5. **Proposed or Applied Changes** — complete proposal/diff or exact applied scope.
6. **Validation and Evaluation** — commands, fixture outcomes, negative checks, and limitations.
7. **Recovery, Risks, and Next Step** — rollback record, remaining uncertainty, and the next authorized action.
