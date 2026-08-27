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
product changes without synchronized documents. The release workflow generates
release metadata but never rewrites curated changelog history.

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
npm run validate:all
```

The release workflow uses pinned immutable action commits:

- `actions/checkout` `v4.2.2` → `11bd71901bbe5b1630ceea73d27597364c9af683`
- `actions/setup-node` `v4.4.0` → `49933ea5288caeca8642d1e84afbd3f7d6820020`
- `mikepenz/release-changelog-builder-action` `v6.2.3` →
  `c9bcd8238b6f41e05561348339429d360b1c0247`

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
