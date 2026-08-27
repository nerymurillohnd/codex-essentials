# Community GitHub Project Template

Codex Essentials uses one organization-level Project as the operational view
for marketplace maintenance. GitHub Project templates are organization-scoped;
the repository cannot publish an equivalent reusable template from a personal
account. Set `${GITHUB_ORG}` to the organization that owns the community
Project and `${PROJECT_TITLE}` to `Codex Essentials Community` unless the
organization has an established name.

## Data model

GitHub Issues and pull requests remain the source of truth for title, body,
labels, assignees, milestones, and review state. The Project stores only
cross-repository coordination fields:

- Status: Backlog, Ready, In progress, In review, Done.
- Plugin: exact `plugins/<plugin-id>` identifier.
- Priority: P0, P1, P2, P3.
- Review: Not required, Pending, Approved, Changes requested.
- Documentation: Not started, In progress, Complete.
- Security: Not required, Pending, Approved, Blocked.
- Release target: plugin tag `plugin/<plugin-id>/v<semver>`.

Do not duplicate ownership, dates, or release versions in multiple fields.

## Views and workflows

Create these views from the organization template:

1. **Backlog** — all open items grouped by Status and filtered to the
   marketplace repositories.
2. **Release readiness** — items with a Release target, grouped by Review and
   Documentation, with Security visible.
3. **Security** — items whose Security field is Pending or Blocked.

Configure built-in automations to add matching issues and pull requests, move
closed issues and merged pull requests to Done, and archive completed items
after the organization’s retention period. GitHub Projects automatically
reflects labels, assignees, and milestones from Issues and pull requests; do not
copy those values into custom fields.

## Bootstrap and permissions

Run the idempotent helper locally or from an authorized maintenance workflow:

```bash
GITHUB_ORG="${GITHUB_ORG}" PROJECT_TITLE="${PROJECT_TITLE}" \
  npm run project:bootstrap -- --dry-run
GITHUB_ORG="${GITHUB_ORG}" PROJECT_TITLE="${PROJECT_TITLE}" \
  npm run project:bootstrap
```

The helper reuses an existing project with the same title. A real run requires
`gh` authentication with organization Projects write access. The repository
scoped default Actions token is insufficient for organization-level Project
mutations; use an approved GitHub App or a project-scoped token stored as a
secret. Never print its value.
