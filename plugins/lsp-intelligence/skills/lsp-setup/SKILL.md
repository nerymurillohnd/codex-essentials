---
name: lsp-setup
description: Use when installing, verifying, updating, or troubleshooting the LSP Intelligence plugin and its local mcpls language-server runtime.
---

# LSP setup

Resolve the plugin root from this skill's installed location. Use Node managed by nvm and uv for Python. Read [requirements and installation](../../README.md#requirements) and [verified limits](../../references/verification.md).

Run `node <plugin-root>/scripts/runtime.mjs doctor` or call `lsp_status` first. Report installed prerequisites separately from negotiated workspace capabilities. An absent runtime must not disable tool discovery or appear as clean diagnostics.

When setup or an upgrade is requested, run the explicit `install` or `update` command with the needed profile, or `--profile all`. These download pinned official dependencies. Do not install during an ordinary semantic query. Do not replace unrelated global tools, load secret files, or inspect credential values. Confirm bridge version, checksum verification, and the resulting profile status.

No per-repository MCP file, shell export, workspace activation step, or hook is required. New Codex sessions receive the global plugin; every call supplies the task's workspace root. Use the project's existing checks for full verification.

For errors, preserve the concrete failure and try the relevant native project check. Missing servers, startup failures, unsupported capabilities, and stale diagnostics are different conditions; do not collapse them into a permission failure. Runtime rollback restores only the preceding managed mcpls binary.
