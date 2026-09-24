# System Ops Audit

System Ops Audit helps Codex scope and interpret a read-only operational
baseline for one Mac. It separates observed host state from inference, privacy
exclusions, and proposed remediation. The package contains guidance, not an
executable collector.

## Install and use

```sh
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add system-ops-audit@codex-essentials
```

Ask:
`Use $system-ops-audit to design a read-only baseline for this Mac and identify what evidence it will collect.`
The package includes one [skill](skills/system-ops-audit/SKILL.md),
[Codex metadata](skills/system-ops-audit/agents/openai.yaml), and five
conditional references for safety, workspace, coverage, script design, and
scenario review.

## Inputs and result

Identify the local machine, requested scope, workspace or output destination,
and whether the task is design, collection, or analysis. The skill returns a
bounded read-only plan, an authorized collector, or an evidence-based findings
report. It records command provenance, privilege, time, failures, and privacy
exclusions. It does not call an unknown or permission-limited check healthy.

## Requirements and boundaries

- Supported environment: a local macOS machine with Codex filesystem and shell
  access. No plugin-specific credential, executable, hook, MCP server, or
  background service is bundled.
- Installation changes Codex-managed plugin state only. A direct request to
  create a named local audit artifact or run read-only diagnostics bounds that
  action; it does not authorize system repair.
- Baseline commands may read approved system metadata but must not collect
  secret values, private content, recovery material, or broad data dumps. Real
  `.env` and Keychain contents are out of scope.
- No install, update, service change, cleanup, privilege change, or settings
  mutation is part of a baseline. Any remediation needs its own request.
- The workspace location is discovered or chosen for the target machine; this
  plugin does not impose a fixed path under a particular username.

Current macOS command behavior and Apple documentation take precedence over
static examples. The skill is not a repository audit, application feature
workflow, or fleet-management tool.

## Update and removal

```sh
codex plugin marketplace upgrade codex-essentials
codex plugin add system-ops-audit@codex-essentials
codex plugin list --json
codex plugin remove system-ops-audit@codex-essentials
```

This clean-history package begins at `0.1.0`; refresh and explicitly reinstall
if an older cached version remains. Start a new session to verify current skill
discovery. Removing the plugin does not delete user-created audit scripts,
reports, or workspaces.

## Maintainer verification

Run `npm run check` and install in a clean Codex home. Test one read-only
baseline request, a nearby repository-audit request that should route elsewhere,
and a request for secret values or immediate remediation that must stay outside
baseline collection. Verify the final report separates observation, unknown,
privacy exclusion, and recommendation.

See the [changelog](CHANGELOG.md) and [MIT license](LICENSE.md). This is an
independent community plugin, not an OpenAI or Apple product.
