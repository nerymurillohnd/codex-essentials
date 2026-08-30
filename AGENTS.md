# Repository Guidelines

This repository is a community marketplace for Codex plugins and data. It is not a web application. Keep repository-specific instructions here and use the linked policy documents for detailed guidance.

## Project Structure

- `.agents/plugins/marketplace.json` is the catalog.
- `plugins/` contains local plugin packages; see [Plugin package guidelines](plugins/AGENTS.md) for their structure, manifests, resources, and catalog registration.
- `schemas/` contains the strict plugin and marketplace schemas, `templates/` contains the complete plugin creation form, `scripts/` contains the generators and validators, and `lib/` contains bounded domain modules with colocated tests.
- `.github/` contains issue forms, the pull-request contract, release-note categories, and CI documentation gates.
- `tsconfig.scripts.json` checks the JavaScript modules under `lib/` and `scripts/` with the Node-aware `checkJs` configuration.
- `docs/` is the canonical home for repository documentation; read [docs/AGENTS.md](docs/AGENTS.md) before operating inside it.
- `adapters/` and `config/` contain supporting material. There is no repository-level `skills/` directory.

## Documentation Authority

- Keep all repository plans, specifications, maintenance records, decisions, operational procedures, contributor guidance, additional agent instructions, and audit reports under `docs/`.
- Use `docs/agent-guidelines/` for durable policy documents, `docs/decisions/` for ADRs, `docs/maintenance/` for technical debt, and `docs/operations/` for runbooks and external-service procedures.
- Use `docs/superpowers/plans/` for implementation plans, `docs/superpowers/specs/` for approved designs, and `docs/audits/` for dated audit and assessment reports.
- Keep root-level documentation limited to cross-cutting entry points and link detailed guidance from the relevant document authority.
- Read and follow `docs/AGENTS.md` before creating, editing, moving, or deleting any file under `docs/`.

## Development Commands

- `npm install` — install project dependencies.
- `npm run format` — write Prettier formatting; use `npm run format:check` for a read-only check.
- `npm run check` — run formatting, linting, typechecking, Vitest coverage, and complete manifest validation.
- `npm run documentation:gate -- --base <base> --head <head>` — enforce README/changelog synchronization for changed plugins.
- `GITHUB_ORG="${GITHUB_ORG}" PROJECT_TITLE="${PROJECT_TITLE}" npm run project:bootstrap -- --dry-run` — preview organization Project bootstrap.
- `npx tsc --noEmit` / `npx tsc6 --noEmit` — run the TypeScript 7 native compiler or the TypeScript 6 API-compatible compiler explicitly.
- `npm run validate:plugins` — validate every package-local plugin manifest and its resources.
- `npm run validate:marketplace` — validate the catalog and reverse-link it to package manifests.
- `npm run validate:release-set -- --plan <release-plan.json> [--archives]` — validate exact Release Please tag outputs and optional artifacts.
- `npm run validate:release-workflow` — validate that the Release Please workflow captures every configured component output.
- `npm run marketplace:build` — run the complete validate, generate, and reverse-validate pipeline.
- `npm run marketplace:check` — run the complete read-only package and catalog validation.

## Coding and Testing

Use the repository Prettier/ESLint conventions, two-space indentation, LF endings, constants instead of magic strings, and no `any`. JavaScript, MJS, and CJS files must begin with `// @ts-check` (after a required shebang) and remain covered by `tsconfig.scripts.json`. Name tests `*.test.ts` so the strict TypeScript project checks them; cover schema behavior, filesystem semantics, and new validation/generation branches. The Vitest gate requires at least 96% per file.

## Quality and Documentation

Run applicable diagnostics and tests before declaring work complete. Keep docs synchronized, verify version-sensitive claims against current releases, and report skipped checks, missing tools, unresolved diagnostics, and residual risks. Apply the folder-specific documentation rules in [docs/AGENTS.md](docs/AGENTS.md).

## Detailed Policies

- [Architecture and paths](docs/agent-guidelines/architecture.md)
- [Tooling and runtimes](docs/agent-guidelines/tooling.md)
- [Security and credentials](docs/agent-guidelines/security.md)
- [Communication and writing](docs/agent-guidelines/communication.md)
- [Quality and maintenance](docs/agent-guidelines/quality.md)
- [Ownership and private context boundary](docs/agent-guidelines/ownership.md)

## Operational Architecture and Source of Truth

Each `plugins/<plugin-id>/.codex-plugin/plugin.json` is the sole authored source
of truth for that distributable plugin's identity, version, metadata, and
declared components. Create it from `templates/codex-plugin-plugin.json`, then
remove optional declarations that the package does not use.

- `schemas/plugin.schema.json` defines the strict manifest contract.
- `schemas/marketplace.schema.json` defines the strict generated catalog contract.
- `lib/schemas/agent.schema.json` defines the required metadata for every
  `skills/<skill-id>/agents/openai.yaml` file.
- `scripts/marketplace-contract.cjs` validates package resources and builds the
  catalog only from validated manifests.
- `scripts/generate-marketplace.cjs` writes `.agents/plugins/marketplace.json`
  atomically; `scripts/validate-marketplace.cjs` validates the catalog and
  compares it exactly with the manifests that generated it.
- `scripts/plugin-manifest-guard.cjs` runs the complete build after a relevant
  Codex edit. The local hook requires explicit trust in Codex; CI remains the
  authoritative gate.
- Plugins must be self-contained. Every file, executable, declared resource,
  and symbolic link must remain inside its owning plugin package; symlinks are
  rejected before generation or release.
- Plugins must have at least one functional component: `skills`, `hooks`,
  `mcpServers`, or `apps`.

The marketplace is generated from package-local manifests only. The generator,
validator, schemas, templates, and hook are repository maintenance tooling and
are not runtime dependencies of installed plugins.

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
