# TypeScript Pro

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[← Back to Codex Essentials](../../README.md)

> Senior-grade TypeScript work that proves types at runtime boundaries instead
> of asserting them.

**Explore:** [Install](#quick-start) · [Purpose](#purpose) ·
[Safety](#behavior-and-boundaries) · [Verification](#verification)

TypeScript Pro is a Codex plugin for reading, writing, refactoring, reviewing,
and debugging TypeScript and TSX. It strengthens correctness with minimal,
behavior-preserving changes; it does not treat type annotations as a substitute
for runtime validation, authorization, or server-side pricing checks.

## Quick start

Add the marketplace and install the plugin:

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add typescript-pro@codex-essentials
codex plugin list
```

Then, from the target project, ask Codex:

```text
Use $typescript-pro to review the checkout API's TypeScript trust boundaries. Do not change runtime behavior unless a fix is necessary.
```

## Use cases

| Scenario                        | How this plugin helps                                                       | Expected result                                               |
| ------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Unclear `as` or `any` usage     | Distinguishes proved types from assertions and finds the validation point.  | Narrow, justified interop boundaries or runtime parsers.      |
| Fragile state objects           | Identifies impossible combinations.                                         | Discriminated unions and exhaustive handling where justified. |
| TypeScript configuration change | Inspects the runtime, framework, module system, and compiler version first. | Compatible strictness proposal with rationale.                |
| Client-submitted order values   | Separates security from typing concerns.                                    | Server-side recomputation and domain validation.              |

**Not a fit when:** the requested change is unrelated to TypeScript, TSX,
configuration, type boundaries, or type-related build failures.

## Purpose

- Treat TypeScript as a correctness layer without changing behavior by default.
- Validate external data before conversion into domain types.
- Surface security findings separately from ordinary type-safety findings.

## Included components

| Component                                                                                      | Purpose                                                                                      |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [plugin.json](plugin.json)                                                                     | Portable plugin identity, version, and capability metadata.                                  |
| [skills/typescript-pro/SKILL.md](skills/typescript-pro/SKILL.md)                               | Authoritative TypeScript workflow and review rules.                                          |
| [skills/typescript-pro/agents/openai.yaml](skills/typescript-pro/agents/openai.yaml)           | Codex-facing label and invocation metadata.                                                  |
| [boundary and state patterns](skills/typescript-pro/references/boundary-and-state-patterns.md) | Optional worked patterns for runtime parsing, state reducers, and internal event registries. |
| [CHANGELOG.md](CHANGELOG.md)                                                                   | User-facing change history.                                                                  |
| [LICENSE.md](LICENSE.md)                                                                       | License terms.                                                                               |

## Requirements and compatibility

| Requirement   | Supported value or behavior                                                                                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Codex surface | Codex CLI and supported ChatGPT/Codex plugin surfaces.                                                                                                                           |
| Project types | TypeScript, TSX, JavaScript projects with TypeScript configuration, including Node and browser frameworks.                                                                       |
| Runtime/tools | The target project's declared package manager, runtime, TypeScript version, scripts, and test runner.                                                                            |
| Credentials   | None required by this plugin.                                                                                                                                                    |
| Network       | Not required for normal local work; official documentation may be read when current framework or TypeScript behavior matters.                                                    |
| Last verified | `2026-09-12` against [official Codex skill documentation](https://learn.chatgpt.com/docs/build-skills) and [plugin documentation](https://learn.chatgpt.com/docs/build-plugins). |

The installed project's lockfile, TypeScript version, framework documentation,
and runtime constraints take precedence over examples in this package.

## Behavior and boundaries

### Inputs and outputs

**Inputs:** the user request; target-project manifest, lockfile, TypeScript and
framework configuration, scripts, tests, and relevant source.
**Outputs:** complete edited code when feasible; a configuration rationale;
trust-boundary, security, and typing findings; validation evidence; and explicit
remaining risks or migration debt.

### Permissions

| Access or effect | What this plugin may do                                                                 |
| ---------------- | --------------------------------------------------------------------------------------- |
| Read             | Inspect the requested TypeScript project's configuration, scripts, and relevant source. |
| Write            | Make only the smallest safe, user-requested change in the target project.               |
| Process          | Run existing project-local typecheck, test, lint, and build commands when available.    |
| Network          | Read official documentation only when current compatibility information is material.    |
| Authentication   | Not required.                                                                           |

### Side effects and approvals

Installing the plugin changes only Codex-managed plugin state and cache. It
does not modify a target project. When a TypeScript request authorizes a change,
the skill preserves runtime behavior unless the requested or necessary fix
changes it. It does not bypass tests, hooks, signatures, branch protection, or
other controls.

Configuration changes, dependency changes, broad migration steps, and any
security-sensitive correction must be scoped to the target project and explained
with their compatibility and behavior implications.

## Uninstall and rollback

Refresh the marketplace only after its source has moved to an approved newer
release:

```bash
codex plugin marketplace upgrade codex-essentials
codex plugin list
```

Remove only this plugin:

```bash
codex plugin remove typescript-pro@codex-essentials
```

Uninstalling removes only Codex-managed plugin state and cache. It does not
revert target-project changes; recover those through the target repository's Git
history and normal review process.

## Verification

Maintainers run the marketplace gate from this repository:

```bash
npm run check
```

After installation, start a new Codex session and perform a representative
review:

```text
Use $typescript-pro to inspect this repository's tsconfig and one external-data boundary. Report findings without changing files.
```

## Known limitations

- TypeScript cannot prove unvalidated runtime facts; the skill requires a parser,
  guard, controlled construction, or documented framework contract at those
  boundaries.
- Enabling strict compiler options in an existing repository can expose
  substantial migration debt; the skill stages the work rather than suppressing
  it globally.
- Type-level constraints do not replace authentication, authorization, inventory,
  pricing, or other runtime controls.
- The optional advanced-pattern reference is intentionally narrow. It is not a
  reason to add generic builders, recursive utility types, or typed event
  infrastructure without a demonstrated design need.

## Failure and recovery

If the target project's TypeScript version, module system, framework constraints,
or validation command is unavailable, the skill reports the missing prerequisite
and recommends the exact next validation command. It does not invent
compatibility or silence diagnostics to claim completion.

## FAQ

<details>
<summary>Does installing this plugin modify the target project?</summary>

No. Installation changes only Codex-managed plugin state and cache. Target files
change only while completing a scoped TypeScript request.
</details>

<details>
<summary>Does it turn on every strict TypeScript option automatically?</summary>

No. It first identifies the TypeScript version, runtime, framework, module
system, generated types, and existing migration debt, then recommends only
compatible options.
</details>

<details>
<summary>Does a TypeScript type validate API or client data?</summary>

No. The skill treats external data as `unknown` until a runtime parser or
controlled construction proves the domain shape.
</details>

## Documentation and support

- [Authoritative skill](skills/typescript-pro/SKILL.md)
- [Boundary and state patterns](skills/typescript-pro/references/boundary-and-state-patterns.md)
- [Changelog](CHANGELOG.md)
- [Codex Essentials marketplace](../../README.md)
- [Issues](https://github.com/nerymurillohnd/codex-essentials/issues)
- [License](LICENSE.md)

TypeScript is an independent open-source project. This plugin is not affiliated
with or endorsed by Microsoft or the TypeScript project.
