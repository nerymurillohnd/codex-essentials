# Contributing

Thanks for contributing to Codex Essentials. Read [the authoring guide](docs/authoring.md) before adding or changing a plugin.

For bugs, improvements, plugin proposals, and documentation corrections, use the matching [issue form and triage guide](docs/issues.md). Search existing issues first. Report suspected vulnerabilities privately through [the security policy](SECURITY.md).

## Pull requests

- Keep a pull request focused on one plugin or one repository concern.
- Include the plugin's purpose, supported clients, required permissions or external services, and manual verification steps.
- Update the plugin's own version and changelog when its user-facing behavior changes.
- Follow [the release guide](docs/releasing.md) for version bumps, tags, and release assets.
- Run `python3 scripts/preflight.py pr` and report the result; it includes package validation and catalog drift checks.
- Follow [the documentation maintenance guide](docs/maintenance.md) when repository instructions, templates, or remote-state claims change.
- For plugin format, marketplace, skill, MCP, hook, or public publication changes, re-open the relevant live OpenAI Docs pages and follow [the freshness procedure](docs/official-guidance.md#how-to-keep-this-guidance-current). Record the access date and any rule changes in the PR.
- Use clear English commit messages and apply one `type:` and one primary `area:` pull request label, plus `process: release` for a versioned plugin release. See [the label taxonomy](docs/issues.md#label-taxonomy).

Contributors must have the right to submit their work under this repository's license. Do not include secrets, private user data, or assets you cannot redistribute.

## Review

Maintainers may request changes for correctness, security, licensing, or unclear installation instructions. A merged contribution is not automatically a public directory submission.
