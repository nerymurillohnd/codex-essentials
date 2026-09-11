---
status: accepted
date: 2026-08-28
decision-makers: Nery Samuel Murillo, Codex
consulted: OpenAI Codex plugin and hooks documentation
informed: Codex Essentials contributors and plugin consumers
---

# Use each plugin manifest as the marketplace source of truth

## Context and Problem Statement

The repository previously kept fixed plugin metadata in `lib/source.json` and
generated plugin manifests and catalog entries from that repository-wide file.
That model made a distributable plugin's own required manifest a derived copy,
created duplicate metadata ownership, and left contributors unable to reason
about a package from its package boundary alone.

How should Codex Essentials ensure that every published plugin is complete,
self-contained, and exactly represented in the marketplace without maintaining
a second declaration of the same plugin metadata?

## Decision Drivers

- One authoritative manifest per distributable plugin package.
- Strict failure on incomplete metadata, invalid paths, drift, or unsafe links.
- A generated marketplace that is reproducible from package-local manifests.
- Immediate feedback after Codex edits a plugin manifest.
- No installed plugin dependency on repository maintenance tooling.

## Considered Options

- Keep `lib/source.json` as repository-wide metadata source.
- Hand-maintain both manifests and marketplace entries.
- Use `plugins/<id>/.codex-plugin/plugin.json` as the source for each plugin.

## Decision Outcome

Chosen option: "Use each plugin manifest as the package source of truth" because
it puts identity, version, declared components, and install-surface metadata at
the distributable package boundary. The marketplace catalog can then be derived
without duplicating plugin-owned metadata.

### Consequences

- Good, because changing a plugin version or metadata has one authored location.
- Good, because the generated catalog can be checked exactly against all manifests.
- Good, because package validation can reject undeclared components, missing
  resources, invalid skill metadata, and symbolic links before generation.
- Bad, because contributors must start a new manifest from the complete template
  and remove optional fields that do not apply.
- Bad, because a project-local Codex hook requires explicit user trust before it
  can execute.

### Confirmation

- `npm run validate:plugins` validates every package manifest against
  `schemas/plugin.schema.json`, the fixed template profile, and package resources.
- `npm run marketplace:build` validates manifests, atomically writes
  `.agents/plugins/marketplace.json`, and validates the written catalog back
  against every manifest.
- `npm run marketplace:check` validates existing catalog drift without writing.
- `npm run check` includes the read-only marketplace check.
- `.codex/hooks.json` invokes the complete build after a relevant Codex edit;
  Codex must trust that hook through `/hooks` before runtime activation.

## Pros and Cons of the Options

### Keep `lib/source.json` as repository-wide metadata source

- Good, because one central file can describe all packages.
- Bad, because the required package manifest becomes a generated duplicate.
- Bad, because package-local inspection cannot identify the authoritative data.

### Hand-maintain manifests and marketplace entries

- Good, because no generator is required.
- Bad, because metadata drift is inevitable and hard to detect reliably.

### Use each plugin manifest as the package source of truth

- Good, because ownership follows the distributable package boundary.
- Good, because a strict generator and reverse validator prevent catalog drift.
- Bad, because fixed organization metadata must be checked against the reusable
  template profile rather than copied from a separate source file.

## More Information

The complete creation form is `templates/codex-plugin-plugin.json`. It contains
all supported manifest fields, fixed owner and legal metadata, and explicit
placeholders for plugin-specific values. Only `.codex-plugin/plugin.json`
belongs inside `.codex-plugin`; skills, hooks, assets, `.mcp.json`, and
`.app.json` remain at the plugin root.

This decision supersedes the operational source-of-truth model described by
the older declarative-pipeline plans. Those documents remain historical records
and must not be interpreted as current operating instructions.
