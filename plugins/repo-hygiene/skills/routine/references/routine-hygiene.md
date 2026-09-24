# Routine Git Hygiene

Inventory before interpreting a path:

```sh
git status --short --branch --ignored
git diff --name-status
git diff --cached --name-status
git ls-files --others --ignored --exclude-standard
git check-ignore -v -- <path>
git ls-files --error-unmatch -- <path>
```

The ignore rule identifies why Git excludes a path, not who owns it or whether
its contents can be regenerated. Inspect size and project documentation without
opening ignored files. Retain secrets, local configuration, lockfiles, user
data, and caches with unknown rebuild cost.

`git clean -ndX` previews ignored-path deletion; it does not authorize the
actual cleanup. Do not substitute `-x`, which broadens the scope to unignored
untracked files. For an authorized operation, match every exact target against
the final preview and prefer a recoverable move when practical. Recheck status
afterward.

For a local branch, resolve its intended base and check other worktrees before
using `git merge-base --is-ancestor <branch> <base>` or
`git branch --merged <base>`. Ancestry is not proof of squash, rebase, PR
review, or remote integration. Only delete an exact, authorized, contained local
branch using `git branch -d`; route ambiguous integration to deep mode.

Sources: [git-clean](https://git-scm.com/docs/git-clean),
[git-check-ignore](https://git-scm.com/docs/git-check-ignore),
[git-branch](https://git-scm.com/docs/git-branch).
