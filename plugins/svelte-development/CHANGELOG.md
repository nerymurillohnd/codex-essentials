# Changelog

All notable changes to Svelte Development are documented in this file.

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Use ISO 8601
dates (`YYYY-MM-DD`) and keep entries concise, user-facing, and actionable.

## [Unreleased]

### Added

- Documented recommended project-scoped `AGENTS.md` wiring for the Svelte MCP
  server and Svelte Development skills.

### Changed

- Clarified that the bundled Svelte MCP and skills load in a refreshed or new
  Codex session.

### Fixed

- Restored the portable `streamable-http` transport required for the bundled
  Svelte remote MCP server to load in a fresh Codex session.

## [0.2.1] - 2026-09-12

### Changed

- Changed the bundled Svelte remote MCP declaration to the `http`
  transport and documented the official Svelte direct Codex CLI configuration
  with its current Codex-reference compatibility caveat.

## [0.2.0] - 2026-09-11

### Changed

- Migrated package metadata to the portable root `plugin.json` contract and portable `mcp.json`.

## [0.1.0] - 2026-09-11

### Added

- Initial marketplace package with skills, and MCP server configuration: Engineer Svelte 5 and SvelteKit with official MCP-backed guidance.
