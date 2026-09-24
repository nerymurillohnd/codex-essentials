# Read-only and privacy boundary

Use this reference for every System Ops Audit mode. A baseline observes one
local Mac; it does not install, update, remove, unload, disable, kill, clean,
change ownership or permissions, or rewrite system configuration. A command with
a mutating option is not made safe by calling the overall task an audit.

Never read or report password hashes, Keychain data, tokens, API keys, SSH or
other private keys, browser cookies or history, email/messages/documents,
clipboard, FileVault recovery material, session stores, or real environment
values. For secret-like objects, name and presence/location metadata are the
maximum default evidence, and even that must be relevant to the scope.

For files such as shell startup dotfiles, prefer existence, type, owner,
permissions, size, and modification time. Do not read content merely to identify
the file. Avoid full-filesystem scans, packet capture, payload inspection, and
unique hardware identifiers in an initial baseline.

Before collecting, evaluate whether output could disclose sensitive paths,
usernames, process arguments, network endpoints, or profile payloads. Narrow or
redact the affected check before saving a report. Distinguish directly observed,
inferred, unavailable, permission-limited, privacy-excluded, and unsupported
results. Do not convert an unknown into a reassuring finding.
