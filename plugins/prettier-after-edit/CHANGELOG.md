# Changelog

All notable changes to this plugin are documented in this file.

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
[Semantic Versioning](https://semver.org/spec/v2.0.0.html). Use ISO 8601 dates
(`YYYY-MM-DD`) and keep entries concise, user-facing, and actionable.

## [Unreleased]

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

[unreleased]: https://github.com/nerymurillohnd/codex-essentials/compare/HEAD...HEAD
