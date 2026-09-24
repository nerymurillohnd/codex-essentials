# Codex Memory Audit

Codex Memory Audit reviews memory claims against current project state and
official Codex behavior. It separates generated memory from durable
instructions, identifies stale or conflicting claims, and proposes exact
corrections before any requested write.

## Install and use

```sh
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add optimize-memories@codex-essentials
```

Ask:
`Use $audit-and-cure-memories to audit project-relevant Codex memories and show proposed corrections.`
The plugin contains one [skill](skills/audit-and-cure-memories/SKILL.md) and its
[Codex metadata](skills/audit-and-cure-memories/agents/openai.yaml). It bundles
no hook, script, MCP server, app, or credential.

## Inputs and result

Choose project-relevant, global, or combined scope. The skill discovers the
effective Codex home and selected memory artifacts, reads them, and checks
material claims against current official and local evidence. It reports a claim
ledger with verified, stale, false, ambiguous, duplicated, or unverifiable
findings and a complete proposed change set.

Memory files are generated state. Codex's
[Memories documentation](https://developers.openai.com/codex/memories)
(consulted 2026-09-24) says to inspect them when needed but not rely on manual
editing as the primary control surface. An authorized correction uses the
host-supported memory mechanism; if this runtime cannot write safely, the skill
stops at the proposal. It does not silently edit memory databases, `AGENTS.md`,
configuration, skills, or Git history.

## Requirements and boundaries

- Supported host: Codex with access to the selected local memory scope. Official
  documentation retrieval is needed for behavior claims; no plugin-specific
  credential or server is bundled.
- Installation changes Codex-managed plugin state only. Auditing, inventory, and
  reporting are read-only.
- A direct request to correct memory bounds the authorized memory change. If the
  user requested proposal review, no write occurs before their decision.
- Secret values are not read or printed. A suspected secret is reported by
  location and type without its value.
- Project rules remain in project instructions or checked-in docs; memory is not
  a substitute for a required operating policy.

## Update, removal, and recovery

```sh
codex plugin marketplace upgrade codex-essentials
codex plugin add optimize-memories@codex-essentials
codex plugin list --json
codex plugin remove optimize-memories@codex-essentials
```

This clean-history package begins at `0.1.0`; refresh and explicitly reinstall
if an older cached version from the former history remains. Start a new session
to verify current skill discovery. Uninstalling the plugin does not reverse a
memory correction. Recovery must use the actual host mechanism or a verified
before-image, not a fingerprint alone.

## Maintainer verification

Run `npm run check` and install in a clean Codex home. In a read-only scenario,
confirm no memory writes occur; in a correction scenario, confirm the skill
requires exact target evidence and the supported host path. Missing or ambiguous
scope must remain unresolved rather than guessed.

See the [changelog](CHANGELOG.md) and [MIT license](LICENSE.md). This is an
independent community plugin, not an OpenAI product.
