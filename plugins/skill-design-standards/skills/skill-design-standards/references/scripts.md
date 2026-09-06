# Commands and Scripts in Skills

Source: [Using scripts in skills](https://agentskills.io/skill-creation/using-scripts),
checked 2026-09-06. Discover updated pages through the
[documentation index](https://agentskills.io/llms.txt) before further research.

## Choose the execution model

Prefer an existing project command or installed tool when a short invocation solves
the task. A skill can document such commands without creating a `scripts/` directory.
Bundle a tested helper when quoting, branching, repeated processing, or orchestration
would otherwise be reconstructed unreliably. Preserve the project's runtime contract.

For one-off package execution, choose the runner already supported by the environment:

| Ecosystem | Runner and prerequisite                                                                  |
| --------- | ---------------------------------------------------------------------------------------- |
| Python    | `uvx` with uv; `pipx run` where pipx is the established tool. Neither comes with Python. |
| Node.js   | `npx` with npm; prefer project-local scripts and locked dependencies first.              |
| Bun       | `bunx` for an existing Bun environment.                                                  |
| Deno      | `deno run` with narrowly scoped permissions required by the task.                        |
| Go        | `go run` with the Go toolchain and a versioned package.                                  |

Pin an exact reviewed release or source revision for repeatability. A major version,
compatible range, or `latest` is not an exact pin. Preserve existing lockfiles and
dependency policy. Explain runtime, package-download, cache, and network prerequisites;
use `compatibility` for actual runtime requirements. Do not silently switch ecosystems
or turn a run instruction into a global installation requirement.

## Make execution paths explicit

List bundled executable entrypoints in `SKILL.md`, with when to run each, its inputs,
and how to interpret the result. Use paths relative to the skill root, including
commands shown inside references. Establish that working directory explicitly or
resolve the discovered skill root before execution; shell tools do not automatically
change directory because a skill was loaded. Resolve caller input/output paths before
changing directory so the command acts on the intended files.

## Keep reusable scripts self-contained

Use documented existing dependencies or inline dependency metadata when appropriate:

- **Python:** For a standalone dependency-bearing helper, use PEP 723 `# /// script`
  TOML metadata with `dependencies` and applicable `requires-python`, executed with
  `uv run --script scripts/helper.py`. Pin dependencies; use `uv lock --script` when
  a maintained lockfile is needed. Keep standard-library-only helpers dependency-free.
- **Deno:** Use versioned `npm:` or `jsr:` imports. Verify required permissions and
  native dependency support in the target runtime.
- **Bun:** Versioned imports can support runtime installation, but surrounding
  `node_modules` can change resolution; validate in the intended directory context.
- **Ruby:** `bundler/inline` can declare gems. Check existing `Gemfile` or
  `BUNDLE_GEMFILE` interactions and use explicit dependency versions.

Consult current runtime documentation before writing those less-common runtime
variants. Inline dependencies still require a compatible runner and may download
packages; they do not guarantee offline execution or full transitive reproducibility.

## Design an agent-facing interface

- Run unattended: accept flags, environment variable names, or explicit stdin.
  Fail promptly on missing input instead of opening a prompt, menu, or password dialog.
  Do not assume a TTY is available even if a particular host supports interactive tools.
- Provide concise `--help` with arguments, defaults, examples, side effects, and
  documented exit codes. Use nonzero failure codes that let callers distinguish
  actionable categories; never report partial failure as unconditional success.
- State what failed, the accepted input, and a useful next step. Reject malformed or
  ambiguous input before mutation. Do not echo credentials or sensitive payloads.
- Prefer JSON, CSV, or TSV for machine-consumed results. Reserve stdout for result
  data and stderr for diagnostics; validate structured output with its actual consumer.
- Bound output through summaries, limits/pagination, or an output file. For large
  artifacts, support an explicit output destination and intentional stdout opt-in.
- Make retries safe through idempotency, deduplication, or state inspection. Bound
  retries and timeouts; do not blindly repeat an action with an uncertain outcome.
- For stateful or destructive operations, provide meaningful dry-run or preview
  behavior and safeguards proportional to risk. A confirmation flag expresses an
  already-authorized decision; it does not grant permission or justify bypassing controls.

## Verify the interface

For changed executable helpers, run `--help`, a valid case, and relevant invalid or
missing-input cases without interactive input. Check exit codes, stdout parsing,
stderr separation, paths containing spaces, and actual output artifacts where relevant.
For mutations, verify preview has no mutation and retries do not duplicate effects.
Exercise timeout or output-limit behavior when those mechanisms were added. Apply
the runtime's configured lint, format, and diagnostic checks. Do not require a test
matrix for runtimes the skill neither ships nor uses.
