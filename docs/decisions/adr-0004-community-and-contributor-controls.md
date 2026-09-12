---
status: accepted
date: 2026-09-12
decision-makers: Nery Samuel Murillo, Codex
consulted: Repository governance needs and Contributor Covenant template
informed: Repository contributors
---

# Add contributor controls and repository operating guidance

## Context and Problem Statement

Codex Essentials is intended to serve a public plugin marketplace. The
repository therefore needs contributor guidance, issue intake structure, labels,
editor recommendations, and community conduct expectations in addition to code
and validation scripts.

Which contributor controls should be committed now?

## Decision Drivers

- Keep contribution intake structured and reviewable.
- Keep repository operations discoverable from root guidance.
- Provide professional community expectations.
- Align editor recommendations with the selected toolchain.

## Considered Options

- Keep governance and contributor process informal.
- Add only technical config files.
- Add contributor guidance, issue template, label contract, Code of Conduct,
  VS Code settings, and VS Code extension recommendations.

## Decision Outcome

Chosen option: "Add contributor controls and operating guidance" because the
repository is becoming a public distribution surface, not a private scratch
space.

The repository includes `CODE_OF_CONDUCT.md`, GitHub issue template files,
`.github/label-contract.json`, `.vscode/settings.json`,
`.vscode/extensions.json`, and updated root `AGENTS.md` operating commands.

### Consequences

- Good, because contributors have clearer expectations.
- Good, because issue triage and local editor setup are more repeatable.
- Bad, because governance files must be maintained as tooling changes.

### Confirmation

Run `npm run check` and review root `AGENTS.md` whenever operating scripts or
tooling contracts change.
