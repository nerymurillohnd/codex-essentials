# Plugin Submission Guidelines

Use this checklist before proposing a new Codex Essentials marketplace plugin or
changing an existing plugin product.

## Required Package Structure

Place every plugin under `plugins/<plugin-id>/`. The plugin ID must match the
manifest `name` and the marketplace catalog entry.

Each plugin package must include:

- `plugins/<plugin-id>/.codex-plugin/plugin.json`
- `plugins/<plugin-id>/README.md`
- `plugins/<plugin-id>/CHANGELOG.md`

Add these only when the plugin actually uses them:

- `plugins/<plugin-id>/skills/<skill-id>/SKILL.md` and its required
  `plugins/<plugin-id>/skills/<skill-id>/agents/openai.yaml`
- `plugins/<plugin-id>/.app.json`
- `plugins/<plugin-id>/.mcp.json`
- `plugins/<plugin-id>/assets/`

Do not create a repository-level `skills/` directory. Skill content belongs
inside the plugin package that distributes it.

Each `agents/openai.yaml` validates against `templates/agent.schema.json` after
YAML parsing. It requires `interface.display_name` and
`interface.short_description`; an `interface.default_prompt` is optional and
provides concise invocation framing. The file is metadata and prompt bootstrap,
not a second copy of `SKILL.md`. Optional icons must live under the owning
skill's `./assets/` directory, and unsupported fields or traversal paths fail
validation.

## Manifest Requirements

The manifest must validate against `templates/plugin.schema.json`. It must
define the plugin identity, author, interface metadata, capabilities, and at
least one of `skills`, `apps`, or `mcpServers`.

Use relative resource paths with a `./` prefix. Do not use `..` path segments.
Declare screenshots only for PNG assets that exist inside the package.

Top-level `hooks` are not accepted until the schema and supported Codex plugin
packaging contract are aligned.

## Documentation Requirements

Start from the canonical templates:

- `templates/README.md`
- `templates/CHANGELOG.md`

The plugin README must explain:

- Purpose and supported use cases.
- Included skills, apps, MCP integrations, and assets.
- Supported environments and required tools.
- Credentials, permissions, side effects, and human-approval boundaries.
- Installation, update, uninstall, rollback, verification, and recovery steps.
- Known limitations and compatibility notes.

The changelog must keep a `## [Unreleased]` section and record
product-relevant changes, including manifest, skill, agent metadata, MCP, app,
permission, security, compatibility, installation behavior, and breaking
changes.

## Catalog Registration

Register local packages in `.agents/plugins/marketplace.json` with a source path
such as `./plugins/<plugin-id>`.

Prefer repository helpers so generated fields remain consistent:

```bash
npm run generate:plugin -- <plugin-id>
npm run complete:plugin -- <plugin-id>
npm run validate:plugins
```

`complete:*` preserves authored values while filling missing defaults.

## Pull Request Evidence

Before opening a pull request, run the relevant checks and include the command
output in the PR description:

```bash
npm run format:check
npm run lint -- --max-warnings=0
npm run typecheck
npm run typecheck:scripts
npx tsc6 --noEmit
npm test
npm run validate:all
```

For product-affecting plugin changes, also verify that the plugin README and
`CHANGELOG.md` `Unreleased` entry changed together:

```bash
npm run documentation:gate -- --base <base> --head <head>
```

## Security and Review Expectations

Never commit credentials or real secret values. Document required variables as
`${VAR}` references.

Explain permissions, network access, filesystem writes, spawned commands,
external services, and rollback behavior in the plugin README. Reviewers should
be able to decide whether a plugin is safe to install without reading hidden
implementation assumptions.

## Release Expectations

Plugin release tags use this format:

```text
plugin/<plugin-id>/v<semver>
```

Validate a release candidate before tagging:

```bash
npm run validate:release -- plugin/<plugin-id>/v<semver>
```

Generated GitHub release notes supplement the curated plugin changelog; they do
not replace it.
