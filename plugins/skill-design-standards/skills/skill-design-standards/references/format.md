# Agent Skills Format

Source: [specification](https://agentskills.io/specification), checked 2026-09-06.
Start future refreshes from the [complete index](https://agentskills.io/llms.txt).

## Required structure and frontmatter

A skill is a directory with `SKILL.md`: YAML frontmatter followed by a Markdown body.
Other files and directories are optional. The body has no prescribed sections.

| Field           | Contract                                                                                                                                                         |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`          | Required string, 1–64 characters; lowercase alphanumeric characters and hyphens; no leading, trailing, or consecutive hyphens; matches the containing directory. |
| `description`   | Required non-empty string, 1–1024 characters; describes the capability and when it applies.                                                                      |
| `license`       | Optional string naming a license or referring to a bundled license file.                                                                                         |
| `compatibility` | Optional string, 1–500 characters if present; use for actual environment requirements.                                                                           |
| `metadata`      | Optional mapping of string keys to string values; quote values such as versions to preserve string types.                                                        |
| `allowed-tools` | Optional space-separated string of pre-approved tool patterns; experimental and host-dependent.                                                                  |

Prefer ASCII `a-z`, `0-9`, and hyphens for portable names. The specification's prose
mentions Unicode, and `skills-ref` accepts Unicode alphanumerics; the Codex creator's
local quick validator uses ASCII. Verify the target consumer before claiming Unicode
portability. Do not label that consumer restriction as a universal format rule.

Keep tool declarations distinct from authority: `allowed-tools` neither configures
an MCP server nor overrides user authorization or host-enforced permissions.
Preserve supported optional fields; do not add environment requirements speculatively.
Keep custom metadata within `metadata` unless the host documents another extension.

## Progressive disclosure and resources

The specification describes three loading stages: metadata at discovery, the full
entrypoint on activation, and supporting resources on demand. It recommends fewer
than 5000 tokens for instructions and keeping `SKILL.md` under 500 lines. These are
context-management recommendations, not mandatory body schemas or size targets.

- Keep the entrypoint as short as its useful instructions permit.
- Use skill-root-relative resource paths, such as `references/schema.md`.
- Link instruction references directly from `SKILL.md`; avoid nested reading chains.
  This is reading-depth guidance, not a ban on nested asset or code directories.
- Make each resource's loading or execution condition clear. Assets may be consumed
  by scripts or host metadata without needing to be read as instructions.
- Prefer `references/` for knowledge, `scripts/` for executable helpers, and `assets/`
  for static resources. These directory names are conventions, not an exhaustive list.
- Require self-contained helpers or documented dependencies, useful error messages,
  and handling of relevant edge cases. Supported runtimes depend on the host.

Do not add empty directories, copied manuals, or ancillary documentation without an
actual workflow or packaging requirement.
