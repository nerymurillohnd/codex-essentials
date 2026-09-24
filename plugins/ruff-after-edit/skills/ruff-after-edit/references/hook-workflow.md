# Ruff Hook Workflow

This reference is for explicit hook work. Reading it does not authorize or
enable a hook.

## Inventory

Inspect without writing:

- `<repo>/.codex/hooks.json`
- `<repo>/.codex/config.toml`
- `$HOME/.codex/hooks.json`
- `$HOME/.codex/config.toml`
- `pyproject.toml`, `ruff.toml`, and `.ruff.toml`
- the selected Ruff executable route and version
- baseline `ruff check` and `ruff format --check` for the proposed scope

Also inspect current official Codex Hooks documentation. Codex discovers
`hooks.json` and inline `[hooks]` tables next to active config layers, loads
matching hooks from multiple sources, and requires review and trust for
non-managed hooks.

## Scope and representation

Ask the user to choose project or user scope, then choose exactly one
representation in that scope:

- JSON: `.codex/hooks.json` or `$HOME/.codex/hooks.json`
- TOML: inline hook tables in `.codex/config.toml` or `$HOME/.codex/config.toml`

If both representations already exist in the selected scope, stop and ask which
one should own this workflow. Preserve unrelated events and handlers.

Use these templates as inert source material:

- `assets/templates/ruff-after-edit.sh`
- `assets/templates/ruff-check-on-stop.sh`
- `assets/templates/hooks.json.fragment`
- `assets/templates/config.toml.fragment`

## Command route

Select one route and use it in both handlers:

- `uv run ruff` when Ruff is a project dependency in a uv project.
- An absolute project-local or `PATH` Ruff executable that the user approved.
- `uvx ruff` only after explicit approval.

Do not install Ruff from a hook, modify `PATH`, fall back silently, or mix
routes between PostToolUse and Stop.

## Approval proposal

Before writing, show:

- selected scope and hook representation;
- exact handler and optional config paths;
- exact JSON or TOML merge;
- Ruff route and version;
- baseline diagnostics;
- write effects and timeout;
- disposable positive and negative tests;
- `/hooks` review and trust step;
- rollback plan.

After approval, write only the approved consumer files, set executable mode on
consumer Bash scripts, run the agreed test, inspect the diff, and ask the user
to review and trust the hook definition in `/hooks`.

## Rollback

Remove only the hook group and files created by this workflow. Preserve
unrelated hook groups, configuration, dependencies, and user files.
