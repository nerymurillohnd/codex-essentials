---
name: svelte-verification
description: Use when verifying Svelte or SvelteKit work before completion, including MCP docs, Svelte CLI commands, autofix, checks, tests, builds, preview servers, browser validation, diagnostics, or failure recovery.
---

# Svelte Verification

Use this skill before claiming Svelte or SvelteKit work is complete. It also
applies when debugging framework diagnostics, deciding whether to use MCP or
CLI tooling, running migrations, or selecting final checks.

## Verification contract

1. Identify changed files and behavior.
2. Use Svelte MCP documentation for current, version-sensitive guidance.
3. Run `svelte-autofixer` through the Svelte MCP for changed `.svelte` files
   when remote source analysis is authorized and the tool is available.
4. Run project-native gates before generic fallbacks.
5. Exercise the actual user path when behavior is interactive, route-based,
   form-based, auth-sensitive, adapter-sensitive, or visual.
6. Report exact commands, relevant output, skipped checks, and residual risk.

## Command selection

Prefer the project's package scripts:

```bash
npm run check
npm run typecheck
npm run test
npm run build
```

Use `sv` or `@sveltejs/mcp` only when the project or task calls for Svelte's
official tooling. Before relying on a command or flag, inspect the installed
or invoked help output:

```bash
npx sv --help
npx sv check --help
npx -y @sveltejs/mcp --help
```

Do not install dependencies, run migrations, or rewrite lockfiles unless the
user has authorized that mutation.

## MCP routing

- Use MCP docs lookup before version-sensitive claims.
- Use MCP autofix only with source the user is allowed to send remotely.
- Never send secrets or real credential files to remote tools.
- If MCP is unavailable, state that explicitly and continue with local checks
  and official docs.

## Read the relevant reference

| Reference                                                 | Read when                                                                        |
| --------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [mcp-and-cli.md](references/mcp-and-cli.md)               | Choosing remote MCP, `sv`, `@sveltejs/mcp`, migrations, docs lookup, or autofix. |
| [verification-gates.md](references/verification-gates.md) | Selecting checks, tests, builds, previews, browser proof, and failure recovery.  |

Never summarize a failed gate as success. Preserve the failure output that
changes the next engineering decision.
