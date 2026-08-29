---
name: declarative-plugin-pipeline
description: Use when creating, changing, validating, or releasing a Codex Essentials plugin package, its manifest, skills, hooks, apps, MCP resources, documentation, marketplace registration, or release metadata. Do not use for unrelated repository work.
metadata:
  short-description: Maintain plugin packages and marketplace metadata
---

# Codex Essentials Plugin Pipeline

Keep each distributable plugin self-contained and keep the generated marketplace
catalog consistent with validated package manifests. This skill is repository
maintenance guidance; the skill itself under `.agents/skills/` is not a plugin.

## Use when

- Creating or changing `plugins/<plugin-id>/` or any declared plugin component.
- Editing a plugin manifest, skill, agent metadata, hook, app, MCP resource,
  README, changelog, or marketplace registration.
- Changing the schemas, templates, validators, generators, manifest guard, or
  release checks that enforce this contract.

Do not use for unrelated repository work or documentation-only changes with no
plugin-contract impact. Applying this skill never authorizes a commit, tag,
push, publication, PR, merge, or other remote mutation.

## Current model

- `plugins/<plugin-id>/.codex-plugin/plugin.json` is the authored source of
  truth for that plugin's identity, version, interface, and components.
- `SKILL.md`, `agents/openai.yaml`, `README.md`, `CHANGELOG.md`, hooks, apps,
  MCP files, and assets are package-owned and are validated, not regenerated.
- `.agents/plugins/marketplace.json` is generated from validated manifests; do
  not edit it by hand.
- `schemas/`, `templates/`, `scripts/`, and `lib/` are repository tooling, not
  installed-plugin dependencies.

There is no current `lib/source.json` model. Do not restore it or prescribe the
historical `scaffold:plugin`, `sync:*`, or `validate:all` commands.

## Workflow

1. Read `AGENTS.md` and `plugins/AGENTS.md`; classify the change and inspect the
   complete affected package boundary.
2. For a new package, start `.codex-plugin/plugin.json` from
   `templates/codex-plugin-plugin.json`. For an existing package, edit its
   manifest and author-owned resources directly.
3. Keep every referenced file, executable, asset, symlink target, and runtime
   path inside the owning plugin. Do not depend on `lib/`, another plugin, or
   repository-only tooling at install time.
4. Follow [the pipeline protocol](references/pipeline-protocol.md) for checks.
   Any non-document change under `plugins/<plugin-id>/` requires updating
   that package's README and CHANGELOG and running
   `npm run documentation:gate -- --base <base> --head <head>`. Use
   `npm run marketplace:build` after manifest/catalog changes,
   `npm run marketplace:check` for a read-only consistency check, and
   `npm run validate:release-workflow` after changing Release Please
   component configuration or workflow output capture.
5. Use `npm run check` for changes to repository tooling, schemas, templates,
   hooks, validators, generators, release behavior, or tests.
6. Before an authorized release, validate the normalized Release Please plan
   with `npm run validate:release-set -- --plan <release-plan.json>
[--archives]` and review the exact tag, package boundary, archive, checksum,
   and changelog invariants.

## Boundaries

- Never hand-edit generated marketplace output or commit credentials.
- Stage named paths only. Never stage, commit, tag, push, publish, create a PR,
  or merge without explicit authorization.
- Validation is evidence of repository state, not permission for remote action.
