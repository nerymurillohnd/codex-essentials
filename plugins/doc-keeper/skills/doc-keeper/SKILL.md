---
name: doc-keeper
description:
  Use when creating, auditing, updating, or repairing a changelog,
  release-history document, or architecture decision record, including closeout
  after notable completed work or an explicit durable decision. Do not use for
  generic README edits or release publication.
---

# DocKeeper

Keep changelogs and ADRs aligned with evidence, existing repository conventions,
and the actual owning release or decision process. This skill edits only local
documents in scope. It does not create commits, tags, GitHub Releases, PRs, or
registry publications by itself.

## Choose the pass

- For a requested changelog audit, entry, release rollover, or history repair,
  read [changelog maintenance](references/changelog-maintenance.md).
- For an architectural decision, ADR status, numbering, or supersession, read
  [ADR maintenance](references/adr-maintenance.md).
- If both apply, make separate passes. A notable user/operator/compatibility
  change can warrant a changelog entry; an explicit durable, cross-cutting, or
  costly-to-reverse decision can warrant an ADR. Typo-only, formatting-only,
  test-only, or speculative work does not create either record by itself.

For a companion closeout, finish and verify the primary task first, then inspect
only its relevant diff and explicit decisions. For a direct document request,
the named local document is already in scope. Audit-only requests remain
read-only. Do not ask for a second approval when the user has already authorized
the document change or full owning workflow.

## Establish authority and evidence

Read applicable `AGENTS.md`, existing documents, local status, release/ADR
configuration, and affected history. Determine who owns versioning, changelog
generation, tags, release publication, ADR status, and indexes. Edit an authored
document only through its owning process; if automation owns it, change the
source input or report that the owner cannot be run. A dry run, manifest value,
local tag, remote tag, GitHub Release, and published package are distinct
states.

Use direct repository state for implementation facts, released tags and Releases
for published history, and an authorized user's explicit statement for the
decision facts they can establish. Do not infer participants, rationale,
acceptance, dates, or publication from an implementation alone. Label unresolved
claims or leave them out; never fill a historical gap with plausible text.

## Write and verify

Preserve valid chronology, naming, status, wording, and links. Use the package's
[changelog example](outputs/changelog-example.md) or
[ADR example](outputs/adr-example.md) only when the target has no stronger
convention. Remove example placeholders and unused sections. A changed accepted
decision requires a successor rather than silent rewriting.

Run the target repository's Markdown, document, release, or ADR checks that
apply. Inspect changed links, duplicate versions or IDs, status transitions, and
the final diff. Report the document mode, files, evidence, validation,
unresolved facts, and remote actions left to the owning workflow. Do not claim a
release exists because the changelog section was prepared.
