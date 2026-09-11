---
status: accepted
date: 2026-08-31
decision-makers: Nery Samuel Murillo
consulted: Codex
informed: Repository contributors and plugin consumers
---

# Retire GitHub Pages from the marketplace repository

## Context and Problem Statement

Codex Essentials is a public marketplace repository for distributable Codex
plugins. GitHub Pages was enabled as an additional publication surface even
though the repository has no site entry point or web application boundary. The
result was a Pages-managed workflow, a `github-pages` environment, and stale
deployment records that were unrelated to plugin distribution.

How should the repository publish and document plugins without maintaining a
second, non-authoritative web surface?

## Decision Drivers

- Keep the repository focused on plugin packages and marketplace metadata.
- Keep documentation versioned, reviewable, and authoritative in the repository.
- Avoid unused GitHub environments and generated workflows.
- Publish plugins through the public repository and generated catalog.

## Considered Options

- Keep GitHub Pages as a future documentation surface.
- Replace GitHub Pages with a new documentation website.
- Retire GitHub Pages and use the repository and generated catalog.

## Decision Outcome

Chosen option: "Retire GitHub Pages and use repository-native publication"
because it matches the repository architecture and avoids a second source of
documentation or distribution truth.

The repository must not configure or re-enable GitHub Pages, the `github-pages`
environment, or a Pages-managed workflow without a new accepted architecture
decision. The README is the public project entry point, `docs/` is the
canonical versioned documentation surface, and `.agents/plugins/marketplace.json`
is the generated catalog.

## Consequences

- Good, because plugin publication has one clear repository-native path.
- Good, because documentation changes remain reviewable in Git history.
- Good, because no Pages credentials, environment approval, or site build is
  required.
- Trade-off, because a future public tutorial or documentation site would need
  a separately approved architecture and implementation.

## Confirmation

On 2026-08-31, the remote `github-pages` environment was deleted after Pages
was disabled. The public Pages URL returns `404`, and the repository has no
active Pages environment. GitHub retains the `pages-build-deployment` workflow
entry as a managed historical UI record; it is not a repository file and the
available GitHub API does not permit deleting or disabling that entry.

The earlier README audit remains a historical snapshot. Its possible Pages
recommendation was not adopted and is superseded by this decision.

## More Information

- [README audit snapshot](../audits/2026-08-30-readme-audit-review.md)
- [Retire the GitHub Wiki](adr-0011-retire-github-wiki.md)
