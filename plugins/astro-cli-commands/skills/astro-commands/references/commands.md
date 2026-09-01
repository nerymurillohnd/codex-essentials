# Astro CLI — Commands reference

Documents the **Astro 7.2.x** CLI. Verified 2026-08-20 against the installed Astro 7.2.2 CLI, its package source, and current Context7 source for `/withastro/astro`.
Invocation convention: `npm run <script> -- <flags>` for `dev`/`build`/`preview`, `npx astro <command> <flags>` for everything else.

## Contents

- [astro dev](#astro-dev)
- [astro build](#astro-build)
- [astro preview](#astro-preview)
- [astro check](#astro-check)
- [astro sync](#astro-sync)
- [astro add](#astro-add)
- [astro docs](#astro-docs)
- [astro info](#astro-info)
- [astro preferences](#astro-preferences)
- [astro telemetry](#astro-telemetry)
- [astro create-key](#astro-create-key)
- [Background subcommands: stop, status, logs](#background-subcommands)

---

## astro dev

Runs the development server: a local HTTP server that does **not** bundle assets, using Hot Module Replacement to update the browser on save.

```bash
npm run dev
npm run dev -- --port 8080 --open
npx astro dev --host          # expose on LAN for device testing
```

**Terminal hotkeys while running:**

| Keys        | Action                                                                   |
| ----------- | ------------------------------------------------------------------------ |
| `s` + enter | Sync the content layer (content and types) — same effect as `astro sync` |
| `o` + enter | Open the site in the browser                                             |
| `q` + enter | Quit the dev server                                                      |

Accepts the global flags and the `dev` flags in `flags.md`, plus:

### `--ignore-lock` — added in `astro@7.1.0`

Starts the dev server without checking or writing the lock file Astro uses to detect other running dev servers. This lets a second server start alongside one already running for the same project instead of erroring.

```bash
npx astro dev --ignore-lock --port 4322
```

Two consequences that matter:

- The new server is **not tracked** by `stop`, `status`, or `logs`. You will be killing that PID by hand.
- Combining it with `--background` (including when `--background` is injected automatically for an AI agent) or with `--force` **throws an error**, because both depend on the lock file.

---

## astro build

Builds the site for deployment. Emits static files into `dist/` by default; if any route is rendered on demand, also generates the server files needed to serve it.

```bash
npm run build
npm run build -- --verbose      # debugging a failing build
npm run build -- --devOutput    # build-only bug reproduction
```

Accepts the global flags and the `build` flags in `flags.md`, plus:

### `--devOutput` — added in `astro@5.0.0`

Produces a development-flavored build, transformed similarly to `astro dev` output, with extra debugging information retained. Use it when a bug appears in `build` but not in `dev` — that is the gap this flag exists to close.

---

## astro preview

Starts a local server serving the contents of the static directory (`dist/` by default) produced by `astro build`. The point is to catch errors in build output **before** deploying.

**Not designed to run in production.** For production use a real host and adapter.

```bash
npm run preview
npm run preview -- --port 4000
npx astro preview --background   # since 7.2.0
```

**Terminal hotkeys:** `o` + enter to open in the browser, `q` + enter to quit.

Accepts the global flags and the `preview` flags in `flags.md`. **Since v7.2.0** it also accepts `--background` and the `stop`, `status`, and `logs` subcommands for managing a background preview server.

---

## astro check

Runs diagnostics — including type-checking inside `.astro` files — and reports errors to the console. **Exits with code `1` if any errors are found**, which is what makes it usable as a CI gate. `tsc` alone cannot do this: it does not understand `.astro` files.

```bash
npx astro check
npx astro check --watch
npx astro check --minimumFailingSeverity warning   # CI: fail on warnings too
```

### Flags

| Flag                                              | Default       | Effect                                                                                  |
| ------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------- |
| `--watch`                                         | —             | Watch for changes and re-report continuously.                                           |
| `--root <path-to-dir>`                            | cwd           | Check a different root directory.                                                       |
| `--tsconfig <path-to-file>`                       | auto-detected | Use a specific `tsconfig.json`. Without it, Astro finds or infers the project's config. |
| `--minimumFailingSeverity <error\|warning\|hint>` | `error`       | Minimum severity that causes a **non-zero exit**.                                       |
| `--minimumSeverity <error\|warning\|hint>`        | `hint`        | Minimum severity that is **printed**.                                                   |
| `--preserveWatchOutput`                           | —             | Do not clear output between checks in watch mode.                                       |

### Hidden compatibility flag: `--noSync`

Astro 7.2.2 checks `flags.noSync` before its implicit sync, but the option is absent from `astro check --help` and from `@astrojs/check`'s public options. Treat it as an internal compatibility flag, not a stable public contract. Prefer the normal implicit sync; use `--noSync` only when an exact pinned version has been inspected and the workflow runs `astro sync` separately.

**The two severity flags are not interchangeable and confusing them is a silent CI failure.** `--minimumSeverity warning` hides hints from the output but changes nothing about whether the command fails. `--minimumFailingSeverity warning` is what makes warnings break the build.

---

## astro sync

**Added in `astro@2.0.0`.**

Generates TypeScript types for all Astro modules. Sets up `.astro/types.d.ts` for type inference and defines the modules that depend on generated types:

- `astro:content` — Content Collections API
- `astro:env` — Astro Env
- `astro:actions` — Astro Actions

```bash
npx astro sync
```

`astro dev`, `astro build`, and `astro check` each run `sync` themselves. Call it directly when editing collection schemas without one of those commands running, when a later tool needs generated types first, or when the editor reports missing `astro:*` modules. **Never hand-write these declaration files** — they are generated from the schemas and will drift.

---

## astro add

Adds an integration to the configuration — installs the package and wires `astro.config.mjs` automatically.

```bash
npx astro add react
npx astro add @astrojs/sitemap
```

Prefer this for supported integrations: the command installs dependencies and edits Astro config, so inspect both changes. Manual configuration remains valid when an integration is unsupported by `astro add` or the repository intentionally owns a custom setup.

---

## astro docs

Opens the Astro documentation website from the terminal.

```bash
npx astro docs
```

This opens a browser. In Codex, use Context7 with `/withastro/astro` for agent-side research; run `astro docs` only when opening the user's browser is part of the request.

---

## astro info

Reports information about the current Astro environment. This is the canonical output to paste into a GitHub issue.

```bash
npx astro info
npx astro info --copy   # copy to clipboard without prompting
```

In Codex, prefer plain `astro info` and capture stdout. Use `--copy` only when changing the user's clipboard is intended.

Output shape (values are illustrative, from Astro's own docs — not current releases):

```text
Astro                    v5.14.1
Vite                     v6.3.6
Node                     v22.17.1
System                   macOS (arm64)
Package Manager          npm
Output                   static
Adapter                  none
Integrations             @astrojs/starlight (v0.35.3)
```

### Flags

| Flag     | Effect                                              |
| -------- | --------------------------------------------------- |
| `--copy` | Copy the output to the clipboard without prompting. |

---

## astro preferences

Manages **user** preferences — settings specific to one developer, unlike `astro.config.mjs`, which changes behavior for everyone on the project. This distinction matters on a shared repo: disabling the toolbar in config affects the whole team; disabling it here does not.

**Scope:** project-local by default, stored in `.astro/settings.json`. With `--global`, applies to every Astro project on the machine, stored in an OS-specific location.

### Available preferences

| Preference     | Effect                                     | Default |
| -------------- | ------------------------------------------ | ------- |
| `devToolbar`   | Enable/disable the browser dev toolbar     | `true`  |
| `checkUpdates` | Enable/disable automatic CLI update checks | `true`  |

```bash
npx astro preferences list                        # current settings
npx astro preferences list --json                 # machine-readable
npx astro preferences get devToolbar.enabled
npx astro preferences set devToolbar.enabled false
npx astro preferences disable devToolbar          # this project only
npx astro preferences disable --global devToolbar # every project, this machine
npx astro preferences enable devToolbar
npx astro preferences reset devToolbar            # back to default
```

`list` prints a table of `devToolbar.enabled` and `checkUpdates.enabled` with their current values.

`get` is read-only. `set`, `enable`, `disable`, and `reset` mutate project or user settings; `--global` changes every Astro project for that user. Do not run mutating preference commands unless that scope is requested.

---

## astro telemetry

Sets telemetry configuration for the current CLI user. Telemetry is anonymous usage data.

```bash
npx astro telemetry disable
npx astro telemetry enable
npx astro telemetry reset    # reset telemetry data
```

`enable`, `disable`, and `reset` mutate user telemetry settings. In CI, prefer `ASTRO_TELEMETRY_DISABLED=1` so the job is deterministic without rewriting user-level state.

---

## astro create-key

Generates a key used to encrypt props passed to server islands.

```bash
npx astro create-key
```

The command prints the key. Treat it as secret material; do not repeat it in chat, logs, issue output, or a final report. Set it as `ASTRO_KEY` only in an authorized local secret store and CI/CD or host build settings whenever server islands need a **constant** encryption key across builds:

- rolling deployments
- multi-region hosting
- a CDN caching pages that contain server islands

Without a fixed key, each build generates a new one, and a page cached from an earlier build cannot decrypt props against a newer deployment. Do not substitute arbitrary text: Astro expects a base64-encoded 256-bit AES key, and `astro create-key` guarantees that format.

---

## Background subcommands

**Added in `astro@7.0.0`.** Accepted by `astro dev` and — since **v7.2.0** — by `astro preview`. They operate on a server started with `--background`, tracked through a lock file (`.astro/dev.json` or `.astro/preview.json`). Astro also auto-backgrounds `dev` when it detects Codex or another AI coding agent.

### `stop`

Stops a running background server. Sends `SIGTERM` and waits up to 5 seconds for a graceful exit; if the process is still alive, escalates to `SIGKILL`.

```bash
npx astro dev stop
npx astro preview stop
```

### `status`

Reports whether a background server is running, with its URL, PID, and uptime. This replaces `lsof`/`ps` guesswork — it reads the lock file Astro itself wrote.

```bash
npx astro dev status
```

### `logs`

Prints logs from a background server. **Only works for servers started with `--background`**, since a foreground server writes its logs straight to the terminal.

```bash
npx astro dev logs
npx astro dev logs --follow   # or -f: stream new output, like tail -f
```

| Flag              | Effect                                                                                              |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| `--follow` (`-f`) | Stream new log output as written. Without it, the current log contents print and the command exits. |
