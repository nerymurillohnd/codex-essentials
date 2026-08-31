---
name: configure-prettier
description: Audit, recommend, configure, and maintain Prettier with repository-first conventions. Use for Prettier setup, upgrades, conflicts, editor integration, formatting checks, hooks, CI, or update drift; audit first and require explicit approval before every mutation.
---

# Configure Prettier

Manage Prettier as reproducible repository tooling, never as a personal style override.

## Authorization boundary

- Begin every request with a read-only audit.
- Do not install, update, remove, write, format, regenerate, rename, or delete anything until the user explicitly approves a complete proposed plan or diff.
- Treat approval as item-specific. Never extend it to dependencies, lockfiles, source formatting, editor settings, ignores, hooks, CI, or sibling repositories that were not approved.
- If implementation exposes a material new conflict or needs a change outside the approved diff, stop and present a revised plan.

## Workflow

1. Resolve the scope and state every included and excluded location. Default to the current repository/workspace; inspect user-level or sibling locations only when explicitly requested.
2. Perform the read-only audit in [audit scope](references/audit-scope.md).
3. Infer conventions using the precedence in [convention resolution](references/convention-resolution.md). Repository evidence wins over user-level preferences.
4. Evaluate formatting, linting, and parser/plugin coverage under [quality integration](references/quality-integration.md). Assess absent adjacent tooling at a high level, and escalate it only when audit evidence establishes a material gap.
5. Verify time-sensitive behavior, releases, versions, and compatibility according to [source verification](references/source-verification.md).
6. Verify CLI/IDE parity under [IDE and CLI parity](references/ide-cli-parity.md).
7. Detect conflicts, then return the complete approval-gated report in [recommendation report](references/recommendation-report.md). Include full diffs or full replacement contents for every proposed file.
8. Stop. Implement only after unambiguous approval, following [implementation approval](references/implementation-approval.md).

## Local dependency decision

Recommend a repository-local exact `prettier` development dependency only when at
least one of the following is true:

- The repository already uses Prettier in scripts, CI, hooks, editor
  configuration, or a shared config.
- The repository contains file types for which Prettier is the approved
  formatting authority.
- The user explicitly requests Prettier adoption for the repository.
- A reproducibility issue exists because CI or contributors rely on a global or
  transient Prettier binary.

Otherwise, report that Prettier adoption is not established and do not
introduce it by default.

## Policy

- Treat global installations and home-directory configuration as diagnostic or explicitly requested personal fallback only; never as project authority.
- Do not set a top-level parser. Assess plugins and linter integrations strategically—even when absent—but propose them only when verified evidence shows a material quality, correctness, or file-type-coverage benefit.
- Ensure an approved Prettier setup resolves consistently through the repository-local CLI and the supported IDE configuration. Do not rely on one path while leaving the other ambiguous.
- Keep CI non-writing. Separate any one-time `prettier --write` operation from configuration changes as an independently approved item.
- For explicit update checks, report current state and a complete proposed update; never auto-update any package, configuration, or this skill.

Use [templates](references/templates.md) only after discovery and verification. They are starting points, not defaults to impose.
