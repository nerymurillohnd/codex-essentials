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
- Add reusable references, templates, examples, domain procedures, validation,
  and delivery gates for prompt authoring, audits, and execution planning.
- Add conditional `/goal` guidance for long-running Codex tasks that support
  persistent goals.
- Register Prompt Architect in the marketplace catalog and root README.

### Changed

- Refine the bundled skill frontmatter description to improve implicit
  invocation precision for prompt authoring and audits.
- Package the skill's references, templates, examples, source canon, and
  pressure scenarios inside `skills/prompt-architect/` so its workflow remains
  reproducible from an installed plugin.
- Align package documentation with the current self-contained skill layout,
  permissions, installation behavior, and verification commands.
