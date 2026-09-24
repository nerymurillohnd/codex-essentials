# Pinned Agent Plugins 1.0.0 schemas

Fetched from the published Agent Plugins schema endpoints on 2026-09-24. These
files are copied byte-for-byte so package validation is reproducible without
contacting a remote service during CI.

| File                 | Source                                                       | SHA-256                                                            |
| -------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------ |
| `plugin.schema.json` | <https://agent-plugins.org/schemas/1.0.0/plugin.schema.json> | `0a4aad95ce337878ad38802ebf0daa3fde76abe3f65400c86bcbb1ec0b3ab883` |
| `mcp.schema.json`    | <https://agent-plugins.org/schemas/1.0.0/mcp.schema.json>    | `6539175bfcdf43085855183e86da40ea94b166547a72b47ae9a0a390516d3acb` |

The published schemas enforce portable structure. Repository-specific product
policy is implemented separately in `scripts/validate-packages.mjs`.
