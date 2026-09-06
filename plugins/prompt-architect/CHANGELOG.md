# Changelog

All notable changes to Prompt Architect are documented in this file.

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Use ISO 8601
dates (`YYYY-MM-DD`) and keep entries concise, user-facing, and actionable.

## [Unreleased]

### Added

- Add the Prompt Architect marketplace plugin and its self-contained,
  risk-calibrated prompt-authoring skill.
- Add Codex-facing skill metadata in `agents/openai.yaml` for consistent
  display and invocation.
- Add reusable references, packaged templates, examples, domain procedures,
  validation, and delivery gates for prompt authoring, audits, and execution
  planning.
- Add conditional `/goal` guidance for long-running Codex tasks that support
  persistent goals.
- Add a packaged `Stop` hook and deterministic final-output validator for Prompt
  Architect delivery checks.
- Register Prompt Architect in the marketplace catalog and root README.

### Changed

- Normalized the README navigation, heading style, backlink, and plugin version
  source statement to match the current plugin README convention.
- Refactor `SKILL.md` from a broad mandatory-read sequence into a progressive
  support-file router with explicit inputs, non-inference rules, ask/stop/decline
  behavior, and verifiable success criteria.
- Refine the bundled skill frontmatter description to improve implicit
  invocation precision for prompt authoring and audits.
- Align Codex-facing skill metadata with the package's risk-calibrated prompt
  contract.
- Package the skill's references, templates, examples, and pressure scenarios
  inside `skills/prompt-architect/` so its workflow remains reproducible from an
  installed plugin.
- Move prompt templates to `assets/templates/` and calibration plus pressure
  scenarios to `references/examples/` so support files match OpenAI's skill
  resource guidance.
- Align package documentation with the current self-contained skill layout,
  permissions, installation behavior, and verification commands.
- Distill the full prompt-authoring canon into modular runtime references for
  core sections, tool use, deviation reporting, final reporting, assembly,
  quality checks, and common prompt failures.
- Make the skill workflow boundary explicit in `SKILL.md`, including expected
  inputs, required output, non-inferable facts, stop conditions, and supporting
  file authority.
- Replace the linear workflow list with conditional routing that keeps required
  gates explicit without forcing every reference into context by default.
- Tighten the final-output validator so malformed `Ready` or
  `Needs Clarification` outputs cannot pass merely because required prompt
  sections are absent.

### Removed

- Remove the stale packaged `skills/prompt-architect/scripts/validate_skill.py`
  migration helper from the distributed skill package.
- Remove the stale migration source document from the distributed plugin after
  backing it up outside the package.
- Remove the redundant skill-level README so installed runtime guidance lives in
  `SKILL.md`, references, templates, examples, and the package README.
