---
name: audit-and-cure-memories
description:
  Use when the user asks to audit, verify, reconcile, or prepare corrections to
  Codex memory at project-relevant, global, or combined scope. Compare each
  material memory claim with current evidence before proposing a change.
---

# Codex Memory Audit

Treat local Codex memory files as generated state and a recall layer. Durable
project rules belong in `AGENTS.md` or checked-in documentation, not solely in
memory. Read the
[current Codex Memories documentation](https://developers.openai.com/codex/memories)
before making host-specific storage or update claims.

## Bound the audit

Choose one scope from the user request: project-relevant memories, global
memories, or both. Resolve the active project and effective Codex home from the
actual session; never assume a fixed path or separate project-memory store.
Enumerate candidate memory files and justify inclusion. Exclude instructions,
configuration, skill definitions, logs, and unrelated project data. Preserve
unrelated changes and do not read real secret values; a suspected secret is a
finding to redact.

## Verify claims without mutation

Read each selected memory artifact completely before evaluating it. For every
material claim, record its file/location, scope, date or snapshot, current
evidence, and status: verified, partly verified, stale, false, duplicated,
misplaced, ambiguous, or unverifiable. Distinguish committed code, local dirty
state, remote state, official documentation, and inference. Check pointers,
duplicates, contradictions, and omissions in both directions.

Current official OpenAI documentation controls product behavior; actual project
files and tool output control project facts. A search result, past summary, or
memory statement cannot prove its own accuracy. When a source is unavailable,
preserve the claim as uncertain rather than upgrading it to verified.

## Propose and apply corrections

Report the complete proposed change set with exact target, replacement text or
note, reason, supporting evidence, and recovery method. Audit and proposal steps
are read-only. A direct user request to update memory authorizes only that
scoped memory work; if the user requested review before applying, await their
decision on the exact proposal.

Use the host-supported memory update path when one exists. Codex documents local
memory files as generated state and advises against editing them by hand as the
primary control surface. If this runtime exposes only a write-note mechanism,
write the approved correction note there; do not overwrite a generated summary
or database directly. If no supported write route exists, deliver the proposal
and explain the limit. Never modify `AGENTS.md`, skills, configuration, Git
refs, or unrelated files as a side effect of a memory audit.

Immediately before an authorized write, re-read the exact target and evidence
for drift. Afterward, inspect the resulting note or state, verify the corrected
claim and scope, and report any remaining uncertainty. Do not call a proposed
diff an applied change or a fingerprint a recoverable before-image.

## Report

Give the selected scope, candidate inventory, claim-by-claim findings,
authoritative sources, exact proposed or applied changes, checks performed, and
unresolved gaps. Name any tool, permission, or storage behavior that could not
be verified. A failed or partial update remains failed or partial in the final
status.
