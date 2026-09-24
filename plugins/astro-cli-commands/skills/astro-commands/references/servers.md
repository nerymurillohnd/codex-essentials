# Server Operations

Read this reference before starting, stopping, inspecting, or exposing Astro dev
or preview servers.

## Foreground servers

Use a foreground server when the task needs live logs or when the agent can keep
the terminal session open:

```sh
npm run dev
npm run preview
```

Record the command, URL, port, and how the process will be stopped. If the
server is needed only for a quick smoke test, stop it before final handoff.

## Background servers

Astro supports `--background` for `dev`, and current docs state that preview
also supports it starting in Astro 7.2.0. When background mode is active, Astro
writes a lock file such as `.astro/dev.json` or `.astro/preview.json` with the
server URL, port, and PID. It also enables JSON logging.

Use these subcommands when supported by the installed Astro version:

```sh
astro dev status
astro dev logs
astro dev logs --follow
astro dev stop
```

Check help for the exact installed command surface before using a preview server
subcommand. If the lockfile, PID, or command output disagrees, inspect the
process table and prefer a targeted stop over broad process cleanup.

## Network exposure

The `--host` flag makes dev or preview listen beyond localhost. Use it only for
local network testing, document why it is needed, and avoid it for CI or
production. Pair `--host` with `--allowed-hosts` when testing through tunnels,
custom domains, or devices that require a specific hostname.

`astro preview` serves build output locally so you can catch build-output issues
before deployment. It is not designed for production hosting.
