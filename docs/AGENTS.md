# Documentation Guidelines

## Authority and Scope

- Treat `docs/` as the canonical home for repository documentation.
- Read this file before creating, editing, moving, or deleting anything under `docs/`.
- Keep repository documentation and durable technical artifacts in English unless a document explicitly requires another language.
- Record time-sensitive claims with their date, repository revision, source, and verification status.
- Keep plans, decisions, maintenance, operations, audits, and contributor guidance in their designated folders.
- Use relative links inside `docs/` and repair links when documented paths change.
- Never store credentials, tokens, private keys, or sensitive personal data in documentation.

## Root Documentation

- Keep root-level files for cross-cutting entry points that do not belong to a specialized folder.
- Use `roadmap.md` for prioritized product direction, sequencing, and explicitly accepted scope.
- Link detailed guidance from the relevant index or instruction file instead of duplicating it.

## `agent-guidelines/`

- Store durable instructions that govern repository architecture, tooling, security, quality, ownership, and communication.
- Keep each file focused on one policy area and make every rule actionable.
- Update links from the root `AGENTS.md` whenever a policy file is added, renamed, or removed.
- Do not place task-specific plans, audit findings, or temporary instructions here.

## `contributing/`

- Store contributor-facing workflows, contribution contracts, and package authoring guidance here.
- Keep commands, required checks, and contribution boundaries synchronized with the repository implementation.
- Document compatibility effects when a contribution workflow changes package or catalog behavior.

## `decisions/`

- Store durable architectural and operational decisions as numbered ADRs or decision records.
- State the context, decision, alternatives, consequences, and status for every new decision.
- Treat accepted decisions as historical records and create a superseding record instead of rewriting their rationale.
- Link implementation plans and affected policies when a decision changes repository behavior.

## `maintenance/`

- Store active technical debt, deferred remediation, and verified resolution records here.
- Record each debt item with evidence, impact, owner or responsible area, next action, and review condition.
- Move an item to resolved records only after the corrective change and its verification are complete.
- Keep security findings in audit records unless they are explicitly converted into tracked maintenance work.

## `operations/`

- Store runbooks, external-service procedures, permissions, release operations, and recovery instructions here.
- Record exact commands, prerequisites, expected outputs, rollback steps, and external identifiers for operational procedures.
- Re-verify GitHub, release, project, and environment claims before presenting them as current.
- Describe secrets by variable name or secret location only and never by value.

## `audits/`

- Store dated repository, security, compliance, and operational audit reports here.
- Use `YYYY-MM-DD-<scope>-review.md` naming and create a new file for each audit cycle.
- Include scope, revision, evidence, status by area, findings, severity, limitations, and prioritized remediation.
- Separate confirmed facts, reasoned inferences, and unresolved questions in every report.
- Preserve prior reports as historical snapshots and document follow-up status in a new report or linked maintenance item.
- Do not overwrite an audit to hide a prior finding or silently change its conclusion.

## `superpowers/plans/`

- Store implementation plans with exact files, interfaces, verification commands, and completion criteria.
- Keep plans aligned with the approved specification and mark execution progress without rewriting the original intent.
- Treat a plan as preparation, not evidence that the implementation exists or passed verification.

## `superpowers/specs/`

- Store approved requirements and design specifications that define intended behavior before implementation.
- State scope, constraints, non-goals, acceptance criteria, and compatibility expectations explicitly.
- Update or supersede a specification when approved scope changes and link the resulting decision record.

## Cross-Folder Changes

- Update the smallest authoritative document set when a policy, process, decision, or audit conclusion changes.
- Add links between related documents instead of copying conflicting versions of the same rule.
- Run the repository documentation gate and relevant validation after documentation changes.
