## Summary

Describe the user-visible change and the affected plugin(s).

## Product documentation synchronization

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
