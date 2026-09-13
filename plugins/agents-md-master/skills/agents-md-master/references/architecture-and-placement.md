# AGENTS.md Architecture and Placement

Use this reference for a new instruction system, nested-boundary design,
contradiction resolution, policy placement, or an enforcement finding.

## Effective Codex instruction model

For current Codex behavior, verify the official `AGENTS.md` documentation before
making compatibility claims. In the documented model, Codex reads its global
instruction file and then considers at most one instruction file per directory
from the project root to the current working directory. In a directory,
`AGENTS.override.md` takes precedence over `AGENTS.md`; later, more-local
guidance is appended after broader guidance. Empty files are ignored and the
combined instruction chain is bounded by configuration.

This behavior does not mean that an instruction file nearest to a changed file
is the only applicable source. It also does not make linked Markdown documents
automatic imports. Record the actual chain for the target working directory.

## Put material in the narrowest reliable layer

| Material                                                                                      | Placement                             | Required evidence                                                                            |
| --------------------------------------------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------- |
| Repository-wide identity, navigation, universal command index, and universal boundaries       | Root `AGENTS.md`                      | Applies to nearly every repository task.                                                     |
| Subtree-specific command, ownership, tooling, validation, or risk rule                        | Nearest nested `AGENTS.md`            | Applies to that subtree and materially differs from inherited guidance.                      |
| Detailed architecture, runbook, release procedure, domain definition, or historical rationale | Versioned project documentation       | Durable but conditional; has an identifiable owner and update trigger.                       |
| Reusable conditional procedure with judgment and outputs                                      | Skill                                 | Applies across repositories or repeated work, and cannot be reduced to a short command list. |
| Required fields, allowed values, wire shape, or generated structure                           | Schema or typed configuration         | A machine can validate it.                                                                   |
| Deterministic repeated command or behavioral invariant                                        | Script, test, or CI                   | The operation can be executed or checked reliably.                                           |
| Filesystem, network, approval, secret, or execution boundary                                  | Runtime permissions and configuration | A runtime control owns the boundary.                                                         |
| Trusted event-driven automation                                                               | Hook                                  | A real lifecycle event and an approved, reviewable handler are required.                     |

## Root and nested content

A root file should contain only the information required to start most tasks
correctly: what the repository is, how to find its authoritative instructions,
the command source of truth, shared validation expectations, and high-impact
approval boundaries. It should link to the next relevant project artifact rather
than copy conditional procedures.

A nested file should identify its subtree and state only local additions,
exceptions, or replacement commands. Do not duplicate inherited root content.
If a nested rule changes a broader rule, state the exact local condition and the
source of truth that justifies the override.

## Resolve contradictions

1. Establish whether two statements actually address the same scope and mode.
2. Apply the authority chain: platform and developer instructions; explicit user
   direction; effective instruction chain; repository configuration and
   implementation evidence; linked documentation; external evidence.
3. Give executable configuration, source code, and current command output
   authority over a stale descriptive claim about the same fact.
4. Classify the result as a valid local override, stale guidance, duplicated
   policy, incompatible configuration, ambiguous ownership, or unsupported
   claim.
5. Propose a disposition: retain, clarify, move, supersede, correct, or block.
   Do not silently choose an interpretation when authority remains unresolved.

## Commands, definitions of done, and recoverability

For every command named in instructions, record its owner, working directory,
input scope, preconditions, expected evidence, and whether it is focused or
full-repository validation. Do not call a missing check successful because a
different check passed.

A definition of done must identify the actual evidence required for the change:
reviewed targets, applicable validation, generated-output freshness, residual
risks, and approval state. It must not infer a successful outcome from an
intention or a formatter run.

For an approved rewrite, use a reviewable diff or complete before/after record.
Identify the recovery mechanism before making an irreversible change: version
control, an existing backup, a generated artifact's source, or an explicit
statement that no recovery record is available.

## Prevent dead references

- Point to the smallest authoritative document, command, schema, or source.
- Verify every local path and anchor after a change; do not assume a Markdown
  link is current because it renders.
- Record the owner and change trigger for operational documentation.
- Refresh external Codex links before relying on a change-sensitive claim.
- Prefer a maintained local index only when the documentation tree is large
  enough that navigation is genuinely ambiguous. Do not introduce tags, import
  syntaxes, or registries without demonstrated retrieval value.

## Anti-patterns

| Anti-pattern                                                   | Corrective action                                                                       |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| A universal root file contains every stack and package detail. | Move conditional material to nested instructions, documentation, or skills.             |
| Prose says it blocks secret access or destructive commands.    | Preserve intent, then route enforcement to permissions, configuration, CI, or hooks.    |
| “Run the usual checks” appears without a source.               | Name the exact owning command, target scope, and expected evidence.                     |
| A community example becomes a compatibility claim.             | Reverify against current official documentation and the actual target host.             |
| A fixed length cap is treated as quality.                      | Measure scope relevance, retrieval value, and the actual configured instruction budget. |
