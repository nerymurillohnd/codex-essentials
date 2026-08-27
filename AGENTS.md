# Repository Guidelines

This repository is a community marketplace for Codex plugins and data. It is not a web application. Keep repository-specific instructions here and use the linked policy documents for detailed guidance.

## Project Structure

- `.agents/plugins/marketplace.json` is the catalog.
- `plugins/` contains local plugin packages; see [Plugin package guidelines](plugins/AGENTS.md) for their structure, manifests, resources, and catalog registration.
- `lib/` contains the declarative source, schemas, templates, domain modules, and colocated Vitest tests; `types/` contains TypeScript contracts.
- `.github/` contains issue forms, the pull-request contract, release-note categories, and CI documentation gates. `docs/operations/` documents organization-level Projects.
- `tsconfig.scripts.json` checks the JavaScript modules under `lib/` with the Node-aware `checkJs` configuration.
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
- `npm run scaffold:plugin -- <plugin-id>` — add a source declaration and initialize only missing author-owned package documents.
- `npm run sync:all` / `npm run sync:check` — write or read-only check metadata derived from `lib/source.json`.

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

## Operational Architecture and Source of Truth

The repository operates from one declarative, non-executable source of truth:
`lib/source.json`. It describes every maintained plugin's identity, version,
author, license, repository, interface metadata, marketplace policy, skills,
apps, MCP declarations, and declared assets.

- `lib/source.json` is the sole owner of fixed metadata. Do not hand-edit a
  derived `plugin.json`, `agents/openai.yaml`, or marketplace entry.
- `lib/schemas/` contains the JSON Schemas that validate the source model and
  emitted runtime artifacts. Ajv is the runtime schema validator.
- `lib/templates/` contains the initial README, changelog, and skill document
  templates. Templates initialize author-owned files; synchronization must not
  overwrite authored `SKILL.md`, `README.md`, or `CHANGELOG.md` content.
- `lib/<domain>/` contains one bounded operational area per directory, its
  executable code, and its colocated tests. The repository does not maintain
  root `scripts/`, `tests/`, or `templates/` directories.
- The source file is development and CI infrastructure only. Codex-installed
  plugins neither execute nor import `lib/`, repository tooling, another
  plugin, or any resource outside their package.
- A plugin is distributable only when every effective path, including symbolic
  links after canonicalization, resolves inside `plugins/<plugin-id>/`.
  Reject external paths before generation, validation, archiving, or release.
- CI must verify that derived artifacts are synchronized with `lib/source.json`
  and that the release archive contains a complete, self-contained package.

The implementation commands are `scaffold`, `sync`, and `validate`: scaffold
creates missing valid package structure, sync regenerates only derived
artifacts from the source of truth, and validate is read-only and strict.
Neither a generator nor a validator is part of a plugin runtime contract.

## Commits and Pull Requests

Use concise imperative Conventional Commit subjects (for example, `feat: add npm source schema`). Pull requests should explain the change, show verification commands/output, link an issue when applicable, and note compatibility effects. Product changes must update the affected plugin README and `Unreleased` changelog entry in the same PR. Screenshots are not applicable.

### Change Routing and PR Completion

Route changes according to their risk and distribution impact:

- **Pull request required:** plugin packages, manifests, marketplace catalog
  entries, scripts, tests, schemas, workflows, release behavior, permissions,
  security controls, or any change that alters product behavior, installation,
  validation, or compatibility.
- **Direct commit to `main` allowed:** small documentation corrections,
  wording or formatting adjustments, minor `AGENTS.md` or contributor-guidance
  clarifications, and other changes with no product or runtime impact. Run the
  relevant formatter and validation for the affected files first.

| Issue type                                    | PR needed now?                                            |
| --------------------------------------------- | --------------------------------------------------------- |
| Badges / roadmap / contributor docs           | No                                                        |
| Branch protection                             | No                                                        |
| Homepage metadata                             | No                                                        |
| Packages                                      | No action now                                             |
| First stable release                          | Likely yes for prep docs; release action after validation |
| Future plugin/catalog/schema/workflow changes | Yes                                                       |

For every pull request, read all review comments, checks, and requested
changes before integrating. Evaluate each finding against the repository; fix
it when technically valid, reply in the review thread with the result, and
resolve the conversation after the fix is pushed. Do not dismiss or resolve a
valid review finding without addressing it. Re-run the applicable validation
after review changes.

When a pull request is ready, integrate it with an explicit **merge commit**.
Do not squash unless Nery explicitly requests it. After merging, delete the
feature branch from the remote and local checkout, run `git fetch --prune`,
fast-forward `main` with `git pull --ff-only origin main`, and confirm
`git status --short --branch` is clean and synchronized with `origin/main`.
