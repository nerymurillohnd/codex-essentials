---
name: system-ops-audit
description:
  Use when planning, running, or analyzing a read-only operational baseline for
  one local macOS machine, including workspace setup, privacy-safe diagnostics,
  or audit findings. Exclude repository, application-feature, fleet-management,
  and remediation tasks.
---

# System Ops Audit

Use this skill for one local Mac. Choose the requested mode: inspect or prepare
an audit workspace, design a baseline, create a read-only collector, run an
authorized collector, or analyze supplied evidence. Do not turn an audit into
remediation or a fleet-management task.

Read [safety policy](references/safety-policy.md) for every mode. Load only the
other relevant reference: [workspace contract](references/workspace-contract.md)
for workspace work,
[coverage and evidence](references/macos-baseline-audit-spec.md) for baseline
scope, [script design](references/script-design-template.md) before writing a
collector, or [test scenarios](references/test-scenarios.md) when reviewing
behavior.

## Bound the request

Confirm the machine, requested categories, output audience and destination, and
whether the user wants a plan, script, execution, or analysis. Discover the
actual workspace path; do not assume a particular home directory or preexisting
`System-Ops` layout. A direct request to create a named workspace or run a
read-only audit authorizes that scoped action; ask only for a materially missing
location, coverage choice, privacy boundary, or authority.

Never collect or expose passwords, hashes, tokens, private keys, recovery
material, Keychain contents, cookies, message/email/document contents, real
environment values, or full sensitive configuration. Presence metadata by name
and location may be used when safe. Do not install, upgrade, unload, kill,
clean, change permissions, or modify settings during baseline collection. A
finding can recommend remediation, but performing it requires a separate user
task.

## Collect or analyze

Select the smallest read-only command set that answers the user's question.
Check each command and option on the actual macOS version or against current
Apple documentation before claiming its behavior. Record collection time, source
command/API, privilege, exit status, parsing result, and confidence for material
observations. Mark unavailable, permission-limited, privacy-excluded,
unsupported, and inferred results distinctly; absence of evidence is not a
healthy-state result.

Before running a generated script, inspect its exact path, commands, output
destination, and side effects against the approved scope. If the script or a
command needs elevated privileges, secret access, or a write outside the agreed
report, stop that check and explain the narrower safe alternative.

Report verified observations, limitations, privacy exclusions, findings,
recommendations, and the action still needed. Classify a finding as expected,
informational, review, warning, critical, or unknown only when the available
evidence supports that classification. Never report a recommended fix as
performed.
