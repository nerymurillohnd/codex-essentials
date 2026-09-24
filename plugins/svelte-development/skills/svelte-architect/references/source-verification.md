# Svelte source verification

For version-sensitive framework behavior, compare the installed package and its
CLI output with official Svelte MCP documentation, Svelte/SvelteKit docs, and
the relevant release history. Start with the MCP section inventory; fetch only
sections needed for the task. A successful MCP configuration does not prove the
remote server is callable.

Treat community examples and issues as design signals, not as authoritative API
contracts. Check licenses before copying substantial outside code or text. When
official current docs and an older installed project differ, state the version
boundary and test the installed behavior before applying a migration pattern.
Record the source date or package version that supports a material claim.
