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
| Global preview | Installed all five runtime profiles at the user-level default path. Registered `codex-essentials-lsp-preview` and installed its plugin using the official Codex CLI. Removal and reinstallation refreshed the package cache after review fixes. |
| Actual Codex session | A fresh CLI conversation selected diagnostic/navigation skills without a skill-name prompt, invoked installed MCP tools, observed pending then published TS2322, retried an import alias and resolved `add` to `math.ts` with three references. An earlier direct LSP request also invoked installed tools successfully. |
| Managed maintenance | Actual global update and bridge rollback completed and reported all profiles ready. Failure fixtures prove metadata recovery, dead-process lock reclamation, concurrent-install refusal and rejection of externally altered active/backup binaries. Rollback covers the bridge only. |
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

- Signed commits were pushed to `feat/lsp-intelligence`; [PR #4](https://github.com/nerymurillohnd/codex-essentials/pull/4) is open with `enhancement` and `documentation` labels. Merge, tags, GitHub releases and public directory publication have not been performed. The global installation is a local preview; `main` remains unchanged.
- The relocated ZIP and fresh remote branch checks establish executable package independence, not installation from a published release or from merged `main`.
- Model-driven selection was observed in representative CLI requests. It cannot guarantee LSP invocation after every future edit.
- Published push-cache diagnostics can remain stale immediately after an edit. The skills require observing the expected change and running project gates.
- Svelte, Astro, Python and Bash received representative diagnostics/symbol checks, not exhaustive support for all 31 native tools. Query `lsp_get_tool_support`; unsupported and empty responses do not prove correctness.
- Managed bridge recovery covers process interruption and metadata-write failures. It is not a power-loss durability guarantee. Profile package installs use native npm/uv behavior and are not transactionally rolled back with the bridge.
- The adapter rejects direct secret-file targets. External language servers may independently read authorized project configuration; they are not a filesystem sandbox.

## Linux findings resolved

The first Linux run exposed a case-sensitive license filename bug: `path-key` uses `license`, while the scanner guessed uppercase names. Actual directory-entry discovery now handles case variations and still refuses absent or empty licenses; the added regression passed.

The Bash fixture originally depended on optional local ShellCheck hints for a constant string. The strengthened fixture uses an unknown positional argument and requires `SC2086`, matching [ShellCheck's documented word-splitting check](https://www.shellcheck.net/wiki/SC2086). The stronger assertion failed on the original input, then passed locally and in Linux with the corrected input. No diagnostic rule or gate was disabled.
