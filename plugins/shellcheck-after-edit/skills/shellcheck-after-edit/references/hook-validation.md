# Hook Validation

Run this validation only against a disposable or explicitly approved consumer
scope. It can rewrite the selected shell file.

## Static and smoke validation

    bash -n /path/to/.codex/hooks/shellcheck-after-edit.sh
    printf '%s

' '{"cwd":"/path/to/project","tool_input":{"file_path":"script.sh"}}' | bash /path/to/.codex/hooks/shellcheck-after-edit.sh --scope /path/to/project

Then inspect the file diff and the stderr result. The expected clean path runs
shfmt before ShellCheck and exits zero.

## Required negative cases

Exercise each case and record the exit status and diagnostic:

- a ShellCheck finding;
- missing shfmt or ShellCheck;
- malformed JSON;
- a missing or directory target;
- an absolute target outside scope;
- a symlink resolving outside scope;
- an ignored target under .editorconfig;
- a second unreported shell file, which must remain unchanged.

## Configuration review

Validate the selected hooks.json or config.toml fragment, confirm that exactly
one representation is active for the selected scope, inspect the final
definition in /hooks, and let the user decide whether to trust it. A green
syntax check is not evidence that the hook is enabled or alive.
