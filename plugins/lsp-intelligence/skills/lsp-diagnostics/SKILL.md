---
name: lsp-diagnostics
description: Use when checking language-server diagnostics after edits, investigating type or syntax failures, or assessing whether an LSP result supports a clean-code claim.
---

# Diagnostic verification

Call `lsp_get_diagnostics` with the current task's explicit `workspace_root` and source `file_path`. Preserve the returned evidence.

- `pending` or `evicted`: analysis is unavailable, even with an empty list.
- `indexing_in_progress` or `push_notifications_degraded`: coverage may be incomplete.
- `push_cache`: published results may lag an edit.
- Failed pull, unsupported capability, timeout or truncation: report the limitation; do not manufacture an empty successful result.

After an edit, recheck until the expected diagnostic change is observed. Never infer freshness just because `availability` says `published`. If freshness cannot be established, state that and use the native project checks. LSP diagnostics are file-level feedback, not a complete project gate.

Use the project's configured type checker, lint, build and tests before declaring completion. For Python, Basedpyright supplies the MCP diagnostic route; Ruff project checks are a separate gate. Keep intentional errors in acceptance fixtures to prove the server is responding.

Report checked files, diagnostic state, actionable failures and checks not run. Do not read real secret files or dump logs that could expose credentials or source secrets. [Verification scope](../../references/verification.md) separates protocol tests, real backends, actual Codex behavior and remote CI.
