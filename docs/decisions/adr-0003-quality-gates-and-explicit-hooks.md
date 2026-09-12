---
status: accepted
date: 2026-09-12
decision-makers: Nery Samuel Murillo, Codex
consulted: Lefthook, ShellCheck, Ruff, and Prettier documentation
informed: Repository contributors
---

# Use explicit hooks and one complete repository gate

## Context and Problem Statement

The repository benefits from fast local pre-commit checks, but automatic hook
installation during dependency install can surprise contributors and CI. The
repository also needs one authoritative command that validates formatting,
marketplace generation, Python scripts, and shell scripts.

How should hooks and quality gates be wired?

## Decision Drivers

- Keep hook installation explicit and contributor-owned.
- Keep the complete validation command easy to run.
- Re-stage Prettier, Ruff, and shfmt fixes only when a user invokes hooks.
- Avoid bypassing or weakening validation controls.

## Considered Options

- Install hooks automatically from `prepare`.
- Avoid local hooks and rely only on manual commands.
- Use Lefthook, but require explicit hook installation.

## Decision Outcome

Chosen option: "Use Lefthook with explicit installation" because it provides a
fast polyglot pre-commit runner while keeping installation intentional.

`npm run check` is the complete repository gate. `npm run hooks:install`
installs hooks explicitly. `npm run hooks:pre-commit` runs configured
pre-commit jobs manually. The `prepare` lifecycle script is intentionally not
used.

### Consequences

- Good, because `npm install` no longer mutates Git hooks.
- Good, because contributors can opt into local automation.
- Bad, because contributors must remember to run `npm run hooks:install`.

### Confirmation

Run `npm pkg get scripts.prepare scripts.hooks:install`,
`npm run hooks:pre-commit` when hooks are needed, and `npm run check` before
handoff.
