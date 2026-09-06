# Codex Configuration

Source: [official skills documentation](https://developers.openai.com/codex/skills/),
checked 2026-09-06. Recheck current documentation when changing host-specific behavior.

## Optional host metadata

`agents/openai.yaml` is a Codex extension for UI metadata, invocation policy, and
tool dependencies. It is not required by the base Agent Skills format. Use the field guidance below
and verify current host requirements when creating or modifying this file.

- Preserve existing interface, policy, and dependency fields outside the requested edit.
- Use quoted strings and real YAML booleans. As an authoring convention, keep
  `interface.short_description` at 25–64 characters and mention `$skill-name` in
  `default_prompt`. Check the actual consumer for stricter requirements.
- Add icons and branding only when requested or supplied; verify relative asset paths.
- `policy.allow_implicit_invocation` defaults to `true`; an omitted policy is valid.
  Preserve an existing policy. For new skills, select explicit-only invocation
  (`false`) only when the user requests it; do not infer it from task sensitivity.
- Treat invocation policy and action authorization separately. Explicitly invoking
  a skill does not authorize every operation described in it.

Do not regenerate an existing file blindly: creator generators can replace the
entire file, including unrelated policy and dependencies.

## Tools and packaging

Declare actual required MCP dependencies using supported `dependencies.tools` fields
when targeting Codex. Verify identifiers, transport, and endpoint against the real
integration. A declaration does not prove installation, authentication, permissions,
or availability; inspect the exposed tool contract and results before relying on it.

For necessary tools, explain which workflow decision or action they support, expected
inputs and results, and how unavailable, empty, or ambiguous responses are handled.
Prescribe call ordering only where one call depends on another. Distinguish optional
enhancements from required dependencies; never invent endpoints or add speculative tools.

Plugin submission and repository validators may impose additional rules on UI fields,
manifests, or resources. Inspect those actual gates when packaging a skill. Do not
apply plugin submission requirements to every standalone skill, or convert a local
skill update into an installation or publication task.
