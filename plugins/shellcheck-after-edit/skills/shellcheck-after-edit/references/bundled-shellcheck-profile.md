# Bundled ShellCheck Profile

Use this reference only after the user selects the bundled ShellCheck policy and
approves the exact consumer path.

The template shellcheckrc is copied to:

    Project: <repo>/.codex/shellcheckrc
    User:    $HOME/.codex/shellcheckrc

The handler must receive the selected path explicitly:

    --shellcheckrc <approved-path>

Passing --rcfile makes that file the ShellCheck configuration authority; it is
not an addition to normal discovery. Review every source-path, external-sources,
optional-check, and exclusion setting before approval. The bundled profile is
optional and must never be copied during plugin installation.
