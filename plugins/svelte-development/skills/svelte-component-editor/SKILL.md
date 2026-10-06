---
name: svelte-component-editor
description: Use when creating, editing, fixing, or migrating Svelte components, Svelte modules, SvelteKit routes, forms, loads, hooks, or related integration code.
---

# Edit Svelte code

Complete the requested change using the project's version and conventions. The companion best-practices, docs/autofixer, and navigation skills supply specific checks; this skill owns the editing sequence.

1. Read the requested files, nearby usage, `package.json`, lockfile, and check scripts. Record Svelte and SvelteKit versions. Keep the project's current major version unless migration is part of the request.
2. Fetch current official documentation for every unfamiliar or version-sensitive API through `svelte-docs-and-autofixer`. For Kit 3 migration, read its migration guide and inspect any codemod's proposed changes before applying them.
3. For a public symbol or changed prop, use `svelte-code-navigation` references and search its blind spots before editing. If the local server is unavailable, make the limitation explicit and inspect text usages carefully.
4. Make the smallest complete change, including callers and affected tests. Respect server/client boundaries, accessibility, and the project's formatting conventions. Do not alter unrelated dependencies or configuration.
5. Run the official Svelte autofixer on each changed component or Svelte module, resolve applicable feedback, then run the project's check and relevant tests. Check rendered behavior when the change concerns visible interaction and a browser is available.
6. Report changed files, documentation consulted, autofixer and check results, any pre-existing failures, and behavior not tested.

When Astro islands or Tailwind appear in the task, consult their official sources from [the source map](../svelte-best-practices/references/sources.md). Do not add those integrations to a project that does not use them unless requested.
