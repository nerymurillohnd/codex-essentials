# Source Verification

Before claiming current Prettier, plugin, editor, hook, CI, or Codex behavior,
verify it from current authoritative sources.

Use this order:

1. Official Prettier documentation, release notes, and package metadata.
2. Official documentation and release notes for detected Prettier plugins or
   framework integrations.
3. Official OpenAI/Codex documentation for plugin packaging, skill metadata, and
   hook behavior.
4. Repository-local manifests, lockfiles, scripts, and policy documents.

For version recommendations, state the installed or absent version, the exact
proposed version, compatibility constraints, relevant release notes, expected
lockfile impact, and why the update is needed. Do not recommend the newest
version solely because it is newest.

If official documentation conflicts with repository constraints, report the
conflict and ask for a decision instead of silently overriding the repository.
