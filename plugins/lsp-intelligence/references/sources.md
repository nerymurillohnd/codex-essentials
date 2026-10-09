# Sources and dependency record

Accessed 2026-10-09. Versions are pinned and updates require renewed behavioral acceptance.

| Component | Pin | Primary source |
| --- | --- | --- |
| mcpls | 0.7.0 | [Release](https://github.com/bug-ops/mcpls/releases/tag/v0.7.0) |
| MCP server/client SDK | 2.3.1 | [Official SDK](https://github.com/modelcontextprotocol/typescript-sdk) |
| typescript-language-server | 6.0.2 | [Registry](https://registry.npmjs.org/typescript-language-server) |
| JavaScript TypeScript | 6.0.3 | [Registry](https://registry.npmjs.org/typescript) |
| Svelte server | 0.18.4 | [Language tools](https://github.com/sveltejs/language-tools) |
| Astro server | 2.17.2 | [Language tools](https://github.com/withastro/language-tools) |
| Basedpyright | 1.40.2 | [Documentation](https://docs.basedpyright.com/latest/) |
| Ruff | 0.16.10 | [Editor documentation](https://docs.astral.sh/ruff/editors/) |
| Bash server | 5.8.1 | [Repository](https://github.com/bash-lsp/bash-language-server) |

The mcpls tool catalog is sourced from its [v0.7.0 snapshot](https://github.com/bug-ops/mcpls/blob/v0.7.0/crates/mcpls-core/src/mcp/tool_surface.json). SDK parsing preserves its schemas; custom unsigned numeric format validators enforce bounds rather than discarding annotations.

Official bridge archive SHA-256:

- macOS ARM64: `16761c74b4148c0e2f7fcfabb8d53576d7aea7e4b9dd4ae5443df4408e5d304b`.
- Linux x64: `dacc1324d6c010eb631180715e09b984f14bcc7faea079a4d35e4116d749515a`.

[Codex's Agent Plugins loader](https://github.com/openai/codex/blob/rust-v0.162.0/codex-rs/codex-mcp/src/agent_plugin_config.rs) defaults stdio cwd to the plugin directory. The adapter therefore requires an explicit root per query. It neither assumes MCP roots support nor relies on a shell variable being forwarded.

The research comparison used an October 8 cutoff. The TypeScript language-server 6.0.2 setup pin was published on October 9 and is accepted independently; it does not change that historical comparison.
