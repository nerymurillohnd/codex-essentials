# DocKeeper

DocKeeper helps Codex keep changelogs and architecture decision records
consistent with completed work, explicit decisions, and the target repository's
release process. It has a narrower role than a general repository documentation
maintainer: it handles these two historical record types and release-document
preflight, not generic README prose.

## Install and use

```sh
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add doc-keeper@codex-essentials
```

Ask: `Use $doc-keeper to audit CHANGELOG.md without editing it.` A direct
request to update a named changelog or ADR can authorize that scoped local
document edit. The package contains one [skill](skills/doc-keeper/SKILL.md),
[Codex metadata](skills/doc-keeper/agents/openai.yaml), separate
[changelog](skills/doc-keeper/references/changelog-maintenance.md) and
[ADR](skills/doc-keeper/references/adr-maintenance.md) procedures, and two
[example outputs](skills/doc-keeper/outputs/).

## Inputs and result

Supply the requested record, repository instructions, release or decision
context, and relevant Git/remote evidence. The skill chooses create, complete,
audit, update, or repair mode. It preserves established formats and published
history while reporting missing evidence. For completed notable work, it can add
a confirmed `Unreleased` entry; for an authorized durable decision, it can
record the decision without inventing another person's approval.

## Requirements and boundaries

- Supported host: Codex with access to the target repository and its authorized
  evidence sources. The package bundles no script, hook, MCP server, credential,
  or runtime dependency.
- Installation changes Codex-managed plugin state only. Audit mode does not
  write; an authorized local document task can change only its relevant files
  and required index or reciprocal link.
- DocKeeper does not calculate versions or publish releases, tags, PRs, or
  comments. Existing release automation owns its generated files and remote
  state. A prepared changelog section is not proof of publication.
- Private issue text, credentials, and sensitive security details must not leak
  into public documentation.

## Update and removal

```sh
codex plugin marketplace upgrade codex-essentials
codex plugin add doc-keeper@codex-essentials
codex plugin list --json
codex plugin remove doc-keeper@codex-essentials
```

This clean-history package begins at `0.1.0`; refresh and explicitly reinstall
if a cached older-line installation remains. Start a new session to verify the
current skill. Removing the plugin does not undo document edits; use the target
repository's version control or verified before-image.

## Maintainer verification

Run `npm run check` and install from a clean Codex home. A notable change should
produce a supported changelog entry, a durable accepted decision should produce
an ADR under the target convention, and a typo-only change should not create
historical records. Verify that a generated changelog is left to its owning tool
and that audit-only requests make no edits.

See the [changelog](CHANGELOG.md) and [MIT license](LICENSE.md). This is an
independent community plugin, not an OpenAI product.
