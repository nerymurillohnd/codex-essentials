# ADR Maintenance

Use this reference only for architecture decision records. This file explains
the procedure. The default output shape lives in
[outputs/adr-example.md](../outputs/adr-example.md).

## Output contract

- If the repository already has an ADR convention, preserve it.
- If the repository has no convention, use
  [outputs/adr-example.md](../outputs/adr-example.md) as the exact baseline for
  metadata, heading order, and section style.
- The example defines the document format.
- This reference defines when to create, update, supersede, audit, repair, and
  save it.
- Remove optional metadata or sections whose facts are unknown. Do not populate
  them solely to reproduce the example.
- Remove all instructional placeholders before saving.

## When an ADR is warranted

Create an ADR when a decision is durable, costly to reverse, cross-cutting, or
material to architecture, security, data, operations, compatibility,
compliance, or major dependency policy.

Do not create an ADR for:

- routine implementation details;
- minor refactors;
- formatting, lint, or typo-only work;
- task tracking;
- release notes;
- unconfirmed proposals with no real decision context.

## Evidence

1. Read repository instructions, existing ADRs, and local conventions first.
2. Inspect the smallest evidence set that proves the decision.
3. Separate confirmed facts, unresolved facts, and inference.
4. Confirm that documented options were genuinely considered before writing
   them as considered options.
5. When links are included, prefer durable links. Do not require a separate link
   merely to corroborate an authorized user's direct declaration.

An explicit, unambiguous user statement is evidence for the decision facts that
the user is authorized to establish within the task scope. Record the stated
outcome, status, rationale, date, and participants directly. Do not require a
second issue, pull request, meeting record, or link unless repository policy
requires it. Do not infer unstated options, rationale, participants, consensus,
or another authority's approval. Seek clarification or stronger evidence only
when authority or finality is unclear, the statement conflicts with repository
evidence, it claims another party's approval, or local policy requires that
approval.

Implementation can prove that a technical choice exists. It cannot prove the
original rationale, participants, or approval state by itself.

## Location and identity

1. Discover existing ADR directories, indexes, filename patterns, number width,
   and whether numbering is global or per category.
2. Preserve the established convention when one exists.
3. With no local convention, use `docs/decisions/` and name the file
   `NNNN-short-kebab-title.md`.
4. With no local sequence, start at `0001`; otherwise use the highest confirmed
   number plus one. Never reuse or renumber an existing identifier.
5. Do not create a category when none exists. In a categorized collection,
   preserve its taxonomy and sequence scope; ask when the scope cannot be
   established from existing records.
6. Update an ADR index only when the repository has one or local policy requires
   one.

## Status

Use the repository's vocabulary first. With no local vocabulary:

- `proposed`: the decision is under consideration or acceptance is unconfirmed;
- `accepted`: an authorized decision maker explicitly approved the decision;
- `rejected`: the proposal was explicitly declined;
- `deprecated`: the decision no longer governs and has no confirmed successor;
- `superseded`: a confirmed successor replaces the decision and is linked.

Do not derive acceptance from implementation alone. A changed accepted decision
requires a successor ADR; do not rewrite the old outcome.

## Create

1. Confirm the decision meets the ADR threshold.
2. Check whether the repository already has its own ADR format.
3. If it does not, start from [outputs/adr-example.md](../outputs/adr-example.md).
4. Assign the location, identifier, filename, and status from the local
   convention or the defaults above. Record a date only when it is confirmed.
5. Write one bounded decision, not a bundle of unrelated decisions.
6. Record only confirmed context, drivers, options, outcome, consequences, and
   supporting links.
7. Keep the ADR `proposed` when acceptance is not confirmed.

Resolve relative dates such as "today" with the session's current date and time
zone when available, then write the repository's date format. If the relevant
date or time zone is unavailable or disputed, ask instead of guessing.

## Complete

1. Compare the ADR with the local convention or, when none exists, the default
   example.
2. Preserve confirmed wording, identity, status, chronology, and author intent.
3. Fill missing metadata or sections only from evidence competent to establish
   those facts.
4. Remove optional unknown fields or sections when using the default format.
   Report missing required facts instead of inserting placeholders.
5. Do not add unconsidered options, inferred rationale, participants, approval,
   or consequences.
6. Continue through the audit and validation procedures before saving.

## Maintain and update

1. Follow the repository's date semantics. Under the default MADR 4 baseline,
   `date` is when the decision was last updated. Preserve an original decision
   date only when the local convention stores it separately.
2. Correct links, metadata, wording defects, and missing confirmed evidence
   without rewriting the historical decision.
3. Do not upgrade a proposal to accepted from implementation evidence alone.
4. Create a new ADR when the accepted outcome, central rationale, or material
   constraints changed.
5. Use supersession instead of silently replacing history.

## Supersede, deprecate, or reject

1. Confirm the transition and its authority.
2. For supersession, create the new ADR first.
3. Give the successor its confirmed status; use `proposed` when its acceptance
   is not confirmed.
4. Change the old ADR to `superseded` and link it to the successor only after
   the successor and replacement decision are confirmed.
5. Link the successor back to the old ADR.
6. Preserve the old rationale as history.
7. Use `deprecated` when the historical decision no longer governs but no
   successor replaces it.
8. Use `rejected` only for a proposal that was explicitly declined.

## Audit

Check:

- filename, number, title, and index agree;
- status and date follow the local convention;
- the ADR records one bounded decision;
- drivers are criteria, not disguised options;
- options are distinct and genuinely considered;
- an accepted ADR names one chosen option and supported rationale;
- a proposed ADR does not invent approval;
- consequences include real tradeoffs when evidence supports them;
- links and supersession references resolve when changed by the task;
- no placeholders, fake people, fake dates, fake links, or invented claims
  remain.

In audit mode, report confirmed defects, unresolved uncertainties, and optional
improvements separately. Do not edit.

## Repair

1. Preserve recoverable history.
2. Separate structural defects from factual defects.
3. Normalize metadata, headings, filenames, and index entries only as far as
   the established convention or the default example requires.
4. Never renumber accepted ADRs solely for aesthetics.
5. Re-run the audit after the repair.

## AD Guidance Tool

If the repository uses the AD Guidance Tool:

1. Inspect its current configuration first.
2. Use its native workflow when the authorized task can be completed through
   that workflow. Do not recreate its generation or lifecycle behavior in a
   parallel DocKeeper mechanism.
3. Preserve tool-managed metadata and structure.
4. Treat generated structure and placeholders as a draft. Preserve explicit
   user-supplied selections and rationale as direct inputs; independently verify
   only inferred or externally attributed claims.
5. Do not install, initialize, or overwrite configuration without explicit
   authorization.

Add custom ADR automation only after identifying a requirement that the
repository's existing mechanism does not provide.

## Private repositories

- Keep private evidence inside the authorized project scope.
- Replace sensitive names with roles when disclosure is unnecessary.
- Do not expose credentials, internal URLs, customer data, or confidential
  rationale when the document scope does not require it.

## Validate and save

1. Run the project's Markdown formatter or checker when available.
2. Run its documentation or ADR index validation when available.
3. Search for placeholders, duplicate identifiers, broken changed links, and
   invalid status transitions.
4. Inspect the final diff for accidental decision drift.
5. Save only the requested files and required reciprocal links or index entries.
6. Do not commit or publish. Report the validated document state to any
   separately authorized owning workflow.

## Sources and attribution

This procedure and its default example are aligned with:

- the [MADR 4 template](https://github.com/adr/madr/blob/develop/template/adr-template.md)
- the [MADR documentation](https://adr.github.io/madr/)
- the [AD Guidance Tool](https://github.com/adr/ad-guidance-tool)

These are documentation references, not runtime dependencies of DocKeeper.
