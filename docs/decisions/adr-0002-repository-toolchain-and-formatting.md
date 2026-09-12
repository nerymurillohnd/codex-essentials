---
status: accepted
date: 2026-09-12
decision-makers: Nery Samuel Murillo, Codex
consulted: Prettier, Ruff, ShellCheck, VS Code, and TypeScript documentation
informed: Repository contributors
---

# Standardize repository toolchain and formatting

## Context and Problem Statement

The repository needs predictable local maintenance tooling for JSON, Markdown,
YAML, Python, shell scripts, TypeScript editor support, and plugin metadata. It
is not a runtime application, but it now has enough validation and maintenance
code to require a small, explicit developer toolchain.

Which toolchain should contributors use for formatting, linting, and editor
parity?

## Decision Drivers

- Keep development setup simple and reproducible.
- Avoid introducing multiple JavaScript package managers.
- Keep Python and shell checks aligned with repo-local configuration.
- Keep editor behavior consistent with CLI gates.

## Considered Options

- Avoid package-managed tooling until a full application exists.
- Use Python-only tooling for all maintenance.
- Use npm for repository JavaScript tooling and standalone Python scripts for
  repository generators.

## Decision Outcome

Chosen option: "Use npm for repo-local JavaScript tooling and standalone Python
scripts for generators" because it fits Prettier, Lefthook, TypeScript editor
support, and dependency locking while keeping marketplace generation portable.

The repo uses Node.js `24.21.0`, npm, Prettier with `printWidth: 100`,
`.editorconfig` with `max_line_length = 100`, Ruff for Python, ShellCheck and
shfmt for shell, and VS Code recommendations/settings for the same stack.

### Consequences

- Good, because contributors get one install path: `npm install`.
- Good, because editor and CLI formatting use the same width.
- Bad, because formatting changes can touch many Markdown and JSON files when
  the width changes.

### Confirmation

Run `npm run format:check`, `npm run ruff:check`,
`npm run shfmt:check`, `npm run shellcheck:check`, and `npm run check`.
