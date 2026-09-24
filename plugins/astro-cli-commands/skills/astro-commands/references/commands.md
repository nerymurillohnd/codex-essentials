# CLI Command Map

Read this reference when choosing Astro commands, flags, or package-manager
forms. Verify current details against the official Astro CLI reference before
making version-sensitive changes.

## Package-manager forms

Prefer declared project scripts when they exist and match the task:

```sh
npm run dev
pnpm dev
yarn dev
```

When passing flags through npm scripts, include the extra `--` separator:

```sh
npm run dev -- --help
npm run build -- --site https://example.com
```

Use direct Astro commands only after identifying the package manager and local
tooling:

```sh
npx astro check
pnpm astro check
yarn astro check
```

For new projects, use the documented create flow. The Astro tutorial describes
`npm create astro@latest`, `pnpm create astro@latest`, and `yarn create astro`.
A new Astro project must be created in an empty folder.

## Core commands

- `astro dev`: start the local development server with hot module replacement.
  Common flags include `--port`, `--host`, `--open`, `--force`, and
  `--allowed-hosts`.
- `astro build`: build the project for deployment. Use `--devOutput` only for
  debugging build-only issues where Astro 5+ supports it.
- `astro preview`: serve the built output from `dist/` by default for local
  verification after `astro build`. It is not a production server.
- `astro check`: run Astro diagnostics, including type checking inside `.astro`
  files. It exits with code 1 when errors meet the failing threshold and is
  intended for CI workflows.
- `astro sync`: generate Astro module types such as `.astro/types.d.ts`.
  `astro dev`, `astro build`, and `astro check` also run sync.
- `astro add`: add supported integrations and update project configuration.
  Inspect the planned config and dependency changes.
- `astro info`: print environment information for diagnostics or issue reports.
- `astro docs`: open Astro documentation in a browser when interactive browsing
  is useful.
- `astro preferences`: manage user preferences such as `devToolbar` and
  `checkUpdates`, scoped to the project by default or global with `--global`.
- `astro telemetry`: enable, disable, or reset Astro telemetry for the current
  CLI user. CI can also set `ASTRO_TELEMETRY_DISABLED`.
- `astro create-key`: generate an `ASTRO_KEY` value for server-island props
  encryption. Treat the generated value as a secret and do not print it in
  reports.

## Common flags

- `--root <path>` chooses the project root.
- `--config <path>` chooses a non-default Astro config.
- `--site <url>` and `--base <pathname>` override corresponding config values.
- `--mode <string>` configures Astro's inline `mode`.
- `--port <number>` changes the dev or preview port.
- `--host` exposes dev or preview beyond localhost; use only for local device
  testing, not production.
- `--allowed-hosts` constrains hostnames Astro may respond to in dev or preview.
- `--verbose` helps debug; `--silent` suppresses console output.
