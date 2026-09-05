# Git / Repository Domain

Trigger when the prompt involves Git state, branches, commits, refs, worktrees, stashes, merges, rebases, cleanup, recovery, or repository mutation.

Require current-state inspection before mutation: branch, status, refs/upstream, worktrees, stashes, untracked files, and relevant remotes.

Preserve unrelated work. Use exact object identifiers for destructive targets where practical.

Gate force operations, history rewriting, destructive cleanup, stash/branch/ref deletion, protected-branch pushes, and hook bypasses.

Prefer isolated worktrees/branches for risky inspection or integration.

Final verification should include relevant branch/worktree/stash state, commits, push status, local/remote synchronization, and confirmation that unrelated work was not modified.
