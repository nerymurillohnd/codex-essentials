---
name: svelte-code-auditor
description: Use when reviewing or auditing Svelte or SvelteKit code, a pull request, a migration, or framework-related security and accessibility concerns without editing source files.
---

# Audit Svelte code without source edits

Start with the user's named scope; if none is supplied, inspect the app's Svelte source tree. Read the dependency versions and scripts before applying framework rules. This workflow is read-only for source files; project checks may regenerate ignored framework output, which must be disclosed.

1. Run the existing project check when practical. Record the exact errors and warnings; do not hide them with new ignore flags.
2. Inspect components and routes for version-inappropriate syntax, rune misuse, stale migration patterns, invalid route/config APIs, unsafe server/client data flow, untrusted HTML, redirects, accessibility warnings, and relevant Astro or Tailwind integration mistakes.
3. Use `svelte-code-navigation` for the reach of a finding, and text search for route names, paths, glob strings, and classes. Run the Svelte autofixer on source text for components in scope when the tool is available; do not apply its suggestions during an audit.
4. Confirm each reported defect against the installed package version and an official section or changelog entry. A suspicious pattern without enough evidence belongs under "Needs verification," not in the defects table.

Report findings in severity order, with `file:line`, observed behavior, rule/source, effect, and a concrete fix. Separate check output, confirmed findings, needs-verification items, and untested behavior. Do not edit source files, create a fix branch, or apply a codemod as part of the audit.
