# Pending Debt

Use this file for unresolved maintenance work, known limitations, and follow-up tasks.

- 2026-08-31 — Reconcile current GitHub branch protection and security controls
  with the documented policy. Verified live: `main` rejects force pushes and
  deletion and enforces administrators; the plugin release-tag ruleset is
  active; Dependabot security updates, secret scanning, secret scanning push
  protection, and automated security fixes are enabled. Current gaps or
  decisions: `main` has no required pull-request reviews or status checks,
  `secret_scanning_non_provider_patterns` and validity checks are disabled, and
  the historical resolved-debt entry records a stronger branch-protection
  state. Decide and record whether the current direct-documentation routing is
  intentional before closing this item.
- 2026-08-31 — Decide whether to activate the organization-level GitHub Project
  bootstrap. `GITHUB_ORG` and `PROJECT_TITLE` are not configured in the current
  local environment, and the authenticated `gh` token lacks `read:project`, so
  the existence of the target Project cannot be verified. Keep this optional
  until an organization, title, and Projects-scoped authorization are
  explicitly selected; do not treat the helper or its template as evidence
  that a Project exists.
