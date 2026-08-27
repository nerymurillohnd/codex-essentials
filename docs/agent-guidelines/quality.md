# Quality and Maintenance Guidelines

- Run `npm run check` before declaring work clean. It covers formatting, ESLint, typechecking, Vitest coverage, and full manifest validation.
- Treat local hooks as advisory; CI is authoritative. Developers may bypass a
  local hook only for an authorized emergency with `HUSKY=0` or `--no-verify`,
  but the CI gates remain mandatory.
- Required local checks are `npm run format:check`,
  `npm run lint -- --max-warnings=0`, `npm run typecheck`,
  `npm run typecheck:scripts`, `npx tsc6 --noEmit`, `npm test`,
  `npm run validate:all`, `npm run validate:release`, `actionlint`, and
  `git diff --check`.
- Keep branch-protection required checks aligned to the workflow's stable
  `required` aggregator plus independently visible documentation, security, and
  release validation jobs.
- Add applicable language-server diagnostics and unit, integration, regression, security, and adversarial tests. Keep documentation synchronized with behavior.
- Re-check version-sensitive claims against the target release or latest changelog before planning and again before execution.
- Report skipped checks, missing tools, unresolved diagnostics, and residual risks explicitly.
- Maintain documentation under `docs/`. Record unresolved maintenance work in `docs/maintenance/pending-debt.md`; move completed work to `docs/maintenance/resolved-debt.md`.
- Record durable decisions affecting architecture, distribution, permissions, runtime, compatibility, or operations in `docs/decisions/`.
- Validate changed plugin documentation with `npm run documentation:gate -- --base <base> --head <head>`; the gate requires README and `Unreleased` changelog changes for product-affecting edits.
- Use `plugin/<plugin-id>/v<semver>` tags for independent releases. Generated GitHub release notes never replace the curated plugin changelog.
- Release publication requires release environment approval through the protected
  `release` environment. Rollback means restoring the prior marketplace
  metadata, deleting the GitHub release, and deleting the release tag.
