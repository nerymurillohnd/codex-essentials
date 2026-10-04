# Documentation maintenance

Keep repository instructions, generated catalog data, plugin packages, and remote-state claims aligned. The [root README](../README.md) is the marketplace landing page; it does not use the plugin README template. Each plugin README starts from [the plugin template](../templates/skills-only/README.md) and follows [the README guide](readmes.md).

## Sources of truth

| Concern | Authoritative source | Derived or dependent content |
| --- | --- | --- |
| Repository workflow and scope | [AGENTS.md](../AGENTS.md) and the relevant guide | Root README, contribution guidance, PR checklist |
| Plugin identity, description, version, and capabilities | `plugins/<name>/plugin.json`, `skills/`, and `mcp.json` | Plugin README generated regions, root catalog, `.agents/plugins/marketplace.json` |
| Plugin release history | Each plugin's `CHANGELOG.md`, following the [canonical template](../templates/changelog/CHANGELOG.md) | Manifest version, release notes, tag and ZIP name |
| Issue and PR taxonomy | [`.github/labels.yml`](../.github/labels.yml) and [the issue guide](issues.md) | Issue form defaults, PR labels, remote GitHub labels |
| Architecture decisions | [ADR template](../templates/adr/ADR_YYYY-MM-DD_decision-slug.md) and accepted records | Decision references in guides and implementation |
| External product rules | Current [official OpenAI documentation](official-guidance.md) and applicable Codex release notes | Package template, validator, authoring and release guidance |

## Review after a change

1. Update the source of truth first. If a plugin manifest, skill, or MCP file changed, run `python3 scripts/sync_catalog.py --write` and inspect the root catalog, plugin README, and marketplace entry. Fill plugin README prose outside generated regions and manually verify its examples.
2. Update every affected guide, README, template, and PR instruction in the same change. Check `AGENTS.md` references and search for old status language with `rg`; repository state, remote settings, and external product rules cannot be inferred from local files alone.
3. Run the local checks below. The repository validator checks Markdown file targets in root pages, guides, decisions, and the PR template, plus plugin README links and package structure. It does not check external URLs, heading anchors, factual freshness, rendered layout, or whether an example works in Codex.
4. Before stating that a GitHub capability is active, inspect the remote labels, issue forms, workflows and runs, branch rules, and releases as applicable. The presence of a local file does not activate a remote service. Update [the issue guide](issues.md#remote-setup), [release guide](releasing.md#github-activation-checklist), and [roadmap](roadmap.md) with the verified state.
5. Before changing plugin behavior or packaging, follow [the official-guidance freshness procedure](official-guidance.md#how-to-keep-this-guidance-current). Before publication, verify the exact package, release notes, license, permissions, supported client, and installation behavior.

```sh
python3 scripts/validate.py
python3 scripts/validate_adrs.py
python3 scripts/validate_issues.py
python3 scripts/sync_catalog.py --check
python3 -m unittest discover -s tests -v
```

The [Validate workflow](../.github/workflows/validate.yml) is configured to run these checks and Python compilation for pull requests and pushes to `main`. The new documentation-link coverage remains local until these changes reach GitHub and a remote run verifies it. Ruff formatting and the full Ruff lint are separate checks until the existing lint findings are resolved and a CI gate is deliberately added.
