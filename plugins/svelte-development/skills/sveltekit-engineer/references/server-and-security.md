# SvelteKit Server And Security Reference

## Private code and environment

- Keep secrets in server-only modules or approved environment surfaces.
- Do not print secret values in logs, test output, generated docs, or chat.
- Do not read `.env` or equivalent real secret files unless the user explicitly
  requests credential work and the active security policy allows it.
- Reference required credentials as `${VAR}` in instructions and examples.

## Cookies and sessions

- Use project-owned session helpers when they exist.
- Set cookie options deliberately: path, expiry, secure behavior, same-site
  behavior, and http-only behavior must match the threat model.
- Re-check redirects and invalid-session behavior after auth changes.

## Adapters and deployment

- Adapter choice controls runtime capabilities. Verify it before relying on
  filesystem access, Node APIs, edge restrictions, streaming behavior, or
  platform-specific environment handling.
- Treat build success as necessary but insufficient for deployment-sensitive
  changes. Run preview or platform-local checks when behavior depends on the
  adapter.

## Security review prompts

Before finalizing server work, ask:

- Can any client import server-only code?
- Can serialized data expose private values?
- Are form actions protected against missing auth or invalid input?
- Are redirects constrained to trusted destinations?
- Are errors safe for users while preserving server-side diagnostics?
