---
name: automatic-pr-lifecycle
description: Use when taking one or more GitHub pull requests from local changes through protected landing, CI and review repair, merge observation, or an evidenced blocker.
---

# Automatic Pull Request Lifecycle

## End-to-end flow

Scope → Inspect → Prepare → Validate → Commit → Push → Create PR → Watch → Repair → Re-validate → Ready → Confirm → Land → Observe → Close → Report

GitHub operations use the GitHub MCP tools explicitly listed below. Local Git operations such as formatting, testing, committing, pushing, branch switching, and conflict resolution remain local workspace operations.

## MCP-only operating model

- This skill bundles no scripts, hooks, MCP server, or background process.
- Use the connected GitHub MCP tools as the primary GitHub interface.
- Keep repository, PR number, base, branch, current head SHA, and last observed state in the active lifecycle record.
- Re-read remote state before every consequential mutation and after every uncertain result.
- Treat hooks as optional guardrails rather than the lifecycle engine.
- Do not rely on a background hook to block, approve, resume, or complete the workflow.
- Use `gh` or `gh api` only for the specific operation that MCP cannot complete.

## Phase 1 — Define the scope

1. Confirm which repositories and changes belong to the task.
2. Separate task-related changes from unrelated modifications.
3. Identify submodules and independently owned repositories.
4. Determine the base branch from repository policy and configuration.
5. Treat each repository and PR as an independent unit.

GitHub MCP tools:

- `mcp__codex_apps__github_list_repositories`
- `mcp__codex_apps__github_get_repo`
- `mcp__codex_apps__github_search_repositories`

## Phase 2 — Inspect the environment

1. Read all applicable repository instructions.
2. Inspect the workspace and Git state locally.
3. Confirm that the active branch is not the default branch.
4. Review remotes, existing changes, commits, and modified files.
5. Confirm that the configured remote accepts normal pushes.
6. Preserve unrelated user changes.

GitHub MCP tools:

- `mcp__codex_apps__github_get_repo`
- `mcp__codex_apps__github_get_repo_collaborator_permission`
- `mcp__codex_apps__github_get_user_login`
- `mcp__codex_apps__github_search_branches`

## Phase 3 — Prepare the feature branch

1. Create or select a safe feature branch locally.
2. Keep the feature branch separate from `main` or another protected branch.
3. Include only changes related to the task.
4. Avoid force-push and published-history rewrites.
5. Resolve overlaps with unrelated changes before proceeding.

GitHub MCP tools:

- `mcp__codex_apps__github_search_branches`
- `mcp__codex_apps__github_compare_commits`

The normal workflow creates and updates the working branch with local Git so that local hooks and repository controls remain active.

## Phase 4 — Validate locally

1. Run the applicable formatters.
2. Run the applicable linters.
3. Run the applicable type checks.
4. Run the relevant tests.
5. Run `npm run check` when required by the repository.
6. Fix deterministic failures before creating or updating the PR.
7. Record the validation commands and their results.

GitHub MCP tools:

- No GitHub MCP mutation is required for local validation.
- Use `mcp__codex_apps__github_get_repo` only when repository settings affect the required checks.

## Phase 5 — Create the commit

1. Review the complete local diff.
2. Classify the commit according to the actual change.
3. Use a descriptive commit message consistent with repository history.
4. Run the normal pre-commit hooks.
5. Fix hook failures before retrying.
6. Create the commit without `--no-verify`.
7. Record the exact resulting commit SHA.

GitHub MCP tools:

- `mcp__codex_apps__github_fetch_commit`
- `mcp__codex_apps__github_search_commits`

The commit itself should normally be created with local Git to preserve signing, hooks, and repository-specific commit behavior.

## Phase 6 — Push the branch

1. Push the feature branch to the configured remote.
2. Confirm that the remote branch points to the expected head SHA.
3. Do not force-push the branch.
4. Treat the pushed SHA as the new source of truth for the PR cycle.

GitHub MCP tools:

- `mcp__codex_apps__github_search_branches`
- `mcp__codex_apps__github_fetch_commit`

The push is performed with local Git rather than a remote file or ref mutation tool.

## Phase 7 — Create or locate the pull request

1. Search for an existing open PR for the feature branch.
2. Create a PR if the branch does not already have one.
3. Infer the title and body from repository policy and commit history.
4. Document the scope, validations, risks, and expected behavior.
5. Include `@codex` in the PR body to request review.
6. Apply every label required by the PR's nature and impact.
7. Record the repository, PR URL, base branch, feature branch, and head SHA.

GitHub MCP tools:

- `mcp__codex_apps__github_search_prs`
- `mcp__codex_apps__github_get_pr_info`
- `mcp__codex_apps__github_create_pull_request`
- `mcp__codex_apps__github_label_pr`
- `mcp__codex_apps__github_add_issue_labels`

## Phase 8 — Observe and normalize the PR state

1. Read the current PR and record its head SHA.
2. Read combined status and workflow runs for that same head.
3. Read current reviews, unresolved threads, and conversation comments.
4. Read mergeability, draft state, auto-merge state, and repository policy.
5. Normalize the evidence into one lifecycle state.
6. Preserve the evidence source and observation time in the active lifecycle record.
7. Re-query instead of reusing an observation after any remote change.
8. Continue MCP polling while the normalized state is `pending`.

GitHub MCP tools:

- `mcp__codex_apps__github_get_pr_info`
- `mcp__codex_apps__github_get_pr_diff`
- `mcp__codex_apps__github_fetch_pr`
- `mcp__codex_apps__github_get_commit_combined_status`
- `mcp__codex_apps__github_fetch_commit_workflow_runs`
- `mcp__codex_apps__github_list_pull_request_reviews`
- `mcp__codex_apps__github_list_pull_request_review_threads`
- `mcp__codex_apps__github_fetch_pr_comments`

## Phase 9 — Classify the PR state

1. Treat `pending` as a normal waiting state.
2. Treat `actionable` as a repair instruction.
3. Treat `ready` as evidence that the current head satisfies the gates.
4. Treat `auto_merge` as auto-merge configured by another actor.
5. Treat `awaiting_merge` as an accepted but incomplete landing request.
6. Treat `merged` as terminal success only when the authorized SHA matches.
7. Treat `blocked` as an evidenced state requiring diagnosis or escalation.
8. Treat `timeout` as an output that must be consumed before continuing.

GitHub MCP tools:

- `mcp__codex_apps__github_get_pr_info`
- `mcp__codex_apps__github_get_commit_combined_status`
- `mcp__codex_apps__github_list_pull_request_reviews`
- `mcp__codex_apps__github_list_pull_request_review_threads`

## Phase 10 — Repair actionable states

1. Resolve merge conflicts using the merge-conflict-resolution procedure.
2. Update the base only when policy or readiness requires it.
3. Diagnose CI failures using workflow logs and job evidence.
4. Fix only branch-caused or reproducible failures.
5. Rerun jobs only when there is a justified flaky failure.
6. Triage every review comment using technical evidence.
7. Apply validated corrections to the feature branch.
8. Do not create work for a simple `review_rerun` state.
9. Run the applicable validations after every correction.
10. Create a new local commit.
11. Push the new head SHA normally.
12. Re-read all GitHub state against the new head SHA.

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

## Phase 11 — Repeat the repair cycle

1. Treat all previous observations as stale after every push.
2. Treat approvals for previous SHAs as invalid.
3. Re-read the PR, checks, reviews, and threads from the new head SHA.
4. Repeat diagnosis, correction, validation, commit, and push.
5. Continue until the state is `ready`, `auto_merge`, `merged`, or genuinely blocked.
6. Never jump directly from a repair to the landing mutation.

GitHub MCP tools:

- `mcp__codex_apps__github_get_pr_info`
- `mcp__codex_apps__github_get_commit_combined_status`
- `mcp__codex_apps__github_list_pull_request_reviews`
- `mcp__codex_apps__github_list_pull_request_review_threads`

## Phase 12 — Resolve review outcomes

1. Distinguish actionable review feedback from stale or invalid feedback.
2. Inspect the relevant review, thread, diff, and current head SHA.
3. Implement technically valid fixes.
4. Reply to every addressed review thread with evidence.
5. Resolve a thread only after the issue is genuinely addressed.
6. Leave false-positive findings documented with technical reasoning.
7. Re-run validation after review-driven changes.
8. Commit, push, and re-read the complete PR state after any code change.

GitHub MCP tools:

- `mcp__codex_apps__github_list_pull_request_reviews`
- `mcp__codex_apps__github_list_pull_request_review_threads`
- `mcp__codex_apps__github_fetch_pr_comments`
- `mcp__codex_apps__github_fetch_pr_file_patch`
- `mcp__codex_apps__github_reply_to_review_comment`
- `mcp__codex_apps__github_update_review_comment`
- `mcp__codex_apps__github_resolve_review_thread`
- `mcp__codex_apps__github_unresolve_review_thread`
- `mcp__codex_apps__github_add_review_to_pr`

## Phase 13 — Confirm exact readiness

1. Process one `ready` PR at a time.
2. Determine whether the repository requires a merge queue.
3. Determine the permitted merge method from policy and repository settings.
4. Re-read the PR, checks, reviews, and unresolved threads for the current head SHA.
5. Confirm that every readiness observation refers to that same head SHA.
6. Build a landing record with repository, PR URL, PR number, head SHA, action, method, and evidence.
7. Warn that the approved request may merge the pull request immediately.
8. Request explicit confirmation for that PR and exact head SHA.
9. Treat silence, another PR's answer, or an earlier head's answer as no approval.
10. Allow the workflow to stop at `ready` without landing.

GitHub MCP tools:

- `mcp__codex_apps__github_get_repo`
- `mcp__codex_apps__github_get_pr_info`
- `mcp__codex_apps__github_get_repo_collaborator_permission`
- `mcp__codex_apps__github_get_commit_combined_status`
- `mcp__codex_apps__github_list_pull_request_reviews`
- `mcp__codex_apps__github_list_pull_request_review_threads`
- `mcp__codex_apps__github_fetch_commit_workflow_runs`

## Phase 14 — Execute protected landing

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

## Phase 15 — Observe the landing

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

## Phase 16 — Close and synchronize

1. Confirm that the PR is actually merged.
2. Confirm that the merged commit corresponds to the authorized head SHA.
3. Clean local branches when repository policy permits it.
4. Clean remote branches only when explicitly allowed by policy.
5. Synchronize the local `main` branch with the remote `main` branch.
6. Avoid destructive cleanup without exact target evidence.
7. Preserve evidence of checks, reviews, conflicts, and landing.

GitHub MCP tools:

- `mcp__codex_apps__github_get_pr_info`
- `mcp__codex_apps__github_search_branches`
- `mcp__codex_apps__github_fetch_commit`
- `mcp__codex_apps__github_compare_commits`

Remote branch deletion is not required for every lifecycle completion and should be handled only through an approved repository-specific path.

## Phase 17 — Report the final state

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

The automation may inspect, prepare, validate, commit, push, create, monitor, repair, review, and revalidate a PR autonomously; the final landing mutation requires explicit confirmation for the exact PR and current head SHA, and the lifecycle is complete only when fresh GitHub evidence proves that the authorized SHA reached the `merged` state.
