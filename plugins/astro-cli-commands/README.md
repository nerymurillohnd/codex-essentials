# Astro Commands

![Astro](https://img.shields.io/badge/Astro-Commands-ff5d01.svg)
![Plugin version](https://img.shields.io/badge/version-0.1.0-111827.svg)
![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)

> Let Astro's own CLI lead the work.

Astro Commands is a Codex plugin for developers who build, test, preview, and
debug Astro projects. It helps Codex check the local Astro CLI, choose the
official command first, and stop when the installed version does not match the
reference.

## 🎯 Purpose

Use it when you want Codex to:

- find the Astro command that already solves the task;
- use the project's own package manager and dependencies;
- manage development and preview servers through Astro's supported controls;
- distinguish diagnostic output from a failing CI check; and
- surface secrets and other side effects before they happen.

The decision rule is simple:

```text
Check local Astro CLI -> prefer official command -> verify result
```

## ⚡ Quick Start

Add the marketplace and install the plugin:

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add astro-cli-commands@codex-essentials
```

Confirm the installation:

```bash
codex plugin marketplace list
codex plugin list
```

Then open an Astro project and ask Codex for the work you need. You can also
request it directly:

```text
Use Astro Commands before planning this Astro task.
```

## 🧰 Included Components

| Component                        | Purpose                                                  |
| -------------------------------- | -------------------------------------------------------- |
| `.codex-plugin/plugin.json`      | Marketplace manifest and product metadata.               |
| `skills/astro-commands/SKILL.md` | Main command-first operating guidance.                   |
| `references/commands.md`         | Command behavior and lifecycle reference.                |
| `references/flags.md`            | Flag scope, defaults, and compatibility notes.           |
| `references/operations.md`       | Package manager, CI, server, and configuration guidance. |

No hooks, scripts, MCP servers, apps, or assets are bundled with this release.

## 📚 Reference Library

| Read this                                                         | When you need to...                                                          |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [`SKILL.md`](skills/astro-commands/SKILL.md)                      | Choose the right Astro workflow before acting.                               |
| [`commands.md`](skills/astro-commands/references/commands.md)     | Review commands, server controls, preferences, telemetry, or key generation. |
| [`flags.md`](skills/astro-commands/references/flags.md)           | Check a flag's scope, defaults, or version behavior.                         |
| [`operations.md`](skills/astro-commands/references/operations.md) | Resolve package, CI, server, lock-file, secret, or config questions.         |

## 🖥️ Supported Environments

Astro Commands works in Codex sessions inside Astro projects that use the
project's existing Node.js runtime and package manager: npm, pnpm, or Yarn.

The bundled references were verified against Astro 7.2.2 on 2026-08-20. The
published `astro` package reported 7.2.8 on 2026-08-27. Treat the references as
versioned guidance, not as a promise that every patch release has the same CLI.

Before relying on a command or flag, Codex should run:

```bash
npx astro --version
npx astro --help
npx astro <command> --help
```

The installed CLI and current official Astro documentation take precedence when
they disagree with this package.

## 🔄 Maintenance Model

The marketplace repository maintains the plugin package. It does not install
its own `npm` dependencies into a user's Astro project.

The intended maintenance rhythm is a weekly compatibility check plus manual
dispatch when Astro releases meaningful CLI changes. Updates should arrive as
reviewable pull requests; they should not rewrite `main` or publish silently.

## 🔁 Inputs and Outputs

| Inputs                                                                     | Outputs                                                                                       |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| User request, Astro files, `package.json`, lockfile, config, and CLI help. | Selected command, exact invocation, flag explanation, verification result, and recovery path. |

Common failure signals include missing dependencies, `npx` attempting to fetch
Astro, rejected flags, failed `astro check` or `astro build`, and conflicting
server lock-file state.

## 🧩 Required Tools and Credentials

The target Astro project supplies the CLI, Node.js, and package manager. Follow
its lockfile and existing scripts. Do not replace them with a global Astro
binary or another package manager.

No credential is required to install this plugin. A target project may use a
secret such as `${ASTRO_KEY}` during builds. Never print or commit its value.

## 🔐 Permissions

The plugin adds local instructions to Codex. While working in an Astro project,
Codex may need:

| Access          | Reason                                                                         |
| --------------- | ------------------------------------------------------------------------------ |
| Read            | Inspect project files, config, lockfiles, and CLI output.                      |
| Write           | Change files only when the user requests that work.                            |
| Process control | Manage Astro dev or preview servers when requested.                            |
| Network         | Fetch current docs, install requested dependencies, or run deployment tooling. |

## ⚠️ Side Effects

Astro commands may:

- create `.astro/` metadata or `dist/` output;
- update server lock files;
- install an integration through `astro add`;
- open a browser with `astro docs`;
- change the clipboard with `astro info --copy`;
- mutate preferences or telemetry; or
- print secret material with `astro create-key`.

## 🛡️ Human Approval Boundaries

Codex may inspect files, versions, help output, and non-mutating diagnostics as
part of the requested task.

Ask for explicit approval before creating secrets, installing dependencies,
changing configuration, opening a browser, changing the clipboard, mutating
preferences or telemetry, or starting and stopping unrelated servers.

## 📦 Installation Behavior

The public marketplace installation is:

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add astro-cli-commands@codex-essentials
```

For local authoring:

```bash
codex plugin marketplace add /absolute/path/to/codex-essentials
codex plugin add astro-cli-commands@codex-essentials
```

Codex caches the package from the marketplace. It does not install Astro or
modify the target project during plugin installation.

### 🔄 Update

```bash
codex plugin marketplace update codex-essentials
codex plugin list
```

### 🧹 Remove

Remove only the plugin:

```bash
codex plugin remove astro-cli-commands@codex-essentials
```

Remove the marketplace registration too:

```bash
codex plugin marketplace remove codex-essentials
```

## ↩️ Uninstall and Rollback Behavior

Uninstalling removes the Codex instruction package. It does not delete Astro
projects, `node_modules`, `dist/`, server state, caches, or settings changed by
separately authorized Astro commands.

To roll back a marketplace release, restore the previous catalog and plugin
package, then validate the manifests before reinstalling.

## ✅ Verification

Repository maintainers can run the canonical checks:

```bash
npm run validate:plugins
npm run validate:all
npm run validate:release -- plugin/astro-cli-commands/v0.1.0
```

From Codex, maintainers can ask:

```text
Use the plugin-creator Skill to validate plugins/astro-cli-commands.
```

The external `plugin-creator` compatibility checker is optional and is not
stored in this repository. Its terminal form uses a local Skill path:

```bash
uv run --with pyyaml python <plugin-creator-skill-root>/scripts/validate_plugin.py plugins/astro-cli-commands
```

In a target Astro project, verify the installed command surface:

```bash
npx astro --version
npx astro --help
npx astro check --help
```

## 🚧 Known Limitations

This package is a point-in-time Astro 7.2.x reference. It does not replace the
installed CLI, provide an automated command runner, ship an MCP server, or
guarantee coverage for undocumented internals.

## 🩺 Failure and Recovery

If `npx astro` tries to install Astro, stop and check the working directory and
dependencies. If a flag is rejected, inspect the installed command help and
current official documentation before retrying.

For tracked servers, use Astro's own controls:

```bash
npx astro dev status
npx astro dev logs --follow
npx astro dev stop
```

Do not guess with process scans or force-kill commands when Astro's lifecycle
controls can provide the state and recovery path.

## 🌐 Documentation and Attribution

Astro Commands is an independent Codex plugin. It is not an official Astro
product and is not affiliated with or endorsed by the Astro team.

Its references are based on Astro's public documentation and open-source
materials:

| Official source                                                             | Used for                                              |
| --------------------------------------------------------------------------- | ----------------------------------------------------- |
| [Astro Documentation](https://docs.astro.build/)                            | Framework concepts and current documentation.         |
| [Astro CLI Reference](https://docs.astro.build/en/reference/cli-reference/) | Commands, flags, and CLI behavior.                    |
| [Astro Installation Guide](https://docs.astro.build/en/install-and-setup/)  | Project-local setup expectations.                     |
| [Astro GitHub Repository](https://github.com/withastro/astro)               | Source, releases, issues, and implementation context. |
| [Astro 7 Release Notes](https://astro.build/blog/astro-7/)                  | Astro 7 platform changes.                             |
| [Astro 7.2 Release Notes](https://astro.build/blog/astro-720/)              | Astro 7.2 CLI-related additions.                      |

The installed project's CLI and the official Astro sources above take
precedence over bundled references when they differ.
