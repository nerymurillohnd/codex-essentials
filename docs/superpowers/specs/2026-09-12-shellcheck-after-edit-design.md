# ShellCheck After Edit Plugin Design

## Status

Approved for specification on 2026-09-12. Implementation requires review and
approval of this specification, followed by an implementation plan.

## Context

Codex Essentials needs a reusable capability that formats and statically
analyzes each reported shell-script edit with shfmt and ShellCheck. The product
must follow the existing `ruff-after-edit` operating model: marketplace
installation exposes guidance and templates only; a consumer-owned hook is
created and wired only after the user requests it, the agent inspects the
target environment, presents the exact proposed change, and receives explicit
approval.

The design review examined the existing `ruff-after-edit` and
`block-no-verify` packages, a prior ShellCheck/shfmt hook implementation, and
the ShellCheck and shfmt upstream manuals. The facts below were verified on
2026-09-12 at repository revision `ac8d27c`:

- Codex supports lifecycle hooks in `hooks.json` and inline `[hooks]` tables in
  `config.toml`.
- ShellCheck `0.11.0` supports configuration discovery and an explicit
  `--rcfile` route.
- shfmt `3.14.1` discovers formatting options through `.editorconfig`; parser
  or printer command-line options disable those options. `--apply-ignore` is
  needed for an explicitly targeted file to honor `ignore = true`.

ShellCheck and shfmt do not have identical configuration mechanisms. A
consumer-owned ShellCheck profile can live under `.codex/` and be selected with
`--rcfile`. A shfmt formatting profile cannot reliably live under `.codex/`,
because shfmt discovers `.editorconfig` from the edited script's path. An
optional bundled shfmt profile therefore requires an approved, project-level
merge into the repository's `.editorconfig`.

## Decision

Create a skills-only marketplace plugin named `shellcheck-after-edit`,
containing one implicitly invocable skill with the same name. The plugin will
not declare a plugin hook component, ship an active `hooks/` package directory,
or modify a consumer during marketplace installation.

The skill applies when a user asks to run ShellCheck or shfmt on shell scripts,
or to create, change, review, test, or troubleshoot a Codex ShellCheck-after-
edit hook. It has three routes:

1. **Intentional command route:** inspect the target project and run the
   selected ShellCheck and/or shfmt command on explicitly requested paths.
2. **Assessment route:** inspect the selected scope, active Codex hook sources,
   tool availability, existing ShellCheck/shfmt configurations, baseline
   diagnostics, and safety boundaries; then present a proposal without writes.
3. **Approved installation route:** only after explicit approval, materialize
   consumer-owned Bash and configuration assets, merge the selected hook
   definition, run the supplied test, and require `/hooks` review and user
   trust.

## Product Boundary

The product has one responsibility: after a supported Codex edit event reports
an existing regular `.sh` or `.bash` file inside the approved scope, the
consumer-owned `PostToolUse` handler runs shfmt and ShellCheck for that file.

The handler must:

1. Parse one hook payload without evaluating any payload text as shell code.
2. Collect only directly reported file paths and never expand a directory,
   glob, repository-wide search, or unreported path.
3. Canonicalize the selected scope and target; reject missing files,
   directories, non-shell extensions, and paths or symlinks resolving outside
   the approved scope.
4. Run `shfmt --apply-ignore -w -- <target>` without parser or printer style
   flags, so the selected project `.editorconfig` remains authoritative.
5. Run ShellCheck after shfmt, using the selected policy route.
6. Exit non-zero with an actionable diagnostic when shfmt or ShellCheck is
   unavailable, times out, cannot process the file, or reports a problem.
7. Exit zero only after both tools successfully complete with no ShellCheck
   findings. An ignored shfmt file is not an error; ShellCheck still runs.

The initial product does not include a `Stop` gate, a commit-time gate,
automatic dependency installation, repository-wide formatting, rollback of
completed edits, or a claim to support Zsh, `.inc`, `.command`, or extensionless
scripts.

## Consumer Scope and Hook Representation

Before installation, the user chooses one scope and one representation:

| Scope       | Consumer-owned handler                          | Hook configuration choices                                         |
| ----------- | ----------------------------------------------- | ------------------------------------------------------------------ |
| Project     | `<repo>/.codex/hooks/shellcheck-after-edit.sh`  | `<repo>/.codex/hooks.json` or inline `<repo>/.codex/config.toml`   |
| User/global | `${HOME}/.codex/hooks/shellcheck-after-edit.sh` | `${HOME}/.codex/hooks.json` or inline `${HOME}/.codex/config.toml` |

Exactly one configuration representation is allowed in the selected scope:
`hooks.json` or inline `config.toml`. The installer must inspect both files
first, preserve unrelated hook groups and handlers, and decline to add a second
representation that would make the handler run twice.

The selected hook is a synchronous `PostToolUse` command handler matching the
supported Codex edit events. Its configuration uses a finite timeout and a
status message. The handler is written in Bash, receives hook JSON through
standard input, and invokes its tools with literal argument arrays or quoted
arguments and `--` before the target path.

## Tool Policy Selection

The user selects a policy route independently for ShellCheck and shfmt. The
skill must never silently change configuration, ignores, excludes, dialects, or
rule severity to produce a passing result.

### ShellCheck routes

| Route                                  | Behavior                                                                                                                                                                                 |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Defaults                               | Run ShellCheck with the approved hook arguments and normal configuration discovery.                                                                                                      |
| Existing/adapted project configuration | Inspect `<repo>/.shellcheckrc` and `<repo>/shellcheckrc`; preserve normal discovery. Any proposed creation or change requires a shown diff and approval.                                 |
| Bundled profile                        | Copy the approved `shellcheckrc` template to a consumer-owned `.codex/shellcheckrc`, then invoke ShellCheck with `--rcfile <approved path>`. This works in either project or user scope. |

The bundled ShellCheck profile is reference material, not a compulsory policy.
It may define `source-path=SCRIPTDIR`, `external-sources=true`, and explicitly
chosen optional checks only after the user selects that profile. The hook may
use `-x` only when it matches the approved route; it must not invent source
paths or suppress unresolved source diagnostics.

### shfmt routes

| Route                                  | Behavior                                                                                                                                                               |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Defaults                               | Run `shfmt --apply-ignore -w -- <target>` with no parser or printer options.                                                                                           |
| Existing/adapted project configuration | Inspect and preserve the repository `.editorconfig`. Any proposal to create or modify it is shown as an exact, project-scoped diff and requires approval.              |
| Bundled profile                        | Offer a focused `.editorconfig` fragment for an approved merge into `<repo>/.editorconfig`. It is project-only and must not overwrite unrelated EditorConfig settings. |

There is deliberately no user/global bundled shfmt profile. A file such as
`${HOME}/.codex/editorconfig-shell` is not found through shfmt's normal
ancestor-based `.editorconfig` lookup for scripts in arbitrary repositories, so
representing it as a global formatting policy would be misleading.

## Plugin Contents

```text
plugins/shellcheck-after-edit/
├── plugin.json
├── README.md
├── CHANGELOG.md
├── LICENSE.md
└── skills/
    └── shellcheck-after-edit/
        ├── SKILL.md
        ├── agents/
        │   └── openai.yaml
        ├── references/
        │   ├── hook-workflow.md
        │   ├── bundled-shellcheck-profile.md
        │   ├── project-configuration.md
        │   └── hook-validation.md
        └── assets/
            └── templates/
                ├── shellcheck-after-edit.sh
                ├── test-shellcheck-after-edit.sh
                ├── project-hooks.json
                ├── user-hooks.json
                ├── project-config.toml.fragment
                ├── user-config.toml.fragment
                ├── shellcheckrc
                └── editorconfig-shell
```

The implementation will create the marketplace catalog entry through the
repository generator and add one root README catalog entry. It will not hand-
edit `.agents/plugins/marketplace.json`.

## Interface and Distribution

- Plugin identifier: `shellcheck-after-edit`.
- Initial version: `0.1.0`.
- Category: `Developer Tools`.
- Skill policy: `allow_implicit_invocation: true`.
- Runtime of generated handler: Bash.
- Required consumer tools: Bash, ShellCheck, shfmt, and `jq` for hook payload
  parsing unless the approved handler replaces that parser with an equally
  verified standard dependency.
- Credentials and network: none.
- Installation behavior: plugin installation changes Codex plugin discovery
  only; it creates no consumer hook, configuration, dependency, trust state, or
  project modification.

The README must state the input and output boundaries, requirements,
permissions, write effects, approval and trust boundaries, uninstall behavior,
rollback procedure, validation command, known limitations, failure recovery,
and the difference between plugin installation and approved consumer wiring.

## Non-Goals

- No active packaged hook, automatic hook registration, automatic trust, or
  automatic consumer configuration.
- No tool installation, download, `npx`, `uvx`, Homebrew operation, or PATH
  modification.
- No project-wide scan or formatting triggered by a single file edit.
- No silent success when a required tool is absent or fails.
- No replacement for repository CI, pre-commit, editor diagnostics, or
  project-specific validation commands.
- No automatic modification of `.shellcheckrc`, `shellcheckrc`, or
  `.editorconfig`.

## Acceptance Criteria

1. The package has a portable root manifest and one matching schema-valid
   `agents/openai.yaml` file.
2. The package has no declared plugin `hooks` component and no package-root
   `hooks/` directory.
3. The skill requires inspection and explicit approval before materializing any
   consumer-owned handler, hook configuration, ShellCheck profile, or shfmt
   EditorConfig change.
4. The skill supports both project and user scope, and both `hooks.json` and
   inline `config.toml` wiring.
5. The skill prevents duplicate wiring by requiring exactly one representation
   in the selected scope and preserving unrelated hooks.
6. The handler processes only reported, contained regular `.sh` and `.bash`
   files; it does not recurse into directories or process unreported files.
7. The handler uses shfmt before ShellCheck and fails visibly for a missing
   executable, tool error, timeout, or ShellCheck diagnostic.
8. The defaults and existing-project routes preserve ShellCheck configuration
   discovery and shfmt `.editorconfig` behavior.
9. A distributed ShellCheck profile is selected only through an approved
   consumer-owned `--rcfile` route.
10. A distributed shfmt profile is offered only as a reviewed project
    `.editorconfig` merge; it is not represented as a global configuration.
11. The generated Bash script, configuration fragments, and test contract are
    internally consistent for all supported scope and representation choices.
12. The manifest, skill metadata, package documentation, root README catalog,
    and generated marketplace registration are internally consistent and all
    applicable repository checks pass.

## Verification Plan

The implementation plan must require tests for at least these cases:

| Case                                                           | Required result                                                              |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Clean contained `.sh` or `.bash`                               | shfmt runs first, ShellCheck runs second, handler exits zero.                |
| Unformatted contained script                                   | shfmt rewrites only the reported file before ShellCheck.                     |
| ShellCheck finding                                             | handler exits non-zero and reports the actionable diagnostic.                |
| Missing ShellCheck or shfmt                                    | handler exits non-zero with a clear prerequisite failure.                    |
| Empty or malformed payload                                     | handler fails visibly without evaluating payload content or touching a file. |
| Non-shell file, directory, missing path, or outside-scope path | handler does not run either tool or modify a file.                           |
| Symlink escaping the scope                                     | handler rejects it without running either tool.                              |
| Existing `.editorconfig` ignore rule                           | `shfmt --apply-ignore` leaves the ignored target unmodified.                 |
| Existing ShellCheck configuration                              | selected discovery or `--rcfile` route is demonstrably honored.              |
| `hooks.json` and `config.toml`                                 | only the approved representation is materialized and its snippet is valid.   |

The plan must include package-contract tests, tool-specific Bash formatting and
ShellCheck validation, marketplace generation and checks, the full `npm run
check` gate, a final inspection of generated metadata, and an `/hooks` review
step for a disposable consumer fixture. The test fixture must never modify a
real user or project hook configuration.

## Risks and Mitigations

| Risk                                                                      | Mitigation                                                                                                                       |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Marketplace installation unexpectedly changes a consumer environment.     | Ship only a skill, references, and templates; require explicit approved consumer wiring.                                         |
| Duplicate hook execution produces repeated rewrites and diagnostics.      | Permit only one hook representation per selected scope and inspect both sources before writing.                                  |
| A bundled shfmt profile is claimed to work globally when it does not.     | Restrict the profile to an approved project `.editorconfig` merge.                                                               |
| A profile silently weakens a project's existing quality policy.           | Discover configuration first; present exact diffs; never overwrite or add suppressions to get green.                             |
| A malformed payload or symlink causes execution outside the chosen scope. | Parse without evaluation; canonicalize the scope and target; reject all invalid or escaping targets.                             |
| Missing tooling appears as a passing formatting/lint result.              | Make missing executables and process failures explicit non-zero handler outcomes.                                                |
| `PostToolUse` is mistaken for a transaction that can undo an edit.        | Document that it runs after the edit; it formats the reported file and reports lint status but cannot revert a completed action. |

## Sources

- Codex configuration reference, accessed 2026-09-12:
  <https://learn.chatgpt.com/docs/config-file/config-reference#configtoml>
- ShellCheck manual, accessed 2026-09-12:
  <https://github.com/koalaman/shellcheck/blob/master/shellcheck.1.md>
- shfmt manual, accessed 2026-09-12:
  <https://github.com/mvdan/sh/blob/master/cmd/shfmt/shfmt.1.scd>
- Existing repository reference:
  [`plugins/ruff-after-edit`](../../../plugins/ruff-after-edit/)
