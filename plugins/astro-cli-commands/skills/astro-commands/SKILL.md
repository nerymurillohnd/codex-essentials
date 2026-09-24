---
name: astro-commands
description:
  Use when planning, running, debugging, or verifying Astro CLI commands,
  including create astro, astro dev, build, preview, check, sync, add, info,
  preferences, telemetry, create-key, server status, server logs, and CLI flags.
---

# Astro Commands

Use Astro's project-local command surface and current official documentation.
Prefer the target project's declared scripts when they correctly wrap Astro, and
fall back to package-manager-specific Astro invocations only when scripts are
missing or unsuitable.

## Inspect the project first

Read `package.json`, the lockfile, `.nvmrc` or other runtime pins, Astro config,
adapter or deployment configuration, relevant scripts, and the user's exact
task. Identify the package manager before proposing commands:

- npm: use scripts such as `npm run dev`, and pass extra flags after `--`.
- pnpm: use scripts such as `pnpm dev`, or direct commands such as
  `pnpm astro check`.
- Yarn: use scripts such as `yarn dev`, or direct commands such as
  `yarn astro check`.
- Bun: use project scripts when present; verify direct Astro invocation against
  the project's own tooling before relying on it.

Do not introduce a new package manager, globally installed Astro, or downloaded
fallback tool merely to make a command available. If the local dependency or
script is missing, report that boundary and use the project's accepted install
or create flow only when the task authorizes it.

## Choose the command

Read [CLI command map](references/commands.md) when choosing between Astro
commands, flags, or package-manager forms. Read
[server operations](references/servers.md) before starting, stopping,
inspecting, or exposing a dev or preview server. Read
[current evidence](references/current-evidence.md) before making a
version-sensitive claim, using a newly documented flag, changing CLI-related
configuration, or resolving conflict between local docs and Astro's current
reference.

Use these defaults unless the project shows a stronger local convention:

- Create a new project with the documented create flow for the detected package
  manager; new projects must target an empty folder.
- Run development through the declared `dev` script or `astro dev`.
- Run production output through the declared `build` script or `astro build`.
- Preview built output with the declared `preview` script or `astro preview`
  after a successful build.
- Run diagnostics through the declared check script or `astro check`; treat a
  non-zero exit as real diagnostic failure until inspected.
- Run `astro sync` when generated Astro types are stale, or rely on `dev`,
  `build`, and `check` when they already run sync as part of their workflow.
- Use `astro info` for environment reports and issue triage.
- Use `astro add` for supported integrations, after inspecting the current
  package manager and config changes it will make.

## Run and verify

For review-only or planning requests, report the command, rationale, side
effects, and prerequisites without changing files or starting long-lived
processes. For an authorized implementation or diagnosis, run the smallest
relevant command first, inspect its output, and then run the next command needed
to verify the user's goal.

Server commands can leave background processes running. Track the URL, port,
PID, lockfile, and stop command before handing off. Do not use `--host` unless
the user needs LAN testing or the project requires it, and never present `dev`
or `preview` servers as production hosting.

After editing an Astro project, run the project's applicable format, lint,
`astro check`, tests, build, and preview smoke checks in proportion to the risk.
When a command is skipped, say why. When official docs, local package versions,
or project scripts disagree, state the conflict and follow the project owner
instruction unless it would be incorrect or unsafe.

Report the detected package manager, Astro version if observed, commands run,
results, current-doc evidence for version-sensitive choices, server state, and
remaining risks.
