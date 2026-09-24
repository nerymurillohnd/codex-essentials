# Topology and Recovery

Record the common Git directory and inspect every worktree, ref family, stash,
and reflog before considering deletion:

```sh
git rev-parse --show-toplevel --git-common-dir
git worktree list --porcelain
git branch --all --verbose --no-abbrev
git stash list --date=iso-local
git reflog show --all --date=iso-local
git remote
```

Check status and `HEAD` in each reachable worktree. A missing worktree path may
still hold a registration and an important branch; inspect it before pruning.
`git worktree prune --dry-run --verbose` is a preview, while `prune` and
`remove` mutate state. Inspect a stash with `git stash show --stat` and its
exact selector before any drop. A reflog selector requires a local reflog and
can expire; do not promise indefinite recovery from one.

`git ls-remote --heads origin` observes remote heads without changing local
refs. `git fetch --prune` changes remote-tracking refs, so do not disguise it as
read-only. Neither establishes GitHub PR review or merge state. Resolve every
proposed recovery tip to an object ID and inspect its commit before creating a
recovery ref. Never use reset, ref deletion, garbage collection, or object
pruning to tidy the graph during an audit.

Sources: [git-worktree](https://git-scm.com/docs/git-worktree),
[gitrevisions](https://git-scm.com/docs/gitrevisions),
[git-stash](https://git-scm.com/docs/git-stash).
