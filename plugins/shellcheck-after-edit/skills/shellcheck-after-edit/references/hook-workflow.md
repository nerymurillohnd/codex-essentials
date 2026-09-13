# Consumer Hook Workflow

This document is reference material. Reading it does not create or enable a
hook.

## 1. Inventory before proposing

Inspect all applicable sources without writing:

    <repo>/.codex/hooks.json
    <repo>/.codex/config.toml
    $HOME/.codex/hooks.json
    $HOME/.codex/config.toml
    <repo>/.shellcheckrc
    <repo>/shellcheckrc
    <repo>/.editorconfig

Also inspect the selected scope, trust state, current tool paths and versions,
existing hook groups, and baseline ShellCheck/shfmt output.

## 2. Choose scope and representation

The user selects project or user scope:

    Project handler: <repo>/.codex/hooks/shellcheck-after-edit.sh
    User handler:    $HOME/.codex/hooks/shellcheck-after-edit.sh

The user selects exactly one representation for that scope:

- JSON: hooks.json with a PostToolUse group.
- TOML: inline [[hooks.PostToolUse]] and [[hooks.PostToolUse.hooks]] in
  config.toml.

If both representations are present in the same scope, stop and ask which one
is authoritative. Preserve every unrelated event and handler.

## 3. Select policy independently

For ShellCheck, choose normal discovery, an existing/adapted project policy, or
an approved consumer-owned shellcheckrc passed as --rcfile. For shfmt, choose
normal .editorconfig discovery or an approved project merge of the
editorconfig-shell fragment. Never describe that fragment as a global user
profile.

## 4. Approval and materialization

Present a numbered proposal containing:

- selected scope and representation;
- exact handler and policy paths;
- exact JSON/TOML merge;
- tool resolution and versions;
- ShellCheck and shfmt policy;
- write effects, timeout and status message;
- disposable test and expected positive/negative results;
- /hooks review/trust step and rollback.

Wait for explicit approval. Then copy only the approved handler/test/profile,
merge only the approved hook group, set executable mode on consumer Bash files,
run the test, inspect the resulting diff and ask the user to review/trust /hooks.

## 5. Rollback

Remove only the hook group and files created by this workflow. Restore a changed
.editorconfig from the recorded pre-change content or Git history. Do not delete
unrelated hook groups, configuration, dependencies, or user files.
