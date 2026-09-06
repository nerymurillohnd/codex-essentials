---
name: system-ops-audit
description: Use when a user asks to review, audit, diagnose, document, prepare a workspace for, or analyze read-only scripts for the operational state of a local macOS machine, outside repository or product-development work.
---

# System Ops Audit

## Purpose

Use this skill for local macOS operational baseline audits. The workflow is read-only, privacy-preserving, approval-gated, and separate from repository, application, product, or feature-development audits.

## Hard Boundaries

- Do not treat this as a development-repository audit.
- Do not remediate during baseline collection.
- Do not install, update, remove, unload, kill, chmod, chown, clean, rewrite, or reconfigure anything.
- Do not read secrets, Keychain contents, cookies, browser dumps, password hashes, private keys, real `.env` contents, tokens, credentials, or session stores.
- Do not read dotfile contents unless the user gives explicit approval and there is a justified reason.
- Redact or avoid serials, hardware UUIDs, provisioning IDs, tokens, passwords, cookies, credentials, and private keys.
- Secret-like environment variables may be reported only as name-level presence metadata, never values.

## Required References

Before preparing a workspace, designing a script, executing an audit, or analyzing audit output, read the relevant files in this skill:

- `references/workspace-contract.md`
- `references/safety-policy.md`
- `references/macos-baseline-audit-spec.md`
- `references/script-design-template.md`

Use `references/test-scenarios.md` when validating that the skill behavior is being followed.

## Operating Flow

1. Review active user/system/project instructions that limit what may be read, stored, or revealed.
2. Identify whether the task concerns the local machine operational state, not a repository or product.
3. Apply the workspace contract before writing any files.
4. Apply the safety policy before proposing, creating, executing, reading, or analyzing an audit.
5. If a script is needed and does not already exist, present the script design first and wait for explicit approval before writing it.
6. If an existing script is present, review its safety and scope before recommending execution.
7. Do not execute any audit script until the user approves the script, output destination, and collection scope.
8. Analyze outputs by separating verified observations, unavailable data, privacy-excluded data, assumptions, risks, and recommendations.
9. Keep remediation as a separate workflow requiring explicit approval.

## Workspace Contract

The standard workspace is named exactly `System-Ops`. The name and internal architecture are contract requirements, not agent suggestions. Only the parent location may vary if the user chooses.

At start:

1. Check whether `/Users/{username}/System-Ops` exists.
2. If it exists, use it and verify the required architecture.
3. If it does not exist, inspect the local context and recommend a parent location for `System-Ops`.
4. Explain that the recommendation concerns only the parent location; `System-Ops` and its internal architecture are fixed.
5. Ask whether the user confirms creation at the recommended parent or prefers another parent.
6. Do not create or modify files before explicit confirmation.

If the workspace exists but required directories are missing, report the exact missing directories and ask for approval before creating them.

## Required Workspace Architecture

```text
System-Ops/
  .codex/
    hooks/
    skills/
      system-ops-audit/
  archive/
  audits/
    environment/
  decisions/
  inventory/
  scripts/
```

## Script Rules

- Scripts live only in `scripts/`.
- The first environment baseline script must be Bash and start with:

```bash
#!/usr/bin/env bash
set -euo pipefail
```

- The first script must write its output to `audits/environment/`.
- For the initial baseline, generate exactly one complete output file.
- Do not create `raw/`, `summary.md`, `findings.md`, or `manifest.json` for the initial baseline unless the user later approves that structure.
- The first script audits the operating system and base environment only; it must not perform deep development package inventories.

If the script does not exist, present the design first:

- Script name.
- Exact output file it will generate.
- Commands or command families it will use.
- Data it will include.
- Data it will exclude.
- Privacy risks.
- Validations to run.

Wait for explicit approval before writing the script.

## Baseline Coverage

The first baseline should follow `references/macos-baseline-audit-spec.md` and prioritize:

- System identity.
- Hardware and storage.
- Users and groups.
- Shell and environment metadata.
- Top-level filesystem structure.
- Package/runtime manager detection without package inventories.
- Superficial services/startup inventory.
- Security posture.
- Network configuration and listening exposure.
- Persistence mechanisms.
- Privilege and authorization metadata.
- Device management and profiles.
- Installed application metadata.
- Runtime process metadata.
- Storage integrity and backup posture.
- High-impact privacy/TCC permissions at a structural level.
- Development/execution environment resolution without deep dependency inventory.
- Evidence and provenance.

## Reporting Rules

Every final response after audit work must state:

- What was verified.
- What was not checked.
- What was intentionally excluded for privacy.
- What required elevated privilege, if anything.
- Any findings that are informational, review-worthy, warnings, critical, or unknown.
- Recommended next action, without performing remediation.

Use these classifications when useful:

```text
EXPECTED
INFORMATIONAL
REVIEW
WARNING
CRITICAL
UNKNOWN
```

## Non-Negotiable Principle

Baseline collection is observation, not repair. The agent may recommend remediation only after evidence is collected, and remediation requires a separate explicit approval boundary.
