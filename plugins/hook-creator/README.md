# Hook Creator

Hook Creator helps Codex design, create, review, and debug lifecycle hooks from
the released Codex hook contract. It is a knowledge plugin: installing it makes
one skill available and does not register, trust, or execute hooks.

## Install and use

```sh
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add hook-creator@codex-essentials
```

Ask:
`Use $hook-creator to design a project hook that blocks destructive Bash commands.`

The package contains one [skill](skills/hook-creator/SKILL.md), its
[Codex metadata](skills/hook-creator/agents/openai.yaml), and focused references
for hook events, packaging, trust, and verification.

## Inputs and result

Provide the intended outcome, target scope, existing hook sources, operating
system, Codex surface and version, runtime tools, and any MCP or CI environment
that the hook may use. The skill returns a recommended event, matcher, handler,
placement, input/output contract, tests, activation steps, trust boundary, and
rollback. When implementation is authorized, it writes only the selected hook
configuration, handler, tests, and related documentation.

## Requirements and boundaries

- Supported host: Codex clients with lifecycle hooks and Agent Skills.
- The plugin bundles no active hook, MCP server, credential, or runtime
  dependency.
- Non-managed hook definitions must be reviewed and trusted in `/hooks` before
  they run. The plugin never trusts a hook for the user.
- Hook sources compose. Installing or enabling one hook source does not replace
  user, project, managed, or plugin hooks from other active layers.
- Hosted tools and specialized opt-out paths are not a universal enforcement
  boundary for `PreToolUse` or `PostToolUse`.

Official OpenAI documentation for hooks and plugin-bundled hooks was consulted
on 2026-09-24. Recheck current documentation before compatibility-sensitive
changes.

## Update and removal

```sh
codex plugin marketplace upgrade codex-essentials
codex plugin add hook-creator@codex-essentials
codex plugin list --json
codex plugin remove hook-creator@codex-essentials
```

Removing the plugin removes the installed skill package only. It does not remove
hooks, handlers, tests, trust records, CI files, or documentation created during
separate authorized work.

## Maintainer verification

Run `npm run validate:packages` and `npm run format:check` from the marketplace
root. For behavioral smoke testing, ask the skill to design a synchronous
`PreToolUse` hook for Bash and confirm it distinguishes parse, handler,
discovery, trust, and live-integration evidence. Then ask for a background hook
that must block the triggering operation; it should reject that design because
background hooks cannot control the operation that triggered them.

See the [changelog](CHANGELOG.md) and [MIT license](LICENSE.md). This is an
independent community plugin, not an OpenAI product.
