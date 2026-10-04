# README authoring guide

The root [README](../README.md) is the human catalog. Each plugin's README is its own landing page, created from [the skills-only template](../templates/skills-only/README.md). GitHub supports relative repository links, heading anchors, fenced code blocks, tables, and `<details>` disclosure sections; use those features where they make the page easier to scan. See [GitHub's README guidance](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes) and [collapsed-section guidance](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/organizing-information-with-collapsed-sections).

## Core questions

The template gives each question a short place to be answered. Add detail or combine closely related explanations when a plugin needs it, while keeping the answer easy to find.

1. **Identity and purpose:** say what the plugin is, why it exists, what user problem it solves, and what it actually does. The generated title and description identify the package; the Overview should add practical meaning rather than repeat the manifest sentence.
2. **Capabilities:** the generated table lists real `skills/*/SKILL.md` files using their frontmatter descriptions. The MCP line appears only when `mcp.json` exists. Edit those source files, not the generated table.
3. **Requirements and installation:** state supported clients and versions, prerequisites, permissions, side effects, and verified installation steps. Do not promise a command or service that has not been tested.
4. **Usage and examples:** show at least one realistic prompt or action and the result a user should expect.
5. **Verification and maintenance:** tell users how to confirm the plugin works, how to update it, and how to remove it. Give UI steps when commands are not the actual route.
6. **Limits, license, and related links:** describe relevant boundaries, name or link the packaged license, and link to the changelog, repository catalog, and issue form.

## Content choices

- Use a table for comparable facts or capability mappings; use prose for context, instructions, and trade-offs. Do not use a table merely to box in paragraphs.
- Use fenced code blocks with a language (`sh`, `json`, `toml`, or `text`) for commands, configuration, and prompts. Verify commands before publishing.
- Use `<details>` only for optional, lengthy secondary material. Do not hide installation steps, permission requirements, or important limits.
- Use relative links for files in this repository. Use normal heading anchors for local navigation and keep heading text stable when links depend on it.
- The only author-editable placeholders use uppercase double braces, such as `{{EXAMPLE_PROMPT}}`. Replace all of them. HTML maintainer comments explain what to edit; remove optional template comments before review.
- Omit sections for features that do not apply, such as configuration for a plugin without settings. Do not write `N/A` tables or advertise MCP when there is no `mcp.json`.
- Keep the essential questions answered even when a feature has no special setup. For example, state that no external account is required when that fact helps a user evaluate the plugin. Add plugin-specific sections only when they help someone install, use, verify, or maintain it.
- Keep the Overview concise. Avoid restating the same feature list in Overview, Capabilities, and Usage; each section should answer a different reader question.

## Drift prevention

`plugin.json` is the source for title, description, and version. `skills/` and `mcp.json` are the sources for capability badges and the capability table. The badge images use Shields.io, while their labels and linked text remain readable if the image service is unavailable. `scripts/sync_catalog.py --write` updates these generated README regions, the root catalog, and `.agents/plugins/marketplace.json`; `--check` detects drift in CI. The validator also rejects unfilled placeholders, leftover optional guidance, and broken relative file links across repository documentation. A passing check proves structural consistency, not that installation prose, heading anchors, external links, or examples work: review those manually. Follow the [documentation maintenance guide](maintenance.md) after changes that affect multiple files.
