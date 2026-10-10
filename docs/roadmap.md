# Foundation and next steps

## Current foundation

- Repository conventions, contribution and security guidance
- Skills-only starter template
- Structural validator
- Manifest-backed catalog and per-plugin README metadata checks
- Repo-scoped maintenance skill discovered and invoked explicitly and implicitly for a PR-review request in fresh local Codex 0.160.0 sessions; one local/CI preflight for PRs and release packages; a local release-tag gate requiring an annotated tag on reviewed `main` history. The updated `Validate` workflow passed on [PR #1](https://github.com/nerymurillohnd/codex-essentials/actions/runs/37190979560) and [`main` after merge](https://github.com/nerymurillohnd/codex-essentials/actions/runs/37195715144) with the pinned runner and new checkout action; the release workflow has no run.
- GitHub remote created; PR #1 merged into `main` on 2026-10-04

## Plugin status — 2026-10-09

- `svelte-development` 0.1.1 is in the catalog. The initial 0.1.0 package underwent local preflight and representative Codex CLI installation, skill, MCP, editor, and auditor checks on 2026-10-05. The [Validate workflow passed on PR #3](https://github.com/nerymurillohnd/codex-essentials/actions/runs/37395788548); installation from a fresh checkout and a plugin release remain unverified.

- `lsp-intelligence` 0.1.0 merged through [PR #4](https://github.com/nerymurillohnd/codex-essentials/pull/4) as signed commit `24dcd93`. Its post-merge [Validate](https://github.com/nerymurillohnd/codex-essentials/actions/runs/38005806468) and [LSP acceptance](https://github.com/nerymurillohnd/codex-essentials/actions/runs/38005806500) workflows passed. User-scope preview installation, actual Codex CLI requests, a relocated ZIP and a fresh remote branch package were exercised; see the [verification record](../plugins/lsp-intelligence/references/verification.md) for limits.

## Before first public release

- Fix and add regressions for the [P1/P2 runtime maintenance defects](../plugins/lsp-intelligence/references/verification.md#known-maintenance-defects); passing CI does not close them
- Triage the seven open Dependabot alerts observed on 2026-10-09 and verify affected dependency paths before selecting updates
- Verify installation from a tagged release and the supported marketplace source; a remote branch package check is narrower evidence
- Review the package against current OpenAI submission guidance
- Provision the labels in `.github/labels.yml`, verify issue forms, and configure branch rules; recheck their current remote state rather than relying on the dated foundation snapshot
- Verify the release workflow with the first reviewed plugin tag; no release run has occurred
- Confirm the published security contact and decide whether to enable private vulnerability reporting
- Review each plugin's license, branding, permissions, and public listing metadata
