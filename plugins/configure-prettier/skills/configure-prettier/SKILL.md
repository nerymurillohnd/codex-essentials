---
name: configure-prettier
description:
  Use when auditing, proposing, configuring, upgrading, or troubleshooting
  repository Prettier setup, editor integration, formatting scripts, hooks, CI,
  conflicts, or version drift.
---

# Configure Prettier

Manage Prettier as repository-owned tooling. Do not treat personal style, global
binaries, or editor defaults as project authority.

## Authorization

- An audit, review, or proposal request is read-only. A direct request to
  configure, repair, or upgrade Prettier authorizes the ordinary scoped edits
  and relevant validation; do not pause for a second routine approval.
- Do not expand that request to broad source reformatting, unrelated editor
  settings, sibling repositories, or a new hook without the user's approval.
- If implementation reveals a material choice or change outside the requested
  scope, present the exact alternative and its impact before proceeding.

## Workflow

1. Resolve the target scope and state included and excluded locations.
2. Perform the read-only inventory in [audit scope](references/audit-scope.md).
3. Infer the effective formatting contract from repository-local evidence before
   source-file style samples.
4. Verify current Prettier behavior, version, options, parser/plugin support,
   ignore behavior, and OpenAI/Codex host claims with authoritative current
   sources as described in
   [source verification](references/source-verification.md).
5. Compare CLI, editor, hook, and CI paths. Identify whether they use the same
   local Prettier dependency, config, ignore files, plugins, and package-manager
   context.
6. For an audit or proposal, return the reviewable findings in
   [approval report](references/approval-report.md), including exact proposed
   diffs where the user needs to choose among materially different changes. For
   a direct implementation request, make the scoped changes, validate, and
   report the resulting diff and evidence.

## Decision Rules

- Preserve existing Prettier configuration unless there is a verified defect,
  conflict, compatibility issue, or approved migration.
- Recommend an exact local `prettier` development dependency only when the
  repository already uses Prettier, the user requests adoption, an approved
  formatting authority needs it, or reproducibility is currently broken by a
  global/transient formatter.
- Do not add non-default style options only because they are common. If evidence
  is absent, identify documented defaults as defaults.
- Do not set a top-level `parser`; use overrides only for verified file-specific
  parser needs.
- Keep CI checks non-writing. State the distinct effects of `prettier --write`,
  dependency changes, hook activation, and broad source reformatting; execute
  each only when it falls within the user's request.
- Prefer the repository's existing package manager, task runner, script names,
  and quality-gate structure.

## Completion

For implemented changes, report files changed, commands run, source evidence
used, validation results, skipped checks, and any remaining incompatibility or
unverified runtime behavior.
