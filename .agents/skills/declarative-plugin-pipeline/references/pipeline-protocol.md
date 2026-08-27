# Declarative Plugin Pipeline Protocol

This reference defines the repository-specific protocol for a plugin product
change. It supplements `SKILL.md`; it does not authorize publication actions.

## 1. Classify the change

| Change                    | Source update                                | Author-owned update               | Synchronize       | Required checks                           |
| ------------------------- | -------------------------------------------- | --------------------------------- | ----------------- | ----------------------------------------- |
| New plugin                | Add plugin declaration                       | Initialize and complete documents | Yes               | `validate:all`, `check`                   |
| New or renamed skill      | Update the plugin `skills` array             | Add or update `SKILL.md`          | Yes               | `validate:all`, `check`                   |
| Fixed metadata            | Update source fields                         | Update claims if they changed     | Yes               | `validate:all`                            |
| Behavior or runtime files | Only if metadata changes                     | Update skill and product docs     | If source changed | `validate:all`; `check` when code changes |
| Documentation only        | No, unless correcting a source-derived claim | Update documentation              | No                | Applicable documentation gate             |
| Release candidate         | Version and release-facing metadata          | Update changelog release heading  | Yes               | `validate:release`, `sync:check`, `check` |

When a request spans categories, apply the union of their checks. Do not turn a
documentation-only request into an unrelated metadata rewrite.

## 2. Author the declarative model

`lib/source.json` must satisfy `lib/schemas/source.schema.json` before any
output is written. Use the existing plugin record as the shape guide.

Required plugin concerns are:

- `name` and semantic `version`
- description, author, license, and repository
- package interface metadata
- marketplace category, installation, and authentication policy
- one or more declared skills with their own IDs, display names, descriptions,
  and default prompts

Declare apps, MCP configuration, and assets only when the package actually
contains and uses them. Every declared path must remain inside its package.

Do not add executable TypeScript, JavaScript, or CJS as plugin input metadata.
TypeScript contracts exist only for internal repository tooling; the plugin
source is declarative JSON.

## 3. Scaffold and author package content

For a new package:

```sh
npm run scaffold:plugin -- <plugin-id>
```

The scaffold adds a source record and writes missing author-owned documents. It
does not permit an incomplete package to become valid by inventing unrelated
skills. If an existing package already owns a skill with a nonmatching ID,
declare and generate beside that skill.

Author package files deliberately:

- `SKILL.md` contains behavior and operating instructions.
- `README.md` explains purpose, inputs, tools, permissions, side effects,
  install and rollback behavior, verification, limitations, and recovery.
- `CHANGELOG.md` keeps `## [Unreleased]` and records product-facing changes.

Never copy repository-maintenance scripts into a package just to make it work.
An installed package must remain complete when archived alone.

## 4. Synchronize derived artifacts

```sh
npm run sync:all
npm run sync:check
```

`sync:all` is the only writer for generated manifests and catalog entries. If
an output is wrong, modify `lib/source.json`, not the emitted file. A clean
`sync:check` proves the checked-in derived state matches the source; it does
not replace semantic or package validation.

## 5. Validate the package boundary

```sh
npm run validate:all
```

This validates the source schema, generated output drift, marketplace schema,
plugin and agent schemas, required package documents, declared package set, and
effective filesystem containment.

Containment failures are release blockers. Reject any package where a symbolic
link, skills directory, agent manifest, icon, asset, executable, or referenced
resource resolves outside `plugins/<plugin-id>/`. Do not replace this check by
testing from the repository root; release archives distribute only the package
tree.

## 6. Run quality gates

Use the narrowest check that proves the requested change, plus all gates made
necessary by the changed area.

```sh
npm run format:check
npm run lint -- --max-warnings=0
npm run typecheck
npm run typecheck:scripts
npx tsc6 --noEmit
npm test
npm run validate:all
```

For internal tooling, schemas, templates, validation, CI, or release behavior,
prefer the complete gate:

```sh
npm run check
```

The Vitest policy requires at least 96% per file. Do not lower thresholds or
exclude a branch merely to pass coverage; add a meaningful test or simplify an
unreachable invariant.

## 7. Prepare a release candidate

Release tags use this exact form:

```text
plugin/<plugin-id>/v<semver>
```

Before creating or pushing a tag, run:

```sh
npm run check
npm run sync:check
npm run validate:release -- plugin/<plugin-id>/v<semver>
```

The release validator requires a matching manifest name and version, an
`Unreleased` changelog section, a versioned release heading, and a fully
self-contained package tree. A passing local release validation is evidence,
not permission to tag or publish.

## 8. Review and publication protocol

Before an authorized commit or pull request, inspect the intended paths and
diff. Stage named paths only; never stage the whole worktree by default. A
product PR must explain derived-artifact changes, containment implications,
compatibility effects, and exact verification output.

Use a feature branch when starting from `main`. Create pull requests as drafts
unless the user explicitly requests a ready-for-review PR. Before merging,
read all review comments and checks, address valid findings, and rerun affected
validation. Integrate with a merge commit unless the user explicitly requests
another strategy.
