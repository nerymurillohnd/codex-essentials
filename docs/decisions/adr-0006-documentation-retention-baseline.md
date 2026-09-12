---
status: accepted
date: 2026-09-12
decision-makers: Nery Samuel Murillo, Codex
consulted: Repository documentation layout
informed: Repository contributors
---

# Keep documentation aligned with the current repository baseline

## Context and Problem Statement

Repository documentation must describe files, commands, workflows, and controls
that exist in the current checkout. Stale instructions make contribution and
maintenance work unsafe because they ask people to validate or operate systems
that are no longer present.

How should the repository keep its operational documentation reliable?

## Decision Drivers

- Keep operational instructions tied to checked-in files and package scripts.
- Preserve only decisions that still govern the current repository.
- Remove references to retired commands, workflows, and release processes.
- Keep plans and records scoped to their active purpose.

## Considered Options

- Keep unverified or obsolete operational instructions.
- Maintain current documentation against the working tree and configured
  repository services.
- Reintroduce retired tooling solely to preserve old documentation.

## Decision Outcome

Chosen option: "Maintain documentation against the current repository baseline"
because contributor guidance must be executable and verifiable.

Operational documents name only available package scripts, checked-in workflows,
and active repository artifacts. When a control is removed, its instructions
and maintenance records are removed or replaced with the current state.

### Consequences

- Good, because contributors can run every documented command.
- Good, because current controls are not confused with retired processes.
- Bad, because historical implementation detail must be recovered from Git when
  it is genuinely needed.

### Confirmation

Run `npm run format:check` and `npm run check`.
