# Portable Agent Skills format

Source: [Agent Skills specification](https://agentskills.io/specification),
consulted 2026-09-24. Discover updated pages through
[the documentation index](https://agentskills.io/llms.txt).

A skill directory contains `SKILL.md` with YAML frontmatter and Markdown
instructions. `name` and `description` are required. The name is 1–64
characters, lowercase alphanumeric plus hyphens, with no leading, trailing, or
consecutive hyphen; it matches the parent directory. Description is a non-empty
string of at most 1024 characters and should state capability and when to use
it.

Optional frontmatter includes `license`, `compatibility`, string-valued
`metadata`, and experimental `allowed-tools`. The last field is not a permission
grant. Do not impose Codex's `agents/openai.yaml` on the portable format: it is
a host extension.

Keep shared instructions in `SKILL.md` and link conditional `references/`
directly by skill-root-relative path. Use `scripts/` for executable helpers only
when repeated mechanics warrant them and `assets/` for static output resources.
Supporting files are read when needed. The specification's under-500-line and
under-5000-token guidance manages context; it is not a parser requirement.

The portable specification mentions Unicode lowercase alphanumerics, while some
Codex or repository validators restrict names to ASCII. Report the actual
consuming host's constraint separately; do not call an ASCII-only policy a
universal Agent Skills rule.
