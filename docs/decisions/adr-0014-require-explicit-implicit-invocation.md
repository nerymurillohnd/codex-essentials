---
status: accepted
date: 2026-09-06
decision-makers: Nery Samuel Murillo
consulted: Codex skill design standards and marketplace package contract
informed: Marketplace contributors and maintainers
---

# Require explicit automatic invocation for every skill agent manifest

## Context and Problem Statement

ADR-0006 required an `agents/openai.yaml` file for every distributed skill but
left `policy.allow_implicit_invocation` optional. The resulting twelve existing
manifests mixed explicit automatic invocation with omission, even though the
intended policy is normal automatic discovery for every marketplace skill.

How should the marketplace prevent invocation-policy drift while keeping the
authoring path clear for new skills?

## Decision Drivers

- Make invocation behavior visible and uniform in every distributed manifest.
- Prevent a new or edited skill from silently omitting the intended policy.
- Keep the source template, contributor guidance, and validator aligned.

## Considered Options

- Keep the policy optional and document the convention.
- Require an explicit policy but allow either boolean value.
- Require `policy.allow_implicit_invocation: true` for every distributed skill.

## Decision Outcome

Chosen option: "Require `policy.allow_implicit_invocation: true` for every
distributed skill" because it represents the approved marketplace behavior and
makes omission or accidental opt-out a local validation failure.

### Consequences

- Good, because every skill has an auditable, consistent invocation policy.
- Good, because `templates/agents-openai.yaml` gives contributors a valid
  starting point.
- Bad, because an explicit-only skill now requires a future policy change and
  a superseding decision rather than an isolated manifest edit.

### Confirmation

`schemas/agent.schema.json` requires the policy and its `true` value. The
marketplace pipeline validates every packaged agent manifest, and its regression
test rejects both an omitted policy and `false`. Contributors must start from
`templates/agents-openai.yaml` and run `npm run marketplace:check`.

## Pros and Cons of the Options

### Optional convention

- Good, because it has no migration cost.
- Bad, because omissions are indistinguishable from an intentional default.

### Explicit boolean choice

- Good, because it allows explicit-only skills without changing the schema.
- Bad, because it permits an incompatible policy without a repository-level
  decision.

### Required automatic invocation

- Good, because it matches the approved discovery behavior for every current
  skill and fails closed on drift.
- Bad, because it reserves explicit-only invocation for a deliberate future
  contract change.

## More Information

This decision supersedes only the optional-policy statement in ADR-0006; the
remaining agent-manifest path, ownership, and validation decisions remain in
force.
