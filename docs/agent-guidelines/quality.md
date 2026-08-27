# Quality and Maintenance Guidelines

- Run `npm run check` before declaring work clean. It covers formatting, ESLint, typechecking, Vitest coverage, and full manifest validation.
- Add applicable language-server diagnostics and unit, integration, regression, security, and adversarial tests. Keep documentation synchronized with behavior.
- Re-check version-sensitive claims against the target release or latest changelog before planning and again before execution.
- Report skipped checks, missing tools, unresolved diagnostics, and residual risks explicitly.
- Maintain documentation under `docs/`. Record unresolved maintenance work in `docs/maintenance/pending-debt.md`; move completed work to `docs/maintenance/resolved-debt.md`.
- Record durable decisions affecting architecture, distribution, permissions, runtime, compatibility, or operations in `docs/decisions/`.
- Validate changed plugin documentation with `npm run documentation:gate -- --base <base> --head <head>`; the gate requires README and `Unreleased` changelog changes for product-affecting edits.
- Use `plugin/<plugin-id>/v<semver>` tags for independent releases. Generated GitHub release notes never replace the curated plugin changelog.
