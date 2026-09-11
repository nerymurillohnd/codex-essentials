---
status: accepted
date: 2026-08-30
decision-makers: Nery Samuel Murillo
consulted: Codex
informed: Repository contributors and plugin consumers
---

# Retire the GitHub Wiki as a Documentation Surface

## Context and Problem Statement

The GitHub Wiki duplicated documentation that already has authoritative homes
in the repository: the root `README.md`, versioned `docs/`, and each plugin's
README and changelog. The duplicate publication surface had already become
stale: its `Home.md` described Astro Commands as the only installable plugin
while the repository contained four plugin packages.

The project needs one reviewable source of truth for documentation and a clear
answer to where contributors and consumers should look for current guidance.

## Decision Drivers

- Prevent public documentation from diverging from the repository.
- Keep documentation changes versioned, reviewable, and covered by repository
  gates.
- Preserve a concise, discoverable homepage for users and contributors.
- Avoid maintaining a second publication workflow for non-critical content.

## Considered Options

- Keep the Wiki as a synchronized public homepage.
- Keep only a minimal Wiki index or collaborative notes.
- Retire and disable the Wiki, using repository documentation as the public
  documentation surface.

## Decision Outcome

Chosen option: "Retire and disable the GitHub Wiki" because the repository
README and versioned documentation already provide the required public entry
point and detailed guidance without a second synchronization boundary.

The GitHub Wiki content, including its existing `Home.md`, is removed and the
Wiki feature is disabled for the repository. The root `README.md` remains the
homepage. `docs/` remains the canonical home for detailed, versioned
documentation; plugin-local README and changelog files remain authoritative
for plugin-specific information.

### Consequences

- Good, because documentation updates travel with the code and can be reviewed
  and validated together.
- Good, because users have one primary public entry point and fewer competing
  documentation surfaces.
- Bad, because the project no longer has a GitHub-hosted collaborative Wiki
  for informal or non-versioned notes.
- Bad, because historical Wiki commits remain in the separate Git repository's
  history even after its public pages are removed.

### Confirmation

Confirm that the Wiki repository no longer contains published pages, the
repository reports `hasWikiEnabled: false`, and the main repository contains
no active documentation that directs users to the Wiki. Confirm the decision
record and updated documentation pass the repository documentation gate and
complete quality check.

## More Information

The Wiki was a separate repository, `nerymurillohnd/codex-essentials.wiki`,
with `Home.md` at commit `5b030d5` before retirement. The repository's
documentation authority is defined in [`docs/AGENTS.md`](../AGENTS.md), and
the direct-push boundary for documentation-only changes is recorded in
[`ADR-0009`](adr-0009-direct-push-and-pr-routing.md).
