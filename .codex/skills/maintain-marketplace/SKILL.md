---
name: maintain-marketplace
description: Use when scaffolding, changing, reviewing, or releasing a Codex Essentials plugin, or reconciling its catalog and documentation.
---

# Maintain Codex Essentials

Use the repository files as the source of truth. Check `git status --short --branch`, `git remote -v`, and the actual `plugins/` directories before describing project state.

## Route the task

| Task | Working source and check |
| --- | --- |
| Start a plugin | Read `docs/authoring.md`; run `python3 scripts/new_plugin.py --help`, then replace the example skill and complete the generated README and changelog. |
| Add a skill to an existing plugin | Follow `docs/authoring.md`; create `plugins/<plugin>/skills/<skill>/SKILL.md` with matching frontmatter name and a trigger-focused description. `$skill-creator` can help when given that exact destination. Regenerate the catalog and test direct and indirect activation. |
| Change plugin metadata, skills, or MCP | Edit the plugin source; run `python3 scripts/sync_catalog.py --write`; inspect generated README, catalog, and marketplace entry. |
| Change repository documentation | Follow `docs/maintenance.md`; update dependent guides and check links and prose. |
| Review a PR | Inspect its diff and affected docs against `AGENTS.md`, `docs/maintenance.md`, and current official guidance when relevant. Run `python3 scripts/preflight.py pr`; report findings with file and line evidence, then residual unverified behavior. |
| Prepare a plugin release | Follow `docs/releasing.md` and `docs/changelogs.md`; run `python3 scripts/preflight.py release <plugin>` and inspect `dist/<plugin>-v<version>.zip`. After an authorized annotated tag exists locally, run `python3 scripts/check_release_tag.py plugin/<plugin>/v<version>` before any push. |

For packaging, marketplace, skills, MCP, hooks, or public submission work, open the live sources linked in `docs/official-guidance.md` and compare them with the installed `codex --version` and relevant official release notes. Record source URLs, access date, verified local behavior, and unverified client or portal behavior in the PR.

`preflight.py` is a local structural and tooling gate. A plugin's runtime behavior, local installation, GitHub services, and public directory acceptance require separate evidence. Do not push, tag, publish, or alter GitHub settings unless the user explicitly requests that action. Use subagents only for independent work when delegation is explicitly authorized; keep shared-file edits coordinated.
