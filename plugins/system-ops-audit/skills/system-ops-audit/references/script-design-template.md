# Read-only collector design

Use this coverage map before writing or changing a collection script. Replace
every placeholder with the actual approved task details.

- Target Mac and macOS version: `{{OBSERVED_TARGET}}`
- Script path and runtime: `{{EXACT_PATH_AND_RUNTIME}}`
- Output path and retention: `{{EXACT_REPORT_PATH_AND_RETENTION}}`
- Included categories: `{{BOUNDED_COVERAGE}}`
- Excluded private data: `{{SECRET_AND_CONTENT_EXCLUSIONS}}`
- Command families: `{{READ_ONLY_COMMANDS_AND_EXPECTED_OUTPUTS}}`
- Privilege needs: `{{USER_OR_ELEVATED_WITH_REASON}}`
- Sanitization: `{{REDACTION_AND_NAME_ONLY_RULES}}`
- Unsupported/failure behavior: `{{EXIT_AND_UNKNOWN_STATUS}}`
- Verification: `{{SYNTAX_STATIC_REVIEW_VALID_OUTPUT_AND_NO_MUTATION_PROOF}}`

Use `#!/usr/bin/env bash` for a Bash collector and verify its exact commands
with ShellCheck and shfmt when available. Do not infer that a command is
read-only from its name; inspect flags and output. A direct, scoped user request
to write the collector is authority to create that artifact. Ask a focused
question only when target, coverage, destination, or privacy limits are missing
in a way that changes the result.
