# Changelog

All notable changes to Live Research are documented in this file.

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Use ISO 8601
dates (`YYYY-MM-DD`) and keep entries concise, user-facing, and actionable.

## [Unreleased]

### Changed

- Refined the bundled skill frontmatter description to focus implicit
  invocation on time-sensitive and change-sensitive facts.

### Added

- Package the Live Research skill as a self-contained Codex marketplace plugin
  with schema-valid agent metadata and installation documentation.
- Prefer callable specialized MCPs, plugins, apps, and standalone skills before
  generic retrieval, while preserving an independent fallback and verification
  workflow.
- Restore the explicit completion checklist in the primary skill document so
  evidence, source, conflict, and uncertainty controls remain visible at closeout.
- Consolidate the complete evidence, grounding, citation, and checklist protocol
  into one self-contained `SKILL.md` for portable community distribution.
