# IDE and CLI parity

Repository-local Prettier configuration and dependency resolution are the shared contract. The audit must establish—not assume—the effective CLI binary, effective configuration, ignore behavior, parser/plugin loading, and Prettier version for both paths.

## CLI

- Reuse the repository’s package manager, scripts, task runner, and workspace execution model when they already provide a local Prettier path.
- When direct CLI use is proposed, use a command that resolves the local dependency without silently falling back to a global binary or a network download.
- Record the command, working directory, package/workspace target, config discovery path, ignore inputs, and detected Prettier/plugin versions.
- Do not prescribe a script name. Decide after audit whether a command belongs in an existing quality pipeline, needs a dedicated script, or should remain an explicit local CLI command.

## VS Code

- Inspect user, workspace, folder, and language-specific settings only within the declared audit scope.
- For a repository that adopts Prettier, propose workspace settings sufficient to select Prettier for the audited language IDs and to preserve the repository-local configuration contract.
- Leave `prettier.configPath` unset unless the repository has an explicit, verified need for an override; it can bypass normal local configuration resolution.
- Do not set `prettier.prettierPath` merely to restate the conventional local path. Propose it only when audit evidence shows normal extension resolution cannot select the approved local package.
- Evaluate `prettier.requireConfig`, `prettier.useEditorConfig`, `editor.formatOnSave`, language-specific formatter selection, and extension recommendations individually. Their inclusion must be justified by the repository’s intended workflow, not by a universal preference.

## Parity proof

The recommendation must identify the exact repository-local config and package used by both CLI and VS Code, the relevant languages/plugins, and any remaining behavior difference. If parity cannot be demonstrated without a risky or unsupported override, report it as a conflict and do not claim consistency.
