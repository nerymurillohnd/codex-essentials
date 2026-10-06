# Foundation and next steps

## Current foundation

- Repository conventions, contribution and security guidance
- Skills-only starter template
- Structural validator
- Manifest-backed catalog and per-plugin README metadata checks
- Repo-scoped maintenance skill discovered and invoked explicitly and implicitly for a PR-review request in fresh local Codex 0.160.0 sessions; one local/CI preflight for PRs and release packages; a local release-tag gate requiring an annotated tag on reviewed `main` history. The updated `Validate` workflow passed on [PR #1](https://github.com/nerymurillohnd/codex-essentials/actions/runs/37190979560) and [`main` after merge](https://github.com/nerymurillohnd/codex-essentials/actions/runs/37195715144) with the pinned runner and new checkout action; the release workflow has no run.
- GitHub remote created; PR #1 merged into `main` on 2026-10-04

## First plugin

- `svelte-development` 0.1.0 is in the catalog. Local package preflight and representative Codex CLI installation, skill, MCP, editor, and auditor checks were performed on 2026-10-05. The [Validate workflow passed on PR #3](https://github.com/nerymurillohnd/codex-essentials/actions/runs/37395788548); installation from a fresh checkout and a plugin release remain unverified.

## Before first public release

- Verify installation from a fresh checkout and review the package against current OpenAI submission guidance
- Provision the labels in `.github/labels.yml`, verify issue forms, and configure branch rules; GitHub currently has default labels and no `main` protection
- Verify the release workflow with the first reviewed plugin tag; no release run has occurred
- Confirm the published security contact and decide whether to enable private vulnerability reporting
- Review each plugin's license, branding, permissions, and public listing metadata
