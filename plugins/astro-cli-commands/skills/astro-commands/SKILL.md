---
name: astro-commands
description: Use first when planning or executing work in an Astro project. Inspect the installed Astro CLI, prefer official Astro commands over custom workflows, manage Astro dev or preview servers, add integrations, generate types, configure CI checks, and diagnose flags or version drift.
disable-model-invocation: false
---

# Astro Commands

This skill is the default command reference for Astro work. Before proposing a
custom script, manual configuration, or workaround, check whether the
project's installed Astro CLI already provides a supported command for the
operation.

Use the project-installed Astro CLI and the project's existing package manager and scripts. Prefer Astro's supported command over hand-written setup, but inspect mutations such as dependency installation and config edits.

## Establish the executable contract

Before relying on a command or flag:

```bash
npx astro --version
npx astro <command> --help
```

If `npx` attempts to install Astro, stop: dependencies are missing or the working directory is wrong.

The references were verified against Astro 7.2.2 on 2026-08-20. The published
`astro` package reported 7.2.9 on 2026-08-27, so do not infer that patch-level
versions have identical behavior. The installed binary's command-specific
`--help` is authoritative for its public CLI surface. If the installed version
differs materially, help output conflicts with a reference, a flag is rejected,
or a deprecation appears, query current official Astro documentation or
Context7 `/withastro/astro` before retrying. Report the installed version and
what was re-verified.

## Invoke through the project

Match the lockfile and existing `package.json` scripts. In npm projects:

```bash
npm run dev
npm run build -- --devOutput
npm run preview -- --port 4000
npx astro check --minimumFailingSeverity warning
```

Use `--` before arguments forwarded through `npm run`. Do not switch package managers to work around a CLI problem.

## Contracts that prevent false greens and orphaned processes

- `--minimumSeverity` controls which diagnostics are printed. `--minimumFailingSeverity` controls the exit code. CI gates use the latter.
- Astro 7 automatically backgrounds `astro dev` when it detects an AI coding agent. Use `npx astro dev status`, `npx astro dev logs --follow`, and `npx astro dev stop`; do not guess with `ps`/`lsof` or start with `kill -9`.
- A server started with `--ignore-lock` is deliberately untracked and cannot be managed by `status`, `logs`, or `stop`.
- `astro create-key` prints secret key material. Run it only when key creation or rotation is in scope, never repeat the value in chat or logs, and do not write local or remote secrets without authorization.
- `astro docs` opens a browser, `astro info --copy` changes the clipboard, and `astro preferences`/`telemetry` mutate settings. Use them only when that side effect serves the request; use Context7 for agent-side documentation research.

## Read the relevant reference

| Reference                                 | Read when                                                                                                  |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [commands.md](references/commands.md)     | Selecting a command, exit behavior, background subcommands, preferences, telemetry, or `create-key`.       |
| [flags.md](references/flags.md)           | Choosing a flag, checking its scope/version, or resolving flag interactions.                               |
| [operations.md](references/operations.md) | Working with package scripts, CI, agent-run servers, lock files, `ASTRO_KEY`, or configuration precedence. |

State the exact Astro command executed. Preserve failure output that affects the conclusion, and do not claim success from a command that did not exercise the intended gate or behavior.
