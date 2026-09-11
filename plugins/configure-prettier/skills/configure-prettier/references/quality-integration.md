# Quality integration

Evaluate Prettier plugins and adjacent quality tooling proportionately. Assess
absent linters or formatters at a high level, but develop a complete proposal
only when audit evidence demonstrates a concrete, material gap that Prettier
alone or the existing stack does not address.

## Required assessment

For the detected languages, frameworks, source types, documentation formats, deployment configuration, and team workflow, assess:

- Prettier parser/plugin coverage for every relevant file type and whether built-in parser inference is sufficient.
- The value and compatibility of Prettier plugins for Astro, Svelte, Vue, Tailwind, MDX, import ordering, GraphQL, TOML, and other actually relevant technologies.
- Static-analysis gaps that a linter could address independently of formatting: correctness, unsafe patterns, accessibility, CSS quality, framework-specific rules, documentation/content validation, and maintainability.
- ESLint, Biome, Oxlint/OXC, Stylelint, framework-native tooling, or another fit-for-purpose linter when justified by the repository. Do not treat a linter as interchangeable with Prettier.
- Runtime, framework, plugin, package-manager, CI, editor, and contributor-workflow compatibility; overlapping responsibility; performance; migration cost; false positives; and ongoing maintenance burden.
- Whether an existing tool is sufficient, needs a compatible extension, should be replaced only through an explicit migration, or should remain absent. Treat replacement as higher risk than additive integration.

## Decision discipline

- Recommend one formatter as the formatting authority for each file class. Do not create competing formatters for the same files without a documented reason.
- When Prettier is the formatter and ESLint is recommended, evaluate the officially supported conflict-avoidance integration and ensure formatting rules do not fight Prettier.
- Recommend a plugin only for a demonstrated file-type, transformation, or quality need. Verify official compatibility, version constraints, load order, and known incompatibilities before proposing it.
- Prefer the smallest coherent quality stack. Do not add ESLint, Biome, Oxlint, Stylelint, or plugins merely to maximize tool count.
- Do not infer that every repository needs every tool. A recommendation may conclude that Prettier alone, an existing linter alone, or no new plugin is the stronger outcome.
- When no integration is justified, say so explicitly and explain why the existing stack is sufficient.

## Required proposal shape

For each candidate escalated to a complete proposal, provide: the problem it
solves; applicable files; alternatives considered; why the recommended tool fits
better; exact verified version(s); integration with Prettier and existing tools;
configuration, script/task-runner, IDE, hook, CI, and lockfile effects;
migration/churn risk; validation commands; and a complete independently
approvable diff.

Label candidates as `required`, `recommended`, `optional`, or `not recommended`. Never install, configure, or enable any candidate without explicit approval.
