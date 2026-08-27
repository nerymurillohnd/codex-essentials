# Resolved Debt

Move completed maintenance items here with the resolution date and verification reference.

- 2026-08-27 — Added `// @ts-check` to every repository JavaScript source,
  introduced the separate `tsconfig.scripts.json` `checkJs` project, and added
  `scripts/tsconfig.json` for editor project association without changing the
  TypeScript-only root project. Verified with `npm run check` and both
  TypeScript 7 and TypeScript 6 script-project checks.
- 2026-08-27 — Migrated Vitest tests to TypeScript, corrected the strict
  `tsconfig.json` boundaries, and made `tsconfig.build.json` compatible with
  TypeScript 7. All repository `.ts` files are typechecked while runtime
  CommonJS/ESM tooling remains excluded. Verified with `npm run check` and
  `npx tsc --project tsconfig.build.json`.
- 2026-08-27 — Added the documented TypeScript side-by-side aliases: native
  TypeScript 7 through `@typescript/native` and the TypeScript 6 compiler API
  through `typescript`. Verified with `npx tsc --version`, `npx tsc6 --version`,
  and both no-emit checks.
- 2026-08-27 — Confirmed that the `@typescript/typescript6` wrapper publishes
  through `6.0.2` while its `@typescript/old` dependency provides the effective
  TypeScript 6.0.3 API. Verified against npm metadata and
  `require("typescript").version`.
- 2026-08-27 — Added canonical plugin README and changelog templates, generator
  scaffolding, documentation validation, GitHub contribution forms, release
  configuration, documentation gates, per-plugin release validation, and a
  dry-run/idempotent Projects bootstrap helper. Verified with the repository
  format, lint, typecheck, Vitest coverage, and manifest validation gates.
- 2026-08-27 — Updated GitHub Actions jobs that execute repository Node tooling
  to the current Node.js-24-compatible releases: `actions/checkout` `v7.0.1`
  and `actions/setup-node` `v7.0.0`, both pinned to immutable commit SHAs. Kept
  explicit `node-version: "24"` selection for Node-tooling jobs and documented
  the 2026-09-23 Node.js 20 removal deadline and runner compatibility
  constraints. Verified with workflow contract tests and the complete
  repository quality gate.
- 2026-08-27 — Normalized repository ignore policy for generated Husky internals,
  diagnostics output, Python caches, build output, and operating-system files.
  Removed local `.DS_Store` files and documented that authored hooks are linted
  separately from generated `.husky/_/*` infrastructure.
- 2026-08-27 — Published the public Codex Essentials Wiki `Home` page with
  marketplace status, installation, roadmap, contribution direction, release
  expectations, operating principles, and ownership. Verified through the Wiki
  repository at `nerymurillohnd/codex-essentials.wiki`.
- 2026-08-27 — Added `.github/dependabot.yml` for weekly npm and GitHub Actions
  dependency updates, with a limit of 10 open pull requests per ecosystem.
  Verified the configuration with Prettier and observed Dependabot update runs
  on the default branch.
- 2026-08-27 — Removed two generated Playwright MCP accessibility snapshots
  that had entered the public repository accidentally. Verified that the
  snapshots are absent from `main` and the working tree is clean.
- 2026-08-27 — Protected the GitHub `main` branch against force pushes and
  deletion, required conversation resolution, and required the `Required quality
gates` quality aggregator plus the `documentation`, `CodeQL`, `Workflow lint`,
  and `Dependency review` checks before merge. Verified through the GitHub
  branch protection API.
- 2026-08-27 — Added the protected GitHub `release` environment with
  `nerymurillohnd` as a required reviewer and created the active `Protect plugin
release tags` repository ruleset for `refs/tags/plugin/**/v*`. The ruleset
  blocks tag deletion and non-fast-forward tag updates while still allowing new
  plugin release tags to be created. Verified through the GitHub Environments
  and Rulesets APIs.
