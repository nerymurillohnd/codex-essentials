---
name: svelte-best-practices
description: Use when implementing, reviewing, or migrating Svelte components, SvelteKit routes, Svelte CLI setup, Astro Svelte islands, or Tailwind styling in a Svelte project.
---

# Svelte and SvelteKit project guidance

Use the project's installed versions and the live documentation to choose the right API. This skill routes the work; it is not a frozen copy of the framework manual.

## Establish the version

1. Find the app root and read `package.json` plus the relevant lockfile. Identify installed `svelte`, `@sveltejs/kit`, `sv`, `astro`, `@astrojs/svelte`, and Tailwind packages as applicable. A manifest range is not proof of an installed version.
2. Inspect existing conventions before editing. If the project uses Svelte 4 or SvelteKit 2, preserve that baseline unless migration is requested. If it is migrating, use the official migration guides and name the compatibility boundary.
3. Consult [the source map](references/sources.md) and the `svelte-docs-and-autofixer` skill for current signatures. For release-dependent behavior, inspect the relevant package changelog for the interval between the installed version and the documentation.

## Apply the relevant rules

| Area | Check before coding |
| --- | --- |
| Svelte 5 reactivity | `$state`, `$derived`, `$effect`, `$props`, and their placement; avoid using effects to compute derived state. |
| Templates | Event attributes, snippets, render tags, declaration tags, attachments, keyed lists, and accessibility diagnostics. |
| SvelteKit | Route filenames, universal versus server loads, forms and remote functions, hooks, env modules, navigation, adapters, and configuration for the installed major version. |
| Security | Server-only imports, user data in shared module state, untrusted HTML, redirects, CSRF, CSP, and deployment origin. |
| Integrations | Read Astro and Tailwind guidance only when those dependencies or files occur in the task. Check island hydration, serializable props, and Tailwind CSS processing against their installed versions. |

The official [SvelteKit 3 migration guide](https://svelte.dev/docs/kit/migrating-to-sveltekit-3) is the primary source for a Kit 2 to 3 migration; do not infer every breaking change from a single example. Run a codemod only when the user requested migration, inspect its diff, and complete manual tasks it reports.

## Source order and verification

For exact behavior at the installed version, prefer package source and changelog, then official documentation, then this skill's topic map. Report material disagreements. Fetch relevant sections before writing unfamiliar, experimental, or version-sensitive APIs. After editing, use the docs/autofixer skill and the project's check command; a clean autofixer alone is not a type check or runtime test.

For an editing request, follow `svelte-component-editor`. For a review request, follow `svelte-code-auditor`. For symbol questions or a rename, follow `svelte-code-navigation`.
