# Tooling and Runtime Guidelines

- Use npm for project dependencies. Node.js is managed by nvm; `.nvmrc` is
  `24.19.0` and GitHub Actions jobs that execute repository Node tooling must
  select the Node.js 24 major line explicitly. Keep `package.json` engines and `.npmrc`
  `engine-strict=true` aligned when present.
- The repository policy is that local hooks are advisory and CI is authoritative. Husky installs the local
  pre-commit hook through `prepare`, and CI sets HUSKY=0 in CI to avoid local
  hook side effects during `npm ci`.
- The Husky hook must keep the no-shim, POSIX-compatible format: do not source
  `_/husky.sh`, do not use `HUSKY_SKIP_HOOKS`, and invoke
  `npx --no-install lint-staged` directly. Treat `.husky/_/*` as generated
  Husky infrastructure; do not edit or lint those files as authored hooks.
- GUI Git clients launched outside an nvm-initialized shell may not find `npx`.
  Developers may create a user-owned `~/.config/husky/init.sh` that initializes
  their own nvm environment before repository hooks run. Do not commit
  machine-specific Husky init files.
- Pin every third-party GitHub Action to an immutable commit SHA and annotate
  the release tag. Use full SHA pins, not floating tags. The current workflow
  pins are `actions/checkout` `v7.0.1`
  (`3d3c42e5aac5ba805825da76410c181273ba90b1`) and `actions/setup-node`
  `v7.0.0` (`820762786026740c76f36085b0efc47a31fe5020`). Re-check upstream
  release pages before changing these pins.
- Use project-local dependencies for build, test, lint, format, and type checks. Use global PATH tools only for host automation and hooks; do not replace the declared manager.
- uv manages Python 3.14, `ruff`, `basedpyright`, and `pre-commit`. Do not install those tools with pip, Homebrew, npm, or global site-packages.
- Homebrew manages `git`, `gh`, `jq`, `shellcheck`, `shfmt`, and `yq`; prefer `/opt/homebrew/bin`.
- Use POSIX shell (`#!/usr/bin/env sh`) for minimal hooks or scripts that only
  invoke portable commands and do not need Bash. Use Bash
  (`#!/usr/bin/env bash`, `set -euo pipefail`) for non-trivial shell wrappers.
  Use Python entrypoints required by the machine policy for Python automation.
  Internal repository helpers may use `.cjs`, `.mjs`, or `.ts`.
- TypeScript uses `noEmit`, `allowJs: false`, strict checks, and the repository's `types/**/*.d.ts` contracts. JavaScript, MJS, and CJS runtime files start with `// @ts-check` (after a required shebang) and are checked by `tsconfig.scripts.json`, the editor-discoverable `scripts/tsconfig.json`, ESLint, and runtime tests.
- The root package keeps TypeScript 7 as the native compiler (`npx tsc`) and TypeScript 6 as the compiler-API alias (`npx tsc6`). The `typecheck` wrapper must invoke `node_modules/@typescript/native/bin/tsc`; API-dependent tools resolve `node_modules/typescript`.
- For changing technical information, use live authoritative sources. Prefer Context7 for library guidance, Firecrawl for complete retrieval, and Playwright for deterministic browser workflows. Retrieve again immediately before executing version-sensitive changes.
