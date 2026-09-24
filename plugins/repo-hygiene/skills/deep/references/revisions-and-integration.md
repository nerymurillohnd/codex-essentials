# Revisions and Integration

Resolve user-provided revisions before drawing conclusions:

```sh
git rev-parse --verify --end-of-options '<rev>^{commit}'
git merge-base <base> <topic>
git rev-list --left-right --count <base>...<topic>
git log --graph --decorate --oneline --boundary <base>...<topic>
git diff --stat <base>...<topic>
```

Record the resolved base, topic, and merge-base object IDs. In revision walks,
`A..B` means commits reachable from B but not A, while `A...B` is their
symmetric difference. In `git diff`, three dots compare B against the merge
base; it is not a symmetric diff. A clean `main...origin/main` relation proves
only those two refs agree, not that every worktree, PR, stash, and hidden ref is
resolved.

Choose integration by intent: merge retains shared graph history; squash creates
one new commit; cherry-pick selects explicit commits; revert compensates a
published change; rebase rewrites private commits and needs a reviewed recovery
path. Do not rewrite published history or force-push as a cleanup shortcut. For
a merge preview, resolve the merge base and use
`git merge-tree <merge-base> <base> <topic>`. `git range-diff` compares patch
series, not graph containment. Stop at conflicts and inspect the operation state
before choosing its matching abort/recovery command.

Source: [gitrevisions](https://git-scm.com/docs/gitrevisions),
[git-merge-tree](https://git-scm.com/docs/git-merge-tree).
