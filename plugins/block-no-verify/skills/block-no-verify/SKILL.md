---
name: block-no-verify
description:
  Explain, verify, or maintain the Block No Verify Codex hook that blocks Git
  --no-verify, commit -n, --no-gpg-sign, and falsy commit.gpgsign bypasses in
  Bash tool calls. Use for Git verification-bypass policy, commit signing
  enforcement, or this plugin's hook behavior; do not use for ordinary read-only
  Git inspection.
metadata:
  last-verified: "2026-09-24"
  target: "Codex PreToolUse Bash hook"
---

# Block No Verify

Help the user understand, verify, or safely maintain the bundled Codex
verification-bypass policy. Installing the plugin makes this skill and a
plugin-bundled hook available, but the hook is skipped until the user reviews
and trusts the exact definition in `/hooks`.

## Policy

The bundled hook is a synchronous `PreToolUse` command hook for `^Bash$`. It
denies literal Bash commands containing:

- `git ... --no-verify`
- `git commit -n ...` and short-option groups that contain `-n`
- `git ... --no-gpg-sign`
- `git -c commit.gpgsign=false ...`
- `git -c commit.gpgsign=0 ...`
- `git -c commit.gpgsign=no ...`
- `git -c commit.gpgsign=off ...`

It allows valid payloads without a Bash command because there is no command to
inspect. It fails closed for malformed JSON, non-object payloads, non-string
commands, or shell syntax it cannot parse.

## Activation and trust

1. Confirm the plugin is installed and enabled.
2. Ask the user to open `/hooks`.
3. Inspect the plugin-bundled `PreToolUse` source and hash.
4. The user decides whether to trust it. Do not trust it for them.
5. After trust is visible, test one blocked command and one nearby allowed
   command in a non-production repository.

## Verification

Use `references/fixtures.md` for expected fixture commands and outcomes. Label
evidence separately:

- Parse: `hooks/hooks.json` and `hooks/block-no-verify.py` parse.
- Static contract: event, matcher, handler type, command, and output shape match
  current Codex docs.
- Handler: fixture stdin returns the expected exit and stdout.
- Discovery: Codex lists the plugin hook from the installed package.
- Trust: `/hooks` shows the current definition as trusted or awaiting review.
- Live integration: a real matching Bash call is blocked after trust.

## Boundaries

- This is a Codex hook, not a Git hook, branch protection rule, endpoint
  security agent, or CI substitute.
- It observes supported Codex Bash/unified-exec calls that enter the local hook
  path. Hosted tools and specialized opt-out paths are outside its coverage.
- It inspects literal command text. It does not resolve aliases, variables,
  command substitutions, `eval`, shell functions, or scripts that later invoke
  Git.
- Removing the plugin removes the package hook from future plugin discovery; it
  does not remove unrelated user/project hook configuration or Git controls.

## Report

Report installed/enabled status if inspected, hook discovery and trust status if
observed, fixture results, live-event results if run, and coverage limits. Do
not claim live blocking unless a trusted hook actually blocked a real call.
