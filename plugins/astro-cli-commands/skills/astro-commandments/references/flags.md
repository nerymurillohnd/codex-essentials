# Astro CLI — Flags reference

Documents the **Astro 7.2.x** CLI. Verified 2026-08-20 against the installed Astro 7.2.2 CLI, its package source, and current Context7 source for `/withastro/astro`.

## Contents

- [Shared and command flags](#shared-and-command-flags)
- [Global flags](#global-flags)
- [Command-exclusive flags](#command-exclusive-flags)
- [Version matrix](#version-matrix)
- [Interactions and incompatibilities](#interactions-and-incompatibilities)

---

## Shared and command flags

Scope matters: a flag shown by the top-level help is global; other flags belong only to the commands named below.

### `--root <path>`

**Scope:** global. Path to the project root. Defaults to the current working directory. The root is what Astro uses to locate the configuration file.

```bash
npx astro --root myRootFolder/myProjectFolder dev
```

### `--config <path>`

**Scope:** global. Path to the config file, **relative to the project root**. Defaults to `astro.config.mjs`. Use it when the config has a different name or lives in a subfolder.

```bash
npx astro --config config/astro.config.mjs dev
```

### `--force` — added in `astro@5.0.0`

**Scope:** `dev`, `build`. Boolean flag. Clears the content layer cache, forcing a full rebuild. Treat it as a diagnostic, not a default — it discards incremental work.

With `--background`, it means something additional: stop the existing background server and start a new one.

### `--mode <string>` — added in `astro@5.0.0`

**Scope:** `dev`, `build`. Sets the `mode` inline config for the project. `astro dev` defaults to `"development"`; `astro build` defaults to `"production"`.

### `--outDir <path>` — added in `astro@3.3.0`

**Scope:** `build`. Sets `outDir`. **Overrides** the value in `astro.config.mjs` if one exists.

### `--site <url>`

**Scope:** global. Sets `site`. **Overrides** the config file value if one exists.

### `--base <pathname>` — added in `astro@1.4.1`

**Scope:** global. Sets `base`. **Overrides** the config file value if one exists.

### `--port <number>`

**Scope:** `dev`, `preview`. Defaults to `4321`. If the port is taken, Astro tries the next free one — so an unexpected port in the output usually means something else already holds 4321.

### `--host [optional host address]`

**Scope:** `dev`, `preview`. Controls which network IP addresses the server listens on. Useful for testing on a phone or another LAN device.

- `--host` — listen on all addresses, LAN and public
- `--host <custom-address>` — expose on the network IP `<custom-address>`

**Never use `--host` to expose the dev or preview server in production.** Both servers are built for local development only.

### `--allowed-hosts` — added in `astro@5.4.0`

**Scope:** `dev`, `preview`. Hostnames Astro is allowed to respond to. Accepts a comma-separated list, or `true` to allow any hostname. Backed by Vite's `allowedHosts`; allowing any hostname has security implications worth understanding before doing it.

```bash
npx astro dev --allowed-hosts staging.example.com,qa.example.com
```

### `--verbose`

**Scope:** global. Verbose logging. First thing to reach for when debugging a build or server issue.

### `--silent`

**Scope:** global. Silent logging — runs with no console output.

### `--open`

**Scope:** `dev`, `preview`. Opens the app in the browser on server start. Accepts a full URL (`--open http://example.com`) or a pathname (`--open /about`). This is a GUI side effect in Codex.

### `--background` — added in `astro@7.0.0`

**Scope:** `dev`; `preview` since 7.2.0. Starts a detached background process and enables JSON logging.

On start, Astro writes a lock file (`.astro/dev.json` or `.astro/preview.json`) recording the server's URL, port, and PID. That lock file is what prevents duplicate instances and what makes `stop`, `status`, and `logs` work.

**This flag is supplied automatically when an AI agent is detected.** An agent-run `astro dev` therefore behaves differently from a hand-typed one: detached, JSON logs, lock file written.

```bash
npx astro dev --background
npx astro dev --background --force   # stop the existing server, start fresh
```

If a server is already running for the project, the command prints the existing server's info and exits without starting a new one.

### `--json` — added in `astro@7.0.0`

**Scope:** global, plus structured output for `preferences list`. Enables JSON logging for machine-readable output. Implied by `--background`.

---

## Global flags

Available on any command.

| Flag        | Effect                                                                           |
| ----------- | -------------------------------------------------------------------------------- |
| `--version` | Print the Astro version number and exit.                                         |
| `--help`    | Print the help message and exit. Append to any command for that command's flags. |

`--config`, `--root`, `--site`, `--base`, `--verbose`, `--silent`, and `--json` are also listed under Global Flags in `astro --help`.

---

## Command-exclusive flags

| Flag                       | Command                    | Summary                                                  |
| -------------------------- | -------------------------- | -------------------------------------------------------- |
| `--ignore-lock`            | `dev`                      | Start without touching the lock file. See `commands.md`. |
| `--devOutput`              | `build`                    | Development-flavored build for build-only bugs.          |
| `--watch`                  | `check`                    | Continuous re-check on change.                           |
| `--tsconfig <path>`        | `check`                    | Explicit tsconfig.                                       |
| `--minimumFailingSeverity` | `check`                    | Severity that causes non-zero exit. Default `error`.     |
| `--minimumSeverity`        | `check`                    | Severity that gets printed. Default `hint`.              |
| `--preserveWatchOutput`    | `check`                    | Do not clear output between watch runs.                  |
| `--copy`                   | `info`                     | Copy output to clipboard.                                |
| `--global`                 | `preferences`              | Apply to every project on the machine.                   |
| `--json`                   | `preferences list`         | Machine-readable preference output.                      |
| `--follow` / `-f`          | `dev logs`, `preview logs` | Stream new log output.                                   |

### Hidden compatibility flag

Astro 7.2.2 reads `--noSync` in `astro check`, but the flag is absent from command help and the public `@astrojs/check` options. Do not treat it as stable API. Prefer the normal implicit sync; use it only with an inspected, pinned Astro version and an explicit preceding `astro sync`.

---

## Version matrix

| Flag / feature                          | Scope            | Added in      |
| --------------------------------------- | ---------------- | ------------- |
| `--base <pathname>`                     | global           | `astro@1.4.1` |
| `astro sync`                            | command          | `astro@2.0.0` |
| `--outDir <path>`                       | `build`          | `astro@3.3.0` |
| `--devOutput`                           | `build`          | `astro@5.0.0` |
| `--force`                               | `dev`, `build`   | `astro@5.0.0` |
| `--mode <string>`                       | `dev`, `build`   | `astro@5.0.0` |
| `--allowed-hosts`                       | `dev`, `preview` | `astro@5.4.0` |
| `--background`                          | `dev`            | `astro@7.0.0` |
| `--json`                                | global           | `astro@7.0.0` |
| `stop` / `status` / `logs`              | `dev`            | `astro@7.0.0` |
| `--ignore-lock`                         | `dev`            | `astro@7.1.0` |
| `--background` on `preview`             | `preview`        | `astro@7.2.0` |
| `stop` / `status` / `logs` on `preview` | `preview`        | `astro@7.2.0` |

No "Added in" is published for: `astro dev`, `astro build`, `astro preview`, `astro check` and its flags, `astro add`, `astro docs`, `astro info` / `--copy`, `astro preferences`, `astro telemetry`, `astro create-key`, `--root`, `--config`, `--site`, `--port`, `--host`, `--verbose`, `--silent`, `--open`, `--version`, `--help`.

---

## Interactions and incompatibilities

| Combination                          | Result                                                                                                                                                                          |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ignore-lock` + `--background`     | **Error.** Background mode requires the lock file.                                                                                                                              |
| `--ignore-lock` + `--force`          | **Error.** `--force` acts on the lock file.                                                                                                                                     |
| `--ignore-lock` alone                | Server starts, but is invisible to `stop`, `status`, `logs`.                                                                                                                    |
| `--background` + `--force`           | Stops the existing background server, starts a new one.                                                                                                                         |
| `--background`                       | Implies `--json` logging.                                                                                                                                                       |
| `--outDir` / `--site` / `--base`     | Override `astro.config.mjs`. A flag buried in a deploy script silently beating committed config is a real source of environment drift — audit these when environments disagree. |
| `--port` when the port is busy       | Astro silently moves to the next free port.                                                                                                                                     |
| Flags through `npm run` without `--` | npm may parse, warn, reject, or misroute them depending on npm version. Use the separator so Astro receives the intended arguments.                                             |
