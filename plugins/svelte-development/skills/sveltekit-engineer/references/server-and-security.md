# SvelteKit server and security

Keep credentials and privileged clients in server-only modules or private
environment surfaces. Do not read, print, commit, or transmit real secret
values; refer to required names as `${VAR}`. Confirm that client-rendered code
cannot import server-only modules and that serialized data contains no private
values.

Use existing project auth/session helpers. Deliberately set cookie path, expiry,
`secure`, `sameSite`, and `httpOnly` according to the threat model. Test
missing/expired sessions, unauthorized actions, untrusted redirect destinations,
and safe user-facing errors. Keep diagnostic details in the approved server
channel.

Adapter choice changes runtime capabilities. Before relying on Node APIs,
filesystem access, edge bindings, streaming, or deployment environment behavior,
verify the configured adapter and test through its preview or platform-local
route. A generic build is not sufficient proof of a deployment-sensitive path.
