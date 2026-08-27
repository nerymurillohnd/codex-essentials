# Declarative Plugin Architecture Design

## Goal

Replace the legacy root `scripts/`, `tests/`, and `templates/` layout with a
strict, typed, domain-organized internal library. A single non-executable JSON
document drives all fixed plugin metadata while released packages remain fully
self-contained.

## Non-negotiable boundaries

- `lib/source.json` is the only declarative source of truth for all fixed
  marketplace and plugin metadata.
- `lib/` is development and CI infrastructure. Installed plugins must not
  execute, import, or reference it.
- Every installed plugin resolves all files, symlink targets, assets, and
  declared runtime paths inside `plugins/<plugin-id>/`.
- JSON Schema plus Ajv validates JSON data. TypeScript types describe internal
  script contracts. No plugin definition may be executable TypeScript or any
  other code.
- `SKILL.md`, README, and changelog content are author-owned after scaffolding.
  Synchronization validates them but never replaces their text.

## Target layout

```text
lib/
├── source.json
├── schemas/
│   ├── source.schema.json
│   ├── plugin.schema.json
│   ├── marketplace.schema.json
│   └── agent.schema.json
├── templates/
│   ├── README.md
│   ├── CHANGELOG.md
│   └── SKILL.md
├── source/
│   ├── load.cjs
│   └── load.test.ts
├── sync/
│   ├── plugin.cjs
│   ├── plugin.test.ts
│   ├── marketplace.cjs
│   └── marketplace.test.ts
├── validate/
│   ├── package.cjs
│   ├── package.test.ts
│   ├── release.cjs
│   └── release.test.ts
├── documentation/
│   ├── gate.cjs
│   └── gate.test.ts
├── projects/
│   ├── bootstrap.cjs
│   └── bootstrap.test.ts
└── cli/
    ├── scaffold.cjs
    ├── sync.cjs
    ├── validate.cjs
    └── cli.test.ts
```

The final grouping may include a small shared `lib/core/` directory for
filesystem, containment, schema, and error primitives. Its functions must be
pure or explicitly injected so every domain test uses real fixtures.

## Source model

`lib/source.json` contains a marketplace object and an ordered plugins array.
Each plugin definition owns its identity, version, author, license, repository,
interface metadata, marketplace policy, skills, apps, MCP declarations, and
package-relative assets.

The source schema rejects duplicate plugin IDs, duplicate skill IDs per plugin,
unsafe identifiers, unsupported fields, traversal paths, and any declaration
that cannot be emitted into a package-local runtime artifact.

## Derived artifacts

Synchronization derives only these outputs from `source.json`:

- `plugins/<id>/.codex-plugin/plugin.json`;
- `plugins/<id>/skills/<skill-id>/agents/openai.yaml`;
- `.agents/plugins/marketplace.json`.

Scaffolding creates missing `SKILL.md`, README, and changelog files from
`lib/templates/`. It never overwrites them. Synchronization compares generated
metadata byte-for-byte with canonical rendering and reports drift in read-only
mode; explicit write mode updates only the derived artifacts.

## Commands

- `npm run scaffold:plugin -- <plugin-id>` creates a source definition entry,
  missing package structure, and author-owned templates.
- `npm run sync:plugin -- <plugin-id>` writes only that plugin's derived
  metadata after source and containment validation.
- `npm run sync:marketplace` writes the marketplace catalog from the ordered
  source definitions.
- `npm run sync:check` verifies no generated output has drifted.
- `npm run validate:all` validates source data, derived artifacts, package
  containment, documentation contracts, and marketplace consistency.
- `npm run validate:release -- plugin/<id>/v<version>` validates a tagged
  package and independently verifies its archive contents.

## Safety and containment

Containment uses canonical paths, never only lexical paths. Before scanning or
writing a plugin tree, the implementation resolves the plugin root and every
skills directory, skill root, manifest, asset, and archive member target. A
path is valid only when its resolved value is a strict descendant of the
resolved package root. Symlinks that target external files or directories are
rejected, including a symlinked `skills/` root.

The release validator must inspect the generated archive and fail if a package
contains a symbolic link, a missing declared resource, or an entry that could
resolve outside the archive root after extraction.

## Migration and verification

1. Move schemas and templates to `lib/schemas/` and `lib/templates/`.
2. Replace manifest generation with source loading, artifact rendering,
   synchronization, and drift detection.
3. Move documentation, release, project-bootstrap, typecheck, and CLI behavior
   into the appropriate `lib/<domain>/` directory with colocated tests.
4. Convert existing plugins into entries in `lib/source.json`, then generate
   their manifests, agent metadata, and marketplace catalog.
5. Remove root `scripts/`, `tests/`, and `templates/` only after successors
   provide equivalent required CI and release behavior.
6. Update package scripts, TypeScript/Vitest paths, documentation, and GitHub
   Actions to invoke the new commands.

The refactor is complete only when type checks, test coverage thresholds,
schema validation, source-to-output drift checks, package-containment fixtures,
documentation gates, and release archive validation all pass through the same
commands used by CI.
