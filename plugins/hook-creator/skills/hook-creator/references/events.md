# Codex Hook Events

Use this event map before selecting a hook. Confirm current official
documentation when a release-sensitive detail matters.

| Event               | Matcher Filters                                   | Use                                                                     |
| ------------------- | ------------------------------------------------- | ----------------------------------------------------------------------- |
| `SessionStart`      | `source`: `startup`, `resume`, `clear`, `compact` | Add startup or post-compaction context, or stop the next model request. |
| `SessionEnd`        | `reason`, currently `other`                       | Short advisory cleanup for the main thread.                             |
| `SubagentStart`     | `agent_type`                                      | Add context when a subagent starts.                                     |
| `SubagentStop`      | `agent_type`                                      | Request bounded subagent continuation.                                  |
| `PreToolUse`        | tool name and aliases                             | Deny, rewrite, or add pre-tool context for supported local tools.       |
| `PermissionRequest` | tool name and aliases                             | Allow, deny, or defer an approval request Codex is about to show.       |
| `PostToolUse`       | tool name and aliases                             | Replace or shape feedback after a supported tool returns.               |
| `PreCompact`        | `trigger`: `manual` or `auto`                     | Stop or annotate before compaction.                                     |
| `PostCompact`       | `trigger`: `manual` or `auto`                     | Stop or annotate after compaction.                                      |
| `UserPromptSubmit`  | ignored                                           | Add context or reject a prompt before model work.                       |
| `Stop`              | ignored                                           | Request bounded root-turn continuation.                                 |
| `Interrupt`         | ignored                                           | Short advisory logging or cleanup after a user interrupt.               |

`PreToolUse` and `PostToolUse` currently cover Bash, unified exec as `Bash`,
`apply_patch` with `apply_patch`, `Edit`, or `Write` aliases, MCP tools, and
most local function tools. Hosted tools such as web search do not use the local
function-tool hook path. Treat tool hooks as guardrails, not complete endpoint
control.
