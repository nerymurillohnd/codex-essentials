# Source Verification Reference

## Trust order

Use this order for framework claims:

1. Installed project dependencies and command output.
2. Svelte MCP documentation for the current topic.
3. Official Svelte and SvelteKit documentation.
4. Official Svelte repositories and release metadata.
5. Community skills, articles, examples, and issues as design signals only.

Community material can reveal useful patterns, pain points, and missing agent
guidance. Do not copy its text or proprietary structure into generated plugin
content unless its license and attribution permit that exact use.

## When MCP is required

Use Svelte MCP documentation before making claims about:

- Svelte 5 runes and compiler semantics.
- SvelteKit load functions, actions, hooks, and adapter behavior.
- Migration commands or behavior.
- Current CLI flags and AI-tooling commands.
- Warnings, errors, or diagnostics that depend on the current compiler.

## Evidence discipline

Record the installed package version or official source date when it affects the
decision. If current docs and local code disagree, treat local installed
behavior as the executable truth and official docs as the explanation to
reconcile.
