---
status: accepted
date: 2026-08-31
decision-makers: Nery Samuel Murillo
consulted: Codex
informed: Repository contributors
---

# Establish the repository Prettier formatting contract

## Context and Problem Statement

The repository already used Prettier in npm scripts, lint-staged, and the
quality workflow, but the setup did not define one complete reproducibility
contract. The dependency accepted patch drift, the tracked Codex hook was
excluded from formatting checks, and VS Code did not explicitly select the
repository-local formatter. The configuration also needed an explicit boundary
between stable formatting choices and experimental Prettier behavior.

How should the repository make formatting deterministic across the CLI, editor,
staged-file workflow, and CI without introducing competing formatters or broad
source churn?

## Decision Drivers

- Resolve one exact Prettier version and one repository-local configuration.
- Keep CLI, VS Code, lint-staged, and CI behavior consistent.
- Keep CI non-writing and make formatting failures visible.
- Cover every tracked file type for which Prettier is the formatting authority.
- Avoid experimental formatting options and unrequested formatter plugins.
- Preserve the repository's CommonJS tooling convention.

## Considered Options

- Keep the existing partially implicit setup and semver range.
- Standardize the existing CommonJS configuration and integration paths.
- Migrate the configuration to ESM.
- Enable or explicitly freeze experimental formatting options.

## Decision Outcome

Chosen option: "Standardize the existing CommonJS configuration and integration
paths" because it makes formatting reproducible without changing module
boundaries or adopting unstable behavior.

The repository adopts the following contract:

- [`prettier.config.cjs`](../../prettier.config.cjs) is the sole Prettier
  configuration file. It remains CommonJS and is included in the repository's
  JavaScript diagnostics projects.
- [`package.json`](../../package.json) pins the repository-local Prettier
  dependency exactly to `3.9.6`. Version changes require an intentional
  dependency update and release-note review.
- The configuration explicitly records stable formatting defaults, including
  80-column print width, two-space indentation, semicolons, double quotes, LF
  line endings, preserved Markdown wrapping, preserved object wrapping, and
  automatic embedded-language formatting.
- `experimentalTernaries` and `experimentalOperatorPosition` remain omitted.
  Experimental options must not become repository policy without a new review
  of their stability, formatting impact, and removal path.
- [`npm run format`](../../package.json) is the explicit writing command.
  `npm run format:check` and CI only check formatting and never rewrite files.
- lint-staged runs ESLint fixes before Prettier for JavaScript-family files so
  Prettier is the final formatting step.
- [VS Code settings](../../.vscode/settings.json) select the official Prettier
  extension for the supported repository languages, require a project
  configuration, and disallow global-module resolution. The workspace
  [recommends the extension](../../.vscode/extensions.json).
- [`.prettierignore`](../../.prettierignore) excludes local, generated, cache,
  credential, and intentionally unmanaged paths while keeping the tracked
  `.codex/hooks.json` file inside the formatting gate.
- Prettier owns formatting for supported JavaScript, TypeScript, JSON, JSONC,
  YAML, GitHub Actions, and Markdown files. Shell files remain under shfmt and
  ShellCheck; Python files remain under Ruff.

### Consequences

- Good, because npm installs, editor formatting, staged-file processing, and CI
  resolve the same formatter version and configuration.
- Good, because the tracked Codex hook can no longer bypass formatting checks.
- Good, because CI remains a non-writing enforcement boundary.
- Good, because formatter and linter responsibilities remain distinct.
- Trade-off, because exact version pins require deliberate maintenance instead
  of automatic patch adoption.
- Trade-off, because changes to explicitly recorded defaults require reviewing
  the resulting formatting diff rather than inheriting upstream behavior.
- Trade-off, because the configuration remains CommonJS even though the root
  package uses ESM; this preserves the repository's existing tooling boundary.

### Confirmation

The implementation was reviewed and merged through
[PR #38](https://github.com/nerymurillohnd/codex-essentials/pull/38) as merge
commit `c72cbb4397f8010eb5bae17e9350233be902a304` on 2026-08-31.

At that revision:

- `./node_modules/.bin/prettier --find-config-path package.json` resolved
  `prettier.config.cjs`.
- `./node_modules/.bin/prettier --file-info .codex/hooks.json` reported
  `ignored: false` and the JSON parser.
- `npm run check` passed formatting, ESLint, TypeScript diagnostics, 65 tests,
  label validation, five plugin manifests, and marketplace validation.
- The PR
  [Required quality gates](https://github.com/nerymurillohnd/codex-essentials/actions/runs/33451657191)
  completed successfully.
- The merged `main`
  [Quality run](https://github.com/nerymurillohnd/codex-essentials/actions/runs/33451873771)
  completed successfully.
- Independent and GitHub-hosted reviews reported no findings, inline comments,
  or unresolved review threads.

Future compliance is confirmed by running `npm run check`, verifying the config
resolution path, and confirming that tracked supported files are not excluded
from Prettier.

## More Information

- [Hooks and quality gates](adr-0005-hooks-and-quality-gates.md)
- [Prettier configuration documentation](https://prettier.io/docs/configuration)
- [Prettier options documentation](https://prettier.io/docs/options)
