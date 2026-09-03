# Prettier After Edit Only Design

**Status:** Approved

**Date:** 2026-09-03

**Repository revision inspected:** `47b68f00411b6f8697377869839034c9a0174bb4`

**Affected product:** `plugins/prettier-after-edit`

**Supersedes:**
[`2026-08-31-prettier-markdownlint-after-edit-design.md`](2026-08-31-prettier-markdownlint-after-edit-design.md)

## Context

The `prettier-after-edit` plugin previously expanded from exact-file Prettier
formatting into a combined Prettier and markdownlint-cli2 `PostToolUse` hook.
That integration created a policy collision: the plugin became responsible for
Markdown linting behavior that should remain under each target repository's own
scripts, editor configuration, hooks, or CI.

The approved operating model is now narrower. The plugin formats edited files
with Prettier only. Markdownlint remains a separate repository-level quality
control and must not run implicitly from this plugin's edit hook.

## Decision

Keep the plugin identifier `prettier-after-edit`, but make the product behavior
and documentation Prettier-only:

- the hook runs Prettier for exact files reported by supported Codex edit events;
- the hook does not discover, invoke, fix, or report markdownlint-cli2;
- Markdownlint guidance stays outside the plugin runtime contract;
- plugin metadata, README, changelog, skill instructions, agent metadata, tests,
  and marketplace catalog must describe only the Prettier behavior.

## Runtime Contract

For every existing file contained by the event `cwd`, the hook:

1. resolves a project-local `prettier` executable first and then falls back to
   `PATH`;
2. runs `prettier --file-info <relative-path>` from the event `cwd`;
3. skips files that Prettier ignores or cannot parse;
4. hashes the file before and after formatting;
5. runs `prettier --write --ignore-unknown -- <relative-path>`;
6. reports `formatted` only when bytes changed;
7. reports `unchanged`, `skipped`, or `failed` distinctly.

The hook must not invoke package managers, install dependencies, run network
operations, or expand from an edit event into repository-wide formatting.

## Markdownlint Boundary

markdownlint-cli2 is intentionally out of scope for this plugin runtime.
Repositories that require Markdown linting should configure it in their own
quality controls, such as:

- repository scripts;
- lint-staged;
- editor integrations;
- CI checks;
- separate hooks explicitly owned by that repository.

This separation keeps Prettier responsible for mechanical formatting and keeps
Markdown policy enforcement where the repository owns its rule set, exceptions,
and failure semantics.

## Acceptance Criteria

1. An unformatted supported file is rewritten by Prettier and reports
   `prettier=formatted`.
2. A second run over the formatted file reports `prettier=unchanged`.
3. Ignored, unsupported, missing, directory, and out-of-scope targets are not
   modified and report explicit skip states.
4. Missing Prettier, invalid payloads, and Prettier failures produce explicit
   diagnostics.
5. Markdown files are formatted by Prettier when supported, but no status message
   contains `markdownlint=`.
6. Plugin metadata, README, changelog, skill instructions, agent metadata, tests,
   and root marketplace documentation contain no active claim that this plugin
   runs markdownlint-cli2.
7. Repository-level Markdownlint checks may remain as independent quality gates
   for this repository.

## Consequences

- The plugin is simpler and has a narrower side-effect surface.
- Target repositories retain full control over Markdown linting policy and
  failure behavior.
- Existing documentation that described the combined Prettier and Markdownlint
  hook is historical only and must not be used as the current implementation
  plan.
