# Plugin Package Guidelines

These instructions apply to every local package under `plugins/`. The root
`AGENTS.md` and its linked policies continue to apply.

## Package Layout and Identity

- Place each package at `plugins/<plugin-id>/`.
- Every local package must contain
  `plugins/<plugin-id>/.codex-plugin/plugin.json`.
- `<plugin-id>` must match the manifest `name` and satisfy the identifier rules
  in `templates/plugin.schema.json`.
- Keep plugin resources inside the package. Do not create a repository-level
  `skills/` directory; skill content belongs in `plugins/<plugin-id>/skills/`.
- Every distributed skill at `skills/<skill-id>/SKILL.md` must include its
  Codex-facing agent manifest at `skills/<skill-id>/agents/openai.yaml`. The
  skill document owns behavior and operating instructions; the agent manifest
  owns concise presentation metadata and optional prompt bootstrap.

The manifest must validate against `templates/plugin.schema.json`. Its required
top-level fields are `name`, `version`, `description`, `author`, and
`interface`. The interface requires the display metadata, capabilities, and
exactly one of `defaultPrompt` or `default_prompt`. At least one of `skills`,
`apps`, or `mcpServers` must be declared.

## Referenced Resources

- Declare `skills` only when `./skills/` exists.
- Validate every `agents/openai.yaml` against
  `templates/agent.schema.json`. The required `interface.display_name` and
  `interface.short_description` identify the skill in Codex. An optional
  `interface.default_prompt` may frame the first request; it must not repeat
  the skill's operating procedure.
- Agent icon paths are optional. When declared, keep them `./assets/`-relative
  and resolving inside the owning skill directory, including after symbolic-link
  canonicalization. Do not add unsupported YAML fields,
  use traversal paths, or place credentials in agent metadata.
- Declare `apps` as `./.app.json` and `mcpServers` as `./.mcp.json` only when
  those files exist; inline MCP definitions are also permitted by the schema.
- Keep interface assets under `./assets/`; screenshot paths must point to PNG
  files. Do not use `..` path segments.
- Do not add a top-level `hooks` field until the plugin schema and Codex plugin
  creator support it.

## Product Documentation

Every plugin product must include these files at its package root:

- `plugins/<plugin-name>/README.md`
- `plugins/<plugin-name>/CHANGELOG.md`

The plugin README must document its purpose, included components, supported
environments, inputs and outputs, required tools and credentials, permissions,
side effects, human-approval boundaries, installation behavior, uninstall or
rollback behavior, verification steps, known limitations, and failure and
recovery behavior.

The changelog must record every product-relevant change, including manifest,
skill, hook, script, MCP, app, permission, installation-behavior, security,
and breaking changes. Keep `README.md`, `CHANGELOG.md`, `plugin.json`, and the
marketplace registration synchronized in the same change. Product changes are
gated in pull requests; documentation-only changes may update only the
affected document.

Use [`templates/README.md`](../templates/README.md) and
[`templates/CHANGELOG.md`](../templates/CHANGELOG.md) as the canonical starting
points. Preserve Keep a Changelog headings, use ISO 8601 dates, and add
migration notes for breaking changes. Area labels are conditional metadata,
not a checklist: do not add entries for unaffected areas, and remove empty
sections from published releases. Release tags use
`plugin/<plugin-id>/v<semver>`.

## Catalog and Workflow

- Register local packages in `.agents/plugins/marketplace.json` with a local
  source path such as `./plugins/<plugin-id>`.
- Prefer the repository helpers so manifests and catalog entries stay aligned:

  ```sh
  npm run generate:plugin -- <plugin-id>
  npm run complete:plugin -- <plugin-id>
  npm run validate:plugins
  npm run validate:all
  npm run check
  ```

`complete:*` preserves authored values while filling missing defaults. Never
commit credentials or real secret values in plugin files; use `${VAR}`
references and document required configuration instead.

## Consistency and Drift Review

Before merging any plugin change, verify these artifacts as one atomic set:

- `.codex-plugin/plugin.json`
- `skills/<skill-id>/SKILL.md` and `skills/<skill-id>/agents/openai.yaml`
- `README.md`
- `CHANGELOG.md`
- `.agents/plugins/marketplace.json`

Required consistency checks:

- `<plugin-id>` must match `plugin.json` name and marketplace `name`.
- Marketplace registration path must be `./plugins/<plugin-id>`.
- `README.md` version badge and `CHANGELOG.md` unreleased section should reflect
  manifest/versioned intent.
- Capability and installation claims in README should match actual files present
  (`hooks`, `skills`, `agents`, `references`, etc.) and runtime assumptions.
- Each `SKILL.md` must have exactly one schema-valid `agents/openai.yaml`; its
  catalog description and default prompt must accurately describe that skill,
  rather than the entire plugin.
- Any behavioral or compatibility change must appear in the Unreleased changelog
  before the change is released.
- Hook-path assumptions in docs must match runtime script behavior.

When any of these checks fail, pause merge and fix docs/manifest/catalog together
in the same change set.
