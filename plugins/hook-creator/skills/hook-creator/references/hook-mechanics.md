# Codex Hook Mechanics

## Sources and packaging

Codex discovers hooks next to active config layers as `hooks.json` or inline
`[hooks]` tables in `config.toml`. Matching hooks from multiple files all run;
higher-precedence config layers do not replace lower-precedence hook sources. If
one layer has both forms, Codex merges them and warns at startup.

Enabled plugins can bundle hooks. Codex looks for `hooks/hooks.json` by default
unless `extensions.com.openai.hooks` in `plugin.json` points to one or more
`./`-prefixed package paths or inline hook objects. Hook paths resolve inside
the plugin root. Plugin hook commands receive `PLUGIN_ROOT` and `PLUGIN_DATA`.

## Trust

Non-managed hooks, including plugin-bundled hooks, are skipped until the user
reviews and trusts the exact hook definition in `/hooks`. Trust is tied to the
current hook hash, so changed definitions require review again. Managed hooks
from system, cloud, MDM, or `requirements.toml` policy are trusted by policy and
cannot be disabled from the normal user hook browser.

## Handlers

`command` and `mcp_tool` handlers are executable. `prompt` and `agent` handlers
may parse but are skipped by Codex. Command hooks receive one JSON object on
stdin and run with the session cwd. MCP tool hooks call an already-connected
server and do not start or reconnect it.

Set `async: true` only for advisory command hooks. Background hooks cannot
block, approve, rewrite, or continue the operation that triggered them.
`SessionEnd` always runs synchronously.

## Outputs

Use hook-specific JSON output for decisions. Important cases:

- `PreToolUse` deny: `hookSpecificOutput.permissionDecision = "deny"` and
  `permissionDecisionReason`, or legacy `decision: "block"`.
- `PreToolUse` rewrite: `permissionDecision = "allow"` with `updatedInput`.
- `PermissionRequest`: `hookSpecificOutput.decision.behavior` is `allow` or
  `deny`; deny wins across multiple hooks.
- `PostToolUse`: `decision: "block"` or `continue: false` replaces or shapes the
  tool feedback but cannot undo side effects.
- `Stop` and `SubagentStop`: `decision: "block"` requests continuation; it is
  not a tool denial.

Exit `0` with no output is success. For selected blocking events, exit `2` with
stderr can provide the block or continuation reason. Unsupported output fields
are errors and may allow the operation to continue.

## Verification levels

- Parse: JSON/TOML and handler source parse successfully.
- Static contract: event, matcher, handler fields, output, timeout, and
  execution mode match current released docs.
- Handler: fixture stdin produces expected stdout, stderr, exit, and timeout.
- Behavioral: allow, deny, malformed, failure, and concurrency cases work.
- Discovery: Codex lists the exact hook definition from the intended source.
- Trust: Codex reports the current definition hash as trusted or awaiting
  review.
- Live integration: a real matching event runs and coexists with other hooks.
