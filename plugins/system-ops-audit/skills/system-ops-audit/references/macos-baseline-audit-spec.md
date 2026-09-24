# macOS baseline coverage and evidence

Choose only categories that answer the user's question. The initial baseline can
be one complete report; a deep multi-file inventory needs an explicit retention
and comparison purpose. Verify version-sensitive commands on the target host or
against current Apple documentation before using them.

| Category               | Read-only evidence when relevant                                     | Default exclusion                               |
| ---------------------- | -------------------------------------------------------------------- | ----------------------------------------------- |
| System                 | macOS/Darwin version, build, architecture, timezone, collection time | Serial or hardware UUID                         |
| Hardware/storage       | Model, chip, memory, APFS roles, capacity, free space                | Unique disk identifiers, backup contents        |
| Runtime/tooling        | Presence, resolved path, version, ownership of selected tools        | Broad package/dependency inventory              |
| Startup                | LaunchAgent/Daemon and login-item metadata                           | Loading, unloading, or changing services        |
| Security/sharing       | SIP, Gatekeeper, FileVault status, firewall, updates, sharing state  | Recovery keys and sensitive profile payloads    |
| Network                | Interfaces, routes, DNS, proxies, listening bind scope               | Packets, payloads, private traffic              |
| Management             | Enrollment/profile metadata and observed restrictions                | Assumed local ownership or full profile content |
| Applications/processes | Selected app identity, signing status, process metadata              | Private process arguments and user content      |

For a material observation, record check name, source command/API, collection
time, privilege, exit code or equivalent, parsed value, confidence, and any
redaction. Installed, running, persistent, and network-exposed are distinct
states. Mark an unavailable or ambiguous check `UNKNOWN`; absence of evidence
does not establish absence of risk.

Keep findings separate from proposed remediation. A follow-up can deepen one
category when the user authorizes that scope; do not expand the initial baseline
into a full filesystem or package inventory by default.
