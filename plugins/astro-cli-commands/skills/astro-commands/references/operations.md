# Astro CLI — Operating conventions

Operational consequences of the CLI surface: how to detect what a project uses, how to gate CI, how background servers behave under Codex, and what has to be persisted across deployments. Re-verify version-sensitive behavior against the installed CLI.

## Contents

- [Detecting the project setup](#detecting-the-project-setup)
- [Package manager policy](#package-manager-policy)
- [package.json scripts](#packagejson-scripts)
- [CI pipeline](#ci-pipeline)
- [Background servers and agent sessions](#background-servers-and-agent-sessions)
- [Server islands and ASTRO_KEY](#server-islands-and-astro_key)
- [Config override precedence](#config-override-precedence)
- [Verification protocol](#verification-protocol)

---

## Detecting the project setup

Read the project rather than assuming it. Four checks, all cheap, none of which go stale:

```bash
npx astro --version          # CLI surface available (see the version gate in SKILL.md)
cat package.json             # scripts, adapter, integrations, pin style
ls package-lock.json pnpm-lock.yaml yarn.lock 2>/dev/null   # package manager
npm why astro                # peer constraints from adapters and integrations
```

`npm why astro` is the one worth running before proposing an Astro upgrade: adapters and framework integrations declare peer ranges, and they constrain the upgrade path. If `@astrojs/<adapter>` declares `astro@^7.0.0`, a move to Astro 8 waits on that adapter publishing a compatible major. Check the peers first, not after.

An exact pin (`"astro": "7.2.0"`) versus a range (`^7.2.0`) tells you whether upgrades in that project are deliberate acts or side effects of `npm install`. Respect whichever convention the project already uses.

## Package manager policy

Match the lockfile and existing scripts (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`). Never propose switching package managers to work around a problem. The examples below are npm.

```bash
npm run <script>     # dev, build, preview
npx astro <command>  # everything else
```

`npx` resolves `node_modules/.bin/astro` — it does not download anything as long as `astro` is a project dependency. If `npx astro` attempts a download, the working directory is wrong or `npm install` has not run.

**The `--` separator** is required for reliable flag forwarding through `npm run`:

```bash
npm run dev -- --port 8080   # correct
npm run dev --port 8080      # npm may parse or misroute the option/value
```

With npm 11.17.0, the second form warned and forwarded `8080` as a positional argument. Other npm versions may reject or consume it. The separator is the stable contract.

---

## package.json scripts

Written by the `create astro` wizard:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  }
}
```

Worth adding for a project with CI (a recommendation, not an Astro default):

```json
{
  "scripts": {
    "check": "astro check",
    "sync": "astro sync",
    "ci": "astro check --minimumFailingSeverity warning"
  }
}
```

Baking recurring flags into a script body removes the `--` forwarding problem entirely for those flags.

---

## CI pipeline

`astro check` exits `1` on errors, which makes it the natural gate. Three rules:

1. **Gate on `--minimumFailingSeverity`, not `--minimumSeverity`.** The second only changes what gets printed. A pipeline configured with the wrong one reports cleanly and gates nothing — a failure that is invisible until bad code is already deployed.
2. **Disable telemetry with `ASTRO_TELEMETRY_DISABLED=1`.** This removes a network side effect without mutating user-level telemetry settings.
3. **Keep the normal implicit sync.** `astro check` runs `astro sync`; only add a separate sync step when another tool needs generated types first. Treat the hidden `--noSync` flag as version-pinned internal behavior.

```bash
ASTRO_TELEMETRY_DISABLED=1 npx astro check --minimumFailingSeverity warning
ASTRO_TELEMETRY_DISABLED=1 npm run build
```

As a GitHub Actions job — `astro check` exiting `1` is what fails the step, so no extra assertion logic is needed:

```yaml
env:
  ASTRO_TELEMETRY_DISABLED: 1
steps:
  - uses: actions/setup-node@v7
    with:
      node-version-file: .nvmrc
      cache: npm
  - run: npm ci
  - run: npx astro check --minimumFailingSeverity warning
  - run: npm run build
    env:
      ASTRO_KEY: ${{ secrets.ASTRO_KEY }}
```

`ASTRO_KEY` belongs on the build step, not the check step — it is consumed when server islands are compiled. Injecting it from secrets rather than regenerating it per run is what keeps cached pages decryptable across deployments.

---

## Background servers and agent sessions

Astro tracks background servers through a lock file: `.astro/dev.json` or `.astro/preview.json`, holding URL, port, and PID.

**`--background` is injected automatically when an AI coding agent is detected.** Practical consequences inside a Codex session:

- The dev server runs detached with JSON logging, and is discoverable with `npx astro dev status` — no `lsof` or `ps` guessing.
- Stop it with `npx astro dev stop` (SIGTERM, 5s grace, then SIGKILL), not `kill -9`.
- Read its output with `npx astro dev logs --follow`. Foreground servers write to the terminal instead and have no log file to follow.
- "Already running" is not an error to work around — inspect with `status`, then either reuse it or `--background --force` to replace it.
- `--ignore-lock` is deliberately outside this system. A server started with it cannot be seen by `status` or stopped by `stop`, and combining it with `--background` or `--force` throws. Use it only for a genuine second concurrent server on another port.

---

## Server islands and ASTRO_KEY

Wherever a CDN caches pages that contain server islands, **a fixed `ASTRO_KEY` is mandatory, not optional**.

```bash
npx astro create-key
```

When authorized, store the output as `ASTRO_KEY` in a local secret file and in the host's build environment — Cloudflare, Netlify, Vercel, or wherever the build runs. It is required whenever any of these hold:

- rolling deployments
- multi-region hosting
- a CDN caching pages that contain server islands

Without it, every build mints a new key, and a page cached from an earlier build cannot decrypt props against the newer deployment. The failure appears only on cached pages, only in production, after a deploy that otherwise looked clean.

`astro create-key` prints a base64-encoded 256-bit AES key. Treat it as secret material: do not echo it into chat, logs, issues, or reports, and do not write it to `.env`, CI, or a remote host unless that secret mutation is authorized. Do not substitute arbitrary text.

---

## Config override precedence

`--outDir`, `--site`, and `--base` passed on the command line **override** `astro.config.mjs`. A flag sitting in a deploy script or CI job that silently beats committed config is a recurring source of environment drift. When environments disagree about output paths or canonical URLs, audit the invocation before auditing the config.

---

## Verification protocol

`commands.md` and `flags.md` were verified 2026-08-20 against Astro 7.2.2. They remain a point-in-time reference, not a live contract.

**Gate:**

```bash
npx astro --version
```

| Result         | Action                                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------------------------- |
| `7.2.x`        | Use the references as a baseline; command-specific local `--help` wins on conflict.                             |
| Other `7.x`    | Confirm the specific command with local `--help`; use the version matrix for additions.                         |
| `8.x` or newer | Treat the snapshot as provisional. Confirm local help and query Context7 before executing the disputed surface. |
| `6.x` or older | Assume the v7 additions are absent and re-verify before relying on them.                                        |

**Evidence order:** installed `npx astro <command> --help`, installed package source when a hidden behavior matters, then Context7 (`/withastro/astro`) for current repository documentation and source. Context7's default branch can be newer than the installed package, so do not let it override exact-version local evidence silently.

**When the gate fails, fail loudly.** Say which version was found, which claims were re-verified, and against what. Silently degrading to training-data knowledge is the failure this skill exists to prevent — the snapshot is only trustworthy because its boundary is stated.

**Staleness signals to act on**, even when the version matches: a command rejects a documented flag; `--help` lists something absent from these files; a deprecation warning appears. Any of those means the snapshot has drifted and should be re-verified and updated at the source, not worked around.
