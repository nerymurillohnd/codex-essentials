# OpenAI plugin guidance audit

Checked on 2026-10-02 against official OpenAI documentation and the `openai/codex` release notes. This is a dated snapshot, not an evergreen specification. The linked pages and the installed CLI can change independently.

## How to keep this guidance current

Before a change involving packaging, marketplace discovery, skills, MCP, hooks, testing, releases, or public submission:

1. Open the relevant live pages linked below; do not rely on this summary or search snippets alone. Prefer current official OpenAI Docs for product behavior and package/submission rules. Use the official `openai/codex` repository release notes for version changes and the local `codex --version` command for installed behavior.
2. Compare the live rule with the relevant source files, templates, validator, CI workflow, and authoring/release guides. Verify the behavior locally when the CLI supports it. Portal-only behavior remains unverified until tested in the portal.
3. If a rule changed, update this audit and every affected instruction, template, script, and test in the same PR. Record the date, source URL, and what changed in the PR. Do not keep an old rule merely because a local test passes.
4. Recheck immediately before a public ZIP upload or publication, even if the last audit was recent. That is an external publication gate whose requirements can change outside this repository.

The baseline below is useful for spotting drift. Its version numbers and portal constraints describe what was documented on the checked date; they do not assert future compatibility.

## Distribution channels

- The repository README is a human-readable catalog. `.agents/plugins/marketplace.json` is the Codex/ChatGPT desktop repo marketplace catalog; keep both generated from each plugin's manifest. A local marketplace supports authoring, testing, and team distribution. It is separate from the universal public Plugins Directory. [Package your plugin](https://developers.openai.com/plugins/build/plugins)
- A GitHub tag and release create a source/archive release only. Public directory publication requires ZIP upload, automated checks, review, approval, and an explicit publish step in the OpenAI developer portal. [Upload and submit your plugin](https://developers.openai.com/plugins/deploy/submission)
- For an installed local plugin, test from a fresh conversation after refreshing the local marketplace or installed copy. [Connect and test your plugin](https://developers.openai.com/plugins/deploy/connect-chatgpt)

## Package shape and capability choices

- Prefer the portable Agent Plugins 1.0 root `plugin.json`, fixed `skills/` discovery, and root `mcp.json` when MCP is needed. A `.codex-plugin/plugin.json` overlay is optional compatibility support and does not merge with `extensions.com.openai`. [Package your plugin](https://developers.openai.com/plugins/build/plugins)
- A plugin may have one skill or a group of related skills. Each skill should map to a recognizable user goal. Use the skill for workflow instructions; use MCP for live data, authentication, authorization, and actions. [Build skills](https://developers.openai.com/plugins/build/skills)
- Decide whether public publication will need MCP before submitting the first ZIP. The submission flow currently does not support adding an MCP server later to an existing skills-only plugin. The public portal currently connects one MCP server per plugin even though a package can declare more. [Upload and submit your plugin](https://developers.openai.com/plugins/deploy/submission)
- Plugin-bundled hooks require local scripts and user trust before running. Current public ZIP submission does not accept lifecycle hooks or app references. Keep public submission packaging separate from local distribution if such capabilities are present. [Package your plugin](https://developers.openai.com/plugins/build/plugins), [Upload and submit your plugin](https://developers.openai.com/plugins/deploy/submission)
- The skills-only scaffold omits visual assets. Codex package validation requires packaged `logo` and `composerIcon` assets for distribution; the public submission dashboard also requires a primary icon before submission. Add real assets and `./`-prefixed manifest paths before a release, then verify current format and size rules. [Upload and submit your plugin](https://developers.openai.com/plugins/deploy/submission#icons-and-screenshots)

## Validation before publication

1. Run local structural checks and inspect the exact ZIP. These repository checks do not replace the portal's package validation or review. [Upload and submit your plugin](https://developers.openai.com/plugins/deploy/submission)
2. For each skill, test direct and indirect activation, incomplete inputs, non-activation, and unsupported edge cases. For multiple skills, test ambiguous prompts that might choose the wrong one. [Build skills](https://developers.openai.com/plugins/build/skills)
3. For MCP, test the server independently with MCP Inspector: schemas, authentication failures, empty results, write confirmations, and output. Then install the complete plugin and test skill/tool interaction end to end. [Connect and test your plugin](https://developers.openai.com/plugins/deploy/connect-chatgpt)
4. Keep a small use-case evaluation set and rerun it across releases. For public MCP review, prepare five positive and three negative cases, a video walkthrough, release notes, and dedicated reviewer credentials where authentication is required. [Connect and test your plugin](https://developers.openai.com/plugins/deploy/connect-chatgpt), [Upload and submit your plugin](https://developers.openai.com/plugins/deploy/submission)

## Codex CLI release baseline

Local `codex --version` returned `codex-cli 0.160.0` on 2026-10-02. The four preceding stable release notes reviewed were:

| Version | Relevant change |
| --- | --- |
| [0.160.0](https://github.com/openai/codex/releases/tag/rust-v0.160.0) | Plugin manifest parsing and remote requests were optimized; no package-format migration was announced in the release summary. |
| [0.159.2](https://github.com/openai/codex/releases/tag/rust-v0.159.2) | Windows background-process console fix. |
| [0.159.1](https://github.com/openai/codex/releases/tag/rust-v0.159.1) | GPT-6.1 Sol bundled and Bedrock model catalog update. |
| [0.159.0](https://github.com/openai/codex/releases/tag/rust-v0.159.0) | Input steering and UI changes; release notes also say the bundled `plugin-creator` skill was removed. |
| [0.158.0](https://github.com/openai/codex/releases/tag/rust-v0.158.0) | MCP OAuth client-secret support and sandbox/UI changes. |

The currently installed Plugin Creator is supplied as a separate plugin, so its presence does not contradict the removal of the bundled skill in 0.159.0. Treat the live product documentation as authoritative for package and submission rules; release notes indicate changes, not a complete specification.
