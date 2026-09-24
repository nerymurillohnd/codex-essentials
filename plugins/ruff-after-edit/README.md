# Ruff After Edit

Ruff After Edit helps Codex use Ruff intentionally and, when explicitly asked,
prepare a reviewable consumer-owned after-edit workflow. Installing this plugin
exposes the skill, references, and inert templates only. It does not create,
register, activate, trust, or run hooks.

## Install and use

```sh
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add ruff-after-edit@codex-essentials
```

Ask: `Use $ruff-after-edit to lint this Python change.`

For hook work, ask Codex to inspect the target project and propose a Ruff
after-edit workflow. Codex must show the exact consumer files, hook source,
command route, test, `/hooks` review step, and rollback before writing anything.

## Included components

- [Skill](skills/ruff-after-edit/SKILL.md) for Ruff command routing and hook
  workflow decisions.
- [Codex metadata](skills/ruff-after-edit/agents/openai.yaml) for skill
  discovery.
- [Hook workflow reference](skills/ruff-after-edit/references/hook-workflow.md)
  for scope, trust, and rollback.
- [Hook validation reference](skills/ruff-after-edit/references/hook-validation.md)
  for disposable tests.
- Inert templates in `skills/ruff-after-edit/assets/templates/` for the
  consumer-owned Bash handlers and hook fragments.

## Requirements and boundaries

- Supported targets: Python projects with an approved Ruff route.
- Hook templates require Bash and `jq`; the selected Ruff command must already
  be available or be explicitly approved by the user.
- The package bundles no Ruff binary, Python environment, credential, MCP
  server, active hook, or network service.
- `uvx ruff` is not automatic because it can resolve or download a tool.
- The hook proposal must preserve existing `pyproject.toml`, `ruff.toml`, and
  `.ruff.toml` policy unless the user approves a concrete configuration change.

The consumer hook pair is intentionally two-part: `PostToolUse` runs safe Ruff
fixes and formatting for reported `.py` paths, while `Stop` validates the
approved scope before clean completion. PostToolUse cannot undo an edit that
already happened, and a Stop gate does not authorize weakening Ruff policy.

## Verification

Maintainers validate from the marketplace root with:

```sh
npm run validate:packages
npx prettier --check --ignore-unknown plugins/ruff-after-edit
shellcheck plugins/ruff-after-edit/skills/ruff-after-edit/assets/templates/*.sh
shfmt -d plugins/ruff-after-edit/skills/ruff-after-edit/assets/templates/*.sh
```

Run `npm run check` only when generated marketplace outputs are allowed to be
current for the edited package set.

## Removal

```sh
codex plugin remove ruff-after-edit@codex-essentials
```

Removing the plugin stops future skill discovery. It does not remove
consumer-owned hook files that were later created after separate approval.

See the [changelog](CHANGELOG.md) and [MIT license](LICENSE.md). This is an
independent community plugin, not an Astral or OpenAI product.
