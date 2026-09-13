# Existing and Adapted Project Configuration

Inspect existing configuration before proposing a change:

    <repo>/.shellcheckrc
    <repo>/shellcheckrc
    <repo>/.editorconfig

Preserve an existing project policy and use normal discovery. If the user wants
an adapted policy, show the exact diff and obtain approval before writing it.

ShellCheck can use a consumer-owned profile with --rcfile. shfmt discovers
.editorconfig from the edited file's ancestry. Do not pass shfmt parser or
printer flags when .editorconfig is authoritative, because those flags disable
its EditorConfig formatting options.

The bundled editorconfig-shell asset is a project-only merge fragment. Merge
only shell sections after reviewing unrelated EditorConfig settings. It cannot
be installed as a reliable global shfmt profile for arbitrary repositories.
