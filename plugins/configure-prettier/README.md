# Configure Prettier

Configure Prettier helps Codex turn formatting into reproducible repository
tooling. It audits the project first, checks current Prettier behavior, and
either proposes changes or implements the scope the user requested.

## Install and use

```sh
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add configure-prettier@codex-essentials
```

Ask:

```text
Use $configure-prettier to audit this repository and propose a Prettier plan. Do not make changes.
```

The package includes one [skill](skills/configure-prettier/SKILL.md), Codex
metadata in [agents/openai.yaml](skills/configure-prettier/agents/openai.yaml),
and focused references for audit scope, source verification, and approval
reporting.

## Inputs and result

Provide the repository or workspace scope, the Prettier problem to solve, and
any non-negotiable style, editor, hook, or CI requirements. The skill inspects
local package manifests, lockfiles, Prettier configuration, ignore files,
scripts, editor settings, hooks, and CI only within the declared scope.

For a read-only request, it returns an inventory, detected formatting contract,
conflicts, risks, official-source evidence, and proposed changes. For a direct
configuration or repair request, it makes the scoped changes and runs the
relevant validation commands without a redundant approval checkpoint.

## Requirements and boundaries

- Supported projects: repositories that use or are considering Prettier for
  files Prettier supports directly or through verified project plugins.
- Required tools: the target repository's package manager, runtime, local
  Prettier dependency when adopted, and any project-owned validation command.
- Credentials: none.
- Network: read-only documentation or package metadata lookups may be needed for
  current version, compatibility, and migration claims.
- Installation effects: installing the plugin changes only Codex-managed plugin
  state. It does not modify the target repository.
- Task effects: direct configuration requests authorize the ordinary scoped
  repository edits. Broad source reformatting, new hooks, unrelated editor
  settings, and sibling repositories require a clear user choice if they were
  not part of the request.

The skill treats global Prettier binaries and personal editor settings as
diagnostic context, not repository authority. It does not introduce a local
Prettier dependency merely because Prettier is popular.

## Update, removal, and recovery

```sh
codex plugin marketplace upgrade codex-essentials
codex plugin add configure-prettier@codex-essentials
codex plugin remove configure-prettier@codex-essentials
```

Removing the plugin stops future use of this workflow. It does not revert
target-project changes that were applied within an authorized task; use that
repository's Git history or review process for rollback.

## Verification and limitations

Maintainers should run:

```sh
npm run validate:packages
npm run format:check
```

Run `npm run check` after regenerating the catalog, root README inventory, and
issue forms for a package change.

The package does not bundle Prettier, an MCP server, a hook, or an installer. It
is an independent community plugin and is not an official Prettier or OpenAI
product.

See the [changelog](CHANGELOG.md) and [MIT license](LICENSE.md).
