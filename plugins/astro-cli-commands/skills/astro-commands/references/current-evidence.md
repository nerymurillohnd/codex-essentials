# Current Evidence

Read this reference before making a version-sensitive Astro CLI claim or when
local project instructions conflict with current official guidance.

## Authoring baseline

Checked on 2026-09-24:

- Official Astro CLI reference:
  <https://docs.astro.build/en/reference/cli-reference/>
- Official Astro first-project tutorial:
  <https://docs.astro.build/en/tutorial/1-setup/2/>
- Official OpenAI plugin submission error reference:
  <https://developers.openai.com/plugins/deploy/submission-errors>
- Official ChatGPT & Codex changelog: <https://learn.chatgpt.com/docs/changelog>

## Refresh rules

Use current official Astro docs when:

- Choosing between `dev`, `build`, `preview`, `check`, `sync`, `add`, `info`,
  `preferences`, `telemetry`, or `create-key`.
- Depending on flags added in a specific Astro version, such as `--mode`,
  `--allowed-hosts`, `--background`, or `--devOutput`.
- Starting background servers or using server subcommands.
- Creating a new project or relying on create-flow flags.
- Resolving a local guide, package script, or remembered practice that might be
  stale.

Use official OpenAI docs when:

- Changing plugin manifest metadata or bundled skill `agents/openai.yaml`.
- Claiming current Codex skill/plugin packaging behavior.
- Explaining why a submission or package validator rejects plugin metadata.

When current docs and installed project behavior differ, report both. The
installed Astro version controls what can actually run in the project, while the
current docs guide the recommendation and compatibility risk.
