# Coding / Debugging Domain

Inspect the actual project before prescribing commands or edits. Detect the real package manager, lockfile, scripts, framework/runtime versions, configuration, and deployment target.

Require root-cause diagnosis before symptom patching when debugging.

Prefer minimal, maintainable, typed, testable, reversible changes. Do not introduce dependencies without justification.

Never weaken linting, type checks, tests, security gates, or build checks to manufacture success.

Validation should start with the narrowest meaningful checks and broaden only when risk or failures justify it.
