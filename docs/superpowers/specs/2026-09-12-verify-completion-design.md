# Verify Completion Plugin Design

## Status

Approved for specification on 2026-09-12. Implementation requires review and
approval of this specification, followed by an implementation plan.

## Context

Codex Essentials needs a reusable, public, skills-only capability that makes
completion claims evidence-backed. The supplied workflow defines six
verification gates: adversarial review, outcome validation, counterpart
verification, false-positive review, positive and negative proof, and an
evidence record.

OpenAI's current documentation describes skills as reusable workflows and
plugins as the distribution unit for one or more skills. This product therefore
uses one focused skill bundled in one plugin, rather than a hook, MCP server, or
script.

## Decision

Create a skills-only marketplace plugin named `verify-completion` containing one
implicitly invocable skill, also named `verify-completion`.

The skill applies when an agent is about to declare, communicate, record, or act
on a conclusion that work is complete, correct, ready for handoff, ready to
commit, ready for a pull request, or verified. It does not apply merely because
an agent delegates exploratory work, moves between intermediate steps, or makes
an ordinary non-conclusive positive comment.

The skill requires the agent to:

1. State the exact requirement or acceptance criteria under test.
2. Identify applicable artifacts, tests, contracts, hooks, gates, and controls.
3. Execute the six gates in order.
4. Record concrete evidence for every applicable gate.
5. Stop at a failed gate, repair its underlying cause when authorized, and
   restart the full verification protocol after a repair.
6. Include a concise verification summary before the completion claim.

Each gate is mandatory when applicable. A gate may be excluded only when the
agent records a demonstrable reason that the gate cannot apply to the stated
requirement. The final summary must report every exclusion and its justification.

## Six Completion Gates

1. **Adversarial review:** independently inspect claims, artifacts, command
   output, and critical supporting evidence rather than trusting a prior summary.
2. **Outcome validation:** prove the behavior or artifact satisfies the stated
   requirement, not only that a related command exited successfully.
3. **Counterpart verification:** confirm that the consuming side validates and
   enforces the intended contract; exercise rejected missing, malformed, or
   bypassed inputs when a counterpart exists.
4. **Distrust the green:** examine false-positive vectors, including bypassed
   controls, skipped tests, weak assertions, excessive mocks, silent failures,
   and relevant coverage gaps.
5. **Positive and negative proof:** demonstrate both the intended success path
   and the targeted invalid, incomplete, or malicious path failing for the
   expected reason.
6. **Evidence record:** retain exact commands, relevant output, inspected diffs,
   assertions, and exclusions at enough fidelity for an independent reviewer to
   reach the same conclusion.

## Plugin Contents

```text
plugins/verify-completion/
├── plugin.json
├── README.md
├── CHANGELOG.md
├── LICENSE.md
└── skills/
    └── verify-completion/
        ├── SKILL.md
        └── agents/
            └── openai.yaml
```

The repository root `README.md` will receive one catalog entry. The repository
generator will create the corresponding `.agents/plugins/marketplace.json`
entry; that generated file is not an authored input.

## Interface and Distribution

- Plugin identifier: `verify-completion`.
- Initial version: `1.0.0`.
- Category: `Developer Tools`.
- Capability: evidence-backed completion verification.
- Skill policy: `allow_implicit_invocation: true`.
- Credentials: none.
- Runtime dependencies: none.
- Network access: not used by the plugin itself.
- Hooks, scripts, MCP servers, apps, and external assets: not included.

The README will say that installation changes Codex-managed plugin state only;
the skill may inspect and run commands only within the authority granted by the
active user request. It does not grant permission for a commit, pull request,
remote mutation, configuration change, dependency installation, or other action.

## Repository Contract

This repository distributes portable root manifests at
`plugins/<plugin-id>/plugin.json`. Its generator discovers the bundled skill
directory at `plugins/<plugin-id>/skills/`; the portable manifest carries plugin
identity and interface metadata, not a `skills` property. The standard
`plugin-creator` scaffold's `.codex-plugin/plugin.json` compatibility layout is
not compatible with the current repository generator, which loads only the
portable root manifest.

Implementation will use the repository's `templates/plugin.json`,
`templates/agents-openai.yaml`, README, changelog, and license templates while
following `plugin-creator` naming, metadata, and validation guidance. It will
not run the incompatible default scaffold or add an unused compatibility
manifest.

## Non-Goals

- No installation-time or execution-time hook registration, trust, or automatic
  enforcement.
- No universal requirement to run all six gates before every delegation,
  intermediate task transition, or casual positive statement.
- No scripts that attempt to infer complete verification mechanically.
- No replacement for repository-specific tests, controls, approval boundaries,
  or branch protections.
- No claims that evidence has been recorded when the relevant command, artifact,
  or negative case was unavailable.

## Acceptance Criteria

1. The package exists at `plugins/verify-completion/` and its portable root
   `plugin.json` validates against the repository schema.
2. The package declares one skill and contains exactly one matching,
   schema-valid `skills/verify-completion/agents/openai.yaml`.
3. The skill description is concise, discriminating, and matches completion,
   verification, and handoff claims without capturing routine implementation.
4. The skill faithfully implements all six gates, evidence requirements,
   failure-restart rule, and the final verification-summary contract.
5. The skill treats applicability as evidence-based and records every excluded
   gate with a reason.
6. Package documentation accurately describes its read-only-by-default
   instruction role, permission boundaries, installation behavior, limitations,
   recovery behavior, and smoke-test use.
7. The manifest, skill metadata, README, changelog, license, root catalog, and
   generated marketplace entry are internally consistent.
8. The full repository quality gate passes without disabling, weakening, or
   bypassing any control.

## Verification Plan

The implementation plan will require, at minimum:

```bash
python3 /Users/nerymurillohnd/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  plugins/verify-completion/skills/verify-completion
npm run marketplace:build
npm run marketplace:check
npm run check
```

It will also include a manual package-contract review that confirms the catalog
path is `./plugins/verify-completion`, no unsupported components are declared,
and all user-facing documentation makes no capability claim that is absent from
the package.

## Risks and Mitigations

| Risk                                                          | Mitigation                                                                                                             |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Over-triggering disrupts ordinary work.                       | Restrict activation to completion and verification conclusions; use a concise scope boundary in the skill description. |
| Mandatory gates invite fabricated or irrelevant evidence.     | Require demonstrable applicability and explicit, justified exclusions.                                                 |
| A green check hides the wrong behavior.                       | Require outcome, counterpart, false-positive, and positive/negative gates in addition to command results.              |
| The default external scaffold conflicts with this repository. | Author from the repository's portable root-manifest templates and validate through its generator.                      |
| The protocol is mistaken for new execution authority.         | State that the skill never expands authorization or bypasses project controls.                                         |
