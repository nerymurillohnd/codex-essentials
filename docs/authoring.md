# Plugin authoring guide

## Package contract

Use one self-contained directory at `plugins/<name>/`. The directory and manifest `name` must match, use lowercase kebab-case, and contain no more than 64 characters. The root `plugin.json` follows Agent Plugins 1.0. Use semantic versions such as `0.1.0`.

Put reusable workflows in `skills/<skill-name>/SKILL.md`. Each skill needs YAML frontmatter with a matching `name` and a description that says when to use it. Put conditional or lengthy supporting detail next to the skill, such as in `references/`.

If the plugin connects to an MCP server, use a portable root `mcp.json` with verified connection details. Never invent an endpoint, include credentials, or assume a client has access to a service. If an app binding or client-specific compatibility manifest is needed, document the supported client and keep its metadata synchronized with the root manifest.

Reference only assets shipped inside the plugin. The scaffold copies the repository's Apache 2.0 `LICENSE` into the plugin so the release ZIP carries its license; review or replace that file if a plugin uses different terms. Do not commit symlinks, dependency directories, release archives, or secrets in plugin packages. Each plugin README is its landing page. Follow [the README guide](readmes.md) for required content, optional sections, formatting, and generated regions.

The skills-only template is a local starting point, not a distribution-ready package. Before distributing a plugin for Codex, add a square `logo` and `composerIcon` to `extensions.com.openai.interface`, with `./`-prefixed paths to files included in the package (prefer `assets/`). Current Codex package validation requires both. The [current submission guidance](https://developers.openai.com/plugins/deploy/submission#icons-and-screenshots) specifies supported formats, dimensions, and size limits; recheck it before release. Do not add placeholder icon paths or claim that a scaffold passes Codex package validation.

The root README is the human-readable marketplace landing page. Its marked catalog table and `.agents/plugins/marketplace.json` are generated from plugin manifests, sorted by directory name. Do not edit generated content by hand. This keeps identity, description, version, and links aligned without duplicating manual data. See [the official guidance audit](official-guidance.md) for the distinction between a repo marketplace and public directory publication.

## Local workflow

1. Run `python3 scripts/new_plugin.py <name> --display-name "Name" --short-description "Short subtitle" --description "Specific purpose" --author "Author"`.
2. Replace the example skill, complete all plugin README sections, and replace the generic initial-release changelog note with real capabilities.
3. Run `python3 scripts/sync_catalog.py --write` after changing the manifest, skill folders, skill descriptions, or `mcp.json`.
4. Add only the capabilities the plugin actually provides.
5. Run `python3 scripts/validate.py` and `python3 scripts/sync_catalog.py --check`.
6. Exercise the workflow in a supported client and record the result in the pull request.
7. Package a release only after reviewing the exact files and validating its manifest and assets.

The validator checks local repository conventions. It does not prove runtime compatibility, remote service availability, or acceptance by a public plugin directory.

## Release principles

Version each plugin independently and maintain its [changelog](changelogs.md) with `Unreleased` notes and a dated section matching the manifest version. Decide whether a future public version needs MCP before the first public ZIP; current submission rules do not permit adding an MCP server later to an already submitted skills-only plugin. Public directory submission and account installation require separate review and are not implied by a merge. See [the release guide](releasing.md).
