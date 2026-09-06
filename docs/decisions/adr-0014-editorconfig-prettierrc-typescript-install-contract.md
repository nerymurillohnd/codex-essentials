---
status: accepted
date: 2026-09-05
decision-makers: Nery Samuel Murillo
consulted: Codex
informed: Repository contributors
---

# Align editor formatting and preserve the TypeScript wrapper install contract

## Context and Problem Statement

The repository moved its formatter configuration from the historical
`prettier.config.cjs` contract to `.prettierrc.json` and added a root
`.editorconfig`. During validation, `.prettierrc.json` contained CommonJS
syntax under a JSON filename, so Prettier aborted before formatting generated
marketplace data.

The same maintenance pass exposed a second failure mode: running
`npm install typescript --save-dev` replaces the repository's `typescript`
alias with the regular TypeScript package. That removes the `tsc6` binary
required by the established TypeScript 7 and TypeScript 6 side-by-side layout.

How should the repository make editor formatting explicit while preserving the
existing TypeScript compiler split?

## Decision Drivers

- Keep Prettier configuration parseable by Prettier and JSON-aware editors.
- Keep editor defaults aligned with the repository's formatting gate.
- Preserve the accepted TypeScript 7 and TypeScript 6 side-by-side contract.
- Avoid treating Visual Studio extensions as npm dependencies for this Node.js
  repository.
- Keep the generated marketplace catalog under the existing build and
  validation controls.

## Considered Options

- Restore `prettier.config.cjs` as the only Prettier configuration file.
- Keep `.prettierrc.json` as the Prettier source and add `.editorconfig`.
- Use the regular `typescript` npm package as a dev dependency.
- Install the Visual Studio TypeScript extension as a repository dependency.

## Decision Outcome

Chosen option: "Keep `.prettierrc.json` as the Prettier source and add
`.editorconfig`" because it gives editors schema-backed JSON configuration and
shared baseline whitespace settings without changing the TypeScript compiler
contract.

The repository adopts the following current contract:

- [`.prettierrc.json`](../../.prettierrc.json) is JSON only. It may include the
  SchemaStore `$schema` URL, but must not contain JavaScript or CommonJS syntax.
- [`.editorconfig`](../../.editorconfig) lives at the repository root with
  `root = true`, UTF-8, LF line endings, final newlines, two-space indentation,
  and 80-column line length.
- Prettier remains the formatter enforced by `npm run format:check` and the
  broader `npm run check` quality gate.
- [`.agents/plugins/marketplace.json`](../../.agents/plugins/marketplace.json)
  remains generated marketplace output and must not be hand-edited.
- `@typescript/native` remains the repository's TypeScript 7 command-line
  compiler source.
- The package name `typescript` remains aliased to
  `npm:@typescript/typescript6@^6.0.2` so `npx tsc6` and
  `require("typescript")` keep resolving to the TypeScript 6 compatibility
  toolchain.
- Do not run `npm install typescript --save-dev` in this repository. It
  replaces the alias with the regular TypeScript package and breaks
  `npm run check`.
- The Visual Studio Marketplace TypeScript extension is not a repository npm
  dependency. It is for Visual Studio and MSBuild-oriented workflows, not this
  Node.js package contract.

This supersedes only the configuration-file-path portion of
[ADR-0013](adr-0013-prettier-formatting-contract.md). The broader formatting
principles from ADR-0013 still apply where they do not conflict with this
record.

### Consequences

- Good, because Prettier can parse its configuration and editor tooling can
  validate it as JSON.
- Good, because editors that support EditorConfig apply repository whitespace
  conventions before Prettier runs.
- Good, because the TypeScript 7 CLI and TypeScript 6 compatibility API remain
  available side by side.
- Trade-off, because `.prettierrc.json` can no longer participate in CommonJS
  diagnostics the way `prettier.config.cjs` did.
- Trade-off, because generic TypeScript installation guidance must be filtered
  through this repository's accepted alias contract.

### Confirmation

The current implementation was verified at repository revision
`c6aebd6` on 2026-09-05 with:

```text
npx prettier --find-config-path .agents/plugins/marketplace.json
-> .prettierrc.json

npx tsc --version
-> Version 7.0.2

npx tsc6 --version
-> Version 6.0.3

node -e "console.log(require('typescript').version)"
-> 6.0.3

npm run check
-> passed formatting, ESLint, Markdownlint, TypeScript checks, 84 tests,
   GitHub label validation, plugin validation, and marketplace validation.
```

`npm install-scripts ls` still reports
`simple-git-hooks@2.14.0 (postinstall: node ./postinstall.js)` as blocked by
`allowScripts`. That was not required for this decision and must be approved or
denied separately under the repository's install-script controls.

## Pros and Cons of the Options

### Restore `prettier.config.cjs`

- Good, because it matches the historical ADR-0013 implementation.
- Bad, because the current repository has already moved to `.prettierrc.json`
  and editor schema validation is useful for this configuration.

### Keep `.prettierrc.json` and add `.editorconfig`

- Good, because it matches the current implemented state and keeps Prettier
  parseable.
- Good, because the SchemaStore URL is metadata for validation, not a
  replacement for the Prettier option object.
- Neutral, because Prettier still overrides EditorConfig where an explicit
  Prettier option is present.

### Use regular `typescript` as a dev dependency

- Good, because it matches generic TypeScript npm installation guidance.
- Bad, because this repository already uses `@typescript/native` for the
  TypeScript 7 CLI.
- Bad, because replacing the `typescript` alias removes `tsc6` and breaks the
  repository quality gate.

### Install the Visual Studio TypeScript extension

- Good, for Visual Studio or MSBuild project types that need that extension.
- Bad, because it does not define this repository's npm lockfile or Codex/CLI
  TypeScript behavior.

## More Information

- [Preserve the TypeScript 6 wrapper alias at 6.0.2](adr-0003-typescript6-wrapper-version.md)
- [TypeScript 7 and TypeScript 6 side-by-side](typescript-side-by-side.md)
- [Establish the repository Prettier formatting contract](adr-0013-prettier-formatting-contract.md)
- [TypeScript download documentation](https://www.typescriptlang.org/download/)
- [TypeScript 5.9.3 for Visual Studio Marketplace extension](https://marketplace.visualstudio.com/items?itemName=TypeScriptTeam.typescript-593)
