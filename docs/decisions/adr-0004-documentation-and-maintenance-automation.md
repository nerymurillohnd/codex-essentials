---
status: accepted
date: 2026-08-27
decision-makers: Nery Samuel Murillo
consulted: None recorded
informed: Marketplace contributors and maintainers
---

# Systematize plugin documentation and maintenance

## Context and Problem Statement

Codex Essentials is a community marketplace and data repository rather than a
web application. A plugin is a distributable product whose manifest,
documentation, changelog, permissions, installation behavior, and release
metadata must remain synchronized across local files and GitHub.

The repository had manifest generation and validation but no enforced product
documentation contract, pull-request gate, release workflow, or documented
organization-level Project model.

## Decision Drivers

- Keep documentation human-readable and portable.
- Make omissions fail before merge instead of after release.
- Preserve independent plugin versioning and rollback boundaries.
- Use least-privilege, reviewable, secret-safe automation.
- Keep local schemas and validators authoritative for package structure.

## Considered Options

- Manual README and changelog maintenance with no CI enforcement.
- One repository-wide changelog and release cadence.
- Per-plugin documentation and SemVer with PR gates and release metadata.

## Decision Outcome

Chosen option: **Per-plugin documentation, changelogs, releases, and CI gates**.

Every plugin must contain `README.md`, `CHANGELOG.md`, and
`.codex-plugin/plugin.json`. Generator and validator tooling enforce this
contract. Product changes update README and `Unreleased` in the same PR. Tags
use `plugin/<plugin-id>/v<semver>`.

GitHub Issue Forms, a Markdown pull-request template, and native release-note
categories standardize contribution metadata. A documentation gate rejects
product changes without synchronized documents. Release mechanics are defined
by ADR-0008: Release Please generates component release sections from
Conventional Commits, while contributors retain ownership of product
documentation and the Unreleased intent.

The organization-level Project is specified in repository documentation and
bootstrapped idempotently with `${GITHUB_ORG}` and `${PROJECT_TITLE}`. Project
fields hold cross-repository coordination only; Issues and pull requests remain
the source of truth for labels, assignees, milestones, and descriptions.

### Consequences

- Good, because a generated plugin is publishable documentation-wise from the
  first scaffold.
- Good, because review and release failures are actionable and reproducible.
- Good, because independent plugin releases avoid coupling unrelated products.
- Bad, because contributors must update more than the manifest for product
  changes.
- Bad, because organization-level Project bootstrap requires separate GitHub
  permissions and cannot be represented by a personal repository alone.

### Confirmation

The decision is confirmed by:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run typecheck:scripts
npm test -- --coverage
npm run marketplace:check
```

The release and validation workflows use pinned immutable action commits. The
pins were reviewed against the upstream release pages on 2026-08-27:

- `actions/checkout` `v7.0.1` → `3d3c42e5aac5ba805825da76410c181273ba90b1`
- `actions/setup-node` `v7.0.0` → `820762786026740c76f36085b0efc47a31fe5020`

Plugin release notes are built from the curated plugin `CHANGELOG.md`, not from
generated pull-request metadata. Release drafts attach a deterministic archive
of the target plugin and record the validated tag commit, plugin tree SHA, and
archive checksum.

GitHub's current runner migration notice states that Node.js 24 became the
default on 2026-06-16 and Node.js 20 is scheduled for removal on 2026-09-23.
Workflows and jobs that execute repository Node tooling therefore select
Node.js 24 explicitly and use the latest Node.js-24-compatible action majors.
Action-only security jobs, such as dependency review, CodeQL, and actionlint,
do not install repository Node dependencies. The workflows run on
`ubuntu-latest`; contributors maintaining self-hosted runners must provide the
runner version required by these action releases. Node.js 24 does not support
macOS 13.4 or older, or ARM32 runners.

## Pros and Cons of the Options

### Manual documentation

- Good, because it has no workflow maintenance cost.
- Bad, because missing documents are discovered late and cannot be audited.

### One repository-wide release

- Good, because release tooling is simpler.
- Bad, because unrelated plugins share versioning, rollback, and release risk.

### Per-plugin lifecycle with gates

- Good, because ownership, SemVer, changelog history, and rollback are scoped.
- Good, because GitHub automation can validate changed plugin directories.
- Bad, because the repository needs more validation and release configuration.

## More Information

- [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/)
- [GitHub Issue Forms syntax](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-githubs-form-schema)
- [Automatically generated release notes](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes)
- [GitHub Projects automation](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project)
- [Organization Project templates](https://docs.github.com/en/issues/planning-and-tracking-with-projects/managing-your-project/managing-project-templates-in-your-organization)
- [actions/checkout releases](https://github.com/actions/checkout/releases)
- [actions/setup-node releases](https://github.com/actions/setup-node/releases)
- [Node.js 20 deprecation on GitHub Actions runners](https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/)
