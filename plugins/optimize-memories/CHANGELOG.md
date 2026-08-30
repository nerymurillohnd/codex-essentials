# Changelog

All notable changes to Optimize Memories will be documented in this file.

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Use ISO 8601
dates (`YYYY-MM-DD`) and keep entries concise, user-facing, and actionable.

## [Unreleased]

### Changed

- **[Area: Skill]** Clarified that Codex-behavior corrections require official
  sources while project-specific corrections may use authoritative local
  evidence.
- **[Area: Documentation]** Updated the marketplace refresh command to use the
  supported `codex plugin marketplace upgrade` subcommand.

### Added

- **[Area: Manifest]** Added the `optimize-memories` plugin manifest with
  marketplace identity, version, author metadata, capabilities, and default
  prompt.
- **[Area: Skill]** Added the `audit-and-cure-memories` skill with phase-gated
  project, global, and complete memory-audit workflows.
- **[Area: Agent]** Added the Codex-facing agent metadata for the bundled skill.
- **[Area: Documentation]** Added the package README, MIT license, and initial
  changelog entry.

[unreleased]: https://github.com/nerymurillohnd/codex-essentials/compare/HEAD...HEAD
