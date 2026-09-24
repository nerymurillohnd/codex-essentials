# Svelte MCP and CLI routing

This package declares the official remote endpoint in its portable `mcp.json`:

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
  "mcpServers": {
    "svelte": {
      "type": "streamable-http",
      "url": "https://mcp.svelte.dev/mcp"
    }
  }
}
```

The [Svelte MCP documentation](https://svelte.dev/docs/ai/remote-setup) confirms
that endpoint. The Svelte remote-setup page also shows an older Codex-specific
`experimental_use_rmcp_client` flag. Do not add that flag to global
`config.toml` from a plugin: OpenAI's current portable plugin guidance defines
root `mcp.json` as the bundled server contract. Verify the actual Codex version
and session tool catalog before claiming the server works.

Use MCP section discovery before fetching version-sensitive docs. Use
`svelte_autofixer` for changed `.svelte` source only when that source may be
sent remotely; inspect suggestions and re-run after corrections when required.
If MCP is unavailable, use official public Svelte docs and project-local checks,
and report the missing remote proof.

Use project scripts first. `sv create`, `sv add`, and `sv migrate` can change
files, dependencies, and lockfiles; inspect installed help and task authority
before invoking them. Official `sv check` needs the project's `svelte-check`
dependency. Do not use an unpinned `npx -y` fallback to silently install a tool
that is missing from the project.
