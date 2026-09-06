---
name: system-ops-audit
description: Plan, run with approval, or analyze a read-only macOS operational baseline for one local machine. Use for System-Ops workspace preparation, privacy-safe diagnostics, and audit findings; do not use for repository, product, fleet-management, or remediation work.
---

# System Ops Audit

## Purpose

Use this skill to produce a bounded, privacy-preserving baseline of one local
macOS machine. It supports five modes:

- Prepare or validate the `System-Ops` workspace.
- Design a baseline collection before any script is written.
- Write a user-approved read-only collection script.
- Run one already approved script with its approved scope and destination.
- Analyze user-provided or approved audit output.

It does not perform remediation, manage a device fleet, or audit repositories,
applications, or product features.

## Required Inputs

- A local-macOS objective and one selected mode.
- For workspace work: the candidate workspace path or permission to inspect the
  local context.
- For script design: the requested coverage, intended output path, and privacy
  constraints.
- For script writing or execution: explicit approval for the exact script,
  scope, and output destination.
- For analysis: the supplied or authorized audit evidence and the user's
  reporting objective.

Ask one focused question when the mode, target machine, coverage, output
destination, or approval boundary is missing or materially ambiguous.

## Hard Boundaries

- Read `references/safety-policy.md` before every mode. It controls data
  handling, read-only behavior, and the approval boundary.
- Do not collect or expose secret values, private content, recovery keys,
  private keys, cookies, session stores, password hashes, or real `.env`
  contents. Name- and location-level presence metadata is the maximum allowed
  secret-related output.
- Do not invent the current state, a command result, command availability,
  approval, a device-management origin, or a remediation outcome.
- Do not install, update, remove, unload, kill, clean, change ownership or
  permissions, rewrite configuration, or otherwise mutate the system during a
  baseline.
- Stop when the requested check cannot be performed read-only, safely, or with
  the approved authority. Explain the limitation and offer a narrower or
  sanitized alternative when one exists.
- Decline requests to collect secrets, bypass these boundaries, fabricate
  evidence, or perform remediation under the guise of a baseline.

## Reference Map

Load only the reference required by the current mode. Do not preload the full
coverage specification for workspace-only work or output-only analysis.

| Mode or decision                    | Required reference                        | Use it to                                                      |
| ----------------------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| Every mode                          | `references/safety-policy.md`             | Apply privacy, reporting, and read-only controls.              |
| Workspace preparation or validation | `references/workspace-contract.md`        | Check the fixed `System-Ops` layout and its creation boundary. |
| Design or scope review              | `references/macos-baseline-audit-spec.md` | Select proportionate coverage and required provenance.         |
| Script proposal or change           | `references/script-design-template.md`    | Produce the approval-ready design before writing code.         |
| Workflow self-review                | `references/test-scenarios.md`            | Check representative safe and unsafe requests.                 |

## Workflow

1. Confirm that the request is for one local macOS machine and choose the
   applicable mode. Route repository, application, product, fleet-management,
   or remediation work to its own workflow.
2. Read the safety policy and state any constraint that materially limits the
   requested result.
3. For workspace work, read the workspace contract. Inspect only what is
   needed to determine the candidate path and missing relative directories.
   Report missing paths and wait for explicit creation approval.
4. For a design, read the coverage specification and script-design template.
   Select only the requested categories; preserve the initial-baseline limits
   unless the user explicitly approves broader coverage. Present the completed
   design and wait for approval before writing a script.
5. For script writing, confirm that the approved design matches the exact
   script path, coverage, and output file. Write only that approved script and
   validate syntax, output path, forbidden mutations, and secret handling.
6. For execution, review the existing script against the approved design. Do
   not run it until the user has approved its exact scope and destination.
7. For analysis, use only supplied or authorized evidence. Separate direct
   observations from inferences, unavailable checks, privacy exclusions, and
   recommendations. Do not imply that a recommendation was performed.
8. Treat remediation as a separate task. Require new explicit approval before
   any mutation, even when the finding is critical.

When an operating-system command, feature, or management behavior is
version-sensitive, verify its current availability and semantics from the local
host or authoritative Apple documentation before relying on it. If it cannot
be verified, mark the check `UNKNOWN` rather than guessing.

## Output Format

- Workspace mode: candidate path, verified and missing relative paths, and the
  exact approval needed for creation.
- Design mode: use the complete script-design template, including scope,
  excluded data, privacy risk, validations, and a direct approval request.
- Execution mode: approved script identity, destination, observed result or
  failure, and any unavailable checks.
- Analysis mode: `Verified observations`, `Unavailable or permission-limited`,
  `Privacy exclusions`, `Findings`, `Recommendations`, and `Approval needed`.

Classify findings as `EXPECTED`, `INFORMATIONAL`, `REVIEW`, `WARNING`,
`CRITICAL`, or `UNKNOWN` when classification helps the next decision.

## Completion Checks

Before responding, confirm that the selected mode had its required inputs,
reference, and approval; no sensitive value or mutation crossed the boundary;
and the result distinguishes evidence from inference. For a workflow change,
consult the test scenarios and correct any behavior that would violate them.
