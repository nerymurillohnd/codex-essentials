# Issues, labels, and repository topics

This policy was informed by a read-only GitHub MCP review of [openai/codex issue forms](https://github.com/openai/codex/tree/main/.github/ISSUE_TEMPLATE) and its [issue list](https://github.com/openai/codex/issues) on 2026-10-02. The useful pattern is structured reports, duplicate search, and labels that separate the kind of work from the affected area. Codex Essentials has fewer surfaces, so its forms and taxonomy stay smaller. Recheck GitHub's current issue form behavior before changing the live forms or labels.

## Issue entry points

| Form | Use it for | Initial labels |
| --- | --- | --- |
| [Bug report](../.github/ISSUE_TEMPLATE/bug_report.yml) | Reproducible defects in a plugin or repository workflow | `type: bug`, `status: needs triage` |
| [Feature request](../.github/ISSUE_TEMPLATE/feature_request.yml) | Changes to an existing plugin or workflow | `type: feature`, `status: needs triage` |
| [New plugin proposal](../.github/ISSUE_TEMPLATE/new_plugin.yml) | A new distributable plugin | `type: feature`, `area: plugin`, `status: needs triage` |
| [Documentation issue](../.github/ISSUE_TEMPLATE/documentation.yml) | Missing, incorrect, or confusing documentation | `type: documentation`, `area: documentation`, `status: needs triage` |

Blank issues remain available for cases the forms do not cover. Search existing issues first. Do not post vulnerabilities, credentials, or personal data in public issues; follow [SECURITY.md](../SECURITY.md).

## Label taxonomy

[`.github/labels.yml`](../.github/labels.yml) is the definition of label names, colors, and descriptions. Use one `type:` label and one primary `area:` label after triage. Add `status:`, `community:`, or `process:` labels only when they convey useful extra state. A plugin name belongs in the issue form or title, not in a new label for every plugin.

- **Type:** `bug`, `feature`, `documentation`, `maintenance`, `security`. Security work is coordinated privately before any public tracking.
- **Area:** `plugin`, `skills`, `mcp`, `marketplace`, `tooling`, `documentation`.
- **Status:** `needs triage` is removed after classification; `blocked` requires a stated dependency or decision.
- **Community:** `good first issue` needs a bounded task and clear acceptance criteria; `help wanted` signals maintainers welcome a contribution.
- **Process:** `release` applies to versioned plugin release work and PRs.

Labels classify issues and PRs. Git **tags** identify immutable plugin releases using `plugin/<name>/v<version>` as described in [releasing.md](releasing.md). GitHub repository **topics** help discovery and are separate from both; suggested topics during remote setup are `codex`, `codex-plugins`, `agent-plugins`, `mcp`, `skills`, and `plugin-marketplace`, subject to a final relevance check.

## Triage and maintenance

1. Check for duplicates and link or close duplicates with a pointer to the existing issue.
2. Confirm the report's scope and evidence. For bugs, request a minimal reproduction and client version if missing. For new plugins, assess user goal, redistribution rights, skill/MCP needs, and example requests.
3. Apply one type and one primary area. Remove `status: needs triage` when the issue is actionable. Add `status: blocked` only with a named blocker and revisit condition.
4. State acceptance criteria before inviting implementation. Link the resulting PR or ADR where relevant.
5. Close with a clear outcome: completed, duplicate, declined, or not reproducible. Reopen if new evidence changes the decision.

## Remote setup

The [GitHub repository](https://github.com/nerymurillohnd/codex-essentials) exists, and the four issue forms are present on `main`. As checked on 2026-10-03, GitHub still has its default labels rather than the 16 labels in `.github/labels.yml`; form defaults are therefore not verified as usable. Provision the local label catalog, compare remote names and descriptions, and open each form in the GitHub issue chooser before treating the forms as active. Review repository topics, private vulnerability reporting, and branch rules at the same time. The labels file is declarative documentation and does not install labels by itself. Update this section after activation and verification.
