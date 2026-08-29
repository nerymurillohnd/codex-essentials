# GitHub Label Contract

The repository uses GitHub labels for issue intake and release-note
categorization. `.github/label-contract.json` is the versioned contract for
labels referenced by repository configuration; it does not delete GitHub's
default labels.

## Maintained labels

| Label             | Use                                          |
| ----------------- | -------------------------------------------- |
| `bug`             | Reproducible problems and fixes              |
| `breaking-change` | Changes that require migration               |
| `dependencies`    | Dependency updates and maintenance           |
| `documentation`   | Documentation changes                        |
| `enhancement`     | New features or improvements                 |
| `github_actions`  | GitHub Actions changes                       |
| `plugin-change`   | Marketplace plugin change proposals          |
| `security`        | Security-related changes                     |
| `skip-changelog`  | Exclude an item from generated release notes |

The issue templates and `.github/release.yml` may reference only labels listed
in the contract. The `*` release category fallback is intentionally not a
label and is excluded from validation.

## Validation

Run the local contract check with:

```sh
npm run validate:github-labels
```

The same check runs as the required `GitHub label contract` job in the Quality
workflow. When adding a new referenced label, update the contract, create or
update the corresponding GitHub label, and change the consuming configuration
in the same Pull Request.

The repository does not automatically delete unlisted labels. Unused default
labels may remain available for future issue triage.
