---
status: accepted
date: 2026-09-11
decision-makers: Nery Samuel Murillo, Codex
consulted: Official OpenAI Codex GitHub review documentation
informed: Repository contributors
---

# Use Codex Cloud GitHub review with ChatGPT authentication

## Context and Problem Statement

The repository's GitHub Actions review workflow required an OpenAI Platform API
key. The project uses ChatGPT Pro and Codex Cloud review instead; the action
failed before it could review a pull request because no API key was configured.

## Decision Outcome

Remove the `openai/codex-action` workflow and its prompt. Configure Code Review
for the connected repository in Codex Cloud and request reviews with
`@codex review` when automatic review is not enabled. This uses the linked
ChatGPT account and does not require an API key in GitHub Actions.

## Consequences

- GitHub Actions no longer runs a redundant, API-key-based Codex review.
- Codex Cloud remains an advisory review layer; local validation and GitHub
  protections remain independent controls.

## Confirmation

Verify the repository is connected in Codex Cloud, enable Code Review, and use
`@codex review` on a representative pull request.
