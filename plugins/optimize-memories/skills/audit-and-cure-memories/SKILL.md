---
name: audit-and-cure-memories
description: Use when a user asks to audit, verify, reconcile, or update Codex memory artifacts at project scope, global cross-project scope, or both. Use for memory audits, consistency reviews, stale-memory cleanup, memory correction, or complete memory updates.
---

# Codex Memory Audit

## Operating contract

- Support exactly one mode: `project`, `global`, or `complete`.
- Execute phases in order; do not skip, merge, or silently reorder tasks.
- Maintain an audit ledger with every task ID and one status: `PASS`, `FAIL`, `BLOCKED`, or `N/A`.
- Execute one task ID as one atomic unit; do not combine task IDs into an untraceable action.
- Before each task, record `input` and `expected_output`; after it, record `action`, `evidence`, `status`, and `output`.
- Include the full ledger in the report; never mark a task complete from intention, inference, or a tool invocation alone.
- Attach concrete evidence to every `PASS`; explain every `N/A`; never infer completion.
- Close a phase only when every task is `PASS` or justified `N/A` and every checklist item is satisfied.
- Treat `FAIL`, `BLOCKED`, unresolved authority conflicts, target drift, or missing approval as stop conditions.
- Resolve or explicitly report every `FAIL` before advancing; never continue past a failed gate.
- Perform no mutation during discovery, inventory, verification, or reporting.
- Never invent paths, memory formats, official capabilities, tool results, or verification coverage.

## Tool and permission policy

1. Discover available skills, plugins, and tools at runtime; a skill cannot install, enable,
   authenticate, or elevate another capability.
2. Use `$openai-docs` first when available for OpenAI/Codex claims. Otherwise use live official
   web search/open/fetch. Public documentation normally needs no additional permission.
3. Use only `developers.openai.com`, `learn.chatgpt.com`, and `platform.openai.com` for OpenAI
   documentation; use `https://github.com/openai/codex` for official source and release evidence.
4. Use GitHub search/fetch/compare only when the connector is available and read access exists.
   Do not create or modify issues, pull requests, files, branches, or refs.
5. Use local shell, `rg`, filesystem inspection, and `git` for actual local state. Use browser
   control only for an essential live public UI state unavailable through docs or APIs.
6. If a required tool, connection, permission, or network route is unavailable, mark the task
   `BLOCKED`, record the limitation, and continue only where the evidence remains sufficient.
7. Use `$personal-context` only for a materially relevant prior user decision; never as technical
   or official evidence.
8. Do not add `dependencies.tools` to `agents/openai.yaml` merely because a tool is mentioned;
   add dependencies only for verified, intentionally required connections in a separately approved
   packaging/configuration change.

## Phase 0 — Select and bound scope

Tasks:

0.1 Parse the user's requested mode; ask if it is not unambiguous.
0.2 Resolve the active project root using current Codex discovery; do not assume a folder.
0.3 Resolve the effective Codex home from the environment and current official documentation.
0.4 Define included memory candidates and excluded non-memory artifacts.
0.5 Record the scope, resolved roots, exclusions, and reasons in the audit ledger.

Phase output: `Scope Record` containing resolved roots, selected mode, exclusions, and ledger entries 0.1–0.5.

Checklist:

- [ ] Exactly one mode selected.
- [ ] Every root is discovered and evidenced.
- [ ] No fixed project folder or guessed memory path was used.
- [ ] `AGENTS.md`, `AGENTS.override.md`, skills, config, rules, logs, and source docs are excluded.
- [ ] Phase 0 has no `BLOCKED` task.

Exit gate: Advance only when all Phase 0 tasks are `PASS` or justified `N/A`; any `FAIL` or `BLOCKED` stops the workflow.

## Phase 1 — Establish current authority

Tasks:

1.1 Read current Memories documentation: `https://developers.openai.com/codex/memories`.
1.2 Read current Config Reference: `https://developers.openai.com/codex/config-reference`.
1.3 Read current Customization overview: `https://developers.openai.com/codex/customization/overview`.
1.4 Read current Changelog: `https://developers.openai.com/codex/changelog`.
1.5 Inspect `https://github.com/openai/codex` source/releases when implementation behavior needs confirmation.
1.6 Follow redirects; record canonical URL, retrieval date, publication/update date, version, and evidence location.
1.7 Record disagreements between official documentation, official source, and local behavior.

Phase output: `Authority Register` containing canonical sources, dates, versions, evidence locations, and conflicts.

Checklist:

- [ ] Required official pages were actually opened, not inferred from search snippets.
- [ ] Relevant changelog/release entries were checked.
- [ ] Source authority and evidence location are recorded per technical claim.
- [ ] Unresolved source conflicts are explicitly marked `BLOCKED` or `UNKNOWN`.

Exit gate: Advance only when all Phase 1 tasks are `PASS` or justified `N/A`; unresolved authority conflicts stop the workflow.

## Phase 2 — Inventory without mutation

Tasks:

2.1 Enumerate memory candidates dynamically within the selected scope.
2.2 Record name, exact location, type, format, scope evidence, timestamps, size, and fingerprint.
2.3 Read every selected candidate completely before evaluating claims.
2.4 Redact secrets from the report and flag them as findings.
2.5 Build a claim ledger with one row per atomic claim and its source artifact.

Phase output: `Memory Inventory` and `Atomic Claim Ledger`.

Checklist:

- [ ] Every candidate has a documented inclusion reason.
- [ ] Every selected candidate was fully read.
- [ ] No excluded instruction/configuration artifact was treated as memory.
- [ ] Every atomic claim has a stable artifact reference.
- [ ] No write, delete, move, or overwrite occurred.

Exit gate: Advance only when all Phase 2 tasks are `PASS` or justified `N/A`; incomplete reads or missing candidate evidence stop the workflow.

## Phase 3 — Verify reality and classify findings

Tasks:

3.1 Capture current repository HEAD, branch, working-tree state, and relevant file evidence.
3.2 Verify each project claim against the actual current project state.
3.3 Verify each global claim against the actual Codex host/configuration and cross-project evidence.
3.4 Classify every claim: `verified`, `partly verified`, `stale`, `false`, `ambiguous`,
`duplicated`, `scope-misplaced`, `unsupported`, or `unverifiable`.
3.5 Detect exact duplicates, semantic duplicates, contradictions, omissions, and scope contamination.
3.6 Verify every index, pointer, or registry resolves to a real in-scope artifact.
3.7 Determine whether each claim is durable and non-derivable from current code/state.

Phase output: `Verification Matrix` with claim status, evidence, scope classification, and inconsistency categories.

Checklist:

- [ ] Every claim has an evidence status and evidence pointer.
- [ ] Committed, uncommitted, generated, and unavailable evidence are distinguished.
- [ ] Official claims and local observations are not conflated.
- [ ] Duplicate/conflict/scope findings were checked in both directions.
- [ ] Unknowns remain unknown; no unsupported claim was upgraded to `verified`.

Exit gate: Advance only when all Phase 3 tasks are `PASS` or justified `N/A`; any failed verification remains a finding and blocks advancement until resolved or explicitly reported.

## Mandatory report structure

Emit the report in this order:

1. Audit metadata and coverage.
2. Capability/permission matrix.
3. Scope Record and resolved roots.
4. Authority Register.
5. Full task ledger.
6. Memory Inventory and Atomic Claim Ledger.
7. Verification Matrix and findings.
8. Complete proposed change set with diffs.
9. User-observation dispositions, when applicable.
10. Approval gate or final verification result.

## Phase 4 — Produce the approval report

Tasks:

4.1 Report audit name, date, selected scope, resolved roots, authority versions, and coverage.
4.2 Report each finding with: memory name, exact location, finding type, severity, existing claim,
discrepancy/anomaly, evidence status, and local evidence.
4.3 Propose explicit corrected text, deletion, merge, move, or retention for each finding.
4.4 Include a complete unified diff or complete before/after block for every affected file.
4.5 Cite direct official sources for corrections about Codex behavior, capabilities, or configuration; cite authoritative local or project evidence for project-specific corrections; include exact evidence locations for every correction.
4.6 Include risk, rationale, rollback, verification method, and confidence for each change.
4.7 Include all proposed changes in one consolidated change set; do not hide follow-up edits.
4.8 State clearly that no memory change has been made.

Phase output: `Approval Report` containing the complete, reproducible proposal and no mutation.

Checklist:

- [ ] Required metadata fields are present for every finding.
- [ ] Every proposed correction has a complete diff/before-after representation.
- [ ] Every correction has official and local support, or is marked uncertain.
- [ ] The consolidated change set is internally consistent.
- [ ] The report is proposal-only and awaits explicit approval.

Exit gate: Advance only when every report requirement is present and every unresolved item is explicitly marked; no mutation is permitted in this phase.

## Phase 5 — Evaluate user observations

Tasks:

5.1 Parse each user observation as a separate issue.
5.2 Classify it `correct`, `partly correct`, `unsupported`, or `needs clarification`.
5.3 Explain the evidence, risk, and effect on scope or recommendation.
5.4 Accept valid corrections; reject harmful or contradicted changes with reasons.
5.5 Regenerate the entire consolidated report and all diffs, including unchanged findings.
5.6 Reset approval status whenever the proposed change set changes.

Phase output: `Revised Approval Report` containing the complete regenerated proposal and refreshed ledger.

Checklist:

- [ ] Every observation has an explicit disposition.
- [ ] No observation was accepted merely to agree with the user.
- [ ] All affected and unaffected findings appear in the regenerated set.
- [ ] Changed proposals require renewed approval.

Exit gate: Advance only when every observation has a disposition and the final proposal is stable; any changed proposal resets the approval gate.

## Phase 6 — Apply only the approved set

Tasks:

6.1 Require explicit affirmative approval of the final consolidated proposal.
6.2 Re-discover, reread, and re-fingerprint every target immediately before writing.
6.3 Stop and regenerate the report if any target, source, scope, or fact drifted.
6.4 Use a current documented Codex write mechanism when one exists.
6.5 If direct editing is the only option, label it unsupported/manual and obtain approval for that risk.
6.6 Apply only approved changes; preserve unrelated changes and create a recoverable backup when practical.

Phase output: `Applied Change Record` containing approved targets, actual operations, and pre-write fingerprints.

Checklist:

- [ ] Approval matches the exact current proposal.
- [ ] All targets still match the approved baseline.
- [ ] No unapproved opportunistic change was made.
- [ ] Unsupported/manual operations were explicitly identified and approved.

Exit gate: Advance only when every approved operation is accounted for; any drift, unapproved action, or failed write stops the workflow.

## Phase 7 — Verify and close

Tasks:

7.1 Re-read every changed artifact completely.
7.2 Validate syntax, format, fingerprints, indexes, pointers, and scope.
7.3 Re-run duplicate, contradiction, and cross-scope checks.
7.4 Recheck every corrected claim against current official sources and local reality.
7.5 Record exact resulting files, unresolved limitations, rollback data, and verification evidence.
7.6 Assign final outcome: `PASS`, `PARTIAL`, `BLOCKED`, or `FAILED`.

Phase output: `Closure Report` containing post-change evidence, resulting fingerprints, unresolved limitations, and final outcome.

Checklist:

- [ ] Every approved change was applied exactly once or its failure is reported.
- [ ] Post-change evidence is newer than the pre-change baseline.
- [ ] No unresolved critical inconsistency is hidden.
- [ ] Final status reflects actual verification, not intention.

Exit gate: Close only when all applicable Phase 7 tasks and checklist items are resolved; `PARTIAL`, `BLOCKED`, or `FAILED` must be reported as such.

## Mandatory stop conditions

Stop and report instead of guessing when the mode, root, candidate scope, official authority,
write mechanism, target identity, approval, or post-change verification cannot be established.
Do not claim completion after a `BLOCKED`, failed, partial, or inference-only check.
