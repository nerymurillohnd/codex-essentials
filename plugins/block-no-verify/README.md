# Block No Verify

Block No Verify bundles a narrowly scoped Codex lifecycle hook that denies
literal Bash tool calls attempting to bypass Git commit verification or signing.
It also includes a skill that explains the policy, activation, testing, and
rollback.

## Install and use

```sh
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add block-no-verify@codex-essentials
```

After installation, open `/hooks` in Codex, inspect the plugin-bundled
`PreToolUse` hook, and decide whether to trust the exact definition. Installing
or enabling the plugin does not automatically trust the hook.

Ask:
`Use $block-no-verify to review the hook policy and show me how to test it.`

## What the hook blocks

The bundled hook runs synchronously on `PreToolUse` for `^Bash$`. It denies a
literal shell command when it finds:

- `git ... --no-verify`
- `git commit -n ...` (including short-option groups such as `-an`)
- `git ... --no-gpg-sign`
- `git -c commit.gpgsign=false ...`
- `git -c commit.gpgsign=0 ...`
- `git -c commit.gpgsign=no ...`
- `git -c commit.gpgsign=off ...`

It returns the current Codex `PreToolUse` deny shape with a clear reason. It
also fails closed for malformed hook payloads or shell syntax that Python cannot
parse.

## Requirements and boundaries

- Supported host: Codex clients with lifecycle hooks and plugin-bundled hooks.
- Runtime: `python3` must be available where the hook runs.
- Scope: the hook observes Codex Bash/unified-exec calls that enter the local
  tool hook path. It is not a Git hook, branch-protection rule, endpoint-control
  product, or CI replacement.
- Coverage limit: the hook inspects literal command text. It does not resolve
  aliases, shell variables, command substitutions, `eval`, or opaque scripts
  that later invoke Git.
- Trust: the hook is non-managed. It is skipped until the user trusts it in
  `/hooks`, and changed definitions require review again.

Official OpenAI documentation for hooks and plugin-bundled hooks was consulted
on 2026-09-24. Recheck current documentation before compatibility-sensitive
changes.

## Update and removal

```sh
codex plugin marketplace upgrade codex-essentials
codex plugin add block-no-verify@codex-essentials
codex plugin list --json
codex plugin remove block-no-verify@codex-essentials
```

Removing the plugin removes the package hook from future plugin discovery. It
does not alter separate user or project hook definitions, Git hooks, branch
protection, CI configuration, or existing trust records outside the plugin.

## Maintainer verification

Run the handler fixtures:

```sh
python3 hooks/block-no-verify.py < hooks/fixtures/allow-status.json
python3 hooks/block-no-verify.py < hooks/fixtures/block-no-verify.json
python3 hooks/block-no-verify.py < hooks/fixtures/block-short-no-verify.json
python3 hooks/block-no-verify.py < hooks/fixtures/block-gpgsign-false.json
```

Then run `npm run validate:packages` and `npm run format:check` from the
marketplace root. Runtime discovery, trust, and live blocking require an
installed plugin and `/hooks` review in a Codex session.

See the [changelog](CHANGELOG.md) and [MIT license](LICENSE.md). This is an
independent community plugin, not an OpenAI product.
