---
name: ruff-after-edit
description:
  Use when linting, formatting, fixing, or configuring Ruff in Python projects,
  or when designing, installing, reviewing, testing, or troubleshooting a
  consumer-owned Codex Ruff after-edit hook.
---

# Ruff After Edit

Use Ruff deliberately for Python linting and formatting. When explicitly asked,
prepare an approval-gated Codex after-edit workflow. Installing this plugin does
not create, activate, trust, or run hooks.

## Route the request

1. **Intentional Ruff use:** lint, format, explain a rule, fix a file, or assess
   Ruff configuration. Follow this file only; do not load hook references just
   because Python is present.
2. **Hook workflow:** create, change, wire, test, review, or troubleshoot a Ruff
   after-edit hook. Read [Hook Workflow](references/hook-workflow.md), then
   [Hook Validation](references/hook-validation.md).
3. **Installed-hook diagnosis:** inspect the actual consumer hook source,
   handler, event payload, selected Ruff route, scope, and configuration before
   proposing a repair.

## Intentional Ruff use

Inspect the project first. Preserve existing `pyproject.toml`, `ruff.toml`, and
`.ruff.toml` configuration. Scope fixes to requested or changed files, and show
a diff or ask before formatting unrelated legacy code.

Select one verified route:

- `uv run ruff ...` when Ruff is a dependency of the uv-managed project.
- An approved project-local or `PATH` Ruff executable when that is the existing
  project route.
- `uvx ruff ...` only with explicit approval when Ruff is not a project
  dependency; it can resolve or download a tool.

Run safe lint fixes before formatting:

```sh
<ruff> check --fix --no-unsafe-fixes -- path/to/file.py
<ruff> format -- path/to/file.py
<ruff> check -- path/to/file.py
<ruff> format --check -- path/to/file.py
```

Do not add `--unsafe-fixes`, `noqa`, `type: ignore`, rule-selection overrides,
ignores, exclusions, or suppressions just to make a check pass. Explain and
resolve remaining diagnostics in source when authorized.

## Hook workflow

Read the current official Codex hook contract before proposing installation.
First inspect the operating system, Bash and jq availability, selected user or
project scope, existing Codex hook sources, hook trust state, Ruff
configuration, baseline Ruff diagnostics, and verified Ruff command route.

Present the exact files, hook representation, commands, timeout, status message,
side effects, test, `/hooks` review, trust step, and rollback. Obtain explicit
approval before writing any consumer file or configuration.

The approved workflow uses a pair:

- `PostToolUse` runs `ruff-after-edit.sh` for reported `.py` paths in the
  approved scope.
- `Stop` runs `ruff-check-on-stop.sh` against the approved scope and exits
  non-zero until Ruff is clean.

Use one hook representation per scope: `hooks.json` or inline `config.toml`, not
both. Keep templates consumer-owned. Do not create active plugin hooks, install
dependencies, or trust a hook for the user.

## Sources

This skill is grounded in current official Codex Hooks and Agent Plugins
documentation, Ruff documentation, and local project evidence. Recheck current
documentation for hook or Ruff behavior before changing a consumer hook.
