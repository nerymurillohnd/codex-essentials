---
status: accepted
date: 2026-09-12
decision-makers: Nery Samuel Murillo, Codex
consulted: Repository documentation layout
informed: Repository contributors
---

# Reset historical planning and decision records to a current baseline

## Context and Problem Statement

The repository contained older Superpowers plans, specs, and ADRs from earlier
architecture work. The current repository baseline has changed: plugins are
reset to `0.1.0`, the marketplace generator is now standalone Python, and
quality tooling has been re-established.

How should the repository keep durable documentation useful without carrying
obsolete planning records?

## Decision Drivers

- Keep only current, actionable planning context.
- Replace stale ADRs with a concise current decision set.
- Preserve documentation structure for future plans, specs, and decisions.
- Avoid confusing contributors with superseded or unrelated history.

## Considered Options

- Keep all historical plans, specs, and ADRs.
- Delete all documentation history without replacement.
- Delete pre-baseline plans/specs and rebuild ADRs around current decisions.

## Decision Outcome

Chosen option: "Delete pre-baseline plans/specs and rebuild ADRs around current
decisions" because it keeps the repository's durable guidance compact and
aligned with the active implementation.

Plans and specs older than `2026-09-05` are removed from
`docs/superpowers/plans` and `docs/superpowers/specs`. All previous
`docs/decisions/*.md` files are removed and replaced by this current ADR set.

### Consequences

- Good, because contributors see the current operating model first.
- Good, because decision numbers restart from a clean baseline.
- Bad, because historical context is no longer available in working-tree docs.

### Confirmation

Run `rg` for deleted filenames, `npx prettier --check docs/decisions`, and
`npm run check`.
