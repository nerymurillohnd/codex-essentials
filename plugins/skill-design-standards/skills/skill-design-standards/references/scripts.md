# Scripts and commands in skills

Source:
[Using scripts in skills](https://agentskills.io/skill-creation/using-scripts),
consulted 2026-09-24.

Prefer a project command or installed tool for a short, reliable operation.
Bundle a helper only when repeated parsing, quoting, or orchestration would
otherwise be reconstructed unreliably. Give its skill-root-relative path,
runtime, inputs, output, side effects, and failure behavior where it is used.

An agent-facing script should run without an interactive TTY, reject missing or
ambiguous input before mutation, keep secret values out of logs, use structured
output when a machine consumes the result, and return nonzero on partial
failure. Set a bounded timeout/retry policy and provide a dry run for
consequential writes. An `--apply` flag expresses an already-authorized
decision; it does not create permission.

Pin dependencies to a reviewed version or lockfile. `npx`/`uvx` may download
packages, so they are not silent offline fallbacks. Preserve the target
project's chosen runtime and package manager. Verify `--help`, one valid case,
an invalid case, output parsing, paths with spaces when relevant, and
rollback/idempotence for mutating helpers.
