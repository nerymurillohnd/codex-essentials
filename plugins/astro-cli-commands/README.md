# Astro Commands

## Purpose

Astro Commands gives Codex a maintained, command-first operating contract
for Astro projects. Before planning or executing work, it directs the agent to
inspect the project's installed Astro CLI and prefer an official Astro command
or workflow whenever one exists. This prevents unnecessary custom setup,
preserves framework-managed behavior, and makes version drift visible.

The plugin is intended for developers and operators who use Codex to inspect,
build, test, preview, or debug Astro applications.

## Included Components

- `.codex-plugin/plugin.json` manifest for marketplace discovery.
- `skills/astro-commands/SKILL.md` skill instructions.
- `skills/astro-commands/references/commands.md` command reference.
- `skills/astro-commands/references/flags.md` flag reference.
- `skills/astro-commands/references/operations.md` operating conventions.

This release ships no hooks, scripts, MCP servers, apps, or visual assets.

## Supported Environments

The plugin is designed for Codex sessions working inside Astro repositories
with Node.js and npm, pnpm, or Yarn available through the project's existing
tooling. The bundled references were verified against Astro 7.2.2 on
2026-08-20. The published `astro` package reported version 7.2.8 when this
package was prepared on 2026-08-27, so the references are intentionally treated
as versioned guidance rather than a promise that every 7.2.x patch has an
identical CLI surface.

For every target project, the skill requires Codex to re-check the installed
CLI with `npx astro --version` and command-specific `npx astro <command>
--help` before relying on a command or flag. If the installed version differs
materially or behavior has drifted, Codex must consult current official Astro
documentation or `/withastro/astro` through Context7 before proceeding. The
agent should report the version and the exact command surface it re-verified.

## Maintenance Model

The package manager in this repository maintains the marketplace itself; it is
not installed into every user's machine as part of this plugin. Community
users add the remote marketplace and install `astro-cli-commands` independently
through Codex.

The maintenance source of truth should remain the official Astro CLI and
documentation. A lightweight scheduled repository check can query the latest
published Astro version, compare it with the reference verification metadata,
and open a reviewable maintenance pull request when drift is detected. A
weekly schedule plus a manual dispatch is sufficient for this command surface;
daily polling would add noise without improving runtime safety. The check
should never rewrite `main` or silently publish a plugin update.

## Inputs and Outputs

Inputs include user requests about Astro CLI usage, Astro project files,
`package.json` scripts, lockfiles, Astro configuration, and installed CLI help
output. The plugin does not define a machine-readable data format.

Outputs are Codex decisions and actions: selected commands, exact command
invocations, explanation of flag scope, verification output, server management
steps, and recovery guidance. The primary decision rule is: if Astro already
provides a supported command for the requested operation, use and verify that
command before designing an equivalent custom workflow. Observable failures include missing project
dependencies, `npx` attempting to download Astro, unsupported flags,
non-zero `astro check` or `astro build` exits, and background server lock-file
state that contradicts the requested operation.

## Required Tools and Credentials

Required tools are the project-local Astro CLI, Node.js, and the package manager
declared by the target Astro project. The skill examples use `npm` and `npx`,
but the agent must follow the lockfile and scripts in the project under work.

No credential is required to install or use this plugin. Some Astro projects may
require environment variables such as `${ASTRO_KEY}` during build or deployment;
the skill treats secret creation, storage, and disclosure as separate
human-authorized actions.

## Permissions

The plugin itself only adds local instruction files to Codex. When used inside
an Astro project, Codex may need read access to project files, write access when
the user asks it to modify configuration or scripts, and process control for
Astro dev or preview servers started by the project-local CLI.

Network access is not required for ordinary command selection. It may be needed
when Codex must retrieve current Astro documentation after version drift or when
the target project command installs dependencies, contacts a package registry,
or runs deployment-specific tooling.

## Side Effects

Installing the plugin adds the package files to the marketplace cache used by
Codex. Using the skill can lead Codex to run Astro commands requested by the
user. Those commands may generate `.astro/` files, write build output such as
`dist/`, update background server lock files, install packages through
`astro add`, or change Astro preferences and telemetry settings when explicitly
authorized.

The skill warns that `astro create-key` prints secret material, `astro docs`
opens a browser, `astro info --copy` changes the clipboard, and preference or
telemetry commands mutate user or project state.

## Human Approval Boundaries

Codex may automatically inspect project files, check local Astro versions, read
command help, and run non-mutating diagnostics when those actions are necessary
for the user's request.

Explicit human approval is required before creating or rotating secrets,
writing secrets to local or remote stores, opening the user's browser, changing
the clipboard, mutating Astro preferences or telemetry settings, installing
dependencies, changing configuration, or starting/stopping servers when that
side effect is outside the requested task.

## Installation Behavior

This plugin is registered in the `codex-essentials` marketplace at
`.agents/plugins/marketplace.json` with a local source path:

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add astro-cli-commands@codex-essentials
```

For local authoring and testing from a checkout:

```bash
codex plugin marketplace add /absolute/path/to/codex-essentials
codex plugin add astro-cli-commands@codex-essentials
```

Codex reads `plugins/astro-cli-commands/.codex-plugin/plugin.json` and caches
the skill files under its configured plugin cache. The marketplace entry uses
`policy.installation: "AVAILABLE"` and `policy.authentication: "ON_INSTALL"`.

## Uninstall and Rollback Behavior

Uninstall the plugin from Codex with the client's plugin management flow or CLI
for the installed marketplace. Removing the plugin only removes the Codex
instruction package; it does not modify Astro projects, generated build output,
server lock files, package manager caches, or user telemetry preferences that
may have been changed by separately authorized Astro commands.

To roll back the marketplace source, revert the repository changes that added
`plugins/astro-cli-commands/` and the marketplace entry. If an install is
partial, reinstall after validating the marketplace and plugin manifests.

## Verification

Validate the package from the marketplace repository:

```bash
npm run validate:plugins
npm run validate:all
```

Validate with the plugin-creator compatibility checker:

```bash
uv run --with pyyaml python <plugin-creator-skill-root>/scripts/validate_plugin.py plugins/astro-cli-commands
```

In an Astro project, verify the runtime command surface before relying on the
skill's reference material:

```bash
npx astro --version
npx astro --help
npx astro check --help
```

Expected result: manifest validation passes, Codex can discover the skill, and
the target project's installed Astro CLI help agrees with the command being
used or any drift is re-verified against current authoritative documentation.

## Known Limitations

The bundled reference is a point-in-time Astro 7.2.x guide, not a replacement
for the target project's installed CLI. It does not support using a global Astro
binary in place of project dependencies, switching package managers to bypass a
failure, or treating undocumented internal flags as stable API.

The plugin does not ship an MCP server, app UI, automated command runner, or
Astro project template. It guides Codex behavior; it does not execute commands
by itself.

## Failure and Recovery

If `npx astro` tries to install Astro, Codex should stop and report that the
working directory is wrong or dependencies are missing. If a flag is rejected
or help output conflicts with the bundled reference, Codex should re-check the
installed command help and retrieve current authoritative documentation before
retrying.

If an Astro dev or preview server is already running, Codex should inspect it
with `npx astro dev status` or `npx astro preview status` rather than guessing
with process scans. If a background server needs replacement, use Astro's
tracked `--background --force`, `stop`, `status`, and `logs` controls.

The plugin preserves project data by requiring the agent to inspect mutations
from commands such as `astro add`, avoid printing generated secret values, and
report exact verification commands and material failure output.
