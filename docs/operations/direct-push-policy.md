# Direct Push and Pull Request Policy

## Direct pushes to `main`

Direct pushes are reserved for low-risk repository documentation and agent
guidance. The allowed paths are:

- `docs/**`
- `AGENTS.md`
- `README.md`

The authored `.husky/pre-push` hook compares the complete update against the
remote `main` base and rejects every other path. It then runs `npm run check`
before allowing the push to continue.

Do not mix documentation with plugin, tooling, workflow, schema, test,
security, release, or other product-behavior changes in a direct push. Route
mixed changes through a pull request.

## Pull requests

Use a pull request for new plugins, plugin manifests or catalog changes,
refactors, substantive changes to existing plugins, version-bump changes,
scripts, tests, schemas, workflows, release behavior, permissions, and
security controls.

GitHub Actions validation workflows run only for pull-request events. The
repository therefore keeps the direct-push boundary in the local pre-push
hook and keeps the pull-request workflow as the review and validation path for
significant changes.

## Bypass and recovery

Bypass the local hook only for an explicitly authorized emergency, using
`HUSKY=0` or `--no-verify`, and record the reason in the change discussion.
Because pull-request workflows do not run on direct pushes, a bypassed direct
push requires an immediate manual review and local rerun of `npm run check`.

If the hook rejects a path, move the change to a pull-request branch instead of
expanding the allowlist ad hoc. Update this document, the root `AGENTS.md`,
and the decision record together when the policy itself changes.

## Remote protection

Branch protection must permit the documented low-risk direct-push lane while
retaining force-push and deletion protections and conversation-resolution
requirements. GitHub's native branch rules cannot require pull requests and
required checks only for selected paths, so the path split is enforced by the
local classifier and the review process.
