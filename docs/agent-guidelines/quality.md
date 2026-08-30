# Quality and Maintenance Guidelines

- Run `npm run check` before declaring npm-owned repository checks clean. It
  covers formatting, warning-strict ESLint, TypeScript 7 typechecking, script
  typechecking, TypeScript 6 compatibility, Vitest coverage, and full manifest
  validation.
- Treat local hooks as advisory; CI is authoritative. Developers may bypass a
  local hook only for an authorized emergency with `HUSKY=0` or `--no-verify`,
  but the CI gates remain mandatory.
- Required local checks are `npm run format:check`,
  `npm run lint -- --max-warnings=0`, `npm run typecheck`,
  `npm run typecheck:scripts`, `npx tsc6 --noEmit`, `npm test`,
  `npm run marketplace:check`, `npm run validate:release-workflow`,
  `npm run package:preflight`,
  `npm run documentation:gate -- --base <base>
--head <head>`, `actionlint`, and `git diff --check`.
- Keep branch-protection required checks aligned to the quality workflow's
  stable `required` aggregator plus independently visible pull-request
  documentation and security jobs. The aggregator includes Conventional
  Commit PR-title validation, Release Please output capture validation, and
  package preflight, so a Release Please PR cannot merge before its plugin
  packages and archives pass validation.
- Add applicable language-server diagnostics and unit, integration, regression, security, and adversarial tests. Keep documentation synchronized with behavior.
- Re-check version-sensitive claims against the target release or latest changelog before planning and again before execution.
- Report skipped checks, missing tools, unresolved diagnostics, and residual risks explicitly.
- Maintain documentation under `docs/`. Record unresolved maintenance work in `docs/maintenance/pending-debt.md`; move completed work to `docs/maintenance/resolved-debt.md`.
- Record durable decisions affecting architecture, distribution, permissions, runtime, compatibility, or operations in `docs/decisions/`.
- Validate changed plugin documentation with `npm run documentation:gate -- --base <base> --head <head>`; the gate requires README and changelog changes for product-affecting edits.
- Use `plugin/<plugin-id>/v<semver>` tags for independent releases. Release
  Please owns versioning, changelog updates, tags, and draft GitHub Releases;
  the workflow consumes its exact tag output and never reconstructs tags.
- The first release cut uses the native `go` changelog-only strategy with JSON
  `extra-files` for `plugin.json`. `simple` is intentionally not used
  because the current implementation requires a `version.txt` update.
- `docs:` does not create a release by itself. Distributed documentation that
  merits a patch uses a `fix(docs): ...` Conventional Commit (touching the
  plugin path), or an explicit `Release-As` footer when appropriate.
- Release publication requires release environment approval through the
  protected `release` environment. Artifacts are built from exact tags with
  `git archive`, compressed with deterministic `gzip -n` semantics, checked
  with basename-safe SHA-256 files, and uploaded before approval. Rollback
  means restoring prior marketplace metadata and handling the corresponding
  GitHub release and tag under the repository's protected release procedures.
