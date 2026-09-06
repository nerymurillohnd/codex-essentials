# macOS Baseline Coverage and Evidence

## Use This Reference

Read this reference only when scoping or reviewing a baseline design. Select
the smallest set of categories that answers the approved objective. The
initial environment baseline uses one complete output under
`audits/environment/`; it does not require a deep inventory or a multi-file
dataset.

This reference specifies coverage, not a fixed command list. Before relying on
a version-sensitive command or system behavior, verify it on the target host or
against current authoritative Apple documentation. If a check is unavailable,
permission-limited, or ambiguous, report `UNKNOWN` with the reason.

## Core Coverage

| Category                          | Read-only evidence to collect when in scope                                                                                                                                                         | Do not collect by default                                                                                        |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| System identity                   | macOS and Darwin version, build, names, timezone, uptime, architecture, and collection time                                                                                                         | Serial number, hardware UUID, or other unique device identifier                                                  |
| Hardware and storage              | Model/chip, memory, disks, APFS containers and volumes, mount points, filesystem types, capacity, and free space                                                                                    | Unique disk identifiers                                                                                          |
| Users and shell metadata          | Current user, UID/GID, relevant groups, login shells, permissions, active shell, `PATH`, system path declarations, and metadata for shell files                                                     | Password hashes, Keychain data, tokens, cookies, private user files, or dotfile contents                         |
| Top-level filesystem              | Existence, ownership, and permissions for `/Applications`, `/Library`, `/System`, `/Users`, `/opt`, `/usr/local`, `/etc`, and `/var`                                                                | Recursive full-filesystem scans                                                                                  |
| Managers and runtimes             | Presence, resolved and real path, version, and basic ownership for installed managers and selected runtimes                                                                                         | Formulas, casks, global packages, language dependencies, or package inventories                                  |
| Startup and persistence           | LaunchAgent/Daemon metadata, login/background items, cron, shell startup metadata, extensions, and registered helpers                                                                               | Loading, unloading, changing, or deep-reading service configuration                                              |
| Security and sharing              | SIP, Gatekeeper, FileVault status without recovery material, startup security when observable, firewall mode, update settings, and enabled remote/sharing services                                  | Recovery keys, configuration changes, or assumptions that a supported control is enabled                         |
| Network and exposure              | Interfaces, routes, resolvers, proxies, network services, and listening socket metadata with bind scope                                                                                             | Packet capture, payload inspection, or traffic contents                                                          |
| Privilege and management          | Relevant groups, non-content metadata for sudo configuration, secure-token or bootstrap-token state when safe, MDM enrollment, profile scope, identifiers, payload types, and observed restrictions | Full authorization-file or profile contents, profile secrets, or a claim that observed state is locally authored |
| Applications and processes        | App identity, version, bundle identifier, path, signing/notarization status when observable, process metadata, root processes, and listening-process correlation                                    | Development dependency inventories or private process data                                                       |
| Storage and recovery              | APFS roles, encryption state, snapshots, writable state, and Time Machine configuration and recency                                                                                                 | Mounting, browsing, or copying backup contents                                                                   |
| Privacy and execution environment | Structural high-impact TCC grants; developer tools, container/VM runtimes, remote-access state, and executable resolution chain                                                                     | TCC database dump, private data made accessible by a grant, or broad tool inventories                            |

For persistence, classify objects as `Apple`, `Third-Party`, or `Unknown` when
the available evidence supports it. Preserve these distinctions: installed is
not running; running is not persistent; persistent is not network-exposed.

## Scope Tiers

### Initial baseline

Use the approved subset of core coverage. Keep output to one complete file,
avoid package/dependency inventories and full filesystem scans, and list every
excluded category.

### Focused follow-up

Use when a finding needs more evidence in one approved category, such as
network exposure, launchd metadata, application signing, or MDM/profile
relationship. State why the added evidence is needed and what remains out of
scope.

### Deep comparison baseline

Use only after explicit approval for a versionable, machine-readable dataset.
Define the individual artifacts, retention policy, and comparison method in the
design. Do not create a multi-file structure merely because this tier exists.

## Evidence and Reporting

Every material observation needs enough provenance for independent review:

```json
{
  "check": "system.security.sip",
  "value": "enabled",
  "source": "verified local command or API",
  "collected_at": "2026-09-06T00:00:00-06:00",
  "privilege": "user",
  "confidence": "high"
}
```

Record the source, collection time, privilege requirement, exit status or
equivalent outcome, parsing status, and confidence where relevant. Mark each
item as directly observed, inferred, unavailable, permission-limited,
privacy-excluded, or unsupported. A finding may be `EXPECTED`,
`INFORMATIONAL`, `REVIEW`, `WARNING`, `CRITICAL`, or `UNKNOWN`.

Do not treat absence of evidence as evidence of absence. Keep recommendations
separate from collection and do not report a recommendation as executed.
