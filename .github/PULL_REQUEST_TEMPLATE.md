## Summary

Describe the user-visible change and the affected plugin(s).

## Release routing

- [ ] The title is a Conventional Commit subject (`feat:`, `fix:`, `docs:`,
      `chore:`, or another valid type).
- [ ] This product PR changes one releasable plugin at most.
- [ ] If distributed documentation needs a patch release, the title uses
      `fix(docs): ...` or the PR includes an explicit `Release-As` footer.

The commit scope is descriptive only; changed paths determine the Release
Please component. Repository policy does not require squash merging.

## Product documentation synchronization

- [ ] Plugin submissions and product changes follow
      `docs/contributing/plugins.md`.
- [ ] `plugins/<plugin-id>/README.md` was updated for changed behavior,
      permissions, installation, limitations, or recovery behavior.
- [ ] `plugins/<plugin-id>/CHANGELOG.md` contains a concise `Unreleased` entry
      for every product-relevant change.
- [ ] `.codex-plugin/plugin.json` and `.agents/plugins/marketplace.json` are
      synchronized.
- [ ] No unrelated plugin documentation was changed.

## Safety and operations

- [ ] No real credentials, tokens, or private data were added.
- [ ] Permissions use least privilege and credential names use `${VAR}`.
- [ ] Human approval boundaries and side effects are documented.
- [ ] Installation, uninstall, rollback, failure, and recovery behavior are
      documented when affected.
- [ ] Breaking changes include migration and rollback steps.

## Verification

Commands run:

```text
<command>
```

Expected and observed results:

<results>
