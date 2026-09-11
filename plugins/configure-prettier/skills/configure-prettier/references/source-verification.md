# Live source verification

Before recommending a Prettier/plugin version, migration, option behavior, editor setting, or automation integration, consult current authoritative sources in this order:

1. Official Prettier documentation.
2. Official Prettier releases and changelog.
3. Official package-registry metadata.
4. Official documentation and releases for each detected or strategically proposed Prettier plugin, linter, or framework integration.
5. Repository-local documentation, pinned versions, lockfiles, compatibility notes, runtime policy, and CI constraints.

Verify the installed and resolved versions, currently published release, package manager, lockfile state, runtime compatibility, plugin compatibility, breaking changes, and changes affecting discovered config formats, parsers, file types, VS Code behavior, hooks, or CI.

Never recommend a version only because it is newest. When an installation or update is justified, propose exactly one verified version—not a floating range—then state the installed version (or its absence), recommended version, rationale, compatibility, migration/breaking risk, and expected lockfile impact. Do not run the package command.

For update requests, perform a read-only live drift check: compare installed/resolved state with current supported/published state; review release notes since the installed version; assess compatibility and deprecations; then provide a prioritized exact-version proposal and complete diffs. Never automatically update packages, lockfiles, configuration, source formatting, CI, hooks, or this skill.

Use direct links to the sources that support each material recommendation. If official sources, runtime behavior, and repository constraints conflict, stop and report the conflict rather than guessing.
