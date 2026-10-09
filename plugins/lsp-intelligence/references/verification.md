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

- Linux x64 real-server acceptance is configured in `lsp-acceptance.yml` but has not run remotely. An authorized push and successful workflow run are required before claiming Linux acceptance.
- Signed commits, a labeled PR, merge, tags, GitHub releases and public directory publication have not been performed. The global installation is a local preview; the public marketplace source remains unchanged.
- The relocated ZIP test establishes executable package independence, not installation from a published release or a fresh remote checkout.
- Model-driven selection was observed in representative CLI requests. It cannot guarantee LSP invocation after every future edit.
- Published push-cache diagnostics can remain stale immediately after an edit. The skills require observing the expected change and running project gates.
- Svelte, Astro, Python and Bash received representative diagnostics/symbol checks, not exhaustive support for all 31 native tools. Query `lsp_get_tool_support`; unsupported and empty responses do not prove correctness.
- Managed bridge recovery covers process interruption and metadata-write failures. It is not a power-loss durability guarantee. Profile package installs use native npm/uv behavior and are not transactionally rolled back with the bridge.
- The adapter rejects direct secret-file targets. External language servers may independently read authorized project configuration; they are not a filesystem sandbox.
