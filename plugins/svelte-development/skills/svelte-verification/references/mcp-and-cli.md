# MCP And CLI Reference

## Remote MCP

This plugin declares the official remote Svelte MCP endpoint:

```json
{
  "mcpServers": {
    "svelte": {
      "type": "http",
      "url": "https://mcp.svelte.dev/mcp"
    }
  }
}
```

Use it for current Svelte documentation, section lookup, source-aware checks,
and Svelte-specific autofix when the host exposes those tools.

## Local CLI fallback

When MCP tools are not exposed but network and package execution are allowed,
the official package can be queried through `npx -y @sveltejs/mcp`. Inspect
`--help` before using a subcommand, because command names and flags can change.

Use `sv` for project-level tasks such as project creation, adding official
integrations, migrations, and Svelte checks when the installed project supports
that workflow.

## Mutation boundaries

- Docs lookup is read-oriented.
- Autofix may send source snippets to the remote MCP endpoint and may return
  code changes.
- `sv add`, migrations, dependency installation, and lockfile updates are
  mutating operations.
- Dev and preview servers create running processes and must be stopped or
  reported before completion.

## Failure handling

If MCP or CLI commands fail, capture:

- The command or tool name.
- The working directory.
- The exact error that affects the next step.
- Whether the failure is network, missing dependency, unsupported flag,
  project configuration, or framework diagnostic.
