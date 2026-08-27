# Repository Guidelines

This repository is a community marketplace for Codex plugins and data. It is not a web application. Keep repository-specific instructions here and use the linked policy documents for detailed guidance.

## Project Structure

- `.agents/plugins/marketplace.json` is the catalog.
- `plugins/` contains local plugin packages; see [Plugin package guidelines](plugins/AGENTS.md) for their structure, manifests, resources, and catalog registration.
- `templates/` contains JSON Schemas and product-documentation templates; `scripts/` contains validators/generators and the documentation/Project helpers; `types/` contains TypeScript contracts; `tests/` contains Vitest tests.
- `.github/` contains issue forms, the pull-request contract, release-note categories, and CI documentation gates. `docs/operations/` documents organization-level Projects.
- `scripts/tsconfig.json` associates opened JavaScript files with the Node-aware `checkJs` configuration used by the editor.
- `docs/`, `adapters/`, and `config/` contain supporting material. There is no repository-level `skills/` directory.

## Development Commands

- `npm install` — install project dependencies.
- `npm run format` — write Prettier formatting; use `npm run format:check` for a read-only check.
- `npm run check` — run formatting, linting, typechecking, Vitest coverage, and complete manifest validation.
- `npm run documentation:gate -- --base <base> --head <head>` — enforce README/changelog synchronization for changed plugins.
- `npm run validate:release -- plugin/<plugin-id>/v<semver>` — validate an independent plugin release tag.
- `GITHUB_ORG="${GITHUB_ORG}" PROJECT_TITLE="${PROJECT_TITLE}" npm run project:bootstrap -- --dry-run` — preview organization Project bootstrap.
- `npx tsc --noEmit` / `npx tsc6 --noEmit` — run the TypeScript 7 native compiler or the TypeScript 6 API-compatible compiler explicitly.
- `npm run validate:all` — validate the catalog, schemas, plugin directories, and cross-references; targeted plugin commands are documented in `plugins/AGENTS.md`.
- `npm run generate:marketplace` / `npm run complete:marketplace` — generate or complete the catalog without replacing authored values; use the plugin workflow in `plugins/AGENTS.md` for package manifests.

## Coding and Testing

Use the repository Prettier/ESLint conventions, two-space indentation, LF endings, constants instead of magic strings, and no `any`. JavaScript, MJS, and CJS files must begin with `// @ts-check` (after a required shebang) and remain covered by `tsconfig.scripts.json`. Name tests `*.test.ts` so the strict TypeScript project checks them; cover schema behavior, filesystem semantics, and new validation/generation branches. The Vitest gate requires at least 96% per file.

## Quality and Documentation

Run applicable diagnostics and tests before declaring work complete. Keep docs synchronized, verify version-sensitive claims against current releases, and report skipped checks, missing tools, unresolved diagnostics, and residual risks. Maintain debt files under `docs/maintenance/` and durable decisions under `docs/decisions/`.

## Detailed Policies

- [Architecture and paths](docs/agent-guidelines/architecture.md)
- [Tooling and runtimes](docs/agent-guidelines/tooling.md)
- [Security and credentials](docs/agent-guidelines/security.md)
- [Communication and writing](docs/agent-guidelines/communication.md)
- [Quality and maintenance](docs/agent-guidelines/quality.md)
- [Ownership and private context boundary](docs/agent-guidelines/ownership.md)

## Commits and Pull Requests

Use concise imperative Conventional Commit subjects (for example, `feat: add npm source schema`). Pull requests should explain the change, show verification commands/output, link an issue when applicable, and note compatibility effects. Product changes must update the affected plugin README and `Unreleased` changelog entry in the same PR. Screenshots are not applicable.
