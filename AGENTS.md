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
  lifecycle described here, including routine commits, pushes, PR updates, CI
  monitoring, review triage, review replies, conversation resolution, protected
  merge, branch cleanup, and main-branch synchronization.

## Commands and Layout

- Use the NVM-managed Node.js and npm versions declared in `.nvmrc` and
  `package.json`.
- Use `npm install` to install repository-local JavaScript tooling.
- Use `npm run check` as the complete repository validation gate before
  handoff. It runs formatting checks, marketplace generation and tests, GitHub
  label contract tests and validation, Ruff, Basedpyright, shfmt, ShellCheck,
  and repository label validation.
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
- Use `npm run basedpyright:check` after editing Python scripts to typecheck
  every Python file. Do not suppress `Any`, unknown types, unused call results,
  or unused definitions to make diagnostics pass.
- Use `npm run shfmt:check` and `npm run shellcheck:check` after editing shell
  scripts.
- `scripts/install_ci_gate_tools.sh` is CI-only runner setup for repository
  gate tools; do not use it as a local environment bootstrap script.
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
- Follow [docs/operations/releases.md](docs/operations/releases.md) before
  creating repository or plugin release tags.
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

### Automatic Pull Request Lifecycle

When the user authorizes a pull request lifecycle directly or by invoking this
heading, complete the lifecycle without requesting routine intermediate
approval:

1. Inspect the repository state, active branch, remotes, applicable
   instructions, labels, checks, reviews, and unresolved review threads.
2. Apply every label required by the pull request's nature, scope, and impact.
   Include `@codex` in the pull request body or comments when review is needed.
3. Continuously monitor CI, required checks, review state, and every review
   thread until the pull request is ready, actionable, merged, or genuinely
   blocked.
4. Triage every review thread against current code. Treat bot suggestions as
   claims, not proof. Fix real issues, identify stale or false-positive items
   with evidence, validate the result, reply with concrete evidence, and resolve
   the conversation.
5. After every push, invalidate prior readiness assumptions and re-check the
   exact current head SHA, checks, mergeability, labels, and review threads.
6. Once readiness is verified, complete the merge through the repository's
   normal protected path and merge method inferred from repository settings and
   history. Do not ask the user to restate approval for the current head when
   this lifecycle has already been invoked and the action stays within this
   scope.
7. Never bypass protections, force-push public history, use admin override,
   skip hooks, suppress checks, or merge a different head than the one just
   verified.
8. After merge, confirm the terminal merged state from GitHub, synchronize the
   local and remote main branches, clean merged local and remote branches when
   permitted, and inspect review threads again. If new review comments arrive
   after merge, do not claim the lifecycle is fully closed; either address them
   in a follow-up pull request or report the remaining actionable post-merge
   work with exact thread evidence.

## Template Use

Read the matching repository template before creating or updating
`plugin.json`, `agents/openai.yaml`, a root or plugin README, `CHANGELOG.md`,
or `LICENSE.md`.
