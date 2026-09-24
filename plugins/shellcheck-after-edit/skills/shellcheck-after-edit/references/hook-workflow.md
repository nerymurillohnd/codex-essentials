# ShellCheck Hook Workflow

This reference is for explicit hook work. Reading it does not authorize or
enable a hook.

## Inventory

Inspect without writing:

- `<repo>/.codex/hooks.json`
- `<repo>/.codex/config.toml`
- `$HOME/.codex/hooks.json`
- `$HOME/.codex/config.toml`
- `<repo>/.shellcheckrc`
- `<repo>/shellcheckrc`
- `<repo>/.editorconfig`
- current Bash, jq, shfmt, and ShellCheck paths and versions
- baseline shfmt and ShellCheck output for the proposed target files

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

- `assets/templates/shellcheck-after-edit.sh`
- `assets/templates/hooks.json.fragment`
- `assets/templates/config.toml.fragment`
- `assets/templates/shellcheckrc`
- `assets/templates/editorconfig-shell`

## Policy

For ShellCheck, choose normal discovery, an existing/adapted project policy, or
an approved consumer-owned `--rcfile`. For shfmt, use normal `.editorconfig`
discovery or an approved project merge of `editorconfig-shell`. Do not describe
that fragment as a global user profile.

## Approval proposal

Before writing, show:

- selected scope and hook representation;
- exact handler and optional policy paths;
- exact JSON or TOML merge;
- tool paths and versions;
- ShellCheck and shfmt policy;
- baseline diagnostics;
- write effects and timeout;
- disposable positive and negative tests;
- `/hooks` review and trust step;
- rollback plan.

After approval, write only the approved consumer files, set executable mode on
consumer Bash scripts, run the agreed test, inspect the diff, and ask the user
to review and trust the hook definition in `/hooks`.

## Rollback

Remove only the hook group and files created by this workflow. Restore changed
`.editorconfig` or ShellCheck rcfiles from recorded pre-change content or Git
history. Preserve unrelated hook groups, configuration, dependencies, and user
files.
