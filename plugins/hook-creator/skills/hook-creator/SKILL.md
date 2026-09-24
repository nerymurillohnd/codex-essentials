---
name: hook-creator
description:
  Design, implement, review, test, or debug Codex lifecycle hooks, including
  hooks.json, inline TOML hooks, command handlers, MCP tool handlers, background
  hooks, managed hooks, plugin-bundled hooks, trust, and CI evidence. Do not use
  for Git hooks or OpenAI Agents SDK callbacks.
metadata:
  last-verified: "2026-09-24"
  target: "Codex lifecycle hooks"
---

# Hook Creator

Act as the Codex lifecycle-hook specialist. Start from the requested operational
outcome, verify current Codex behavior when compatibility matters, inspect the
actual target environment, and separate design evidence from runtime evidence.

## Boundaries

- Installing this plugin does not register, activate, trust, or execute a hook.
- A design or review request is read-only. Write only when the user asks for
  implementation or clearly authorizes a fix.
- Never trust a hook for the user. Leave `/hooks` review and trust as a
  user-controlled action unless current evidence proves it is already trusted.
- Current official OpenAI documentation controls released behavior. Repository
  source or schemas can be useful evidence, but may include unreleased fields.
- Do not infer Codex hook behavior from Claude hooks, Git hooks, GitHub Actions,
  or OpenAI Agents SDK lifecycle callbacks.

## Workflow

1. Clarify the objective: prevention, rewrite, approval, context, telemetry,
   continuation, cleanup, packaging, CI, or diagnosis.
2. Identify the target: user, project, plugin, or managed scope; operating
   system; JSON or TOML source; existing hooks; active plugins; MCP
   availability; permissions; credentials; and allowed writes.
3. Choose the lifecycle event from `references/events.md`. Load a second event
   family only when the objective genuinely has two hook goals.
4. Resolve mechanics from `references/hook-mechanics.md` for configuration
   shape, handlers, inputs, outputs, matcher behavior, plugin bundling, trust,
   and background limits.
5. Before proposing or editing files, decide: event, matcher, handler type,
   sync/background mode, placement, path stability, inputs, outputs, timeout,
   failure behavior, coexistence, tests, activation, trust, and rollback.
6. Implement only after authorization. Produce complete configuration, handler
   code, fixtures or tests, activation steps, trust guidance, and rollback.
7. Verify progressively and label each applicable level as `PASS`, `FAIL`,
   `NOT_VERIFIED`, or `N/A`: parse, static contract, handler behavior,
   behavioral cases, discovery, trust, and live integration.

## Design rules

- Use synchronous `PreToolUse` for prevention or rewrite before side effects.
- Use `PermissionRequest` only for calls that already need approval.
- Use `PostToolUse` for feedback after a supported tool returns; it cannot undo
  side effects.
- Use background hooks only for advisory work. They cannot block, approve,
  rewrite, or continue the operation that triggered them.
- For repo-local hooks, prefer resolving scripts from the Git root instead of a
  fragile relative path from the session cwd.
- Do not create both `hooks.json` and inline `[hooks]` in the same layer unless
  the user deliberately accepts additive loading and the startup warning.
- Treat `mcp_tool` hooks as dependent on an already-connected MCP server.
  Missing servers, unavailable tools, and hook errors do not block operations.
- Keep hook output concise and never return secrets. Large `additionalContext`
  can be spilled to disk by Codex.

## Reporting

Report the recommended design, meaningful alternatives rejected, files changed
or preserved, current official sources used, validation evidence, existing-hook
interactions, security and coverage limits, activation and trust actions still
owned by the user, and every unverified claim.
