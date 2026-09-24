# Live Research

Live Research gives Codex a source-first workflow for facts that may have
changed. It checks current evidence and the relevant project or version before
answering, recommending, planning, or implementing. It does not bundle a search
service or require another plugin.

## Install and use

```sh
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add live-research@codex-essentials
```

Ask:
`Use $live-research to verify the current compatibility and cite the official sources.`
The package includes one [skill](skills/live-research/SKILL.md) and its
[Codex presentation metadata](skills/live-research/agents/openai.yaml).

## Inputs and result

The user's question or change request is required. Supply a product version,
jurisdiction, environment, date range, budget, risk tolerance, or source target
when it changes the answer. For repository questions, the project files and tool
output are part of the evidence. The result identifies material current facts,
gives dated source links, separates inference from proof, and reports conflicts
and remaining uncertainty.

The skill skips live lookup for genuinely stable or fully supplied facts. It
checks the current session's actual tool catalog before using a specialized MCP
or connector; an installed name alone does not establish availability.

## Requirements and boundaries

- Supported host: Codex clients that load installed Agent Skills and expose a
  suitable retrieval tool when live evidence is needed.
- The plugin bundles no hook, script, MCP server, app, credential, or runtime
  dependency. Source access and network availability depend on the session.
- Research is read-only. It may inspect authorized local files and public or
  explicitly authorized sources. It does not authorize edits, installs,
  messages, deployments, publication, or account mutations.
- Never send private code or credential values to a remote source without the
  applicable authorization. Refer to secret names as `${VAR}`.
- An unavailable source or a disagreement is reported with its effect on the
  conclusion. Silence in release notes is not proof of compatibility.

## Update and removal

```sh
codex plugin marketplace upgrade codex-essentials
codex plugin add live-research@codex-essentials
codex plugin list --json
codex plugin remove live-research@codex-essentials
```

This clean-history package begins at `0.1.0`. Explicitly reinstall after
refreshing the Git marketplace if an earlier installation from the former
history remains cached. Start a new session to verify the current skill is
available. Removing the plugin does not reverse edits made by earlier tasks.

## Maintainer verification

Run `npm run check` from the marketplace root, then install the plugin in a
clean Codex home. A matching request should use current primary evidence and
dated citations; a nearby purely mathematical or user-supplied request should
not trigger external retrieval. A source failure must be visible, not silently
replaced by model memory.

See the [changelog](CHANGELOG.md) and [MIT license](LICENSE.md). This is an
independent community plugin, not an OpenAI product.
