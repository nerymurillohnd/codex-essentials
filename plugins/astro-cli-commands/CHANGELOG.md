# Changelog

All notable changes to this plugin are documented in this file.

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Use ISO 8601
dates (`YYYY-MM-DD`) and keep entries concise, user-facing, and actionable.

## [Unreleased]

### Added

- **[Area: Manifest]** Added the initial Astro Commandments plugin manifest for
  marketplace discovery while retaining `astro-cli-commands` as the stable
  installation identifier.
- **[Area: Skill]** Added guidance for Astro CLI command selection, version
  verification, package-manager alignment, CI checks, background server
  handling, and secret-sensitive commands.
- **[Area: Installation]** Registered the plugin in the Codex Essentials
  marketplace as an available local plugin.
- **[Area: Documentation]** Documented the command-first decision rule and
  version-drift maintenance contract.
- **[Area: Documentation]** Clarified that the repository-owned
  `npm run validate:all` check is the canonical contributor validation, while
  the external `plugin-creator` compatibility checker is optional and
  maintainer-only. Documented asking Codex to invoke that Skill as the
  preferred user experience.

### Changed

- **[Area: Manifest]** Renamed the visible product and Skill from Astro
  Commandments to Astro Commands; the `astro-cli-commands` installation ID is
  unchanged for compatibility.

[unreleased]: https://github.com/nerymurillohnd/codex-essentials/compare/HEAD...HEAD
