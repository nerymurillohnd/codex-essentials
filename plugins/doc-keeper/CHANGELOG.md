# Changelog

All notable changes to DocKeeper will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-08-28

### Added

- Added the `doc-keeper` skill with create, complete, audit, update, and repair
  modes.
- Added a changelog maintenance reference and default output example with
  evidence rules, release rollover, special cases, automation boundaries,
  validation, and recovery procedures.
- Added a MADR-based ADR maintenance reference and default output example with
  decision lifecycle, supersession, categorized-directory, validation, and
  recovery procedures.
- Added explicit safeguards against invented history, confidential disclosure,
  unauthorized local scope expansion, and unauthorized remote mutations.
- Added Codex presentation metadata and complete installation, removal,
  extension, source attribution, and failure-recovery documentation.

### Changed

- Refined skill routing for curated release history, mixed requests, ambiguous
  document types, release rollover, and audit-only completion reports.
- Strengthened changelog maintenance for completion, established local formats,
  uncertain SemVer, comparison links, independently versioned monorepos, yanked
  releases, and evidence classification.
- Strengthened ADR maintenance for completion, default identity and location,
  categorized directories, established status vocabularies, status transitions,
  changed accepted decisions, and bidirectional supersession.
- Separated operating procedures from the example files that define default
  output shape when no local convention exists.
- Added implicit companion closeout for notable implementation changes and
  explicit durable architectural decisions without a blanket lifecycle hook.
- Added changelog preflight for authorized release workflows while keeping tags,
  publication, and remote state outside DocKeeper.
- Defined explicit user declarations as primary decision evidence within the
  user's authority, without inventing unstated rationale or approvals.
- Made infrastructure-first integration explicit: use or wire native Codex,
  GitHub, release, and ADR mechanisms; add custom automation only for a proven
  gap.
- Prevented manual simulation of version files, release manifests, changelogs,
  Release PR state, tags, or publication when their configured owner is
  unavailable or prohibited.
