# Script Design Template

Use this template before creating or changing any audit script.

## Proposed Script

- Name: `scripts/<script-name>.sh`
- Language: Bash
- Required header:

```bash
#!/usr/bin/env bash
set -euo pipefail
```

## Output

- Output directory: `audits/environment/`
- Output file: `audits/environment/<exact-file-name>.txt`
- Initial baseline rule: generate exactly one complete output file.
- Do not generate `raw/`, `summary.md`, `findings.md`, or `manifest.json` unless later approved.

## Command Families

List only read-only command families. For each command family, state:

- Purpose.
- Expected output type.
- Whether elevated privileges are required.
- Privacy risk.
- Sanitization/redaction rule.
- Fallback if unavailable.

## Data Included

List the exact categories included, aligned to `macos-baseline-audit-spec.md`.

## Data Excluded

Explicitly list excluded categories, including:

- Secret values.
- Keychain data.
- Cookies.
- Browser history.
- Private keys.
- Password hashes.
- Real `.env` contents.
- Private documents/messages/email contents.
- Unique hardware identifiers unless approved.

## Privacy Risk Assessment

Classify risk as one of:

```text
LOW
MEDIUM
HIGH
BLOCKED_UNTIL_APPROVED
```

Explain the reason in one or two sentences.

## Validation Plan

Before writing or executing the script, state how it will be validated:

- Bash syntax check.
- Static review for forbidden mutation commands.
- Output path check.
- Secret-value avoidance review.
- Confirmation that no package inventory/deep scan is included unless approved.

## Approval Request

End the design with a direct approval request:

```text
Approve writing this script to scripts/<script-name>.sh with output to audits/environment/<exact-file-name>.txt?
```
