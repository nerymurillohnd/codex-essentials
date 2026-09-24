---
name: automatic-pr-lifecycle
description:
  Use when the user asks to create, continue, repair, land, or complete a GitHub
  pull request through its protected lifecycle. Coordinate local changes, CI,
  reviews, merge, and synchronization against the current head SHA.
---

# Automatic PR Lifecycle

Treat each repository and pull request as one bounded lifecycle. The user's
directive to create or complete a PR authorizes the ordinary protected path,
including validation, repair, review handling, merge, and permitted cleanup. Do
not request routine checkpoints already covered by that directive. New authority
is needed only for unrelated systems, production deployment, credential changes,
a protection bypass, or another material scope expansion.

## Establish the scope

Inspect applicable `AGENTS.md`, local status, branches, remotes, commits,
unrelated user changes, and GitHub branch rules. Identify the target repository,
base branch, feature branch, PR template, and merge method. Keep worktree
changes outside the task untouched. Use the current-session GitHub MCP tools for
GitHub state and normal protected mutations; fall back to `gh` or `gh api` only
for a specific operation the MCP cannot complete. Do not infer remote health or
permissions from local configuration alone.

## Prepare and publish

1. Work on a task branch separate from protected `main`. Review the intended
   diff and run the repository's format, lint, type, test, and build gates.
2. Classify the actual changes in a descriptive commit. Run normal hooks and
   signatures; never use `--no-verify`, force push, or an administrative bypass.
3. Push the branch normally and confirm the remote head SHA. Find an existing PR
   before creating another. Use the repository PR template, required labels, and
   concise evidence for scope, checks, risks, and migration.

## Observe and repair

For the current PR head SHA, read required checks, workflow logs, reviews,
threads, comments, merge queue or auto-merge state, and mergeability. Classify
each signal as pending, actionable, ready, externally managed, merged, or
blocked. A timeout or uncertain tool result is not a terminal state: re-read the
same PR and remote ref before retrying or acting.

Repair reproducible branch-caused CI failures, conflicts, and valid review
findings within the task. Re-run affected local gates, commit and push without
force, reply with evidence, and resolve a conversation only when the issue is
actually fixed. A new head invalidates every earlier check, review, and
readiness observation; repeat the inspection against the new SHA. Rerun CI only
when a flaky failure is supported by evidence. Document false positives and
external blockers without weakening controls.

## Land and reconcile

Before landing, re-read the exact current head, required checks, review and
conversation status, branch policy, and permitted merge method. Use the merge
queue if required; otherwise use the normal protected merge operation. Never use
admin override or bypass an unresolved check. If the user authorized the full
lifecycle, this final revalidation is the gate; an additional approval request
is unnecessary unless the scope or authority changed.

Treat auto-merge enrollment or queue entry as pending until GitHub reports a
merge for the authorized head. After merge, confirm the merge commit and base
branch state, inspect release or downstream checks relevant to the task, and
sync local `main` without discarding unrelated work. Remove only a branch that
is verified merged and safe to remove under repository policy.

Report the PR URL, old and final head SHAs, check and review evidence, merge
method, resulting base SHA, local sync state, cleanup performed, and any
remaining failure or blocker. Do not call an open, queued, or partially observed
PR complete.
