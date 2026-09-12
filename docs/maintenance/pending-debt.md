# Pending Debt

Use this file for unresolved maintenance work that exists in the current
repository or its configured services.

- 2026-09-12 [P1] — `main` has no active branch protection or ruleset requiring
  the repository quality check. Evidence: GitHub reports no classic branch
  protection for `main`, and the repository rulesets API returned no active
  rulesets. The `Quality` workflow now exists and has passed on pull requests
  and direct `main` pushes, but direct changes can still reach the default
  branch without a required protected check. Owner: Marketplace maintenance.
  Next action: require the `npm run check` status check through GitHub branch
  protection or an active ruleset. Review condition: GitHub reports `main` as
  protected or covered by an active ruleset that requires `npm run check`.
