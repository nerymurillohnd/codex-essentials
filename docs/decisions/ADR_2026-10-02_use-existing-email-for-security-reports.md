---
status: accepted
date: 2026-10-02
decision-makers:
  - Nery Samuel Murillo
---

# Use the maintainer's existing email for private security reports

## Purpose

Give people a concrete private reporting route at the time Codex Essentials had no GitHub remote or published plugin releases.

## Scope

This decision governs the security contact in [SECURITY.md](../../SECURITY.md) and the corresponding remote setup guidance. It does not establish a response time, a dedicated security mailbox, or an active GitHub private vulnerability reporting channel.

## Context and problem statement

The repository's initial security policy directed reporters to an unspecified private channel. That left no actionable route for a person who found a suspected vulnerability. The maintainer authorized use of his existing email address, now published in [SECURITY.md](../../SECURITY.md). At the time of this decision, the repository had no GitHub remote, so GitHub private vulnerability reporting had not been activated or verified.

## Decision drivers

- Provide a usable private contact before remote setup.
- Avoid directing vulnerability details to public issues.
- State only capabilities and channels that are currently available.
- Keep the contact easy to revise if repository ownership or reporting volume changes.

## Considered options

- Publish the maintainer's existing email address in `SECURITY.md`.
- Wait until a GitHub remote exists and private vulnerability reporting is enabled.
- Create a dedicated security mailbox before accepting reports.

## Decision outcome

Chosen option: **Publish the existing email address** because the maintainer authorized it and it provides an immediate private reporting route. [SECURITY.md](../../SECURITY.md) lists `nerymurillohnd@gmail.com` as that contact. GitHub private vulnerability reporting remains a possible additional route only after it is enabled and verified.

### Consequences

- Reporters had a specific channel for suspected vulnerabilities before remote setup.
- The address is visible in a public repository and may receive unsolicited mail; security reports will share an inbox with other correspondence.
- The repository makes no claim about email delivery, monitoring frequency, response time, or GitHub reporting availability that has not been verified.

### Confirmation

Check that [SECURITY.md](../../SECURITY.md) names the chosen address and sends reporters away from public issues. During remote setup, the maintainer should confirm the address is still appropriate and verify GitHub private vulnerability reporting before presenting it as active. Revisit this decision if the contact changes, reporting volume calls for a dedicated mailbox, or repository ownership changes.

## More information

Implementation status on 2026-10-03: the GitHub remote exists. The email remains the published private reporting route. GitHub private vulnerability reporting has not been verified as an active route; the original decision and its rationale are unchanged.
