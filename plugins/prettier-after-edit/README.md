# Prettier After Edit

Prettier After Edit formats files reported by supported Codex edit events with
the target project's local Prettier. It is intentionally narrow: it formats
existing contained files, reports what happened, and does not install
dependencies, create configuration, scan the repository, or run unrelated
quality gates.

## Install and use

```sh
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add prettier-after-edit@codex-essentials
```

After installing, review the bundled hook in `/hooks` and trust the current
definition before relying on automatic execution. The target project must
already provide a local `prettier` dependency under `node_modules` within the
session `cwd`.

The package includes:

- [PostToolUse hook configuration](hooks/hooks.json)
- [Node.js hook handler](hooks/format.mjs)
- [Skill instructions](skills/prettier-after-edit/SKILL.md)
- [Codex metadata](skills/prettier-after-edit/agents/openai.yaml)

## Requirements and boundaries

- Host: Codex surfaces that support plugin-packaged lifecycle hooks.
- Runtime: Node.js available to the hook command.
- Formatter: target-project local Prettier. The hook skips when local Prettier
  is absent instead of using `npx`, installing packages, or relying on a global
  formatter.
- Credentials: none.
- Network: none.
- Installation effects: installing the plugin changes Codex-managed plugin
  state. Non-managed plugin hooks still require the host trust flow before
  execution.
- Task effects: a trusted matching hook may write formatted bytes back to the
  exact contained files reported by the event. It does not change dependencies,
  lockfiles, configuration, hooks, CI, or unrelated files.

The hook receives a `PostToolUse` payload, collects direct file fields and
`apply_patch` add/update paths, canonicalizes each target against event `cwd`,
and rejects missing files, directories, deleted files, and paths escaping the
workspace. It respects `.prettierignore`, `.gitignore`, `.editorconfig`, and
Prettier configuration when the local Prettier API supports them.

## Statuses

- `formatted`: Prettier ran and changed file bytes.
- `unchanged`: Prettier ran and bytes were already formatted.
- `skipped`: the payload had no file, the target was invalid, local Prettier was
  missing, the file was ignored, or no parser was inferred.
- `failed`: local Prettier or filesystem handling produced an actionable error.

The hook reports a `systemMessage` and exits `0` because the edit has already
occurred. Repository scripts, CI, and review remain the enforcement boundary.

## Update, removal, and recovery

```sh
codex plugin marketplace upgrade codex-essentials
codex plugin add prettier-after-edit@codex-essentials
codex plugin remove prettier-after-edit@codex-essentials
```

Removal stops future hook runs but does not revert prior formatting. Use the
target repository's Git history or another trusted backup for rollback.

## Verification and limitations

Maintainers should run:

```sh
npm run validate:packages
npm run format:check
```

Run `npm run check` when generated catalog files are allowed to be updated. A
catalog freshness check can fail after adding this package until generated
outputs are refreshed.

This package does not test live hook trust or automatic invocation by itself.
Trust and activation must be verified from Codex `/hooks` in the consuming
environment. It is an independent community plugin and is not an official
Prettier or OpenAI product.

See the [changelog](CHANGELOG.md) and [MIT license](LICENSE.md).
