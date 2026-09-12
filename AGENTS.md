# Repository Guidelines

Codex Essentials is a Git-backed public marketplace for reusable Codex plugins
and skills.

## Repository Model

- `plugins/<plugin-id>/plugin.json` is the authored source of
  truth for plugin identity, version, metadata, and components.
- `.agents/plugins/marketplace.json` is generated metadata. Do not edit it by
  hand.
- Plugins are self-contained and distributed from the public repository and
  `main` catalog.
- Release Please may create plugin tags and GitHub Releases, but must not
  publish packages or upload release assets.

## Session Start Protocol

Before making repository changes:

- Inspect the repository, existing products, active toolchain, Git state, and
  execution environment.
- Run `codex --version`.
- Run `codex plugin --help`.
- Run `codex plugin marketplace --help`.
- Run available `codex doctor --all --json` diagnostics.
- Read `docs/maintenance/pending-debt.md`.
- Read `docs/maintenance/resolved-debt.md`.
- Check Codex release notes from the previous 30 days for relevant changes.
- Probe each required tool using its current `--version` or `--help`.
- Proceed with the prompted user's input.

## Change Routing

| Change                                                                | Required instruction and validation                                                        |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Plugin, skill, hook, app, MCP, manifest, catalog, or release metadata | Read [plugins/AGENTS.md](plugins/AGENTS.md); run applicable plugin and marketplace checks. |
| Repository documentation                                              | Read [docs/AGENTS.md](docs/AGENTS.md); run the applicable documentation gate.              |
| Tooling, schema, validator, generator, workflow, or test              | Run `npm run check`.                                                                       |
| Current Codex behavior or compatibility                               | Consult official OpenAI documentation and relevant release notes.                          |

If a required maintenance file or instruction file is absent, stop and report the
missing prerequisite.

## Plugin Publication Gate

Do not publish, register, or push a marketplace plugin for a pull request until
all of the following are complete:

- A valid root `plugin.json` manifest exists.
- Every included skill has a valid `skills/<skill-id>/agents/openai.yaml`.
- The package includes `README.md`, `CHANGELOG.md`, and `LICENSE.md`.
- The marketplace entry is generated in `.agents/plugins/marketplace.json`.
- The root `README.md` catalog includes the plugin.
- The package, its included skills, and its hooks have been evaluated,
  validated, and verified against current official OpenAI and OpenAI Developers
  documentation.

## Quality and Completion

- Run all applicable formatters, linters, type checks, tests, documentation
  checks, and freshness checks before claiming completion.
- Report failed or skipped checks, missing tools, unresolved diagnostics, and
  residual risks.
- Do not bypass hooks, tests, signatures, branch protections, or validation
  gates.

## Commands and Layout

- Use the NVM-managed Node.js and npm versions declared in `.nvmrc` and
  `package.json`.
- Use `npm install` to install repository-local JavaScript tooling.
- Use `npm run check` as the complete repository validation gate before
  handoff. It runs formatting checks, marketplace generation and tests, GitHub
  label contract tests and validation, Ruff, shfmt, and ShellCheck.
- Use `npm run format` to format supported repository files with Prettier.
- Use `npm run format:check` to verify Prettier formatting without changes.
- Use `npm run marketplace:build` to regenerate and validate
  `.agents/plugins/marketplace.json` from plugin manifests.
- Use `npm run marketplace:test` or `npm test` to run marketplace generator
  tests.
- Use `npm run github-labels:test` to test GitHub label contract validation.
- Use `npm run validate:github-labels` to validate repository GitHub label
  references against `.github/label-contract.json`.
- Use `npm run ruff:format:check` and `npm run ruff:check` after editing
  Python scripts.
- Use `basedpyright $(rg --files -g '*.py')` after editing Python scripts to
  typecheck every Python file. Do not suppress `Any`, unknown types, unused call
  results, or unused definitions to make diagnostics pass.
- Use `npm run shfmt:check` and `npm run shellcheck:check` after editing shell
  scripts.
- Use `npm run hooks:install` to install Lefthook hooks explicitly. Hooks are
  not installed automatically during `npm install`.
- Use `npm run hooks:pre-commit` to run the configured pre-commit jobs
  manually.
- `schemas/`, `scripts/`, and `tests/` contain repository contracts and
  tooling.
- `docs/` contains canonical repository documentation.
- `templates/` contains reusable authoring templates.

## Documentation Records

- Track unresolved work in `docs/maintenance/pending-debt.md`.
- Move verified resolutions to `docs/maintenance/resolved-debt.md`.
- Record durable architecture or operations decisions in `docs/decisions/`.
- Store approved Superpowers plans and specs in `docs/superpowers/`.

## Working Rules

- Prefer pull requests for product, package, catalog, script, test, schema,
  security, permission, refactor, compatibility, release-control, and policy
  changes. Direct pushes require explicit user authorization.
- Before creating or managing a pull request, apply every label relevant to its
  nature, scope, and impact. At least one label is required before review,
  merge, or handoff.
- Product changes update the affected README, `CHANGELOG.md`, and manifest; include validation evidence.
- Use Conventional Commits; do not commit or push without explicit request.
- Refer to secrets only as `${VAR}` and never commit credentials.
- Owner: Nery Samuel Murillo (`nerymurillohnd`). Keep personal and Forestal MT business context outside this public guide; do not infer private business requirements from this repository.

## Template Use

Read the matching repository template before creating or updating
`plugin.json`, `agents/openai.yaml`, a root or plugin README, `CHANGELOG.md`,
or `LICENSE.md`.
