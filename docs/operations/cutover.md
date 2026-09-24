# Clean-history branch cutover

This operation changes the repository default branch. Execute only after the
candidate branch has all 20 verified plugins, a passing Quality run at its exact
SHA, a clean worktree, and an explicit no-writer window. The current history
must remain in a remote branch named `deprecated`; its deletion is outside this
authorization. Do not create an external Git bundle.

## Preflight record

Record the observed values in a dated audit before any remote write:

```sh
git status --short --branch
git worktree list --porcelain
git rev-parse origin/main
gh api repos/nerymurillohnd/codex-essentials --jq '.default_branch'
gh api 'repos/nerymurillohnd/codex-essentials/branches?per_page=100' --jq 'map({name,sha:.commit.sha})'
gh pr list --state open --json number,headRefName,baseRefName
gh api repos/nerymurillohnd/codex-essentials/rulesets --jq 'map({id,name,enforcement,target})'
```

Also record the historical tag and GitHub Release, candidate SHA, all package
IDs and versions, local checks, and remote Quality run URL. Abort if the old
`main` SHA changed since the record, a writer is active, an open PR targets the
branch being renamed, or the candidate check belongs to another SHA.

## No-force switch

1. Set the candidate `codex/rebuild-main` as the temporary default branch.
   Confirm the remote reports that exact name and candidate SHA.
2. Rename the former `main` to `deprecated`. Poll the GitHub branch API until
   `deprecated` exists at the recorded old SHA and `main` no longer exists.
3. Rename `codex/rebuild-main` to `main`. Poll until `default_branch=main` and
   `main` points at the recorded candidate SHA. GitHub warns that rename
   completion can continue in the background after the API responds:
   <https://docs.github.com/en/rest/branches/branches#rename-a-branch>.
4. Add active rules protecting `main` and locking `deprecated`; add a tag
   ruleset that prevents deletion and mutation of new release tags. Query the
   effective rules for each ref. Require the exact `npm run check` job from the
   Quality workflow, PRs, and conversation resolution for future `main` updates.
   Do not require a self-approval that GitHub cannot provide.
5. Align local worktrees without resetting history: rename the old local `main`
   branch to `deprecated`, then the candidate local branch to `main`, fetch, set
   upstream tracking, and verify `origin/HEAD`.
6. Dispatch the initial release workflow as described in `releases.md`, then
   verify all 20 tags/Releases and final Git-backed installation behavior.

GitHub documents default-branch changes and branch renames at
<https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/changing-the-default-branch>
and
<https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/renaming-a-branch>.

## Recovery

If the switch fails before the old branch is renamed, restore the old `main` as
default. If the old branch is already `deprecated`, make it default while
reconciling the candidate. If the new branch already owns the `main` name,
rename it to an explicit failed-candidate name, then rename `deprecated` back to
`main` and verify the old SHA. Preserve both histories and every published
tag/Release; report partial remote state. Do not use force push or delete the
old branch to repair the cutover.
