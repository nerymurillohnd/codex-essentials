# Changelog

All notable changes to this plugin are documented in this file.

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
[Semantic Versioning](https://semver.org/spec/v2.0.0.html). Use ISO 8601 dates
(`YYYY-MM-DD`) and keep entries concise, user-facing, and actionable.

## [Unreleased]

### Changed

- **[Area: Skill]** Refined the bundled skill frontmatter description to
  distinguish immediate post-edit formatting from Prettier configuration work.
- **[Area: Packaging]** Derived plugin and agent metadata from the repository
  plugin manifest and strengthened package validation to reject incomplete skill
  metadata, unsafe links, and resources resolving outside this package.
- **[Area: Manifest]** Added the explicit `hooks` declaration and recorded the
  complete author, legal, interface, and component metadata; the marketplace
  entry is generated and reverse-validated from this manifest.
- **[Area: Runtime]** Accept `tool_response.filePath` in addition to existing
  direct input paths, prefer the nearest local Prettier for each target, and
  retain the PATH-visible global fallback without using `npx` or installing
  dependencies.
- **[Area: Runtime]** Replaced the Bash and jq hook with a self-contained Node
  orchestrator, increased the hook timeout to 60 seconds, and preserved
  project-local-first tool resolution with PATH fallback.
- **[Area: Product]** Restored the display name and documentation to describe
  Prettier-only behavior while retaining the `prettier-after-edit` installation
  identifier.

### Removed

- **[Area: Markdown]** Removed automatic markdownlint-cli2 execution from the
  edit hook; Markdown linting now remains the responsibility of the target
  repository's own scripts, hooks, editor integration, or CI.

### Fixed

- **[Area: Hook]** Replaced the invalid nested shell fallback in the packaged
  hook command with Codex's `${PLUGIN_ROOT}` contract, preventing startup
  failures with exit code `127`.
- **[Area: Hook]** Format every file reported by a multi-file `apply_patch`
  event, preserve paths containing spaces, and leave unreported files untouched.
- **[Area: Formatting]** Run Prettier from the target project with project-local
  paths so its configuration and ignore policy apply to explicit files.
- **[Area: Status]** Report `formatted` only when Prettier changes file bytes;
  distinguish unchanged, ignored, unsupported, and failed formatting outcomes.
- **[Area: Scope]** Reject missing, non-file, and outside-cwd targets and prevent
  a single edit event from widening into repository-wide formatting.
- **[Area: Skill]** Removed the unsupported `disable-model-invocation`
  frontmatter key so the distributed skill passes the current skill validator.

## [0.1.1] - 2026-08-27

### Added

- **[Area: Agent]** Added the schema-validated Codex agent manifest at
  `skills/prettier-after-edit/agents/openai.yaml` with the skill's catalog
  label, concise description, and default invocation prompt.

### Changed

- **[Area: Documentation]** Documented the agent manifest as a bundled
  component and reference, including its distinction from behavioral skill
  instructions.

## [0.1.0] - 2026-08-27

### Added

- **[Area: Manifest]** Added the `prettier-after-edit` plugin manifest with catalog
  identity, version, author metadata, capabilities, and default prompt.
- **[Area: Hook]** Added a `PostToolUse` hook that resolves Prettier with a
  project-local preference and global fallback.
- **[Area: Script]** Added resilient input parsing for direct file paths and
  first-match `apply_patch` file selection.
- **[Area: Documentation]** Added `README.md`, `SKILL.md`, `hooks.json`, and
  local package `LICENSE.md`.
- **[Area: Hooks]** Added installer-safe runtime package files for marketplace
  distribution and documentation.

### Changed

- **[Area: Compatibility]** Replaced single-path fallback behavior with explicit
  local-first/ global-fallback binary selection.
- **[Area: Packaging]** Added a full marketplace-compatible package structure and
  changelog/manifest synchronization entry.
- **[Area: Hook]** Updated hook invocation to use
  `"${CODEX_PLUGIN_ROOT:-$CLAUDE_PLUGIN_ROOT:-$PLUGIN_ROOT}"` so packaged
  hooks resolve correctly in Codex plugin execution environments.

[unreleased]: https://github.com/nerymurillohnd/codex-essentials/compare/HEAD...HEAD
