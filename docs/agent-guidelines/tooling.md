# Tooling and Runtime Guidelines

- Use npm for project dependencies. Node.js is managed by nvm; `.nvmrc` is
  `24.19.0` and all GitHub Actions workflows must select the Node.js 24 major
  line explicitly. Keep `package.json` engines and `.npmrc`
  `engine-strict=true` aligned when present.
- Use project-local dependencies for build, test, lint, format, and type checks. Use global PATH tools only for host automation and hooks; do not replace the declared manager.
- uv manages Python 3.14, `ruff`, `basedpyright`, and `pre-commit`. Do not install those tools with pip, Homebrew, npm, or global site-packages.
- Homebrew manages `git`, `gh`, `jq`, `shellcheck`, `shfmt`, and `yq`; prefer `/opt/homebrew/bin`.
- Use Bash (`#!/usr/bin/env bash`, `set -euo pipefail`) for shell wrappers and hooks. Use Python entrypoints required by the machine policy for Python automation. Internal repository helpers may use `.cjs`, `.mjs`, or `.ts`.
- TypeScript uses `noEmit`, `allowJs: false`, strict checks, and the repository's `types/**/*.d.ts` contracts. JavaScript, MJS, and CJS runtime files start with `// @ts-check` (after a required shebang) and are checked by `tsconfig.scripts.json`, the editor-discoverable `scripts/tsconfig.json`, ESLint, and runtime tests.
- The root package keeps TypeScript 7 as the native compiler (`npx tsc`) and TypeScript 6 as the compiler-API alias (`npx tsc6`). The `typecheck` wrapper must invoke `node_modules/@typescript/native/bin/tsc`; API-dependent tools resolve `node_modules/typescript`.
- For changing technical information, use live authoritative sources. Prefer Context7 for library guidance, Firecrawl for complete retrieval, and Playwright for deterministic browser workflows. Retrieve again immediately before executing version-sensitive changes.
