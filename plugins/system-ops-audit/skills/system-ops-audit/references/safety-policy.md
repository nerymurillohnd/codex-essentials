# Safety Policy

## Default Mode

System Ops Audit operates in read-only mode by default.

The audit must not mutate the system unless the user gives explicit, specific approval for a separate remediation action.

## Forbidden Baseline Actions

The baseline collection process must not perform commands or equivalents that install, update, remove, write, reconfigure, unload, disable, kill, clean, or change ownership/permissions.

Forbidden examples:

```text
brew install
brew upgrade
softwareupdate --install
defaults write
launchctl load
launchctl unload
chmod
chown
rm
mv
kill
systemsetup <mutation>
networksetup <mutation>
profiles <mutation>
```

## Sensitive Data Rules

Never collect or expose values for:

- Passwords.
- Password hashes.
- Keychain contents.
- Authentication tokens.
- API keys.
- SSH private keys.
- Private cryptographic keys.
- Browser cookies.
- Browser history.
- Email contents.
- Message contents.
- Document contents.
- Clipboard contents.
- FileVault recovery keys.
- Sensitive certificate private keys.
- Unique hardware identifiers unless explicitly authorized.
- Environment-variable values that may contain secrets.
- Real `.env` contents.
- Session stores.
- Browser dumps.

## Permitted Secret Presence Metadata

Secret-like objects may be flagged only by name-level and location-level metadata when doing so does not expose values.

Allowed examples:

```text
OPENAI_API_KEY      PRESENT
ANTHROPIC_API_KEY   PRESENT
AWS_ACCESS_KEY_ID   PRESENT
/path/to/.env        PRESENT_METADATA_ONLY
```

Prohibited examples:

```text
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=...
AWS_SECRET_ACCESS_KEY=...
```

## Dotfiles

Dotfiles may be inventoried by metadata only:

- Path.
- Existence.
- Type.
- Owner.
- Permissions.
- Size.
- Modification timestamp.

Do not read dotfile contents unless the user explicitly approves and the reason is justified.

## Before Audit Work

Before proposing, creating, executing, reading, or analyzing an audit:

1. Review active instructions limiting what may be read, saved, or revealed.
2. Assess whether the output may include sensitive information.
3. Tell the user when restrictions affect scope or truthfulness.
4. If real sensitive-data exposure risk exists, ask for approval or propose a sanitized variant.

## Reporting Integrity

Do not hide uncertainty. State when a result is:

- Directly observed.
- Inferred.
- Unavailable.
- Permission-limited.
- Intentionally excluded for privacy.
- Unsupported or unresolved.
