---
name: doc-keeper
description: Use when maintaining changelogs, release history, or ADRs after completed work, release preparation, or explicit architectural decisions. Do not use for routine implementation, generic README prose, formatting-only work, or test-only work.
---

# DocKeeper

Keep changelogs and ADRs aligned with completed work and explicit decisions.
Use existing repository and release infrastructure first. Preserve history.
Make no remote change. Hand separately authorized remote work to its owning
workflow after the document pass.

When the host platform or repository already provides the required operation,
use or wire that native mechanism through its owning workflow. Do not build a
parallel script, hook, release engine, document generator, or state machine to
duplicate it. Add DocKeeper-specific automation only after proving a real gap,
keeping the extension minimal, and obtaining authorization for the change.

If a configured mechanism owns an artifact but cannot run because it is absent,
unavailable, or prohibited by the task, stop that part and report the exact
blocker. Never simulate the owner's output by manually editing generated
changelogs, version files, release manifests, Release PR state, tags, releases,
or publication state.

Do not use this skill as a release publisher, Git tagger, or generic prose
editor. For mixed requests, apply DocKeeper only to the changelog or ADR portion
and let the authorized release workflow own publication and remote state.

## Activate

Use DocKeeper in either case:

1. **Direct maintenance:** the user asks to create, complete, audit, update, or
   repair a changelog or ADR.
2. **Companion closeout:** an implementation task finishes with a confirmed
   notable change or an explicit durable architectural decision that may
   require its project documentation to stay synchronized.
3. **Release preflight:** an authorized release task requires changelog rollover
   or release-history verification before the owning workflow publishes it.

For companion closeout:

1. Complete and verify the primary task first.
2. Inspect only the task-owned diff and explicit decisions from the current
   work.
3. Apply the changelog and ADR thresholds independently before reading a
   reference.
4. If neither threshold is met, do not read a reference and do not edit
   documentation.
5. If a threshold is met, run only the matching document pass.

A change request authorizes only local changelog or ADR companion documentation
and their required indexes or reciprocal links when repository policy requires
them or they are necessary to keep the same change consistent. It does not
authorize unrelated historical reconstruction, release publication, or remote
state changes.

### Closeout thresholds

- **Changelog:** confirmed impact on users, operators, integrators,
  compatibility, installation, migration, packaging, or security.
- **ADR:** an explicit decision that is durable, cross-cutting, costly to
  reverse, or material to architecture, security, data, operations,
  compatibility, compliance, or major dependency policy.

When both thresholds apply, run separate passes. A decision can justify an ADR
before implementation; a changelog entry requires confirmed change or release
impact.

## Route the request

1. Identify each requested document type before reading a reference.
2. For `CHANGELOG.md`, curated release history, unreleased changes, yanked
   releases, changelog links, or release chronology, read only
   [references/changelog-maintenance.md](references/changelog-maintenance.md)
   for that pass.
3. For ADRs, architectural decisions, decision status, numbering, naming,
   supersession, links, or chronology, read only
   [references/adr-maintenance.md](references/adr-maintenance.md) for that pass.
4. If both types are requested, handle them as separate passes. Do not mix their
   procedures, examples, or lifecycle rules.
5. If the document type cannot be determined with high confidence, ask one
   clarification question before reading either reference.

## Select the mode

- **Create:** no target document exists.
- **Complete:** a document exists but required content is missing.
- **Audit:** inspect and report. Do not edit unless the user also requests a fix.
- **Update:** add confirmed information without rewriting valid history.
- **Repair:** correct structure, contradictions, broken links, or unsupported
  claims while preserving recoverable content.

Release rollover is an **Update** operation. When it is requested or required
by release preflight, select Update and follow the changelog reference's release
rollover procedure.

## Shared procedure

1. Read the applicable repository instructions and local documentation rules.
2. Locate the target files, the matching example output, indexes, and
   neighboring documents.
3. Discover the repository's configured Git, GitHub, release, and ADR
   mechanisms. Use their native inputs and lifecycle instead of recreating
   their behavior.
4. Establish the authorized scope. Treat commit, push, tag, release, issue,
   pull-request, and other remote mutations as separate actions.
5. Collect the smallest sufficient evidence. Match each fact to the source
   competent to establish it:
   - the current repository state and tests;
   - merged or committed history;
   - release metadata and automation configuration;
   - linked issues, pull requests, and authoritative external records;
   - explicit user-provided facts within the user's authority.
6. Resolve each conflict with the source competent to establish that fact.
   Repository evidence governs current implementation state. An authorized,
   explicit user declaration governs a new decision or status transition unless
   local policy assigns approval elsewhere. Mark unresolved conflicts instead
   of guessing.
7. Classify statements internally as confirmed, unresolved, or inferred. Write
   only confirmed facts as facts. Label necessary inferences.
8. Follow the selected reference from procedure through validation and save.
9. Preserve established naming, location, language, and formatting conventions
   unless they are the defect being repaired.
10. Inspect the final diff. Ensure it contains only authorized documentation and
    required indexes or links.

## Write rules

- Use a bundled example only to create a missing document when no
  project-specific convention or template exists.
- When no local convention exists, match the structure, order, and output style
  defined by the selected reference and its example.
- Keep edits minimal. Do not rewrite valid historical wording only to match a
  bundled example.
- Do not reorder established history unless evidence proves the chronology is
  wrong and repair is in scope.
- Do not add placeholders, invented dates, fake links, fake issue or pull-request
  numbers, or unverified decision-makers.
- Treat future-tense or tentative statements as intent. Treat an explicit,
  unambiguous user declaration as evidence for the decision, rationale,
  participants, status, or release facts the user is authorized to establish.
- Do not require a second issue, pull request, meeting record, or link merely to
  corroborate that direct declaration unless repository policy requires it.
- Do not infer unstated rationale, participants, consensus, publication, or
  another party's approval.

## Safety rules

- Never invent a release, date, version, decision, participant, rationale, or
  outcome.
- Never rewrite published history silently. Add a corrective note when an
  historical correction is necessary.
- Never convert generated placeholders, inferred automation output, or
  unsupported claims into an authoritative record without competent evidence.
  Preserve explicit user-provided inputs according to the selected reference.
- Never expose credentials, private URLs, confidential discussion, customer
  data, or security details that increase risk.
- DocKeeper itself never creates a commit, push, tag, release, issue, pull
  request, or comment. When the user authorizes a release or other remote
  action, DocKeeper performs only its document pass and hands the result to the
  owning workflow.
- Stop and report the exact missing evidence when accuracy depends on an
  unresolved material fact.

## Completion report

Report:

- mode and document type for each pass;
- files created, changed, or audited;
- example or local convention followed;
- evidence used;
- confirmed facts added or preserved;
- validation performed and its result;
- unresolved facts or inferences not written as history;
- remaining gaps or blocked validations;
- an explicit statement when no local edits were made;
- remote actions not performed.

For a companion closeout where neither threshold is met, skip the full report.
State only that no changelog or ADR action was warranted when that fact is useful
to the primary task handoff.
