# Verification Gates Reference

## Minimum gate selection

For any Svelte change, identify which of these gates applies:

- Formatting when files were edited.
- Typechecking or `sv check` when Svelte, TypeScript, routes, or config changed.
- Unit, component, or integration tests when behavior changed.
- Build when routing, server code, adapters, or bundling changed.
- Preview or browser verification when user-visible UI changed.
- Security review when auth, cookies, redirects, env, or server-only code
  changed.

## Browser proof

Use a browser or Playwright when visual or interactive behavior changed. Check:

- Initial render is nonblank.
- No overlapping or clipped text at relevant viewport sizes.
- Keyboard and pointer interactions work.
- Forms preserve validation, loading, success, and failure states.
- Console and network failures are understood.

## Reporting

Final verification notes should include:

- Commands run.
- Relevant raw output, especially failures.
- MCP docs or autofix use, or why it was skipped.
- Browser checks performed, or why they were unnecessary.
- Residual risks and unverified surfaces.

If a gate cannot run because dependencies, credentials, network, or authority
are missing, say so directly. Do not replace it with a weaker green check and
call the work complete.
