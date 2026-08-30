# 🚀 Astro Commands

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[![Version: 0.1.1](https://img.shields.io/badge/version-0.1.1-blue.svg)](https://github.com/nerymurillohnd/codex-essentials/releases/tag/plugin/astro-cli-commands/v0.1.1)
[← Back to Codex Essentials](../../README.md)

> Let Astro's own CLI lead the work.

**Explore:** [Install](#-quick-start) · [Capabilities](#-what-it-does) ·
[Requirements](#-requirements-and-compatibility) · [Safety](#-behavior-and-boundaries) ·
[Docs](#-documentation-and-support)

Astro Commands is a Codex plugin for developers who build, test, preview, and
debug Astro projects. It checks the installed Astro CLI, prefers supported
commands, and does not replace the project's package manager or CLI.

| Version | Release                                                                                                           | Install ref                        |
| ------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `0.1.1` | [Release 0.1.1](https://github.com/nerymurillohnd/codex-essentials/releases/tag/plugin/astro-cli-commands/v0.1.1) | `plugin/astro-cli-commands/v0.1.1` |

## 🎯 Purpose

Use Astro Commands when Codex needs to plan, check, preview, or coordinate an
Astro project through the installed framework CLI.

## ⚡ Quick start

Add the marketplace and install the plugin:

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add astro-cli-commands@codex-essentials
codex plugin list
```

Then open an Astro project and ask Codex:

```text
Use Astro Commands before planning this Astro task.
```

Read the boundaries below before allowing dependency installation, configuration
changes, secret creation, or server lifecycle operations.

## 🎯 Use cases

| Scenario                                      | How this plugin helps                                                                                                  | Expected result                                    |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| You need the right Astro command for a task.  | Inspects the [installed CLI and command-specific help](skills/astro-commands/references/commands.md).                  | A supported, version-aware command is selected.    |
| Your Astro project has checks or build drift. | Uses the project's scripts, lockfile, and [operations guidance](skills/astro-commands/references/operations.md).       | Diagnostics and CI gates reflect the real project. |
| A dev or preview server is already running.   | Uses Astro's [lifecycle controls](skills/astro-commands/references/commands.md#background-subcommands) and lock state. | The existing server is reused or safely managed.   |

**Not a fit when:** the task requires an unsupported or undocumented Astro
behavior without first re-verifying it against the installed CLI.

## 🎯 What it does

- Finds the Astro command or project script that matches the request.
- Uses the project's Node.js runtime, package manager, dependencies, and lockfile.
- Verifies command and flag behavior before relying on a versioned reference.
- Surfaces potentially mutating commands, secrets, and server effects before use.

## 🧰 Included Components

| Component                                                                                          | Purpose                                               |
| -------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| [`.codex-plugin/plugin.json`](.codex-plugin/plugin.json)                                           | Plugin identity, version, and component declarations. |
| [`skills/astro-commands/SKILL.md`](skills/astro-commands/SKILL.md)                                 | Authoritative command-first operating guidance.       |
| [`skills/astro-commands/agents/openai.yaml`](skills/astro-commands/agents/openai.yaml)             | Codex-facing skill metadata and invocation prompt.    |
| [`skills/astro-commands/references/commands.md`](skills/astro-commands/references/commands.md)     | Command behavior and lifecycle reference.             |
| [`skills/astro-commands/references/flags.md`](skills/astro-commands/references/flags.md)           | Flag scope, defaults, and compatibility notes.        |
| [`skills/astro-commands/references/operations.md`](skills/astro-commands/references/operations.md) | Package, CI, server, and configuration guidance.      |
| [`CHANGELOG.md`](CHANGELOG.md)                                                                     | User-facing release history.                          |
| [`LICENSE.md`](LICENSE.md)                                                                         | MIT license terms.                                    |

## 🖥️ Requirements and compatibility

## Supported Environments

| Requirement   | Supported value or behavior                                                 |
| ------------- | --------------------------------------------------------------------------- |
| Codex surface | Codex sessions with filesystem and process access.                          |
| Runtime/tools | Project-local Node.js, Astro CLI, and existing package manager.             |
| Project types | Astro projects using npm, pnpm, or Yarn lockfile conventions.               |
| Credentials   | None for installation; target tasks may require project secrets.            |
| Network       | Optional for current docs, dependency installation, or deployment commands. |
| Last verified | `2026-08-30` against package references; installed CLI wins.                |

## 🧩 Required Tools and Credentials

The target project supplies Node.js, Astro, and its package manager. No
credential is required to install this plugin; a target project may require
secrets such as `ASTRO_KEY` for separately authorized builds.

The references were verified against Astro 7.2.2; the published package was
reported as 7.2.9 on 2026-08-27. Treat that as a dated reference snapshot, not
a promise that every patch release has identical behavior.

## 🔐 Behavior and boundaries

## Inputs and Outputs

**Inputs:** User request, Astro files, `package.json`, lockfile, config, scripts,
installed CLI version, and command help.
**Outputs:** Selected command, exact invocation, flag explanation, verification
result, and recovery path.

## Permissions and Side Effects

| Access or effect | What this plugin may do                                                                |
| ---------------- | -------------------------------------------------------------------------------------- |
| Read             | Inspect project files, config, lockfiles, versions, and CLI output.                    |
| Write            | Change target files only when the user requests that work.                             |
| Process          | Run Astro commands and manage requested dev or preview servers.                        |
| Network          | Fetch docs, install requested dependencies, or run deployment tooling when authorized. |
| Authentication   | Not required by the plugin; target deployments may require project credentials.        |

Installation changes Codex-managed plugin state only. Separately authorized
Astro commands may create `.astro/` or `dist/`, update lock files, install
integrations, change settings, open a browser, change the clipboard, or print
secret material with `astro create-key`.

## Human Approval Boundaries

Inspection, version checks, help output, and diagnostics are read-only. Ask for
approval before creating secrets, installing dependencies, changing configuration,
opening a browser, changing the clipboard or telemetry, or managing unrelated
servers. Never print or commit secret values.

## 📦 Installation Behavior

Installation changes Codex-managed plugin state only. It does not install Astro
or modify the target project; any project changes come from separately authorized
Astro commands.

## 🔁 Update, Remove, and Uninstall and Rollback Behavior

Refresh the configured marketplace:

```bash
codex plugin marketplace upgrade codex-essentials
codex plugin list
```

Remove only this plugin:

```bash
codex plugin remove astro-cli-commands@codex-essentials
```

Uninstalling removes the Codex instruction package. It does not delete Astro
projects, `node_modules`, `dist/`, server state, caches, or settings changed by
separately authorized commands. Roll back a release by restoring a previous
catalog/package snapshot and validating it before reinstalling.

## ✅ Verification

From the marketplace repository, maintainers can run the read-only package check:

```bash
npm run marketplace:check
```

From the target Astro project, verify the installed command surface from that
project's directory:

```bash
cd /path/to/astro-project
npx astro --version
npx astro --help
npx astro check --help
```

If `npx` attempts to install Astro, stop and check the working directory and
project dependencies.

## 🚧 Known Limitations

- This package is a point-in-time Astro 7.2.x reference, not a live CLI contract.
- It does not run an automated command runner, ship an MCP server, or guarantee undocumented behavior.
- If a flag is rejected, inspect installed command help and current official docs before retrying.
- For tracked servers, use `npx astro dev status`, `npx astro dev logs --follow`,
  and `npx astro dev stop`; do not guess with process scans or force-kill commands.

## 🩺 Failure and Recovery

If `npx astro` tries to install Astro, stop and check the working directory and
project dependencies. If a flag is rejected, inspect installed command help and
current official docs before retrying.

## ❓ FAQ

<details>
<summary>Does installing Astro Commands modify my Astro project?</summary>

No. Installation changes Codex-managed plugin state. Astro commands may modify a
project only when separately requested and approved.
</details>

<details>
<summary>Which Astro version does this package support?</summary>

Its references are a dated Astro 7.2.x snapshot. The installed CLI and its
command-specific help take precedence over the bundled reference.
</details>

<details>
<summary>How do I recover from a rejected command or running server?</summary>

Re-check the installed CLI and use Astro's `dev status`, `dev logs`, and `dev stop`
controls. Preserve the failure output when a command or flag remains incompatible.
</details>

## 📚 Documentation and support

- [Authoritative skill](skills/astro-commands/SKILL.md)
- [Command reference](skills/astro-commands/references/commands.md)
- [Flag reference](skills/astro-commands/references/flags.md)
- [Operations reference](skills/astro-commands/references/operations.md)
- [Changelog](CHANGELOG.md)
- [Codex Essentials marketplace](../../README.md)
- [Plugin contribution guidelines](../../docs/contributing/plugins.md)
- [Issues](https://github.com/nerymurillohnd/codex-essentials/issues)
- [License](LICENSE.md)

Astro Commands is independent and is not affiliated with or endorsed by Astro.
See [Astro documentation](https://docs.astro.build/) and the
[Astro CLI reference](https://docs.astro.build/en/reference/cli-reference/) for
current upstream behavior.

## 📄 License

MIT. See [LICENSE.md](LICENSE.md).
