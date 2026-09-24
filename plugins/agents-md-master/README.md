# AGENTS.md Master

AGENTS.md Master helps Codex users create, audit, refactor, and evaluate
repository instruction systems from evidence instead of generic boilerplate. It
keeps guidance in the narrowest useful location, distinguishes prose guidance
from real enforcement, and produces reviewable proposals before consequential
instruction changes.

## Install and use

```sh
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add agents-md-master@codex-essentials
```

Start with a read-only audit:

```text
Use $agents-md-master to audit this AGENTS.md hierarchy without editing it.
```

Or ask for a new design:

```text
Use $agents-md-master to design a scoped AGENTS.md system for this repository.
```

## Contents

This package contains one skill:

- [`skills/agents-md-master/SKILL.md`](skills/agents-md-master/SKILL.md)

The skill includes Codex UI metadata in
[`skills/agents-md-master/agents/openai.yaml`](skills/agents-md-master/agents/openai.yaml)
and three conditional references:

- [`references/architecture-and-placement.md`](skills/agents-md-master/references/architecture-and-placement.md)
  for new systems, hierarchy placement, authority, and enforcement routing.
- [`references/audit-and-refactor.md`](skills/agents-md-master/references/audit-and-refactor.md)
  for existing instruction audits, stale claims, duplication, and proposed
  rewrites.
- [`references/evaluation.md`](skills/agents-md-master/references/evaluation.md)
  for baseline/candidate comparisons and behavioral evidence.

## Requirements and boundaries

- Host: Codex clients that load Agent Skills from installed Agent Plugins.
- Tools and credentials: no bundled MCP server, hook, script, runtime service,
  API key, or credential is required.
- Installation effect: adds a Codex-managed plugin package only. It does not
  modify a consumer repository.
- Task effects: audits and proposals are read-only. A direct request to create
  or edit AGENTS.md authorizes that scoped file change; runtime configuration,
  hooks, commits, pushes, merging, publishing, deployment, and unrelated
  external systems remain outside it unless separately authorized.
- Safety boundary: `AGENTS.md` is guidance. It cannot enforce filesystem,
  network, approval, secret, CI, branch-protection, hook, or deployment controls
  by itself.

## Current source basis

The package follows the portable Agent Plugins layout: root `plugin.json`,
skills under `skills/`, and OpenAI-specific presentation metadata under
`extensions.com.openai`. OpenAI documentation describes skills as focused
repeatable workflows that may work without an MCP server when packaged
instructions and resources are enough. Agent Plugins v1 defines skills and MCP
servers as the portable component types, with fixed root-level component
locations.

OpenAI's current Codex model guidance says Codex CLI enumerates instruction
files from the Codex home and each directory from repository root to the current
working directory, then injects them in root-to-leaf order. Because Codex
behavior can change, use the skill's source-verification step before making a
compatibility claim.

Sources checked on 2026-09-24:

- <https://developers.openai.com/plugins/build/plugins>
- <https://developers.openai.com/plugins/build/skills>
- <https://developers.openai.com/plugins/concepts/plugins>
- <https://developers.openai.com/api/docs/guides/latest-model>
- <https://agent-plugins.org/specification>
- <https://github.com/agentskills/agentskills/blob/main/docs/specification.mdx>

## Maintainer verification

From the marketplace root, run:

```sh
npm run validate:packages
npm test
npm run catalog:check
```

Run `npm run format` after edits and `npm run check` before a release or
completion claim when generated catalog, root README, and issue-form updates are
in scope. This task intentionally does not edit those generated surfaces.

## License

MIT. See [LICENSE.md](LICENSE.md).

This is an independent community plugin, not an OpenAI product.
