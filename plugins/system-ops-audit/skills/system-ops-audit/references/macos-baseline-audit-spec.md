# macOS Baseline Audit Specification

## Scope

The baseline audit must be read-only, non-destructive, reproducible, privacy-preserving, and suitable for future configuration-drift comparison.

The audit must determine:

- What exists on the Mac.
- How the system is configured.
- Which security controls are effectively active.
- Which mechanisms can execute or persist software.
- Which processes and services are currently running.
- Which services are exposed to the network.
- Which applications or users have elevated capabilities.
- Which configuration sources control the observed state.
- Which findings differ from the expected baseline.

The audit must not remediate, modify, install, remove, update, unload, disable, or reconfigure anything.

---

## 01. System Identity

Collect:

- macOS version.
- macOS build number.
- Darwin/kernel version.
- Hostname.
- Local hostname.
- Computer name.
- Timezone.
- System uptime.
- Audit collection timestamp.
- Hardware architecture:
  - Apple Silicon.
  - Intel.

Do not collect serial numbers, hardware UUIDs, or other unique device identifiers without explicit approval.

---

## 02. Hardware & Storage

Collect:

- Mac model.
- CPU or Apple chip model.
- CPU core count.
- Installed RAM.
- Physical disks.
- APFS containers.
- Volumes.
- Mount points.
- Filesystem types.
- Total disk capacity.
- Used space.
- Available space.

Do not collect unique disk identifiers unless explicitly authorized.

---

## 03. Users & Groups

Collect:

- Current user.
- UID.
- Primary GID.
- Current user's group memberships.
- Local human users.
- Assigned login shells.
- Membership in `admin`.
- Relevant permissions and ownership for:
  - `/Users`
  - `$HOME`
  - Major user directories.

Do not read:

- Password hashes.
- Keychain contents.
- Authentication tokens.
- Cookies.
- Private user files.

---

## 04. Shell & Environment

Collect:

- Active shell.
- Available shells from `/etc/shells`.
- Effective `PATH`, split into individual entries.
- Paths declared by:
  - `/etc/paths`
  - `/etc/paths.d/`

Detect the existence of relevant shell and configuration files without reading their contents unless separately authorized:

- `.zshrc`
- `.zprofile`
- `.zshenv`
- `.bashrc`
- `.bash_profile`
- `.profile`
- `.config/`

For each detected object, collect only:

- Path.
- Type.
- Owner.
- Permissions.
- Size.
- Modification timestamp.

---

## 05. Filesystem Structure

Inspect only the top-level structure, ownership, and permissions of:

- `/Applications`
- `/Library`
- `/System`
- `/Users`
- `/opt`
- `/usr/local`
- `/etc`
- `/var`

Do not recursively scan the full filesystem during the baseline-discovery phase.

---

## 06. Package & Runtime Managers

Detect the following managers when present:

- Homebrew.
- MacPorts.
- Nix.
- asdf.
- nvm.
- pyenv.
- rbenv.
- RVM.
- uv.
- Node.js.
- npm.
- pipx.
- SDKMAN.

For each manager, collect only:

- Present / not present.
- Resolved executable path.
- Real path where relevant.
- Version.
- Basic ownership.

Do not inventory installed packages, formulas, casks, gems, global npm packages, Python packages, or runtime dependencies during this phase.

---

## 07. Services & Startup

Inspect LaunchAgent and LaunchDaemon locations at a superficial level.

Collect:

- Directory existence.
- Directory ownership and permissions.
- Number of entries.
- `.plist` filenames.
- Basic file metadata.

Relevant locations include:

```text
~/Library/LaunchAgents/
/Library/LaunchAgents/
/Library/LaunchDaemons/
/System/Library/LaunchAgents/
/System/Library/LaunchDaemons/
```

Collect Login Items only when they can be queried safely using read-only mechanisms.

Do not:

- Load or unload services.
- Modify `.plist` files.
- Download anything.
- Change startup configuration.

---

## 08. Security Posture

Record the effective state of major macOS security controls.

## System Protection

Collect:

- System Integrity Protection (SIP).
- Gatekeeper.
- FileVault:
  - Enabled / disabled.
  - General status.
- Secure Boot or Startup Security state when safely observable.
- Authenticated Root / Signed System Volume state.
- XProtect presence and relevant version/state when observable.
- MRT and related Apple security components when observable.

Never retrieve FileVault recovery keys.

## Firewall

Collect macOS Application Firewall state:

- Enabled / disabled.
- Stealth mode.
- Block-all mode.

## Security Updates

Collect:

- Automatic security update configuration.
- Background security update configuration.
- Software Update configuration.
- Pending macOS updates.
- Pending security-related updates when available.

## Remote and Sharing Services

Collect effective state for:

- Remote Login / SSH.
- Remote Management.
- Screen Sharing.
- Remote Apple Events.
- Internet Sharing.
- AirDrop discoverability, when safely observable.
- Guest User.
- Automatic login.

The audit must record the actual observed state rather than merely assuming these protections exist because macOS supports them.

---

## 09. Network Configuration & Exposure

## Interfaces

Collect:

- Existing interfaces.
- Active interfaces.
- Wi-Fi interfaces.
- Ethernet interfaces.
- Loopback.
- IPv4 configuration.
- IPv6 configuration.
- Virtual interfaces.
- Bridges.
- VPN interfaces.
- Tailscale, WireGuard, or equivalent interfaces when present.

## Configuration

Collect:

- Default route.
- Effective DNS resolvers.
- DNS search domains.
- Proxy configuration.
- Configured network services.
- Hostname.
- Local hostname.
- Computer name.

## Exposure

Collect listening network sockets:

- TCP listeners.
- UDP listeners.
- Local port.
- Bind address.
- Owning process.
- PID when obtainable.

Classify bind scope where possible:

- `127.0.0.1`
- `::1`
- LAN address.
- `0.0.0.0`
- `::`

Do not:

- Capture packets.
- Inspect payloads.
- Inspect network traffic contents.

The objective is to determine which services are exposed by this Mac and to which network scope.

---

## 10. Persistence Mechanisms

Audit persistence mechanisms beyond `launchd`.

## Launchd

Inspect:

```text
~/Library/LaunchAgents/
/Library/LaunchAgents/
/Library/LaunchDaemons/
/System/Library/LaunchAgents/
/System/Library/LaunchDaemons/
```

## Additional Persistence Sources

Detect:

- Login Items.
- Background Items.
- cron.
- User crontabs.
- `/etc/periodic`.
- `/etc/paths.d`.
- `/etc/manpaths.d`.
- Shell startup files.
- System Extensions.
- Legacy Kernel Extensions.
- Network Extensions.
- Endpoint Security Extensions.
- DriverKit Extensions.
- Finder Extensions.
- Registered application background helpers.
- Browser or application helper components when they represent registered background execution.

Classify each persistence object where possible as:

```text
Apple
Third-Party
Unknown / Unresolved
```

The presence of legacy kernel extensions must be explicitly surfaced because they may materially affect the Mac's security posture.

---

## 11. Privilege & Authorization

Audit how privilege can be obtained or delegated.

Collect:

- Members of `admin`.
- Members of `wheel`.
- Members of `_developer`.
- Relevant remote-access groups.
- SecureToken status per local user when safely observable.
- Bootstrap Token / MDM relationship when applicable.

## sudo

For `/etc/sudoers`, collect:

- Existence.
- Owner.
- Group.
- Permissions.
- Cryptographic hash.

For `/etc/sudoers.d/`, collect:

- Directory existence.
- Filenames.
- Ownership.
- Permissions.

Collect relevant effective `sudo` configuration only when it can be done without exposing secrets.

Do not automatically dump the full contents of authorization files.

## Elevated Executables

In a controlled later phase, identify relevant setuid/setgid executables outside protected Apple system areas.

Surface anomalous privilege delegation when observed.

`admin` membership must not be treated as the only path to privilege escalation.

---

## 12. Device Management & Configuration Profiles

Determine whether the Mac is centrally managed.

Collect:

- MDM enrollment state.
- Managing organization or server when safely visible.
- Installed configuration profiles.
- Profile scope:
  - System.
  - User.
- Profile identifiers.
- Payload types.
- Managed preferences.
- Active restrictions.
- Relationship between profiles and security settings where observable.

Do not expose secrets contained inside configuration profiles.

Observed local state must not automatically be assumed to originate from local configuration; MDM or configuration profiles may be authoritative.

---

## 13. Installed Applications

Inventory GUI applications from:

- `/Applications`
- `~/Applications`
- `/System/Applications`

For third-party applications, collect where obtainable:

- Application name.
- Version.
- Bundle identifier.
- Installation path.
- Owner.
- Code-signing status.
- Signing Team ID.
- Gatekeeper assessment.
- Notarization status when reliably observable.
- Architecture:
  - `arm64`
  - `x86_64`
  - Universal.

Do not inventory every development dependency during this phase.

Detailed inventories of Homebrew formulas and casks, global npm packages, uv tools, pipx applications, and language-runtime packages belong in a subsequent deeper audit phase.

---

## 14. Runtime Processes

Collect metadata about currently running processes without inspecting private process data.

Collect:

- PID.
- PPID.
- User.
- Executable path.
- Architecture when useful.
- Apple / third-party classification where possible.
- Processes running as `root`.
- Processes owning listening network sockets.
- Launchd provenance when correlation is possible.

Maintain these distinctions:

```text
Installed != Running
Running != Persistent
Persistent != Network-Exposed
```

Each represents a different security and operational dimension.

---

## 15. Storage Integrity & Backups

## APFS

Collect:

- APFS containers.
- APFS volumes.
- Volume roles.
- Mount points.
- Encryption state.
- System/Data volume separation.
- Snapshot presence.
- Writable / read-only state.
- Ownership where applicable.

## Backup Posture

Collect Time Machine state:

- Configured / not configured.
- Destination type.
- Last successful backup.
- Last attempted backup.
- Local snapshot presence.

Do not:

- Mount backup destinations.
- Browse backup contents.
- Copy backup data.

A system baseline is incomplete without understanding whether a valid recovery mechanism exists.

---

## 16. Privacy & TCC Permissions

Inspect high-impact privacy permissions at a structural level.

Relevant capabilities include:

- Full Disk Access.
- Accessibility.
- Screen Recording.
- Camera.
- Microphone.
- Automation / Apple Events.
- Input Monitoring.
- Developer Tools.

Prioritize visibility into:

```text
Full Disk Access
Accessibility
Screen Recording
Automation
```

These permissions materially change the effective capabilities of an application or agent.

Record only:

```text
Application -> Granted Capability
```

Do not inspect the private data that these permissions may make accessible.

Do not dump the entire TCC database unless explicitly authorized and justified.

---

## 17. Development & Execution Environment

For development- or agent-operated Macs, inventory the execution environment separately.

Detect:

- Xcode.
- Xcode Command Line Tools.
- Active developer directory.
- Installed SDK versions.
- Rosetta 2.
- Docker.
- Container runtimes.
- Virtualization software.
- SSH client.
- SSH server state.
- Git.
- GPG.
- Language runtimes.
- Package managers.
- Compiler toolchain.
- Homebrew prefix.

For key executables, resolve the complete execution chain:

```text
Command
-> PATH-resolved executable
-> Real path
-> Owner
-> Version
-> Responsible runtime/package manager
```

At minimum evaluate:

```text
node
npm
python
python3
uv
git
ruby
java
brew
```

The audit must detect conflicting or shadowed installations such as:

```text
/usr/local/bin/node
/opt/homebrew/bin/node
~/.nvm/...
~/.asdf/...
```

Simply reporting that a runtime exists is insufficient.

---

## 18. Configuration Drift & Reproducibility

The audit must produce a persistent, machine-readable representation of the observed state.

At minimum, baseline data should represent:

- Timestamp.
- macOS version/build.
- Hardware architecture.
- Security posture.
- Accounts and groups.
- Filesystem structure.
- Shell environment.
- Effective `PATH`.
- Runtime/package managers.
- Services.
- Network configuration.
- Network exposure.
- Persistence mechanisms.
- Extensions.
- Configuration profiles.
- Installed applications.
- Runtime processes.
- Storage and backup posture.

Recommended future artifact structure:

```text
baseline/
├── manifest.json
├── system.json
├── hardware.json
├── users.json
├── filesystem.json
├── shell.json
├── managers.json
├── security.json
├── network.json
├── persistence.json
├── extensions.json
├── profiles.json
├── applications.json
├── processes.json
├── storage.json
└── findings.json
```

Initial baseline exception: do not create this multi-file structure unless the user approves it. The first environment baseline produces a single complete output file under `audits/environment/`.

Each evaluated condition should support classification such as:

```text
EXPECTED
INFORMATIONAL
REVIEW
WARNING
CRITICAL
UNKNOWN
```

Future audits must support deterministic comparison:

```text
baseline-YYYY-MM-DD
        |
        v
       diff
        |
        v
baseline-YYYY-MM-DD
```

The baseline should be reproducible, machine-readable, versionable, diffable, and auditable.

---

## 19. Evidence & Provenance

Every material observation should retain enough provenance for another human or agent to independently assess how the result was obtained.

Recommended evidence structure:

```json
{
  "check": "system.security.sip",
  "value": "enabled",
  "source": "csrutil status",
  "collected_at": "2026-09-05T17:00:00-06:00",
  "privilege": "user",
  "confidence": "high"
}
```

Evidence should distinguish between:

- Directly observed data.
- Derived or inferred data.
- Unavailable data.
- Data requiring elevated privileges.
- Data intentionally excluded for privacy.
- Unsupported or unresolved observations.

Where relevant, also record:

- Collector version.
- Source command or API.
- Exit status.
- Whether elevated privileges were required.
- Parsing status.
- Confidence level.

The audit itself must remain auditable.
