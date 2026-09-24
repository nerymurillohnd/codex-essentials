# Codex Essentials repository instructions

This repository distributes only Codex plugins from a Git marketplace. This
orphan lineage is the candidate for the future `main`; the previous lineage must
be retained remotely as `deprecated` during cutover.

## Authority and layout

- Each `plugins/<id>/plugin.json` owns that package's name, version, and
  publisher metadata. Packages are self-contained; a consumer must not need
  repository tooling or another plugin to use one.
- `.agents/plugins/marketplace.json`, the root README inventory, and issue-form
  plugin options are generated. Never edit them by hand.
- Read `plugins/AGENTS.md` before a package change and `docs/AGENTS.md` before
  documentation changes. Current OpenAI and Agent Plugins documentation governs
  host or schema behavior; local rules may be stricter but must be identified.
- The 20 launch plugins start at `0.1.0` in this new lineage. A later product
  change updates its manifest version, changelog, documentation, and derived
  metadata together before entering `main`.

## Validation and release

- Use the versions pinned in `.nvmrc` and `package.json`; install with
  `npm install` while authoring and `npm ci` in clean verification.
- Run `npm run format` after edits and `npm run check` before a completion or
  publication claim. Resolve all applicable diagnostics; do not bypass hooks,
  checks, signatures, or branch rules.
- Initial and later plugin tags use `codex-essentials/<plugin-id>/v<semver>`.
  Releases contain source notes only; do not publish packages or upload
  generated assets.
- Preserve the former `main` as remote `deprecated` during cutover. Do not
  modify or delete that branch without a separate user decision. Do not create
  an external Git backup for this cutover.

## Secrets and external systems

- Never read or print real secret values. Discover names from example files and
  refer to credentials only as `${VAR}`.
- Remote branch, release, issue, and ruleset changes require exact-target checks
  and a record of the observed SHA or resource ID.
