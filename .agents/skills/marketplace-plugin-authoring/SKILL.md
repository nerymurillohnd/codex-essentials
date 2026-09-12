---
name: marketplace-plugin-authoring
description: "Use when creating a Codex Essentials marketplace plugin or materially changing its manifest, packaged skills, hooks, app, MCP configuration, catalog entry, or product documentation."
---

# Marketplace Plugin Authoring

Create marketplace packages as coherent products, not merely folders of files.
The manifest is the source of truth; the marketplace catalog is generated.

## Scope and authority

- Use this skill for a new plugin or a material package change. Do not use it
  for installing, removing, or using an already published plugin.
- Read the root `AGENTS.md`, `plugins/AGENTS.md`, relevant templates, and the
  existing package before changing anything. Preserve unrelated working-tree
  changes.
- Treat current Codex or plugin compatibility as change-sensitive: consult
  official OpenAI documentation and relevant release notes before making a
  compatibility claim.
- Do not publish, tag, install globally, commit, push, or create a pull request
  unless the user explicitly authorizes that action.

## Authoring workflow

1. **Inspect and define.** Confirm the package identity, intended skill trigger,
   target user, capability boundary, side effects, required tools, credentials,
   supported environments, and explicit non-goals. Prefer a standalone local
   skill when distribution through this marketplace is not needed.
2. **Use repository contracts.** Start `plugin.json`, `agents/openai.yaml`,
   README, CHANGELOG, and LICENSE from their matching templates. Keep every
   distributed component inside `plugins/<plugin-id>/`; do not add a root-level
   distributable `skills/` directory.
3. **Write focused skills.** Keep `SKILL.md` focused on one job. Its description
   must state activation conditions, not summarize the workflow. Add an
   `agents/openai.yaml` for every distributed skill; use implicit invocation
   unless an explicit-only boundary is intentional.
4. **Protect boundaries.** State inputs, outputs, permissions, side effects,
   approval boundaries, failure recovery, limitations, and compatibility in the
   package README. A plugin installation must not modify a consumer project or
   register, trust, or execute hooks. Hook material is consumer-owned and needs
   explicit later approval.
5. **Prove integration.** Add a focused, behavior-relevant test when a stable
   repository contract is introduced or changed. Do not add brittle wording or
   snapshot tests merely to prove documentation exists. Run the test before and
   after the implementation when the testable behavior is new.
6. **Generate, never edit.** Run `npm run marketplace:build` to derive
   `.agents/plugins/marketplace.json`. Update the root README catalog and the
   package changelog in the same change set.
7. **Verify the product set.** Check manifest, package directory, skill IDs,
   agent manifests, README claims, changelog, license, generated catalog, and
   root README as one atomic package change. Run focused checks followed by
   `npm run check`; inspect `git diff --check` and the final diff before handoff.

## Report

Report the package files, generated artifacts, validation commands and results,
skipped checks with reasons, current compatibility evidence, residual risks,
and the Git state. Do not represent a green formatter or generator run as proof
that the package is publishable unless every applicable gate has been checked.
