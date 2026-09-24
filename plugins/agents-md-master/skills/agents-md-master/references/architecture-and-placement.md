# Architecture and Placement

Use this reference for a new `AGENTS.md` system, nested hierarchy design,
authority analysis, contradiction resolution, or enforcement routing.

## Source Inventory

Identify the target repository root, current working directory, branch, dirty
state, package layout, build/test entry points, CI, generated files, runtime
permissions, hooks, and existing instruction files. Read selected instruction
files completely before drawing conclusions.

For current Codex behavior, verify official OpenAI documentation. As of the
2026-09-24 documentation checked for this package, Codex CLI enumerates
instruction files from the Codex home and each directory from repository root to
the current working directory, then injects those chunks in root-to-leaf order.
Treat that as a current source snapshot, not a permanent invariant.

## Placement Rules

Place guidance at the narrowest reliable layer:

| Material                                                                                                       | Owner                                |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Repository identity, universal navigation, shared validation expectations, and high-impact approval boundaries | Root `AGENTS.md`                     |
| Subtree-specific commands, ownership, tooling, risk, or validation                                             | Nearest nested `AGENTS.md`           |
| Long architecture, release, incident, data, or domain guidance                                                 | Versioned repository documentation   |
| Reusable multi-repository procedure with judgment and outputs                                                  | Skill                                |
| Allowed values, data shapes, and generated structures                                                          | Schema or typed configuration        |
| Deterministic checks and repeated mechanical work                                                              | Script, test, or CI                  |
| Filesystem, network, execution, approval, and secret boundaries                                                | Runtime permissions or configuration |
| Event-driven automation                                                                                        | Approved hook and handler            |

Do not copy conditional detail into the root merely because it is important.
Importance decides preservation; scope decides placement.

## Authority and Conflicts

Classify conflict pairs by actor, target, condition, phase, scope, and owner.
Use the strongest applicable evidence:

1. Platform and developer instructions.
2. Explicit user direction.
3. Effective instruction chain for the current working directory.
4. Repository implementation, scripts, config, tests, CI, and generated-source
   owners.
5. Linked documentation and project records.
6. Current official external documentation for host behavior.

If authority still does not resolve the conflict, stop the dependent edit and
ask for the decision. Continue independent read-only analysis when useful.

## Creation Output

A good proposal includes:

- target scope and effective chain assumptions;
- root and nested file map;
- rules retained at root and why most tasks need them;
- rules moved to narrower layers and why they are discoverable there;
- commands and validation with source owners;
- boundaries that require runtime, CI, hook, or permission controls;
- recovery path for proposed edits.
