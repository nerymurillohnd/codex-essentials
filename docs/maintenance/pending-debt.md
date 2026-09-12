# Pending Debt

Use this file for unresolved maintenance work that exists in the current
repository or its configured services.

- 2026-09-11 [P1] — `main` has no active branch protection or ruleset, and the
  repository has no quality workflow. The only configured workflow is the
  read-only Codex pull-request review. Impact: direct changes can reach the
  default branch without a required repository validation run. Owner:
  Marketplace maintenance. Next action: configure a quality workflow that runs
  `npm run check`, then require that check through GitHub branch protection or
  an active ruleset. Review condition: GitHub reports `main` as protected and a
  pull request shows the required quality check.
