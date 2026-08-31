# Recommendation report

After the read-only audit and live verification, return this order exactly.

## 1. Scope

State target repository/workspace; included packages/directories and sibling repositories; included user-level locations; and excluded locations with reasons.

## 2. Inventory

List installed Prettier and location; effective config and precedence; plugins/versions; package manager/lockfile; scripts; CLI and IDE resolution; editor and ignore behavior; hooks/CI; other formatters/lint integrations; and relevant file types/parsers.

## 3. Detected house style

List every convention with evidence and label it as explicitly configured, inferred, documented default, or unresolved. Do not call a default a repository convention.

## 4. Conflicts and risks

List severity, evidence, and impact. Include broad churn, plugin/runtime compatibility, CI mismatch, line endings, generated files, linter interaction, developer experience, and release/deployment effects when applicable.

## 5. Prioritized recommendation

Order items as: required for correctness, recommended for maintainability, optional improvements, and not recommended now. Explicitly assess a quality-integration track for linters and Prettier plugins, even if they are currently absent. For each item state the exact change, reason, repository and official evidence, affected files, mutation categories, CLI/IDE effect, and whether it can be approved independently.

## 6. Complete proposed changes

For every affected file, show a complete unified diff or full replacement file. State explicitly when no file change is needed. For dependencies, include the full `package.json` diff, expected lockfile impact, exact post-approval command, and that it has not run. For formatting, give the exact command, scope, check/write mode, expected changed-file categories, and broad-churn warning.

## 7. Evidence

For every material recommendation, cite relevant local paths/scripts/configuration and direct official documentation, release notes, changelog, or registry metadata.

## 8. Approval gate

End exactly in substance with:

```text
No changes have been made.

Approve one or more items by number, for example:
- “Approve 1 and 2”
- “Approve only the config diff”
- “Approve all proposed changes”
- “Reject 3; revise the CI recommendation”

I will apply only the approved items and will not add unapproved formatting, dependency, hook, CI, or editor changes.
```

Stop after the plan. Do not implement until approval is unequivocal.
