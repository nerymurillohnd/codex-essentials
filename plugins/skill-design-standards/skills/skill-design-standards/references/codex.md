# Codex skill metadata

Source:
[OpenAI optional skill metadata](https://learn.chatgpt.com/docs/build-skills#optional-metadata),
consulted 2026-09-24.

`agents/openai.yaml` can supply `interface.display_name`, `short_description`,
icons, brand color, and `default_prompt`; it can also set
`policy.allow_implicit_invocation` and declare real tool dependencies. The file
is optional for a portable skill. An omitted implicit-invocation policy defaults
to `true`; set it to `false` only for an intentional explicit-only product
boundary. Preserve existing unrelated policy and dependency fields when editing
an established skill.

Declare `dependencies.tools` only for verified integrations the skill actually
needs. A declaration does not install, authenticate, or prove a remote MCP is
callable. Use actual IDs, endpoint, and transport from the target host. The
invocation prompt should represent this one skill rather than duplicate its
procedure or imply permission for unrelated actions.

Plugin packaging can add manifest or marketplace requirements beyond these base
metadata fields. Inspect the actual package schema and receiving Codex CLI path
before treating a local validator pass as installation proof.
