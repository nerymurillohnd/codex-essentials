# Changelog

All notable changes to this plugin are documented in this file.

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Use ISO 8601
dates (`YYYY-MM-DD`) and keep entries concise, user-facing, and actionable.

## [Unreleased]

### Changed

- **[Area: Packaging]** Derived plugin and agent metadata from the repository
  declarative source and strengthened release validation to reject resources
  resolving outside this package.
- **[Area: Documentation]** Updated the published Astro patch reference to
  7.2.9 while preserving installed-CLI verification as the authoritative
  compatibility check.
- **[Area: Documentation]** Clarified the current Codex lifecycle-hook contract,
  including explicit manifest paths and conventional `hooks/hooks.json`
  discovery.

### Added

- **[Area: Packaging]** Added the MIT license terms to the standalone plugin
  package and documented the license as a distributed component.

## [0.1.1] - 2026-08-27

### Added

- **[Area: Agent]** Added the schema-validated Codex agent manifest at
  `skills/astro-commands/agents/openai.yaml` with the skill's catalog label,
  concise description, and default invocation prompt.

### Changed

- **[Area: Documentation]** Documented the agent manifest as a bundled
  component and reference, including its distinction from behavioral skill
  instructions.

## [0.1.0] - 2026-08-27

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
  `npm run check` command is the canonical contributor validation and that
  `npm run validate:all` is manifest-only. The external `plugin-creator`
  compatibility checker remains optional and maintainer-only. Documented
  asking Codex to invoke that Skill as the preferred user experience.
- **[Area: Documentation]** Added official Astro documentation, repository,
  installation, and release-note links with attribution and source precedence.
- **[Area: Documentation]** Added human-facing visual hierarchy and section
  icons to the product README while keeping operational agent instructions
  unchanged.
- **[Area: Documentation]** Removed maintainer-only local authoring commands
  from the public product and marketplace README guidance.
- **[Area: Documentation]** Distinguished the full contributor check from the
  repository's manifest-only validation commands.

### Changed

- **[Area: Manifest]** Renamed the visible product and Skill from Astro
  Commandments to Astro Commands; the `astro-cli-commands` installation ID is
  unchanged for compatibility.

[unreleased]: https://github.com/nerymurillohnd/codex-essentials/compare/HEAD...HEAD
