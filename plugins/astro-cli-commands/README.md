# Astro CLI Commands

Astro CLI Commands helps Codex choose, run, and verify Astro CLI operations from
the target project's actual package manager and current official Astro
documentation. It is meant for day-to-day Astro work: project creation,
integration setup, development servers, builds, preview checks, type
diagnostics, generated types, telemetry, preferences, and environment reports.

## Install and use

```sh
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add astro-cli-commands@codex-essentials
```

Ask:
`Use $astro-commands to verify the Astro build and preview flow for this project.`
The package includes one [skill](skills/astro-commands/SKILL.md),
[Codex presentation metadata](skills/astro-commands/agents/openai.yaml), and
three references:

- [CLI command map](skills/astro-commands/references/commands.md)
- [Server operations](skills/astro-commands/references/servers.md)
- [Current evidence](skills/astro-commands/references/current-evidence.md)

## Inputs and result

Provide the Astro task, target repository, package manifest and lockfile,
existing scripts, adapter/deployment context, and any relevant error output. The
skill first discovers whether the project uses npm, pnpm, Yarn, or Bun, then
prefers declared scripts when they already wrap Astro correctly. When a direct
CLI call is needed, it uses the package-manager invocation that matches the
project and verifies version-sensitive behavior against current official docs.

The result is a scoped command choice, the reason for it, any required flags,
the checks that were run, and the remaining risk when tools, docs, or project
state do not establish the answer.

## Requirements and boundaries

- Supported environments: Astro projects or Astro project creation tasks with a
  detectable package manager and available shell.
- The plugin bundles no Astro runtime, hook, MCP server, credential, executable,
  or network service. Astro dependencies and commands come from the target
  project or the package manager's documented create flow.
- Installation only changes Codex-managed plugin state. Target-project writes
  occur solely within a separately authorized Astro task.
- Server commands are local-development operations. Do not expose `astro dev` or
  `astro preview` with `--host` as production servers.
- Current docs matter. Before relying on version-sensitive CLI behavior, check
  the official Astro CLI reference and applicable release evidence.

## Update and removal

```sh
codex plugin marketplace upgrade codex-essentials
codex plugin add astro-cli-commands@codex-essentials
codex plugin list --json
codex plugin remove astro-cli-commands@codex-essentials
```

This clean-history package begins at `0.1.0`. Explicitly reinstall after
refreshing the Git marketplace if an older installation from the former history
remains cached. Start a new Codex session to confirm the current skill is
available. Removing the plugin does not stop servers that a prior task started;
use the target project's Astro command, PID, or lockfile evidence to stop them.

## Maintainer verification

Run the package validator and repository checks from the marketplace root. A
matching request should inspect the target project's package manager, prefer
project scripts for `dev`, `build`, `preview`, and `check`, and consult official
Astro docs before making version-sensitive claims. A nearby non-Astro frontend
request should not trigger the skill.

Current authoring evidence was checked on 2026-09-24 against the official Astro
CLI reference, official Astro project-creation tutorial, official OpenAI plugin
submission error reference, and ChatGPT & Codex changelog.

See the [changelog](CHANGELOG.md) and [MIT license](LICENSE.md). This is an
independent community plugin, not an Astro or OpenAI product.
