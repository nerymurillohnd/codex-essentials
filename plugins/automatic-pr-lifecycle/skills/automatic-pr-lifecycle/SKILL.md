---
name: automatic-pr-lifecycle
description: Use when taking one or more GitHub pull requests from local changes through protected landing, CI and review repair, merge observation, or an evidenced blocker.
---

# Automatic Pull Request Lifecycle

## End-to-end flow

Scope → Inspect → Prepare → Validate → Commit → Push → Create PR → Observe/Classify → Repair/Revalidate → Confirm → Land → Observe Landing → Close → Report

GitHub operations use the GitHub MCP tools explicitly listed below. Local Git operations such as formatting, testing, committing, pushing, branch switching, and conflict resolution remain local workspace operations.

## MCP-only operating model

- This skill bundles no scripts, hooks, MCP server, or background process.
- Use the connected GitHub MCP tools as the primary GitHub interface.
- Keep repository, PR number, base, branch, current head SHA, and last observed state in the active lifecycle record.
- Re-read remote state before every consequential mutation and after every uncertain result.
- Treat hooks as optional guardrails rather than the lifecycle engine.
- Do not rely on a background hook or manual progress checks to block, approve, resume, or complete the workflow.
- Run Scope → Inspect → Prepare → Validate → Commit → Push → Create PR → Observe/Classify → Repair/Revalidate as an autonomous control loop.
- No mid-cycle user checkpointing is required or expected.
- Use `gh` or `gh api` only for the specific operation that MCP cannot complete.

## Phase 1 — Define the scope

1. Confirm scope boundaries: repositories, independently owned repos, submodules, and task-related changes.
2. Separate task-related changes from unrelated modifications and keep that boundary fixed.
3. Determine the base branch from repository policy and configuration.
4. Treat each repository and PR as an independent lifecycle unit.

GitHub MCP tools:

- `mcp__codex_apps__github_list_repositories`
- `mcp__codex_apps__github_get_repo`
- `mcp__codex_apps__github_search_repositories`

## Phase 2 — Inspect the environment

1. Read repository-specific instructions and branch-policy context (including default-branch protections).
2. Inspect local Git state: workspace, remotes, current branch, commits, and modified files.
3. Verify the configured remote accepts normal push for this branch.
4. Preserve unrelated user changes.

GitHub MCP tools:

- `mcp__codex_apps__github_get_repo`
- `mcp__codex_apps__github_get_repo_collaborator_permission`
- `mcp__codex_apps__github_get_user_login`
- `mcp__codex_apps__github_search_branches`

## Phase 3 — Prepare the feature branch

1. Create or select a safe local feature branch that is separate from `main` and protected branches.
2. Ensure the branch contains only task-related changes, resolving overlaps with unrelated changes before proceeding.
3. Do not force-push or rewrite published history.

GitHub MCP tools:

- `mcp__codex_apps__github_search_branches`
- `mcp__codex_apps__github_compare_commits`

The normal workflow creates and updates the working branch with local Git so that local hooks and repository controls remain active.

## Phase 4 — Validate locally

1. Run applicable local quality gates: formatters, linters, type checks, tests, and `npm run check` when required by repository policy.
2. Fix deterministic failures before creating or updating the PR.
3. Record the validation commands and their exact results.

GitHub MCP tools:

- No GitHub MCP mutation is required for local validation.
- Use `mcp__codex_apps__github_get_repo` only when repository settings affect the required checks.

## Phase 5 — Create the commit

1. Review the complete local diff, determine the real change type, and craft a descriptive message consistent with repository history.
2. Run normal pre-commit hooks; fix failures and retry before proceeding.
3. Create the commit without `--no-verify` and record the exact resulting commit SHA.

GitHub MCP tools:

- `mcp__codex_apps__github_fetch_commit`
- `mcp__codex_apps__github_search_commits`

The commit itself should normally be created with local Git to preserve signing, hooks, and repository-specific commit behavior.

## Phase 6 — Push the branch

1. Push the feature branch to the configured remote without force.
2. Verify the remote branch points to the expected head SHA.
3. Treat the pushed head SHA as the new lifecycle source of truth.

GitHub MCP tools:

- `mcp__codex_apps__github_search_branches`
- `mcp__codex_apps__github_fetch_commit`

The push is performed with local Git rather than a remote file or ref mutation tool.

## Phase 7 — Create or locate the pull request

1. Search for an existing open PR for the feature branch and create one only if missing.
2. Build the PR title and body from repository policy and commit history, including scope, validations, risks, and expected behavior.
3. Add `@codex` to the PR body and apply every required label.
4. Record the repository, PR URL, base branch, feature branch, and head SHA.

GitHub MCP tools:

- `mcp__codex_apps__github_search_prs`
- `mcp__codex_apps__github_get_pr_info`
- `mcp__codex_apps__github_create_pull_request`
- `mcp__codex_apps__github_label_pr`
- `mcp__codex_apps__github_add_issue_labels`

## Phase 8 — Observe and classify the PR state

1. Read the PR with its head SHA plus checks/workflows, reviews, threads/comments, and merge/draft/auto-merge policy for the current head.
2. Normalize all signals into one canonical lifecycle state and persist evidence source + observation timestamp in the active record.
3. Classify transitions:
   - `pending` means continue polling.
   - `actionable` means enter the repair-and-revalidate loop.
   - `ready` means the current head satisfies gates and may move to readiness confirmation.
   - `auto_merge` means external auto-merge is configured.
   - `awaiting_merge` means landing is accepted but not complete.
   - `merged` is terminal success only when the authorized SHA is confirmed.
   - `blocked` requires diagnosis/escalation.
   - `timeout` requires consuming the latest observer output and re-evaluating before any action.
4. Mark any prior observations and approvals as stale after each remote head change.

GitHub MCP tools:

- `mcp__codex_apps__github_get_pr_info`
- `mcp__codex_apps__github_get_pr_diff`
- `mcp__codex_apps__github_fetch_pr`
- `mcp__codex_apps__github_get_commit_combined_status`
- `mcp__codex_apps__github_fetch_commit_workflow_runs`
- `mcp__codex_apps__github_list_pull_request_reviews`
- `mcp__codex_apps__github_list_pull_request_review_threads`
- `mcp__codex_apps__github_fetch_pr_comments`

## Phase 9 — Repair and revalidate actionable findings

1. Trigger this phase whenever the normalized state is `actionable` or review-driven issues are present.
2. Pull PR state, checks, review threads, comments, and relevant diff/log evidence for the same head SHA.
3. Classify each finding as actionable, stale, false-positive, flaky, or externally blocked.
4. Resolve conflicts and update the base only when policy or readiness requires it.
5. Fix only real/reproducible branch-caused defects with minimal, targeted changes.
6. Rerun CI jobs only when flakiness is evidenced and the rerun is justified.
7. Run required local checks after each code change.
8. Commit validated fixes locally and push the new head SHA without force.
9. Reply to every addressed review thread with evidence, and resolve it only when genuinely fixed and validated.
10. Keep stale and false-positive findings documented with technical justification.
11. Treat old observations and approvals as stale after each push; return to Phase 8 for the new head.
12. Repeat until the state becomes `ready`, `auto_merge`, `merged`, or true `blocked`.
13. Never jump directly to landing while any actionable finding remains.

GitHub MCP tools:

- `mcp__codex_apps__github_compare_commits`
- `mcp__codex_apps__github_fetch_workflow_run_jobs`
- `mcp__codex_apps__github_fetch_workflow_job_logs`
- `mcp__codex_apps__github_fetch_workflow_job_steps`
- `mcp__codex_apps__github_rerun_failed_workflow_run_jobs`
- `mcp__codex_apps__github_rerun_workflow_job`
- `mcp__codex_apps__github_fetch_pr_comments`
- `mcp__codex_apps__github_list_pull_request_review_threads`
- `mcp__codex_apps__github_list_pull_request_reviews`
- `mcp__codex_apps__github_reply_to_review_comment`
- `mcp__codex_apps__github_add_comment_to_issue`
- `mcp__codex_apps__github_fetch_pr_file_patch`
- `mcp__codex_apps__github_update_review_comment`
- `mcp__codex_apps__github_resolve_review_thread`
- `mcp__codex_apps__github_unresolve_review_thread`
- `mcp__codex_apps__github_add_review_to_pr`

## Phase 10 — Confirm exact readiness

1. Process one `ready` PR at a time.
2. Determine whether the repository requires a merge queue.
3. Determine the permitted merge method from policy and repository settings.
4. Re-read the PR, checks, reviews, and unresolved threads for the current head SHA.
5. Confirm that every readiness observation refers to that same head SHA.
6. Build a landing record with repository, PR URL, PR number, head SHA, action, method, and evidence.
7. Warn that the approved request may merge the pull request immediately.
8. Request explicit confirmation for that PR and exact head SHA.
9. Do not infer approval from silence, another PR's signal, or stale authorization.
10. Proceed only when approval is explicitly recorded for that exact PR and head SHA; otherwise remain in controlled observation and repair/revalidate loops.
11. Allow the workflow to stop at `ready` without landing.

GitHub MCP tools:

- `mcp__codex_apps__github_get_repo`
- `mcp__codex_apps__github_get_pr_info`
- `mcp__codex_apps__github_get_repo_collaborator_permission`
- `mcp__codex_apps__github_get_commit_combined_status`
- `mcp__codex_apps__github_list_pull_request_reviews`
- `mcp__codex_apps__github_list_pull_request_review_threads`
- `mcp__codex_apps__github_fetch_commit_workflow_runs`

## Phase 11 — Execute protected landing

1. Stop without mutation if confirmation is declined.
2. Immediately re-read the PR and every readiness gate after approval.
3. Compare the current head SHA with the approved landing record.
4. Invalidate approval if the head, policy, or any gate changed.
5. Revalidate the merge queue and merge-method policy.
6. Use the merge queue when repository policy requires it.
7. Use `merge`, `squash`, or `rebase` only when policy permits it.
8. Execute exactly one protected GitHub MCP landing mutation.
9. Reconcile GitHub state immediately after the mutation.
10. Never use admin privileges, force-push, or a protection bypass.
11. Require a new readiness record and confirmation after any stale authorization.

GitHub MCP tools:

- `mcp__codex_apps__github_get_repo`
- `mcp__codex_apps__github_get_pr_info`
- `mcp__codex_apps__github_get_commit_combined_status`
- `mcp__codex_apps__github_list_pull_request_reviews`
- `mcp__codex_apps__github_list_pull_request_review_threads`
- `mcp__codex_apps__github_enable_auto_merge`
- `mcp__codex_apps__github_merge_pull_request`

Important control:

- Do not call a landing mutation before the exact-head confirmation.
- Do not reuse approval after a push or remote state change.
- Treat an uncertain MCP response as unknown external state and reconcile before retrying.

## Phase 12 — Observe the landing

1. Observe one landing PR at a time.
2. Keep the authorized head SHA and request time in the lifecycle record.
3. Re-read the PR through GitHub MCP after each state transition.
4. Require observable auto-merge enrollment or merge-queue entry.
5. Treat `awaiting_merge` as waiting rather than completed.
6. Convert missing or rejected enrollment into an evidenced blocker.
7. Return to normal readiness evaluation if a different head appears.
8. Require new readiness and confirmation when the previous authorization becomes stale.
9. Confirm `merged` only when GitHub reports the authorized head as merged.

GitHub MCP tools:

- `mcp__codex_apps__github_get_pr_info`
- `mcp__codex_apps__github_fetch_pr`
- `mcp__codex_apps__github_get_commit_combined_status`
- `mcp__codex_apps__github_search_prs`

## Phase 13 — Close and synchronize

1. Confirm merge finality and confirm that the merged commit corresponds to the authorized head SHA.
2. Preserve complete evidence: checks, reviews, replies, conflicts, and merge/queue state.
3. Clean local feature branches only when policy and branch state allow safe cleanup.
4. Remove remote feature branches only when explicitly allowed by policy and the merge is final.
5. Sync local `main` with remote `main` after merge finalization.
6. Avoid destructive cleanup without exact target evidence and explicit repository approval.

GitHub MCP tools:

- `mcp__codex_apps__github_get_pr_info`
- `mcp__codex_apps__github_search_branches`
- `mcp__codex_apps__github_fetch_commit`
- `mcp__codex_apps__github_compare_commits`

Remote branch deletion is not required for every lifecycle completion and should be handled only through an approved repository-specific path.

## Phase 14 — Report the final state

1. Report the final PR URL.
2. Report the final head SHA or authorized landing SHA.
3. Report all commits created and pushed.
4. Report the final status of checks and workflows.
5. Report reviews, comments, replies, and resolved threads.
6. Report conflicts and base updates that were performed.
7. Report the landing method and queue status.
8. Report the source of the explicit confirmation.
9. Report one terminal state: `merged`, `ready-without-approval`, `external-auto-merge`, or `blocked`.
10. Never report `merged` merely because auto-merge was enabled or a queue request was submitted.

GitHub MCP tools:

- `mcp__codex_apps__github_get_pr_info`
- `mcp__codex_apps__github_get_commit_combined_status`
- `mcp__codex_apps__github_list_pull_request_reviews`
- `mcp__codex_apps__github_list_pull_request_review_threads`
- `mcp__codex_apps__github_fetch_pr_comments`
- `mcp__codex_apps__github_fetch_commit`

## Technical fallback note

If the GitHub MCP server is not installed, unavailable, unsupported for a required operation, or unable to complete an action, fall back to the equivalent `gh` CLI or `gh api` command for that specific action.

The fallback must follow these rules:

1. Use `gh` for normal GitHub CLI operations such as PR inspection, creation, checks, reviews, labels, and comments.
2. Use `gh api` when the required REST or GraphQL operation is not exposed by the normal CLI or MCP tool.
3. Verify the current GitHub state before retrying after an MCP error.
4. Check the PR number, repository, current head SHA, and operation result before mutating again.
5. Preserve the same permissions, branch protections, readiness policy, and exact-SHA binding.
6. Never use the fallback to bypass review requirements, required checks, merge queues, hooks, or branch protection.
7. Do not duplicate comments, labels, reviews, auto-merge requests, or merge attempts after an uncertain MCP response.
8. Treat a partially completed MCP action as an external state change and reconcile it before continuing.
9. Use `gh pr merge --match-head-commit <sha>` only when the equivalent protected MCP action is unavailable.
10. Report whether each GitHub action was completed through GitHub MCP, `gh`, or `gh api`.

## Main control rule

The automation runs autonomously from Scope to Report, including repeated monitor/repair/revalidate loops, and does not pause for routine status approvals.
The final landing mutation requires explicit confirmation for the exact PR and current head SHA.
The lifecycle is complete only when fresh GitHub evidence proves that the authorized SHA reached the `merged` state.
