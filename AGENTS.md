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
- Release tags follow [ADR-0009](docs/decisions/adr-0009-release-tagging-policy.md):
  use `v`-prefixed SemVer tag names, keep manifest and package version fields
  without the `v`, and mark unstable release candidates as GitHub prereleases.

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

- Plugin, skill, hook, app, MCP, manifest, catalog, or release metadata: Read [plugins/AGENTS.md](plugins/AGENTS.md) and run the applicable plugin and marketplace checks.
- Repository documentation: Read [docs/AGENTS.md](docs/AGENTS.md) and run the applicable documentation gate.
- Tooling, schema, validator, generator, workflow, or test: Run `npm run check`.
- Current Codex behavior or compatibility: Consult official OpenAI documentation and relevant release notes.
- If a required maintenance file or instruction file is absent, stop and report the missing prerequisite.

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

## Marketplace Plugin Authoring

For a new marketplace plugin or a material change to an existing package,
invoke `$marketplace-plugin-authoring` before creating or editing package
artifacts. The skill defines the end-to-end authoring workflow; this file keeps
the permanent routing and non-negotiable publication gates.

Do not hand-edit `.agents/plugins/marketplace.json`. Keep mechanically
verifiable invariants in repository tooling and run the applicable validation
gates rather than relying on the skill as the sole control.

## Quality and Completion

- Run all applicable formatters, linters, type checks, tests, documentation
  checks, and freshness checks before claiming completion.
- Report failed or skipped checks, missing tools, unresolved diagnostics, and
  residual risks.
- Do not bypass hooks, tests, signatures, branch protections, or validation
  gates.

## Instruction Authority

- Treat every applicable `AGENTS.md` as binding operating instructions, not as
  optional reference material or background context.
- When the user invokes a heading, policy name, lifecycle name, or other
  shorthand that appears in an applicable `AGENTS.md`, apply the corresponding
  full instruction set without asking the user to restate it.
- Do not ask for routine confirmation for work that the applicable
  instructions already authorize. Continue autonomously until the authorized
  lifecycle reaches a verified terminal state or a real blocker exists.
- If a tool, skill, helper, or lower-priority workflow asks for extra approval
  that conflicts with an applicable `AGENTS.md` authorization, follow
  `AGENTS.md` and use the safest normal protected path available. Do not use
  that conflict as a reason to stop unless the requested action would bypass a
  control, exceed the user's scope, expose secrets, deploy production, or mutate
  an unrelated system.
- Interpret explicit user directives such as "commit and push", "commit, push
  and PR", "Automatic Pull Request Lifecycle", "take the PR to completion", or
  equivalent continuation language as authorization for the complete normal
  lifecycle defined by the applicable `AGENTS.md` instructions, including
  routine commits, pushes, PR updates, CI monitoring, review triage, review
  replies, conversation resolution, protected merge, branch cleanup, and
  main-branch synchronization.

## Commands and Layout

- Use the NVM-managed Node.js and npm versions declared in `.nvmrc` and `package.json`.
- Use `npm install` to install repository-local JavaScript tooling.
- Use `npm run check` as the complete repository validation gate before handoff.
- Use `npm run format` to format supported repository files with Prettier.
- Use `npm run format:check` to verify Prettier formatting without changes.
- Use `npm run marketplace:build` to regenerate and validate `.agents/plugins/marketplace.json` from plugin manifests.
- Use `npm run marketplace:test` or `npm test` to run marketplace generator tests.
- Use `npm run github-labels:test` to test GitHub label contract validation.
- Use `npm run validate:github-labels` to validate repository GitHub label references against `.github/label-contract.json`.
- Use `npm run ruff:format:check` and `npm run ruff:check` after editing Python scripts.
- Use `npm run basedpyright:check` after editing Python scripts to typecheck every Python file.
- Use `npm run shfmt:check` and `npm run shellcheck:check` after editing shell scripts.
- `scripts/install_ci_gate_tools.sh` is CI-only runner setup for repository gate tools.
- Use `npm run hooks:install` to install Lefthook hooks explicitly.
- Use `npm run hooks:pre-commit` to run the configured pre-commit jobs manually.
- `schemas/`, `scripts/`, and `tests/` contain repository contracts and tooling.
- `docs/` contains canonical repository documentation.
- `templates/` contains reusable authoring templates.

## Documentation Records

- Track unresolved work in `docs/maintenance/pending-debt.md`.
- Move verified resolutions to `docs/maintenance/resolved-debt.md`.
- Record durable architecture or operations decisions in `docs/decisions/`.
- Follow [docs/operations/releases.md](docs/operations/releases.md) before creating tags.

## Template Use

Read the matching repository template before creating or updating
`plugin.json`, `agents/openai.yaml`, a root or plugin README, `CHANGELOG.md`,
or `LICENSE.md`.
