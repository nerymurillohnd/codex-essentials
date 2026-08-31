# Audit scope

## Resolve scope

Default scope is the current repository, its workspace packages, and applicable parent configuration. State the target, included packages/directories, and excluded locations.

Inspect user-level configuration, global tooling, sibling repositories, shared workspaces, or editor directories only when the user explicitly requests that broader scope. For a cross-project request, inspect only the declared sibling repositories and relevant user-level Prettier locations. Never recursively inspect unrelated home-directory content, credentials, caches, private application data, or arbitrary files.

## Read-only inventory

When present and relevant, inspect:

- Repository/workspace layout; every `package.json`, workspace manifest, package-manager configuration, and lockfile (`package-lock.json`, `npm-shrinkwrap.json`, `pnpm-lock.yaml`, `yarn.lock`, `bun.lock`, `bun.lockb`).
- Prettier configuration: `.prettierrc*`, `prettier.config.*`, TypeScript configs where supported, and the `prettier` field in `package.json`.
- `.prettierignore`, `.gitignore`, `.eslintignore`, tool-specific ignore files, `.editorconfig`, `.gitattributes`, `.vscode/settings.json`, `.vscode/extensions.json`, and `*.code-workspace` files.
- ESLint (flat and legacy), Biome, Oxlint/OXC, dprint, Stylelint, framework integrations, scripts, task runners, Makefiles, justfiles, and workspace orchestrators.
- Existing hooks, Husky, lint-staged, GitHub Actions, GitLab CI, and deployment checks only when they run formatting or affect the relevant files.
- Local/global Prettier and plugin installations, relevant file extensions/parsers, and framework files for Astro, Svelte, Vue, MDX, YAML, TOML, GraphQL, Tailwind, and other detected stacks.
- The effective CLI command path and the effective IDE formatter/configuration resolution path, including whether they use the same local Prettier package and repository-local config.

Do not run package installation, `prettier --write`, generators, formatters, or commands that change files. Avoid commands that refresh lockfiles or caches during discovery.

## Command safety classes

Classify every command before running it.

### Read-only discovery

These commands may inspect paths, versions, configuration resolution, package
metadata, Git state, and file contents, provided they do not create or refresh
files, caches, or lockfiles.

Examples include:

```sh
command -v prettier
prettier --version
prettier --find-config-path <file>
git status --short
git ls-files
```

Do not assume a command is read-only merely because it appears to inspect
tooling. Verify that it does not install packages, download dependencies,
refresh metadata, write caches, regenerate lockfiles, or modify repository
files.

### Non-mutating validation

Run only after approval when the proposed plan explicitly includes the command.
Validation must not install dependencies, write files, update lockfiles, rewrite
caches, or alter Git state.

Examples may include:

```sh
<package-manager> run format:check
<local-prettier-command> --check <approved-scope>
```

### Mutating commands

Treat every command that may install, update, remove, write, format, generate,
cache, or alter tracked or untracked files as a mutation requiring explicit
approval.

Examples include:

```sh
<package-manager> install
<package-manager> add --save-dev prettier@<version>
<local-prettier-command> --write <scope>
```

Never run a mutating command outside the exact approved item and scope.

## Required conflict checks

Report evidence, practical effect, severity (`blocking`, `high`, `medium`, `low`), minimal options, and a recommendation when justified for:

- Ambiguous/multiple Prettier configs or conflicting resolution precedence.
- Conflicting Prettier, `.editorconfig`, VS Code, `.gitattributes`, plugin, and ignore behavior.
- Multiple formatters or ESLint stylistic rules targeting the same files.
- Plugin, framework, package-manager, runtime, or lockfile incompatibilities.
- Global binaries masking an absent local dependency; CI/local binary or configuration-path drift.
- Platform line-ending risks and generated, vendored, minified, build-output, or CMS-managed files.
