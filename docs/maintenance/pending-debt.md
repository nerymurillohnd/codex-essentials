# Pending Debt

Use this file for unresolved maintenance work, known limitations, and follow-up tasks.

- 2026-09-06 — Defer the coordinated `vitest` and `@vitest/coverage-v8` 5.0.0
  upgrade. Owner: Marketplace maintenance. A clean project install followed by
  `npm run typecheck` fails in the published Vitest declarations: `TS2307` for
  missing `@vitest/expect` and `TS2305` for missing `MarkOptions`, plus Vite
  and Tinybench declaration errors. Evidence verified 2026-09-06: the official
  Vitest [`v5.0.0` tag](https://github.com/vitest-dev/vitest/tree/v5.0.0)
  (commit `f441c6fab25e579c5b7dd3dd50538416f415fbae`) has
  [`vitest/config.d.ts`](https://github.com/vitest-dev/vitest/blob/v5.0.0/packages/vitest/config.d.ts)
  importing `@vitest/expect`, while its
  [`package.json`](https://github.com/vitest-dev/vitest/blob/v5.0.0/packages/vitest/package.json)
  lists that package only in `devDependencies`; the published
  [`npm metadata`](https://registry.npmjs.org/vitest/5.0.0) matches this
  dependency classification. Keep both packages aligned at 4.1.11; reassess
  after an upstream consumer-compatible release passes `HUSKY=0 npm ci` and
  `npm run check`.
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
