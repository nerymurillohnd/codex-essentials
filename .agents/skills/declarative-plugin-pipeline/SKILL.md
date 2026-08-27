---
name: declarative-plugin-pipeline
description: Create, update, validate, or release a Codex Essentials plugin through its declarative source, generated metadata, and self-contained package contract.
metadata:
  short-description: Maintain declarative marketplace plugins
---

# Declarative Plugin Pipeline

Use this skill when a task changes a marketplace plugin, its fixed metadata, the
catalog, generated Codex manifests, or plugin release validation. Do not use it
for an unrelated repository change or for behavior-only edits that leave the
plugin source and package contract unchanged.

## Operating model

`lib/source.json` is the only declarative source of truth for fixed plugin
metadata. It is development infrastructure; an installed plugin must never
read, import, execute, or depend on it.

The source owns plugin identity, version, interface metadata, marketplace
policy, declared skills, and optional app, MCP, and asset declarations. The
synchronizer derives only these runtime artifacts:

- `.agents/plugins/marketplace.json`
- `plugins/<plugin-id>/.codex-plugin/plugin.json`
- `plugins/<plugin-id>/skills/<skill-id>/agents/openai.yaml`

`SKILL.md`, `README.md`, and `CHANGELOG.md` are author-owned. Initialize a
missing file from `lib/templates/`, but never replace authored content during a
sync.

## Non-negotiable invariants

- Treat `lib/source.json` as the sole owner of generated metadata. Never
  hand-edit a derived catalog, `plugin.json`, or `openai.yaml`.
- Derive manifests from each declared `skill.id`, not from the plugin ID. A
  plugin and skill may intentionally have different IDs.
- Keep every plugin dependency and effective filesystem path inside
  `plugins/<plugin-id>/`. This includes imports, executables, assets, declared
  runtime paths, and symbolic links after canonicalization.
- Do not create a repository-level `skills/` directory. Distributed skills
  live under their owning package.
- Keep source, author-owned documentation, generated metadata, and the
  marketplace registration consistent in the same product change.
- Never stage, commit, push, tag, create a pull request, or publish a release
  without explicit user authorization for that external mutation.

## Workflow

1. Identify whether the task scaffolds a new plugin, changes fixed metadata,
   changes package behavior, or prepares a release.
2. Read the relevant plugin declaration in `lib/source.json` and inspect only
   the package files affected by the requested change.
3. For a new plugin, run `npm run scaffold:plugin -- <plugin-id>`. For an
   existing plugin, update its source declaration directly; do not infer a new
   skill from its package name.
4. Write or update author-owned behavior and product documentation only where
   needed: `SKILL.md`, `README.md`, and `CHANGELOG.md`.
5. Run `npm run sync:all` to regenerate metadata. Do not manually repair its
   output afterward; correct `lib/source.json` and synchronize again.
6. Run `npm run validate:all`. Resolve every source-schema, drift, package,
   document, catalog, and containment failure before release work.
7. Run the applicable quality gate. For a code, schema, template, validator,
   or workflow change, use `npm run check`.
8. For a release candidate, validate the exact plugin tag with
   `npm run validate:release -- plugin/<plugin-id>/v<semver>` and ensure
   `npm run sync:check` reports no drift.
9. Before any authorized publication, review the complete package boundary,
   version, changelog heading, generated artifacts, and validation evidence.

Read [the detailed pipeline protocol](references/pipeline-protocol.md) when
you need exact command selection, failure diagnosis, release conditions, or
review evidence.
