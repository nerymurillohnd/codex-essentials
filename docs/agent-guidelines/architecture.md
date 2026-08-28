# Architecture Guidelines

This is a community marketplace for Codex plugins and data. It is not a web application.

- `.agents/plugins/marketplace.json` is the catalog and must remain at that exact path.
- `plugins/` is the collection of local plugin packages; see [Plugin Package Guidelines](../../plugins/AGENTS.md) for package-level structure and manifest rules.
- There is no repository-level `skills/` directory today. Skill content belongs inside the plugin that distributes it.
- Each `plugins/<plugin-id>/.codex-plugin/plugin.json` is the package source of truth. `schemas/` contains the plugin and marketplace schemas, `templates/` contains the complete plugin creation form, `scripts/` contains the generator and validators, and `lib/` contains bounded helpers with colocated Vitest tests.
- `.github/` contains contribution forms, release-note categories, and CI workflows. Organization-level Project structure is specified in `docs/operations/`.
- `tsconfig.scripts.json` is the separate no-emit `checkJs` project for runtime JavaScript, CJS, and MJS files; the root `tsconfig.json` remains TypeScript-only.
- `tsconfig.scripts.json` directly checks JavaScript helpers under `lib/` and `scripts/` with the Node-aware configuration.
- `docs/`, `adapters/`, and `config/` contain supporting material and integrations.

Keep local marketplace paths relative (`./plugins/<plugin-id>`) and inside the repository. Do not add `src/`, `public/`, `pages/`, or other web-oriented structure without an explicit architecture decision.

Each plugin is an independently versioned product. Its `README.md`,
`CHANGELOG.md`, and `.codex-plugin/plugin.json` are part of the product boundary;
each `SKILL.md` also has a Codex agent surface at
`skills/<skill-id>/agents/openai.yaml`. The PR that changes behavior or agent
metadata must update the affected documentation.

Plugin packages are release boundaries. A plugin must not import or execute
repository tooling, another plugin, or any path outside its own package. The
validator canonicalizes every symbolic link and rejects a package whose real
tree escapes `plugins/<plugin-id>/`.
