# GitHub Label Contract

The repository uses GitHub labels for issue intake and triage.
`.github/label-contract.json` is the versioned contract for labels referenced
by repository configuration; it does not delete GitHub's default labels.

## Maintained labels

| Label             | Use                                                    |
| ----------------- | ------------------------------------------------------ |
| `bug`             | Reproducible problems and fixes                        |
| `breaking-change` | Changes that require migration                         |
| `catalog`         | Generated marketplace catalog changes                  |
| `dependencies`    | Dependency updates and maintenance                     |
| `documentation`   | Documentation changes                                  |
| `enhancement`     | New features or improvements                           |
| `github_actions`  | GitHub Actions changes                                 |
| `hook`            | Plugin hook package or reference changes               |
| `plugin-change`   | Marketplace plugin change proposals                    |
| `plugin-manifest` | Plugin manifest contract changes                       |
| `release-control` | Versioning, changelog, or release-control changes      |
| `security`        | Security-related changes                               |
| `skill-contract`  | Skill instructions or agent metadata contract changes  |
| `tooling`         | Repository tooling, schema, validator, or test changes |

Issue templates may reference only labels listed in the contract.

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
