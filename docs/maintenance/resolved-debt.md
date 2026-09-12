# Resolved Debt

Record a resolution here only after the corrective change and its verification
are complete in the current repository baseline.

- 2026-09-12 — Repository quality workflow is active and runs `npm run check`.
  Evidence: `.github/workflows/quality.yml` exists on `main`, GitHub lists the
  `Quality` workflow as active, PR #3 and PR #4 both reported successful
  `npm run check` check runs, and recent `main` push runs for the workflow
  completed successfully. Remaining work: `main` still needs branch protection
  or an active ruleset requiring that check; tracked in
  `docs/maintenance/pending-debt.md`.
