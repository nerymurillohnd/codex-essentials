# Repo Hygiene

Repo Hygiene gives Codex three distinct Git workflows: automatically
discoverable routine local housekeeping, explicit deep topology and recovery
analysis, and explicit Git-based regression diagnosis. It makes targets,
integration state, and recovery evidence reviewable before a consequential
change.

## Install and use

```sh
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add repo-hygiene@codex-essentials
```

Use `$repo-hygiene:routine` for ignored output and merged local branches,
`$repo-hygiene:deep` for remotes, worktrees, reflogs, stashes, hidden refs,
objects, or integration, and `$repo-hygiene:debug` for a reproducible
regression, code search, blame, or bisect. The package contains these three
skills, their Codex metadata, and five conditional references. It bundles no
hook, script, MCP server, or credential.

## Inputs and result

Provide a repository path and the cleanup, recovery, topology, or regression
question. Useful evidence includes the intended base, exact refs or paths,
current worktrees, provider PR state, and a known-good/known-bad pair for
bisection. The result separates active work, retained recovery evidence, safe
observations, deletion candidates, and unknowns. A mutation report records exact
targets, commands, verification, and residual risk.

## Authority and side effects

Installation changes Codex-managed plugin state only. Audits and previews are
read-only. A direct request with exact targets and a recoverable plan can
authorize scoped execution; a vague “clean it up” does not establish which user
data may be deleted. When the user has already approved a concrete plan, the
skill carries that authorization without a redundant checkpoint.

Never infer that `main == origin/main` proves the repository is fully clean,
that an ancestor branch was integrated through a squash PR, or that an ignored
file is disposable. Do not print ignored-file contents or secret values. No
force push, broad `git clean`, `gc`, `prune`, history rewrite, deletion of
unclassified work, or protection bypass is implicit in a hygiene request.

## Update, removal, and recovery

```sh
codex plugin marketplace upgrade codex-essentials
codex plugin add repo-hygiene@codex-essentials
codex plugin list --json
codex plugin remove repo-hygiene@codex-essentials
```

This clean-history package begins at `0.1.0`; refresh and explicitly reinstall
if an older cached version remains. Start a new session to check the three skill
routes. Removing the plugin does not reverse Git operations; recovery depends on
the target repository's verified refs, worktrees, reflogs, provider history, or
other preserved evidence.

## Maintainer verification

Run `npm run check` and install in a clean Codex home. A routine request should
avoid remote or object-store mutations. A deep audit should enumerate refs,
worktrees, stashes, and uncertain provenance before deletion. A debug request
should distinguish search presence, last line edit, and regression causality.
Verify approved actions against exact targets and final refs.

See the [changelog](CHANGELOG.md) and [MIT license](LICENSE.md). This is an
independent community plugin, not a Git or OpenAI product.
