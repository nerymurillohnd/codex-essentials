---
name: routine
description:
  Use for routine Git cleanup, ignored build-output review, local cache
  assessment, or merged-branch housekeeping in one checkout. Route remotes,
  multiple worktrees, hidden refs, and recovery questions to the explicit deep
  skill.
---

# Routine Repo Hygiene

Inspect one checkout's status, index, ignored candidates, and project cleanup
contract. Read [routine hygiene](references/routine-hygiene.md) before
classifying files or branches. Keep the audit read-only until the exact target
and effect are understood.

Classify each path as tracked, generated, ignored, configuration, secret, cache,
or user data. Record path, size, ignore rule, and regeneration cost without
opening ignored contents. `git check-ignore` explains a rule; it does not prove
a file is disposable. `git clean -ndX` is only a preview.

For a local branch, identify the intended base, whether another worktree checks
it out, and whether normal ancestry proves containment. Squash/rebase
integration and provider PR state need deep or provider evidence, not a local
`--merged` result alone.

If the user named exact safe targets and authorized cleanup, revalidate them and
carry out only that scope. If the request is vague or includes uncertain user
data, present exact candidates, consequences, and recovery before a destructive
step. Use recoverable removal where practical. Never run broad `git clean -fx`,
remove secrets or lockfiles by appearance, delete an active branch, or treat a
cache as free to rebuild without checking cost.

Report what was inspected, what was retained, exact changes if any, and the
post-action status. Route remotes, reflogs, stashes, objects, worktrees, and
divergent history to `$repo-hygiene:deep`.
