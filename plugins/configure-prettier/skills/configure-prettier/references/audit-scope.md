# Audit Scope

Default to the current repository or declared workspace. Inspect parent,
sibling, user-level, or global configuration only when the user explicitly puts
those locations in scope.

## Read-Only Inventory

Inspect relevant:

- `package.json`, workspace manifests, package-manager files, lockfiles, and
  runtime version files.
- Prettier configuration files, `.prettierignore`, `.gitignore`,
  `.editorconfig`, `.gitattributes`, and editor workspace settings.
- Existing format, lint, quality, test, hook, CI, and task-runner commands.
- Detected formatters and linters that overlap Prettier's file ownership.
- Local Prettier and Prettier plugin versions without installing or updating
  dependencies.

Do not run commands that install packages, update lockfiles, write caches,
format files, regenerate outputs, or change Git state during discovery.

## Conflict Checks

Report conflicts in configuration precedence, ignore behavior, line endings,
generated or vendored files, multiple formatters for the same file class,
missing local dependencies, plugin/runtime incompatibility, and CI/editor/CLI
drift. For each conflict, include evidence, impact, severity, and the smallest
viable correction.
