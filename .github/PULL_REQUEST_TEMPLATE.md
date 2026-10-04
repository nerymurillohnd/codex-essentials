## Summary

Describe the change and the affected plugin or repository workflow.

## Change type

- [ ] Plugin feature or fix
- [ ] Documentation
- [ ] Repository tooling
- [ ] Security fix

Apply one `type:` and one primary `area:` label. Add `process: release` for a versioned plugin release. See `docs/issues.md`.

## Plugin release details (if applicable)

- Plugin:
- Version before / after:
- Changelog entry:
- Required permissions or external services:

## Documentation freshness (for packaging, marketplace, skills, MCP, hooks, or publication changes)

- Official source URL(s) opened and access date:
- Local `codex --version` and release notes checked, if CLI behavior matters:
- Differences from `docs/official-guidance.md` and files updated together:
- Portal-only or client behavior that remains unverified:

## Verification

- [ ] `python3 scripts/validate.py` passes
- [ ] `python3 scripts/validate_adrs.py` passes if ADRs changed
- [ ] `python3 scripts/validate_issues.py` passes if issue forms or labels changed
- [ ] `python3 scripts/sync_catalog.py --check` passes
- [ ] Affected guides, examples, and remote-state claims were reviewed using `docs/maintenance.md`
- [ ] I tested the affected workflow in a supported client, or explained why it remains untested
- [ ] No secrets, private data, or unlicensed assets are included

Describe manual results and remaining limitations:
