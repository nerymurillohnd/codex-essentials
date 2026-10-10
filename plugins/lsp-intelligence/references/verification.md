# Verification evidence

Verified locally on 2026-10-09, macOS ARM64, Codex CLI 0.162.0, nvm Node 24.21.0 and npm 12.2.0; Python through uv. These results describe this prepared package, not a public release.

## Executed acceptance

| Lane | Result and scope |
| --- | --- |
| Static checks | Strict TypeScript compilation, Biome, reproducible bundled runtime and complete third-party licenses passed. Ruff checks and formatting passed for the changed Python files. |
| Repository preflight | Nine Python tests and six existing Svelte helper tests passed; catalog, links, manifests, issues, ADRs and packaging gates passed. |
| Unit and MCP protocol | 19 cases passed: isolation, simultaneous startup, active resource limits, invalid paths and positions, UTF-16 boundaries, nested secret-target refusal, missing backend errors, pending diagnostics, unsigned formats, case-sensitive license discovery, checksums, concurrency, interrupted mutation recovery and rollback identity. |
| Real servers | Six stdio cases passed using official mcpls 0.7.0: TypeScript, JavaScript, Svelte, Astro, Python and Bash. TypeScript covers definitions, references, hover, document/workspace symbols, an actual organize-imports edit preview, error-to-clean diagnostics and separate workspaces. JavaScript verifies diagnostics and definition routing. Other profiles verify diagnostics and symbols; their import-action checks verify response shape, not a positive action guarantee. |
| Relocated package | The TypeScript acceptance case passed from both an extracted ZIP and a clean package-only copy outside `plugins/`. Neither package copy contains `node_modules`; the external test harness supplies its own client SDK. |
| Fresh remote checkout | The TypeScript acceptance case passed against the package bundle from a new checkout of `feat/lsp-intelligence` at `201b3cf`, with no development dependencies inside that checkout. The external harness and managed runtime are separate. |
| Linux x64 | [LSP acceptance](https://github.com/nerymurillohnd/codex-essentials/actions/runs/38000776859) passed on Ubuntu 24.04, nvm Node 26.11.1 and uv Python 3.14.8 at `201b3cf`. All six real-server cases and release preflight passed. [Validate](https://github.com/nerymurillohnd/codex-essentials/actions/runs/38000776889) also passed. |
| Merged main | [PR #4](https://github.com/nerymurillohnd/codex-essentials/pull/4) merged as verified signed commit `24dcd93` on 2026-10-09. Local preflight on the synchronized primary checkout passed; post-merge [Validate](https://github.com/nerymurillohnd/codex-essentials/actions/runs/38005806468) and [LSP acceptance](https://github.com/nerymurillohnd/codex-essentials/actions/runs/38005806500) passed. The feature branch was deleted locally and remotely. |
| Global preview | Installed all five runtime profiles at the user-level default path. Registered `codex-essentials-lsp-preview` and installed its plugin using the official Codex CLI. Removal and reinstallation refreshed the package cache after review fixes. |
| Actual Codex session | A fresh CLI conversation selected diagnostic/navigation skills without a skill-name prompt, invoked installed MCP tools, observed pending then published TS2322, retried an import alias and resolved `add` to `math.ts` with three references. An earlier direct LSP request also invoked installed tools successfully. |
| Managed maintenance | Actual global update and bridge rollback completed and reported all profiles ready. Existing fixtures cover metadata recovery, one dead-owner lock reclamation, concurrent first-install refusal and rejection of externally altered active/backup binaries. They do not cover concurrent stale-lock reclamation or identical updates preserving an earlier backup; see the confirmed defects below. Rollback covers the bridge only. |
| Workflow audit | Zizmor reported no new findings for the three changed workflows. Checkout and setup-uv use verified commit pins; checkout does not persist credentials. npm 12.2.0 is a locked development dependency selected after bootstrap with Node's bundled npm. |

## Reproduce

Use Node through nvm and Python through uv. From the repository:

```sh
npm ci --ignore-scripts --no-audit --no-fund
node plugins/lsp-intelligence/scripts/runtime.mjs install --profile all --runtime-root .lsp-test-runtime/managed
npm run test:lsp
npm run test:lsp:integration
npm run check:lsp
uv run python scripts/preflight.py release lsp-intelligence
```

The integration suite defaults to `.lsp-test-runtime/managed`; `LSP_TEST_RUNTIME` can select another non-secret runtime path. `LSP_TEST_BUNDLE` can select a relocated server bundle. Missing prerequisites fail instead of being skipped.

## Pending evidence and limits

- The plugin is merged into `main`; the verified global installation remains `lsp-intelligence@codex-essentials-lsp-preview`. No GitHub release or release-workflow run exists as checked on 2026-10-09. Tagged release installation and public directory publication remain unverified.
- The relocated ZIP and fresh remote branch checks establish executable package independence, not installation from a published release or from merged `main`.
- Model-driven selection was observed in representative CLI requests. It cannot guarantee LSP invocation after every future edit.
- Published push-cache diagnostics can remain stale immediately after an edit. The skills require observing the expected change and running project gates.
- Svelte, Astro, Python and Bash received representative diagnostics/symbol checks, not exhaustive support for all 31 native tools. Query `lsp_get_tool_support`; unsupported and empty responses do not prove correctness.
- Managed bridge recovery has verified interruption and metadata-write-failure cases, but the concurrent stale-lock case remains defective. It is not a power-loss durability guarantee. Profile package installs use native npm/uv behavior and are not transactionally rolled back with the bridge.
- The adapter rejects direct secret-file targets. External language servers may independently read authorized project configuration; they are not a filesystem sandbox.

## Linux findings resolved

The first Linux run exposed a case-sensitive license filename bug: `path-key` uses `license`, while the scanner guessed uppercase names. Actual directory-entry discovery now handles case variations and still refuses absent or empty licenses; the added regression passed.

The Bash fixture originally depended on optional local ShellCheck hints for a constant string. The strengthened fixture uses an unknown positional argument and requires `SC2086`, matching [ShellCheck's documented word-splitting check](https://www.shellcheck.net/wiki/SC2086). The stronger assertion failed on the original input, then passed locally and in Linux with the corrected input. No diagnostic rule or gate was disabled.

## Known maintenance defects

An independent read-only review of `f20c88a` reproduced two defects. The maintainer requested the merge after receiving those findings; they remain present in `24dcd93`. Passing CI and the representative update/rollback checks above do not establish that these cases are safe.

- **P1 — Concurrent stale-lock reclamation:** in `withRuntimeLock` in [bridge-storage.ts](../src/bridge-storage.ts), two contenders can both observe a dead owner. One contender's delayed recursive deletion can remove the other's newly acquired lock. A controlled filesystem interleaving reproduced overlapping mutations, a binary/state hash mismatch and refusal of the next maintenance operation. Fix ownership-safe reclamation and add a two-contender regression that verifies mutual exclusion and journal/bin/state consistency. The reproduction establishes the race, not its frequency.
- **P2 — Identical update loses rollback:** `activateBridgeUnlocked` only treats an identical artifact as a no-op when `update` is false. A sequence of old-version installation, new-version update and identical new-version update replaced the old backup; rollback retained the new version. Preserve the backup when version and hash match regardless of the update flag, allow profile installation to continue and add a regression for an identical update followed by rollback.

These isolated review fixtures are not part of the 19 checked-in unit/protocol cases. No implementation fix is included in this documentation update.

As checked on 2026-10-09, [Dependabot](https://github.com/nerymurillohnd/codex-essentials/security/dependabot) also has seven open dependency alerts: one high, five medium and one low. Dependency-path and exposure analysis remains pending; this count does not establish which shipped runtime paths are affected.
