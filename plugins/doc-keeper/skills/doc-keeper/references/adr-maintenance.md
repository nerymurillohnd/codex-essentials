# Architecture decision maintenance

Read this reference only for an ADR, durable decision status, numbering,
supersession, or an ADR audit. Use the repository's convention first; use the
[default example](../outputs/adr-example.md) only when none exists.

## Threshold and evidence

An ADR is appropriate for a durable, cross-cutting, costly-to-reverse choice
about architecture, security, data, operations, compatibility, or major
dependency policy. Routine code details, formatting, release notes, and task
tracking do not justify one on their own.

Read existing ADRs, indexes, naming rules, and the smallest evidence set that
establishes the choice. An explicit, unambiguous statement from the authorized
decision maker can establish the decision they made; do not demand a second
meeting record merely to believe them. Implementation can prove a choice was
made in code, but cannot prove unstated rationale, participants, or approval.

## Create or update

1. Discover the existing directory, numbering scope, status vocabulary, and date
   convention. With no local convention, use `docs/decisions/` and the next
   unused `NNNN-short-title.md` number.
2. Record one bounded decision: context, real drivers, options genuinely
   considered, selected outcome, consequences, and confirmation method. Omit
   optional facts that are unknown; do not leave placeholders.
3. Keep a proposal `proposed` until authorized acceptance is explicit. Do not
   infer acceptance from a merge or deployed implementation.
4. Preserve an accepted decision's rationale as history. If its outcome or
   central constraints change, write a successor and link both records after the
   replacement decision is confirmed. Use `deprecated` when it no longer governs
   without a successor; `rejected` only for an explicitly declined proposal.
5. Update an index or reciprocal link only when the repository owns one or the
   change requires it. Never renumber accepted ADRs for aesthetics.

## Verify

Check title/filename/number agreement, status authority, date semantics,
considered options, evidence for claims, consequences, changed links,
supersession links, and remaining placeholders. Run local Markdown or ADR checks
and inspect the final diff. Keep private rationale or customer data within its
authorized audience.

Source: [MADR guidance](https://adr.github.io/madr/), consulted 2026-09-24. This
reference is an authoring aid, not a required runtime dependency.
