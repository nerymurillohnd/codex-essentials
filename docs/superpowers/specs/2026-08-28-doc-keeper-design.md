# DocKeeper Design

> **Status: Superseded historical record**
>
> This design records an earlier implementation approach and is retained for
> historical context. It was superseded by [ADR-0007](../../decisions/adr-0007-plugin-manifest-marketplace-contract.md).
> Do not use its source-of-truth, synchronization, validation, or release
> commands as current instructions. Use the current [architecture guidance](../../agent-guidelines/architecture.md),
> `npm run marketplace:build`, and `npm run marketplace:check` instead.

## Purpose

DocKeeper is a distributable Codex plugin for maintaining project history and
decision records. Its first release supports two document types:

- `CHANGELOG.md` files;
- Markdown Architectural Decision Records (ADRs).

The plugin must work in private local projects and GitHub repositories. It may
inspect available local or remote evidence. It must not invent missing history
or treat an inference as a confirmed fact.

## Package

The package ID and skill ID are `doc-keeper`. The display name is `DocKeeper`.
The package contains:

```text
plugins/doc-keeper/
├── .codex-plugin/plugin.json
├── README.md
├── CHANGELOG.md
├── LICENSE.md
└── skills/doc-keeper/
    ├── SKILL.md
    ├── agents/openai.yaml
    ├── outputs/
    │   ├── adr-example.md
    │   └── changelog-example.md
    └── references/
        ├── adr-maintenance.md
        └── changelog-maintenance.md
```

The package has no runtime scripts, hooks, MCP servers, apps, credentials, or
network dependency. Codex may use tools already available in the consumer's
environment when the task requires them.

## Skill routing

`SKILL.md` provides the shared intake and safety contract. It identifies the
requested document type and requires reading exactly the matching reference.
It also uses Codex's native implicit skill matching to evaluate companion
documentation when implementation work completes. It does not require a
blanket lifecycle hook.
It defines these modes:

1. Create a missing document from confirmed project evidence.
2. Complete an incomplete document without rewriting valid history.
3. Audit structure, chronology, links, claims, and repository consistency.
4. Update a document for a confirmed change or decision.
5. Repair defects while preserving author intent and historical records.

Future document types extend DocKeeper by adding one focused reference and one
router entry. Existing references remain independent.

## Shared safety contract

DocKeeper must:

1. Read repository instructions and existing document conventions first.
2. Determine whether the request authorizes inspection, local edits, or remote
   actions.
3. Inspect the smallest evidence set that proves the requested entry.
4. Separate confirmed facts, unresolved facts, and inferences.
5. Preserve existing history, identifiers, ordering, links, and style unless a
   correction is explicitly in scope.
6. Show material uncertainty instead of filling gaps with plausible text.
7. Validate the resulting Markdown and all changed local links.
8. Report the files changed, evidence used, checks run, and remaining gaps.

DocKeeper must not commit, push, tag, publish a release, or modify GitHub state.
When the user separately authorizes one of those actions, its owning workflow
performs it after DocKeeper's document pass. Historical deletion is never an
implicit repair operation.

## Changelog reference

`changelog-maintenance.md` is a self-contained operating procedure. The output
template is `outputs/changelog-example.md`. Together they include:

- a canonical, reusable changelog template;
- section order and entry-writing rules;
- creation, completion, update, release rollover, link maintenance, validation,
  and save procedures;
- explicit update triggers and explicit non-triggers;
- evidence precedence for source changes, commits, pull requests, tags,
  releases, and automation metadata;
- safe interoperability guidance for semantic-release, Changesets,
  `@semantic-release/github`, and git-extras;
- rules for private repositories, monorepos, multiple changelogs, prereleases,
  breaking changes, yanked releases, and unreleased work.

Keep a Changelog and Semantic Versioning provide the neutral editorial base.
Automation tools are evidence and workflow integrations, not permission to
overwrite an established project convention.

## ADR reference

`adr-maintenance.md` is a self-contained operating procedure. The output
template is `outputs/adr-example.md`. Together they include:

- a reusable MADR-based template;
- creation, numbering, naming, writing, review, status transition,
  supersession, validation, update, and save procedures;
- criteria for when a decision requires an ADR and when it does not;
- rules that preserve accepted or rejected decisions as historical records;
- explicit handling for proposed, accepted, rejected, deprecated, and
  superseded decisions;
- guidance for single and categorized ADR directories;
- attribution to MADR, its source template, and AD Guidance Tool.

The reference adapts MADR guidance concisely. It does not claim affiliation
with the MADR or AD Guidance Tool maintainers.

## Product documentation

`README.md` explains purpose, components, supported environments, inputs,
outputs, tools, permissions, side effects, approval boundaries, installation,
removal, verification, limitations, recovery, and source attribution. Its
documentation section links every upstream source used to equip the plugin.

`CHANGELOG.md` starts at version `0.1.0` and records the complete initial
package. `LICENSE.md` contains the repository MIT license. Generated UI metadata
must describe the skill, not the entire marketplace.

## Repository integration

Author-owned skill, references, examples, README, changelog, and license are
maintained deliberately. Fixed metadata remains in `lib/source.json`, and the
repository synchronizer emits the catalog, plugin manifest, and agent metadata.
The installed package has no dependency on that development pipeline.

## Acceptance criteria

- The plugin is registered and independently distributable.
- The skill routes to exactly one relevant reference per document task.
- Each reference contains deterministic lifecycle steps and points to one clear
  example that defines the default output shape.
- Notable implementation work and explicit durable decisions can trigger a
  companion closeout through native implicit skill invocation.
- Instructions state when to update, when not to update, how to validate, and
  how to save safely.
- Source attribution is complete and visible in the README and references.
- No unresolved placeholders outside the bundled examples, invented claims,
  external package dependencies, or implicit remote authorization remain.
- The complete repository quality gate and exact plugin release validation pass.

## Proposal synthesis

The implementation combines four reviewed proposals:

- Preserve the concise routing, evidence classes, and explicit prohibition
  model from the standalone `doc-keeper` proposal.
- Preserve the deterministic lifecycle, status transition tables, save steps,
  automation ownership rules, and monorepo handling from the packaged `0.1.0`
  proposal.
- Preserve the strong product documentation, recovery behavior, input/output
  descriptions, and extension model from the `doc-keeper-plugin` proposal.
- Preserve this specification's package boundary, repository identity,
  declarative integration requirement, and acceptance gates.

Reject proposal content that conflicts with this repository: invalid manifest
shapes, incomplete agent metadata, placeholder links, references to
`just-for-codex`, personal email metadata, alternate author names, generated
files from another marketplace, and licenses not matching the repository copy.
