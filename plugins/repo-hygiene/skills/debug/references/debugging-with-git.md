# Debugging with Git

Choose the narrowest evidence route for the question:

- `git grep -n -e '<pattern>' -- <pathspec>` locates tracked text in this
  checkout; add a named revision to query historic tracked text. Presence is not
  causality. Scope patterns so output cannot disclose secrets.
- `git blame -L <start>,<end> -- <path>` identifies the last edit to known
  lines. Inspect the cited diff and context before attributing a defect.
- `git bisect` can isolate a reproducible regression only with a known-good and
  known-bad endpoint, a consistent classifier, and a safe isolated checkout.
  Inspect an automated test command for side effects first.

For bisection, keep a log, classify each revision as good, bad, or skip, and run
`git bisect reset` to restore the pre-bisect checkout. A skipped revision may
leave multiple candidate first-bad commits. A candidate is not the cause until
its change and the actual symptom are reconciled. Diagnosis does not authorize
code changes or history rewrites.

Sources: [git-bisect](https://git-scm.com/docs/git-bisect),
[git-blame](https://git-scm.com/docs/git-blame),
[git-grep](https://git-scm.com/docs/git-grep).
