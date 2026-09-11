# Prettier and Markdownlint After Edit Design

**Status:** Superseded

**Date:** 2026-08-31

**Repository revision inspected:** `a1be47d4af1767e634401d9a83d119352e14fcba`

**Affected product:** `plugins/prettier-after-edit`

**Superseded by:**
[`2026-09-03-prettier-after-edit-only-design.md`](2026-09-03-prettier-after-edit-only-design.md)

> Historical note: this specification described a combined Prettier and
> markdownlint-cli2 edit hook. It is no longer the active product direction for
> `plugins/prettier-after-edit`. The current approved design is Prettier-only;
> Markdownlint remains a repository-owned quality control outside this plugin
> runtime.

## Context

The current `prettier-after-edit` plugin runs Prettier for files reported by
Codex `PostToolUse` edit events. Its Bash hook treats any successful Prettier
process as proof that a file was formatted, suppresses formatter output, and has
no Markdown linting phase. A successful formatter invocation can therefore
produce a misleading `formatted` message when no bytes changed.

The repository now has project-local Prettier `3.9.6`, markdownlint-cli2
`0.23.2`, and markdownlint `0.41.1`. Node.js `24.20.0` satisfies the
markdownlint-cli2 requirement of Node.js `>=22`. The VS Code markdownlint
extension uses the same markdownlint-cli2 and markdownlint versions, so the CLI,
editor, hook, and CI can share one policy without version drift.

The approved design keeps one plugin and one ordered hook. Prettier owns
mechanical formatting for every supported edited file. markdownlint-cli2 owns
Markdown structure and policy after Prettier. The hook owns only routing,
process execution, exact-file containment, and truthful status reporting.

## Goals

- Format only files reported by supported Codex edit events.
- Report `formatted` only when Prettier changes file bytes.
- Report `unchanged`, `skipped`, and `failed` distinctly.
- Run markdownlint-cli2 only for explicitly reported `.md` and `.markdown`
  files in projects that provide a markdownlint configuration.
- Apply markdownlint automatic fixes after Prettier and report remaining
  non-fixable violations without hiding diagnostics.
- Use the same Prettier and markdownlint policies in the hook, CLI, lint-staged,
  VS Code, and repository quality gate.
- Prefer project-local tools and retain the existing documented PATH fallback.
- Keep every installed-plugin runtime resource inside
  `plugins/prettier-after-edit`.
- Preserve the plugin identifier `prettier-after-edit` while making the expanded
  capability explicit in display metadata and product documentation.

## Non-goals

- Do not implement markdownlint as a Prettier plugin.
- Do not run Prettier through ESLint or add `eslint-plugin-markdownlint`.
- Do not split formatting and linting into separate Codex plugins whose
  cross-plugin hook order is not documented.
- Do not lint the entire repository after a single-file edit.
- Do not install Prettier or markdownlint-cli2 from the hook.
- Do not package root `node_modules`, repository scripts, or root configuration
  files as plugin runtime dependencies.
- Do not promise that stock markdownlint detects every possible unmatched
  Markdown delimiter.
- Do not add a custom unmatched-emphasis rule in this change.
- Do not weaken repository gates, lint rules, or coverage thresholds to obtain a
  green result.

## Source Baseline

The design was checked on 2026-08-31 against:

- [Prettier CLI](https://prettier.io/docs/cli)
- [Prettier API](https://prettier.io/docs/api)
- [Prettier options](https://prettier.io/docs/options.html)
- [Prettier plugin API](https://prettier.io/docs/plugins)
- [Prettier rationale](https://prettier.io/docs/rationale#empty-lines)
- [Prettier linter integration](https://prettier.io/docs/integrating-with-linters)
- [prettier-vscode](https://github.com/prettier/prettier-vscode)
- [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2)
- [markdownlint configuration v0.41.1](https://github.com/DavidAnson/markdownlint/blob/v0.41.1/README.md#configuration)
- [markdownlint Prettier compatibility](https://github.com/DavidAnson/markdownlint/blob/v0.41.1/doc/Prettier.md)
- [vscode-markdownlint](https://github.com/DavidAnson/vscode-markdownlint)
- [OpenAI release notes](https://openai.com/products/release-notes/)

The OpenAI release notes contained no published change to `PostToolUse` ordering
in the preceding 30 days. The design therefore does not rely on ordering between
different plugins.

## Responsibility Boundaries

| Component             | Owns                                                                                            | Must not own                                                             |
| --------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Prettier              | Parsing and canonical printing of supported edited files                                        | Markdown document policy or semantic repair                              |
| markdownlint          | Markdown structure, consistency, diagnostics, and rule-provided fixes                           | Formatting rules disabled by the official Prettier compatibility profile |
| Hook orchestrator     | Payload parsing, target containment, tool resolution, ordered invocation, hashing, and statuses | Repository-wide discovery or embedded style policy                       |
| Project configuration | Formatting options, lint rules, ignores, and narrow exceptions                                  | Machine-global assumptions                                               |
| Repository gates      | Whole-repository read-only validation                                                           | Silent correction                                                        |
| VS Code               | Local feedback and explicit save-time actions                                                   | Duplicate Prettier or markdownlint policy                                |

## Repository Configuration

### Prettier

`prettier.config.cjs` remains the only Prettier option source. The hook, CLI,
lint-staged, and VS Code must discover it normally. No Prettier options are
duplicated in hook arguments or VS Code settings.

`.prettierignore` remains specific to Prettier. It is not reused as the
markdownlint ignore source because the tools have different file scopes and
ignore semantics.

### markdownlint Rule and Execution Policy

Create one `.markdownlint-cli2.jsonc` for rule policy, discovery, ignores, and
file-type overrides:

```jsonc
{
  "$schema": "https://raw.githubusercontent.com/DavidAnson/markdownlint-cli2/v0.23.2/schema/markdownlint-cli2-config-schema.json",
  "config": {
    "extends": "markdownlint/style/prettier",
    "MD024": {
      "siblings_only": true,
    },
    "MD033": {
      "allowed_elements": ["br", "details", "summary"],
    },
  },
  "globs": ["**/*.md", "**/*.markdown"],
  "gitignore": true,
  "overrides": [
    {
      "filter": ["**/LICENSE.md", "templates/LICENSE-reusable-template.md"],
      "combine": "merge",
      "config": {
        "MD036": false,
      },
    },
    {
      "filter": ["docs/decisions/adr-template.md", "templates/adr-template.md"],
      "combine": "merge",
      "config": {
        "MD026": false,
        "MD041": false,
      },
    },
  ],
}
```

The single-file model is required by markdownlint-cli2 `0.23.2`: when a
separate `.markdownlint.jsonc` exists, its `markdownlintConfig` takes precedence
over the per-file override `config` objects calculated from
`.markdownlint-cli2.jsonc`. Consolidation ensures base rules and overrides reach
the same lint invocation. The file is supported directly by markdownlint-cli2
and vscode-markdownlint.

The compatibility profile disables markdownlint rules that overlap with
Prettier, including line length, whitespace, heading spacing, list spacing,
emphasis style, and strong style. Rules such as single H1, link validity, table
column count, and descriptive link text remain markdownlint responsibilities.

`MD024.siblings_only` permits repeated changelog section names under different
version headings while still rejecting duplicate sibling headings. `MD033`
allows only HTML elements observed as intentional repository syntax. Placeholder
text such as `<plugin-id>` and `<semver>` must be corrected to code spans rather
than allowlisted as HTML.

The root CLI and CI commands use the configured `globs`. The edit hook passes
`--no-globs` and one literal path prefixed with `:` so an edit never expands to
repository-wide linting. `.markdownlintignore` is not created because
markdownlint-cli2 does not support it.

## Hook Architecture

### Package and Runtime

Keep the plugin identifier `prettier-after-edit`, bump its manifest version from
`0.1.1` to `0.2.0`, and change its display name to
`Prettier + Markdownlint After Edit`.

Replace `hooks/prettier-format.sh` with a self-contained Node ESM entrypoint:

```text
plugins/prettier-after-edit/hooks/format-and-lint.mjs
```

Node is justified for this hook because the accepted design already requires
Node-backed Prettier and markdownlint-cli2, the input is structured JSON, and the
runtime must safely orchestrate subprocesses and paths without shell quoting.
The implementation must have no third-party imports.

`hooks/hooks.json` continues matching:

```text
apply_patch|Write|Edit|MultiEdit
```

Its command becomes:

```text
node "${PLUGIN_ROOT}/hooks/format-and-lint.mjs"
```

The hook timeout becomes 60 seconds. Each child process receives a 20-second
timeout so one stalled tool cannot consume the entire hook budget.

### Payload Contract

The orchestrator reads one JSON document from standard input and collects:

- `tool_response.filePath`
- `tool_input.file_path`
- `tool_input.path`
- `tool_input.file`
- every `*** Add File:` and `*** Update File:` directive from a string
  `tool_input` or `tool_input.command`

Candidates are deduplicated in first-seen order.

For every candidate, the orchestrator:

1. Resolves relative paths against payload `cwd`.
2. Canonicalizes `cwd` and the existing target.
3. Skips missing files, directories, and targets resolving outside `cwd`.
4. Processes only the exact canonical target.

### Tool Resolution

For each target and tool name:

1. Search upward from the target directory for an executable under
   `node_modules/.bin`.
2. Stop at the canonical event `cwd`; do not escape the authorized project.
3. Fall back to an executable of the same name on `PATH`.
4. Skip with an actionable message when no executable is available.

The hook never invokes `npm install`, `npx`, Yarn, pnpm, Corepack, or a network
operation.

### Prettier Phase

For every existing contained file:

1. Run `prettier --file-info <relative-path>` from event `cwd`.
2. Parse the returned JSON.
3. Skip when `ignored` is true or `inferredParser` is null.
4. Hash the file with SHA-256.
5. Run `prettier --write --ignore-unknown -- <relative-path>`.
6. Hash the file again.
7. Report `formatted` only when the hashes differ.
8. Report `unchanged` when Prettier succeeds without a byte change.
9. Preserve Prettier stderr and report `failed` on a non-zero result.

### markdownlint Phase

Run this phase only when all conditions are true:

- The target extension is `.md` or `.markdown`, case-insensitively.
- A recognized `.markdownlint*` or `.markdownlint-cli2*` configuration exists
  between `cwd` and the target directory.
- markdownlint-cli2 resolves locally or on `PATH`.

The exact invocation from event `cwd` is:

```text
markdownlint-cli2 --fix --no-globs :relative/path.md
```

Hash the file before and after the invocation. Interpret results as:

- Exit `0`, hash unchanged: `clean`.
- Exit `0`, hash changed: `fixed`.
- Exit `1`, hash unchanged: `issues remain`.
- Exit `1`, hash changed: `fixed; issues remain`.
- Exit `2` or process failure: `failed`.

The hook includes remaining markdownlint diagnostics in its system message. It
does not suppress stdout or stderr.

### Status Contract

Emit one JSON `systemMessage` per processed file with both phase results. Example:

```json
{
  "systemMessage": "prettier-after-edit: README.md; prettier=unchanged; markdownlint=issues remain (README.md:181 MD025/single-title)"
}
```

Normal skip, unchanged, formatted, fixed, and remaining-issue outcomes exit the
hook with status `0` because `PostToolUse` occurs after the edit. Payload parsing
or child-process failures are surfaced explicitly in `systemMessage` and also
exit `0` so Codex does not misrepresent the already-completed edit as rolled
back. Repository CLI and CI checks retain their native non-zero behavior.

## Repository Workflow Integration

Pin `markdownlint-cli2` exactly to `0.23.2` in `devDependencies`.

Add scripts:

```json
{
  "lint:markdown": "markdownlint-cli2",
  "lint:markdown:fix": "markdownlint-cli2 --fix"
}
```

Add `npm run lint:markdown` to `npm run check` after `npm run format:check` and
before typechecking. CI remains read-only because it never calls
`lint:markdown:fix`.

Split lint-staged Markdown handling from other Prettier files:

```json
{
  "*.{ts,tsx,mts,cts,json,jsonc,yaml,yml}": ["prettier --write"],
  "*.{md,markdown}": [
    "prettier --write",
    "markdownlint-cli2 --fix --no-globs --"
  ]
}
```

lint-staged supplies the exact staged paths after `--`. `--no-globs` prevents
configured repository globs from widening that scope.

## VS Code Integration

Recommend both extensions:

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "DavidAnson.vscode-markdownlint"
  ]
}
```

Retain `prettier.requireConfig: true`,
`prettier.resolveGlobalModules: false`, and Prettier as the Markdown default
formatter. Do not add the deprecated `markdownlint.config` setting.

For explicit saves, configure ordered code actions under `[markdown]`:

```jsonc
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.prettier": "explicit",
    "source.fixAll.markdownlint": "explicit",
  },
}
```

The checked-in `.markdownlint-cli2.jsonc` remains the editor policy source.

## Baseline Remediation

A read-only baseline using markdownlint `style/prettier` found 115 issues in 25
of 82 Markdown files. The implementation must not activate the repository gate
until the accepted policy produces zero errors.

Intentional constructs receive narrow policy:

- `details`, `summary`, and `br` are allowed HTML.
- Repeated changelog headings are allowed only under different parents.
- License emphasis is excluded from `MD036` only in license documents.
- ADR templates are excluded from `MD026` and `MD041` only where introductory
  comments deliberately precede template front matter and cause the generic
  Markdown parser to interpret front-matter fields as heading content.

All other findings are corrected at their source, including broken link
fragments, bare URLs, placeholder angle-bracket text, unlabeled fences, invalid
heading punctuation, and real duplicate headings.

The deliberate root README test content is not product documentation. Its table
serves as a behavioral fixture in the hook test suite; the extra H1 and table are
removed from the root README during implementation.

## Package Synchronization

The behavioral change requires synchronized updates to:

- `plugins/prettier-after-edit/.codex-plugin/plugin.json`
- `plugins/prettier-after-edit/hooks/hooks.json`
- `plugins/prettier-after-edit/hooks/format-and-lint.mjs`
- `plugins/prettier-after-edit/skills/prettier-after-edit/SKILL.md`
- `plugins/prettier-after-edit/skills/prettier-after-edit/agents/openai.yaml`
- `plugins/prettier-after-edit/README.md`
- `plugins/prettier-after-edit/CHANGELOG.md`
- `.agents/plugins/marketplace.json`, generated from the manifest

The old Bash hook is removed after the new entrypoint passes its behavioral
contract. No generated marketplace file is edited by hand.

## Security and Failure Boundaries

- Treat all payload paths as untrusted input.
- Never interpolate file paths into a shell command.
- Use argument arrays and `shell: false` for child processes.
- Reject targets resolving outside event `cwd`, including symlink escapes.
- Do not follow directory targets.
- Do not read `.env`, `.dev.vars`, credentials, or secret values.
- Do not use network access at hook runtime.
- Keep diagnostics bounded before embedding them in `systemMessage` while
  retaining the first actionable error and total count.
- A failure in one file does not prevent reporting outcomes for other event
  targets.

## Acceptance Criteria

1. An unformatted Markdown table is rewritten by Prettier and reports
   `prettier=formatted`.
2. A second run over the formatted table reports `prettier=unchanged`.
3. A second H1 is left unchanged by Prettier and reported by markdownlint as
   `MD025/single-title`.
4. A fixable markdownlint violation changes the file and reports
   `markdownlint=fixed`.
5. A non-fixable violation emits the exact diagnostic and reports
   `markdownlint=issues remain`.
6. An ignored or unsupported file is not modified and reports `skipped`.
7. A Markdown file without project markdownlint configuration is formatted by
   Prettier and reports `markdownlint=skipped; no project configuration`.
8. Missing tools, invalid payloads, missing targets, and tool timeouts produce
   explicit non-success statuses.
9. Paths containing spaces and multi-file apply patches process only reported
   files.
10. Absolute paths and symlinks escaping event `cwd` are rejected.
11. The hook never expands configuration globs for an edit event.
12. CLI, lint-staged, VS Code, and CI consume the same configuration files.
13. `npm run lint:markdown`, `npm run check`, plugin validation, marketplace
    validation, and the documentation gate pass.
14. The plugin archive remains self-contained and declares its actual runtime
    requirements and side effects.

## Delivery Boundary

This specification and its implementation plan do not authorize a commit,
push, pull request, merge, release, tag, publication, or remote cleanup. Those
operations require separate explicit authorization.
