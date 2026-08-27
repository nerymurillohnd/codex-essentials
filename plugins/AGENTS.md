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

The manifest must validate against `templates/plugin.schema.json`. Its required
top-level fields are `name`, `version`, `description`, `author`, and
`interface`. The interface requires the display metadata, capabilities, and
exactly one of `defaultPrompt` or `default_prompt`. At least one of `skills`,
`apps`, or `mcpServers` must be declared.

## Referenced Resources

- Declare `skills` only when `./skills/` exists.
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
