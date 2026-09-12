---
status: accepted
date: 2026-09-12
decision-makers: Nery Samuel Murillo, Codex
consulted: Official OpenAI Codex GitHub Action and Codex code review documentation
informed: Repository contributors
---

# Add a Codex pull request review workflow

## Context and Problem Statement

The repository needs an automated review pass that can catch consequential
plugin, marketplace, documentation, security, and validation issues on pull
requests. OpenAI provides a Codex GitHub Action that can run from CI and post
feedback.

How should Codex PR review be wired without overexposing repository secrets?

## Decision Drivers

- Keep OpenAI API credentials in GitHub secrets.
- Avoid running secret-backed workflows on forked pull requests.
- Keep Codex read-only for review.
- Keep review guidance versioned in the repository.

## Considered Options

- Use only ChatGPT/Codex hosted repository review settings.
- Add a GitHub Action that runs on every pull request, including forks.
- Add a same-repository-only GitHub Action with read-only Codex execution.

## Decision Outcome

Chosen option: "Add a same-repository-only GitHub Action with read-only Codex
execution" because it automates feedback while limiting secret exposure.

The workflow lives at `.github/workflows/codex-pr-review.yml`, uses
`openai/codex-action@v1`, reads `.github/codex/prompts/pr-review.md`, runs with
`sandbox: read-only` and `safety-strategy: drop-sudo`, and posts the final
message to the pull request.

### Consequences

- Good, because PRs get an additional high-signal review pass.
- Good, because forked PRs cannot access `${OPENAI_API_KEY}` through this
  workflow.
- Bad, because forked contributions need a separate manual review path.

### Confirmation

Run `npx prettier --check .github/workflows/codex-pr-review.yml
.github/codex/prompts/pr-review.md` and `npm run check`.
