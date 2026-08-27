---
status: accepted
date: 2026-08-27
decision-makers: Nery Samuel Murillo
consulted: Codex plugin package conventions observed in installed OpenAI-curated plugins
informed: Marketplace contributors and maintainers
---

# Require a Codex agent manifest for every distributed skill

## Context and Problem Statement

Codex Essentials distributes skills inside independently versioned plugin
packages. A `SKILL.md` supplies the instructional content, but it does not by
itself provide a stable, machine-validated presentation and invocation surface
for the Codex client. Established Codex plugin packages place that surface in
`skills/<skill-id>/agents/openai.yaml`.

Without a repository contract, contributors can add a skill that is valid as
Markdown but unavailable or inconsistently presented as a Codex agent. The
repository also needs to distinguish the agent bootstrap metadata from the
skill's behavior and from plugin-level `plugin.json` metadata.

## Decision Drivers

- Make every distributed skill discoverable through one predictable path.
- Validate the runtime-facing YAML instead of treating it as incidental text.
- Keep skill instructions, plugin product metadata, and marketplace metadata
  independently scoped while requiring their identities to agree.
- Avoid inventing unsupported runtime fields or forcing decorative assets.
- Fail contributor mistakes locally and in CI before a plugin is released.

## Considered Options

- Leave `agents/openai.yaml` optional and document it as a convention.
- Put agent presentation fields inside `.codex-plugin/plugin.json`.
- Require one `agents/openai.yaml` manifest for every `SKILL.md`.

## Decision Outcome

Chosen option: **Require one `agents/openai.yaml` manifest for every
`SKILL.md`.**

For a skill at `skills/<skill-id>/SKILL.md`, its agent manifest must be at
`skills/<skill-id>/agents/openai.yaml`. The canonical schema is
`lib/schemas/agent.schema.json`, expressed as JSON Schema Draft 2020-12 and
applied to YAML after parsing.

The required contract is:

```yaml
interface:
  display_name: Human-readable skill label
  short_description: Concise catalog description
```

`interface.default_prompt` is optional and, when supplied, gives Codex the
initial task framing. `interface.icon_small`, `interface.icon_large`, and
`policy.allow_implicit_invocation` are optional supported metadata. They are
not required merely to make a skill valid. The manifest must use only these
declared fields, prevent traversal in icon paths, and resolve declared icons
inside the owning skill directory after canonicalizing symbolic links. A
symbolic link is permitted only when its real target remains inside that skill.

`SKILL.md` remains the behavior and operating-instruction source. The agent
manifest is metadata and prompt bootstrap only; it must not duplicate long
procedures or contain secrets. `plugin.json` remains package-level distribution
metadata, while `marketplace.json` remains catalog, installation-policy, and
source metadata.

### Consequences

- Good, because every skill has an explicit, uniform Codex-facing identity.
- Good, because malformed YAML, missing manifests, unsupported fields, and
  missing icon assets fail through the repository validator.
- Good, because generators create the required skeleton instead of leaving a
  partially valid plugin package.
- Bad, because contributors add one small YAML file for each skill.
- Bad, because package version changes are required when adding this product
  surface to an already released plugin.

### Confirmation

The repository confirms the decision through schema tests, generator tests,
validator tests covering missing and invalid manifests, documentation gates,
and the complete quality command:

```bash
npm run check
npm run validate:release -- plugin/<plugin-id>/v<semver>
```

## Pros and Cons of the Options

### Optional convention

- Good, because existing packages need no migration.
- Bad, because client presentation and invocation drift silently.

### Plugin-level agent fields

- Good, because package metadata is already validated.
- Bad, because one plugin can contain multiple skills and therefore multiple
  independently invokable agents.

### One manifest per skill

- Good, because it matches the established Codex package layout and preserves
  the correct ownership boundary.
- Good, because each skill can later expose distinct prompts or optional icons.
- Bad, because it adds a required artifact to every skill directory.

## More Information

The schema intentionally accepts the subset of fields observed in installed
OpenAI-curated plugin manifests. Add a new field only when current Codex
documentation or a maintained official package demonstrates its runtime
meaning, then update the schema, validator, contributor guidance, and tests in
one change.
