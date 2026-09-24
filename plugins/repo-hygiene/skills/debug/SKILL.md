---
name: debug
description:
  Use when explicitly invoked as $repo-hygiene:debug to investigate a
  reproducible Git-tracked regression, code origin, line attribution, or
  repository search result. This mode diagnoses history; it does not implement
  the fix.
---

# Repo Hygiene Debug

Record the symptom, expected and actual behavior, reproduction command, target
paths, current status, and any known-good and known-bad revisions. Read
[debugging with Git](references/debugging-with-git.md) to choose the narrowest
route: tracked text search, line attribution, or bisection.

Search presence does not prove causality. `git blame` identifies the last line
edit, not fault or intent. Bisection needs reliably classifiable endpoints and a
safe checkout strategy; skipped or untestable revisions can leave more than one
candidate. Reconcile candidate commits with their diffs, tests, and real symptom
before naming a cause.

If the user directly authorized a bisection with endpoints and a safe test, run
it in an isolated clean worktree and always restore the starting state. If those
inputs are missing, report the precise missing choice before changing the
checkout. An automated test command must be inspected for side effects; do not
run arbitrary historical scripts or expose secret matches.

Report strongest evidence, exact revision range, method, uncertainty, restored
checkout, and a proposed fix boundary. Implementing a fix requires an
implementation task, not an inference from a first-bad commit.
