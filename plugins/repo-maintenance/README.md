# Repository Maintenance

Repository Maintenance helps Codex audit and maintain README files, changelogs,
architecture decisions, debt records, licenses, and skill presentation metadata.
It reads the target repository before choosing a template and removes sections
that the available evidence cannot support.

## Install and use

```sh
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add repo-maintenance@codex-essentials
```

Ask:
`Use $repo-maintenance to audit this repository's maintenance records without editing.`
For a scoped change, name the target file and desired result. The package
contains one [skill](skills/repo-maintenance/SKILL.md),
[Codex metadata](skills/repo-maintenance/agents/openai.yaml), and eight
[adaptable assets](skills/repo-maintenance/assets/): repository and plugin
README, changelog, ADR, pending and resolved debt, MIT license, and skill
metadata templates.

## Inputs and result

The skill uses the user request, applicable instructions, Git state, existing
documents, release and ownership conventions, and project checks. A read-only
request yields an evidence-based audit. A requested edit yields only the
selected documents, with commands and links verified where possible. A template
is never treated as a mandatory universal structure.

## Requirements and boundaries

- Supported host: Codex clients that load installed Agent Skills and can read
  the target repository. No plugin-specific credential, server, hook, or
  executable is bundled.
- Installation changes Codex-managed plugin state only. An audit does not write.
  A direct request for a named document authorizes that local document change,
  subject to target repository instructions.
- The skill does not implement source code, choose a license without the user's
  decision, invent a release, or modify remote Git or account state.
- It does not write memory unless separately and directly requested.

## Update and removal

```sh
codex plugin marketplace upgrade codex-essentials
codex plugin add repo-maintenance@codex-essentials
codex plugin list --json
codex plugin remove repo-maintenance@codex-essentials
```

This clean-history package begins at `0.1.0`; refresh and explicitly reinstall
if an older installation remains cached. Start a new session to verify current
skill discovery. Removing the plugin does not revert documents created in a
target repository; recover them through that repository's normal version control
or verified before-image.

## Maintainer verification

Run `npm run check` and install the package in a clean Codex home. Inspect the
installed asset paths. A request for one ADR should use only the ADR asset and
the target repository's convention; a read-only audit should not create files.
The finished document must have no placeholder sections or invented facts.

See the [changelog](CHANGELOG.md) and [MIT license](LICENSE.md). This is an
independent community plugin, not an OpenAI product.
