# Plugin package instructions

- Author each package in `plugins/<id>/` with a root portable `plugin.json`,
  `README.md`, `CHANGELOG.md`, and `LICENSE.md`. The manifest name and directory
  ID must agree. Initial versions in this lineage are `0.1.0`.
- Use `skills/<skill-id>/SKILL.md` for skills and keep their supporting files
  inside the same package. Add `agents/openai.yaml` only with supported host
  fields and real dependencies. Do not declare unsupported root component fields
  in a portable manifest.
- Use `mcp.json` only for an actual portable MCP server. Put OpenAI-specific
  interface, app mapping, and hook settings under `extensions.com.openai`.
- A plugin install must not write a consumer project, register or trust a hook,
  or execute a handler without the host's trust process. Document and test
  material side effects, credentials, failure modes, and rollback.
- Validate packages with the official pinned schemas and local policy, then
  regenerate the Codex catalog and other derived output. Run the relevant
  package test and `npm run check`; a schema pass alone is not install proof.
- Changelogs begin with this lineage. Do not copy old version entries or claim
  that old Git tags represent releases from the new root history.
