# ShellCheck After Edit

ShellCheck After Edit helps Codex format and lint shell scripts deliberately
and, when explicitly asked, prepare a reviewable consumer-owned `PostToolUse`
hook. Installing this plugin exposes the skill, references, and inert templates
only. It does not create, register, activate, trust, or run hooks.

## Install and use

```sh
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add shellcheck-after-edit@codex-essentials
```

Ask: `Use $shellcheck-after-edit to run shfmt and ShellCheck on this script.`

For hook work, ask Codex to inspect the target scope and propose an after-edit
workflow. Codex must show the exact consumer files, hook source, tool paths,
test, `/hooks` review step, and rollback before writing anything.

## Included components

- [Skill](skills/shellcheck-after-edit/SKILL.md) for command routing and hook
  workflow decisions.
- [Codex metadata](skills/shellcheck-after-edit/agents/openai.yaml) for skill
  discovery.
- [Hook workflow reference](skills/shellcheck-after-edit/references/hook-workflow.md)
  for scope, representation, trust, and rollback.
- [Hook validation reference](skills/shellcheck-after-edit/references/hook-validation.md)
  for disposable tests.
- Inert templates in `skills/shellcheck-after-edit/assets/templates/` for the
  consumer-owned Bash handler, hook fragments, and optional policy fragments.

## Requirements and boundaries

- Supported files: existing regular `.sh` and `.bash` files reported by an edit
  payload and contained by the approved scope.
- Hook templates require Bash, `jq`, `shfmt`, and ShellCheck already available
  to the consumer.
- The package bundles no executable dependency, credential, MCP server, active
  hook, or network service.
- ShellCheck configuration uses normal `.shellcheckrc` or `shellcheckrc`
  discovery unless the user approves an explicit `--rcfile`.
- shfmt should run without parser or printer style flags so `.editorconfig`
  remains authoritative.

The default hook shape is intentionally exact-file only: format with shfmt, then
lint with ShellCheck for the reported shell file. It does not scan directories
or add suppressions to make diagnostics disappear.

## Verification

Maintainers validate from the marketplace root with:

```sh
npm run validate:packages
npx prettier --check --ignore-unknown plugins/shellcheck-after-edit
shellcheck plugins/shellcheck-after-edit/skills/shellcheck-after-edit/assets/templates/*.sh
shfmt -d plugins/shellcheck-after-edit/skills/shellcheck-after-edit/assets/templates/*.sh
```

Run `npm run check` only when generated marketplace outputs are allowed to be
current for the edited package set.

## Removal

```sh
codex plugin remove shellcheck-after-edit@codex-essentials
```

Removing the plugin stops future skill discovery. It does not remove
consumer-owned hook files that were later created after separate approval.

See the [changelog](CHANGELOG.md) and [MIT license](LICENSE.md). This is an
independent community plugin, not a ShellCheck, mvdan/sh, or OpenAI product.
