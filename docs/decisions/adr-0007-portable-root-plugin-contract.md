---
status: accepted
date: 2026-09-11
decision-makers: Nery Samuel Murillo, Codex
consulted: OpenAI plugin and skill documentation
informed: Repository contributors and plugin consumers
---

# Use portable root plugin manifests

## Context and Problem Statement

The marketplace used `.codex-plugin/plugin.json` as its only package contract.
Current OpenAI plugin guidance defines `plugin.json` at the plugin root as the
portable entry point and treats `.codex-plugin/plugin.json` as a compatibility
fallback.

## Decision Outcome

Every package uses a root `plugin.json` as its sole authored manifest. Portable
components use their root locations: `skills/`, `mcp.json`, and `hooks/`.
OpenAI presentation metadata and hook paths are declared in
`extensions.com.openai`. The repository requires every distributed skill to
retain `agents/openai.yaml` with an explicit boolean
`policy.allow_implicit_invocation`.

The legacy `.codex-plugin/` fallback is removed. This coordinated contract
migration releases every package as `0.2.0` without release assets.

## Consequences

- The marketplace follows the current portable package layout.
- The generator and documentation validate one manifest source only.
- Consumers that require the legacy fallback must update before consuming 0.2.0.

## Confirmation

Run `npm run marketplace:build`, `npm run marketplace:check`, and
`npm run check`.
