# README Audit Report — Codex Essentials

**Repository:** `nerymurillohnd/codex-essentials`  
**Audited ref:** `main` at `d51fd8bdf40f02de3ee4f97dc756de1c527e7daf`  
**Audit date:** 2026-08-30  
**Scope:** root `README.md` and the four plugin README files

## Executive assessment

The repository has a strong documentation foundation and unusually good operational
disclosure for an early plugin marketplace. The five READMEs are substantive,
careful about permissions and side effects, and their local Markdown links resolve.
However, they currently behave more like complete operating manuals than landing
pages. This increases reading friction, duplicates content, and makes stale claims
more likely.

The most important recommendation is to adopt a two-level documentation contract:

1. The root README converts a visitor into a user or contributor: explain the
   marketplace, show the four plugins, provide one canonical installation path, and
   link to the right next document.
2. Each plugin README converts a user into an informed installer: explain the
   outcome, requirements, side effects, quick start, verification, rollback, and
   links to the authoritative skill and references.

Detailed execution policy belongs in `SKILL.md`, references, or `docs/`; it should
not be repeated in every landing page.

## Evidence and audit method

I inspected the repository tree, manifests, generated marketplace catalog, workflows,
documentation rules, all five README files, and the current Git state. I also
checked local Markdown targets with a path resolver and compared the marketplace
commands and plugin packaging model with current GitHub and OpenAI documentation.

Observed baseline:

| Item                   | Observation                                                                    |
| ---------------------- | ------------------------------------------------------------------------------ |
| README files           | 5: root plus 4 plugin READMEs                                                  |
| Total size             | 1,251 lines, approximately 6,399 words, 54 KB                                  |
| Root README            | 237 lines / approximately 1,303 words                                          |
| Plugin README sizes    | Astro 286, DocKeeper 271, Optimize Memories 242, Prettier After Edit 215 lines |
| Catalog                | 4 installable plugins, matching the four plugin directories                    |
| Local links            | 34 checked; no missing local targets found                                     |
| Worktree               | Clean; `main` matches `origin/main` at the audited commit                      |
| Plugin source of truth | `plugins/*/.codex-plugin/plugin.json`; catalog is generated                    |

The clean local-link result does not mean every navigation claim is correct. A path
written as inline code is not validated as a link, and that distinction exposed the
Astro path error described below.

## Scoring model

Scores use a 10-point scale. The weighted dimensions are: correctness and
freshness 25%, task usability and quick start 20%, navigation 15%, discovery and
conversion 15%, operational boundaries 15%, and visual/accessibility quality 10%.
The score is a documentation maturity assessment, not a measure of plugin quality.

| README              | Correctness | Usability | Navigation | Conversion | Boundaries | Visual | Weighted result | Maturity                          |
| ------------------- | ----------: | --------: | ---------: | ---------: | ---------: | -----: | --------------: | --------------------------------- |
| Root marketplace    |         5.5 |       6.0 |        6.0 |        5.5 |        8.0 |    7.0 |      **6.2/10** | Needs restructuring               |
| Astro Commands      |         6.5 |       7.5 |        7.5 |        7.0 |        8.5 |    7.0 |      **7.2/10** | Good, with correctness fixes      |
| DocKeeper           |         8.0 |       6.5 |        5.5 |        5.5 |        8.5 |    5.5 |      **6.9/10** | Accurate but weak as landing page |
| Optimize Memories   |         8.5 |       8.0 |        7.5 |        7.0 |        9.0 |    7.0 |      **8.0/10** | Best current baseline             |
| Prettier After Edit |         7.0 |       7.5 |        7.5 |        7.0 |        8.5 |    6.5 |      **7.3/10** | Good, with command/path fixes     |

## Cross-cutting findings

### P0 — No blocking security issue found

I found no credential, secret, or dangerous authorization claim in these READMEs.
The plugins generally disclose read/write/process/network boundaries better than most
marketplace documentation. That strength should be preserved in the new compact
format.

### P1 — The root README contains a stale release-control claim

Lines 200–205 state that release packaging pauses at a protected `release`
environment. The current `.github/workflows/release-please.yml` has no job-level
`environment:` declaration and instead conditionally skips automation when the GitHub
App credentials are unavailable. The README is therefore asserting an operational
control that the current workflow does not implement.

**Required change:** remove implementation-level release details from the root
README. Replace them with a short statement that plugin releases are independently
versioned and a link to the release decision/runbook. If a protected approval gate is
desired, implement and verify that control separately before documenting it.

### P1 — Two plugin READMEs document the wrong marketplace command

`plugins/astro-cli-commands/README.md:176` and
`plugins/prettier-after-edit/README.md:156` use:

```bash
codex plugin marketplace update codex-essentials
```

The current OpenAI plugin documentation lists `codex plugin marketplace upgrade`
for refreshing a configured marketplace. The root README and Optimize Memories
README already use `upgrade`.

**Required change:** replace `update` with `upgrade` in both files, then run a
command/documentation consistency check across all README files.

### P1 — The root README's release badge is semantically misleading

The badge labelled `Latest release` uses the repository-level latest-release
endpoint, while the repository currently publishes independent plugin tags such as
`plugin/astro-cli-commands/v0.1.1` and `plugin/prettier-after-edit/v0.1.1`. There is
no single marketplace release represented by that label.

**Required change:** remove the dynamic badge until a root marketplace release
exists, or relabel it as `Plugin releases` and link directly to the Releases page.
Never present the latest plugin tag as the version of the marketplace catalog.

### P1 — The root README is too long and duplicates its own installation model

The root repeats marketplace installation in `Start Here` and `Marketplace
Lifecycle`, then adds contributor and release implementation details. A visitor must
pass several operational paragraphs before reaching the actual product links.

**Required change:** keep one canonical installation block, one plugin catalog table,
one update/remove block, and a short contributor section. Move release mechanics,
artifact determinism, commit taxonomy, and emergency bypass details to `docs/`.

### P1 — The Astro component table contains incorrect relative paths

The package stores references at:

```text
skills/astro-commands/references/commands.md
skills/astro-commands/references/flags.md
skills/astro-commands/references/operations.md
```

But the `Included Components` table presents them as `references/commands.md`,
`references/flags.md`, and `references/operations.md`. The later Reference Library
uses the correct paths, so this is an internal contradiction rather than a missing
file.

**Required change:** use links, not unlinked code spans, in the component table and
point them to the real paths.

### P2 — Navigation works technically but is weak at the conversion points

The root product table lists plugin names as bold text, not links. The product links
appear much later at lines 124–127. This creates unnecessary scrolling and weakens
the primary “discover → inspect → install” path.

**Required change:** make every product name in the first catalog table a direct link
to its plugin README. Add reciprocal links from every plugin README to the root
marketplace README, its own changelog, and support/contribution entry points.

### P2 — `types/` is documented but empty in the current repository

The root Directory Reference describes `types/` as an active TypeScript contracts
directory, but no tracked files currently exist there. This is a trust issue because
the directory table is intended to orient contributors.

**Required change:** remove the row until the directory contains maintained files, or
document it as intentionally reserved with a clear status. The stronger option is to
remove stale references and let the directory reappear when it becomes real.

### P2 — README detail is not consistently routed to authoritative documents

Astro, Optimize Memories, and Prettier provide Reference Library tables. DocKeeper
lists important paths only as inline code and has no equivalent navigation table.
Conversely, several READMEs repeat policy that already belongs in the skill.

**Required change:** standardize a short `Documentation` section in all plugin
READMEs with links to `SKILL.md`, references/examples, `CHANGELOG.md`, `LICENSE.md`,
the marketplace root, and support. Keep one-sentence summaries, not full policy
copies.

### P2 — The repository does not clearly distinguish marketplace surfaces

The root README says users can open the Plugins Directory and select Codex
Essentials, but it does not make clear that a repo marketplace is a curated
repo/team distribution source and is not the same thing as a universally published
public plugin directory. That distinction matters for expectations about visibility,
availability, and discoverability.

**Required change:** add one explicit sentence: “This repository marketplace is a
curated repo/CLI distribution source; it is not evidence that these plugins are
listed in the universal public Plugins Directory.” Keep the exact supported surface
claim aligned with current Codex behavior.

### P2 — Version-sensitive claims lack a maintenance convention

Astro's README records specific verification dates and Astro versions, which is good
evidence, but the other READMEs make compatibility claims without a visible “last
verified” field. Version-sensitive facts will age at different rates.

**Required change:** add a small compatibility table or metadata line to plugins
whose behavior depends on an external tool. Use `Last verified: YYYY-MM-DD` and
update it in the same change as reference updates. Do not claim universal support
when the package only provides guidance.

### P2 — Use cases are implicit instead of being a shared conversion section

The root table has `Purpose`/`Best for` text and the plugin READMEs describe
capabilities, but there is no consistent, scannable `Use cases` section that starts
from the visitor's problem and ends with an expected result. This makes the visitor
translate implementation language into personal relevance.

**Required change:** add three to five realistic use cases to every plugin README.
Each row should state the scenario, how the plugin helps, and the observable result.
Add one explicit “Not a fit when” boundary. At the root, add a compact “Choose by
use case” router that points to the four plugin READMEs.

### P2 — Release metadata, labels, and FAQ are not standardized

The documents discuss releases and support, but they do not share a clear metadata
contract for version/tag discovery or a concise FAQ contract. GitHub topics and issue
labels also have different jobs: topics aid repository discovery, while issue labels
support maintainer triage. Mixing them into README prose would make the page noisier
and less accurate.

**Required change:** show a truthful plugin version and release/tag link in each
plugin README, link the root to the release collection, keep repository topics in
GitHub metadata, and keep issue labels in Issues/templates. Add three concise FAQ
entries to the root and three plugin-specific FAQ entries to every plugin README.

## File-by-file critique

### Root `README.md`

#### What works

- Strong repository identity, license, workflow, security, and documentation links.
- The four-plugin catalog is accurate and the installation IDs are visible.
- It correctly explains that marketplace repository dependencies are not installed
  into a user's Astro project.
- It includes contributor commands, package containment, generated catalog behavior,
  and plugin release isolation.

#### What fails or underperforms

- The first screen does not offer a direct linked choice for each plugin.
- “Start Here” and “Marketplace Lifecycle” overlap.
- The release badge and protected-environment paragraph can mislead users about what
  is released and what control currently protects it.
- The directory table contains the empty `types/` path.
- Internal maintainer details overwhelm the user-facing marketplace pitch.
- There is no compact support path, issue link, discussion link, or explicit
  “which plugin should I choose?” decision aid.
- The title emoji and heading emoji are consistent within this file but not across
  the plugin files, and several headings are visually heavy for a technical catalog.

#### Recommended target

Use the supplied root template. Target approximately 120–160 lines. Its order should
be: value proposition, trust/status, plugin catalog, install, update/remove, docs
routing, contribution, support/license.

### `plugins/astro-cli-commands/README.md`

#### What works

- Clear outcome and decision rule.
- Good explanation of local CLI precedence, side effects, approval boundaries, and
  failure recovery.
- The Reference Library is useful and mostly well linked.
- It appropriately says the package is independent from Astro.

#### Required fixes

- Correct the three unlinked component paths.
- Replace `marketplace update` with `marketplace upgrade`.
- Move detailed command lifecycle and approval policy to the skill/reference layer.
- Keep the version baseline, but identify it as a dated reference snapshot and add a
  visible last-verified convention.
- Add a direct root-marketplace link, changelog link, and support link.
- In verification examples, state whether the command is run from the marketplace
  root or the installed plugin directory.

**Assessment:** technically thoughtful, but path and command inconsistencies are
high-impact because this README is an installation document.

### `plugins/doc-keeper/README.md`

#### What works

- The purpose and non-invention principle are excellent.
- Scope, authorization, side effects, and remote-mutation boundaries are explicit.
- The component inventory matches the package structure.
- It explains how existing release tooling remains authoritative.

#### What fails or underperforms

- It starts with a dense policy explanation instead of a one-line value proposition,
  badge, quick start, or direct marketplace link.
- Installation begins at line 107, too late for a package README.
- There is no Reference Library table, so important reference and example files are
  harder to reach.
- The compatibility section names many third-party tools and historical tools; that
  is useful reference material but too much for the landing page and increases
  maintenance burden.
- Its visual language differs from the other plugin READMEs: no badge, no concise
  tagline, and no restrained section icon system.

**Assessment:** high factual and safety quality, low landing-page and navigation
quality. Use it as the accuracy model, not as the length model.

### `plugins/optimize-memories/README.md`

#### What works

- Best current balance of purpose, scope modes, approval gate, rollback, and
  verification.
- The package inventory matches the tree and clearly states that it has no hooks,
  scripts, MCP servers, apps, or runtime dependencies.
- It correctly uses `marketplace upgrade`.
- The proposal-first behavior is a strong trust/conversion asset for a sensitive
  memory workflow.

#### Remaining improvements

- Shorten the document by moving full phase/policy detail into `SKILL.md`.
- Add reciprocal marketplace/changelog/support links.
- Separate mutating `marketplace:build` from read-only `marketplace:check` in the
  verification prose; the former regenerates the catalog.
- Avoid presenting `rg` as a universal requirement; call it an optional search tool
  or describe the capability instead.
- Align the README title with the manifest display name (`Codex Memory Audit` versus
  `Optimize Memories`) so the repository, marketplace picker, and README present one
  product identity.

**Assessment:** strongest plugin README; it should be the content baseline for
permissions and recovery, then be reduced to a landing-page-sized document.

### `plugins/prettier-after-edit/README.md`

#### What works

- Explains the hook event contract, local-first resolution, fallback behavior, input
  payloads, output JSON, side effects, and limitations.
- Component and Reference Library links correspond well to the package tree.
- The hook's write behavior is disclosed instead of being hidden behind a generic
  “automatic formatting” promise.

#### Required fixes

- Replace `marketplace update` with `marketplace upgrade`.
- Make the smoke-test command unambiguous about its working directory. The current
  `plugins/prettier-after-edit/hooks/...` path only works from the marketplace root,
  not from the plugin directory or an installed package.
- Convert the raw Prettier URL at line 213 into a Markdown link and use the current
  official CLI documentation URL.
- State prominently that this plugin contains a hook that can write to the edited
  file, and link to the current Codex hook trust/review guidance.
- Add a reciprocal marketplace link and support path.

**Assessment:** good operational disclosure, but install/update and verification
friction makes it less reliable than it appears.

## Navigation and conversion design

The intended path should be:

```text
GitHub search / repo page
        ↓
Root README: understand value and choose a plugin
        ↓
Plugin README: verify fit, side effects, and requirements
        ↓
One canonical install command
        ↓
Skill/reference: use, troubleshoot, and maintain
```

Implement that path with these exact link rules:

- Root catalog: link each product name directly to its plugin README.
- Each plugin README: link back with `../../README.md`.
- Each plugin README: link its `SKILL.md`, references/examples, `CHANGELOG.md`,
  `LICENSE.md`, GitHub Issues, and the root contribution guide.
- Use relative links for repository files. They follow the viewed branch on GitHub.
- Do not make a Wiki page the only route to installation or plugin behavior.
- Do not use raw URLs when a descriptive link label is available.
- Keep a single canonical installation command and link to it from any repeated
  “install” section rather than copying multiple variants.

## Visual appeal and keyword routing — addendum

The user's observation is correct: a marketplace README needs a stronger visual
hierarchy and more deliberate keyword routing than a conventional library README.
The right implementation is visual structure with semantic links, not decoration
for its own sake.

### Recommended visual system

- Use one brand emoji in the title and one consistent emoji per major section:
  catalog, install, safety, documentation, contribution, and support.
- Keep the first screen composed of: title, badges, one-line promise, keyword
  navigation row, and one GitHub alert for the most important trust or safety fact.
- Use bold text for actions and product names, regular text for explanation, and
  italics for short orientation or decision hints.
- Use tables for plugin comparison and routing; do not place long prose inside table
  cells.
- Use GitHub alerts (`NOTE`, `TIP`, `IMPORTANT`, `WARNING`, `CAUTION`) for one or two
  genuinely consequential messages per README. Do not turn every paragraph into a
  colored box.
- Use `<details><summary>...</summary>` for optional maintainer material, release
  internals, exhaustive compatibility notes, and long troubleshooting examples.
- Keep code blocks limited to commands, minimal payloads, and one canonical example.
- Use neutral badges and non-affiliating language. A framework-colored badge should
  never imply that Astro, Prettier, OpenAI, or Codex endorses a community plugin.

GitHub officially supports Markdown alerts with colored icons and collapsible
`details` sections. It also advises limiting alerts so that they retain meaning.

### Exact keyword-to-destination map

Use the following links near the top of the root README and, where relevant, in
plugin READMEs:

| Keyword or visitor intent                            | Destination                                          |
| ---------------------------------------------------- | ---------------------------------------------------- |
| `Codex plugins`, `plugin marketplace`                | Root catalog and official packaging guide.           |
| `Astro CLI`, `Astro workflows`                       | `plugins/astro-cli-commands/README.md`               |
| `Prettier`, `format after edit`, `hooks`             | `plugins/prettier-after-edit/README.md`              |
| `changelog`, `ADR`, `architecture decisions`         | `plugins/doc-keeper/README.md`                       |
| `Codex memory`, `memory audit`, `reconcile memories` | `plugins/optimize-memories/README.md`                |
| `install`, `update`, `remove`                        | One root installation/lifecycle section.             |
| `permissions`, `side effects`, `trust`               | The selected plugin's boundary section.              |
| `contribute`, `maintain`, `validate`                 | `docs/contributing/plugins.md` and quality guidance. |
| `support`, `bug`, `request`                          | GitHub Issues and Discussions.                       |

These are contextual keyword links, not SEO keyword stuffing. They improve the
visitor's next action and create a measurable navigation path. Markdown links do
not create HTTP redirects and should not be described as redirects; they are
semantic internal routes. The repository description and GitHub topics remain the
main repository-level discovery controls.

### Use-case quality standard for all plugins

Every plugin README should include the same pattern:

```markdown
## 🎯 Use cases

| Scenario                | How this plugin helps        | Expected result       |
| ----------------------- | ---------------------------- | --------------------- |
| A concrete user problem | The relevant plugin behavior | An observable outcome |

**Not a fit when:** a clear boundary or alternative applies.
```

Use cases should be concrete and testable. Prefer “After Codex edits a tracked
JavaScript file, format it with the project's local Prettier configuration” over
“Provides formatting automation.” The former helps both human visitors and agents
select the correct plugin.

## Visual and style recommendations

The current Markdown renders cleanly, but the visual system is inconsistent:
Astro has a custom orange badge, Prettier has only a license badge, Optimize has a
license badge, and DocKeeper has none. Three files use icon-heavy headings while
DocKeeper does not.

Recommended system:

- Use the same badge order everywhere: license, version or release link if truthful,
  and CI/status only where it is meaningful.
- Prefer a text title plus a short blockquote tagline. A single brand mark is fine;
  emoji in every heading is unnecessary visual noise and does not improve search.
- Do not use an Astro-colored badge that could imply official endorsement. Use a
  neutral plugin/repository badge or plain text attribution.
- Keep tables for comparison and routing, not for paragraphs.
- Keep code blocks only for commands, compact payloads, and minimal examples.
- Use sentence-case headings and consistent names across manifest, catalog, README,
  and agent metadata.
- Preserve alt text for badges and avoid decorative images without an accessibility
  purpose.
- Include version/release badges only when their target is the plugin's actual
  release/tag, not merely the latest release in a multi-plugin repository.

## Exact change set recommended

### Root README

1. Replace the current file with the supplied root template.
2. Link all four names in the first catalog table.
3. Remove the repository-level “Latest release” badge or relabel it truthfully.
4. Remove the duplicate marketplace lifecycle explanation.
5. Replace `types/` with no row until it is a maintained path.
6. Remove the protected release-environment claim and link to the release runbook.
7. Add explicit repo-marketplace versus universal-public-directory wording.
8. Add direct links for installation, product docs, contribution, issues, releases,
   and license.

### Astro Commands

1. Change the three component paths to `skills/astro-commands/references/...` and
   make them links.
2. Change `marketplace update` to `marketplace upgrade`.
3. Clarify command working directories in verification examples.
4. Add root, changelog, support, and dated compatibility links.
5. Move exhaustive command/approval material into the skill/reference documents.

### DocKeeper

1. Add consistent badges, tagline, and above-the-fold quick start.
2. Add a Reference Library table with real links to the skill, two references, and
   two examples.
3. Add root, changelog, support, and license links.
4. Shorten the release-tool compatibility catalogue and link to the authoritative
   reference instead.
5. Keep the evidence/authorization boundary in the README, but move its full policy
   to the skill.

### Optimize Memories

1. Use the supplied plugin template as a shorter structure.
2. Resolve the `Optimize Memories` versus `Codex Memory Audit` identity mismatch.
3. Add reciprocal root/changelog/support links.
4. Label `marketplace:build` as mutating and `marketplace:check` as read-only.
5. Replace the universal `rg` requirement with capability-oriented wording.

### Prettier After Edit

1. Change `marketplace update` to `marketplace upgrade`.
2. Fix the hook smoke-test path or add an explicit `cd` to the marketplace root.
3. Use a Markdown link for the current Prettier CLI documentation.
4. Put hook write/trust behavior in the first screen, before installation.
5. Add reciprocal root/changelog/support links and use the common badge style.

### All plugin READMEs

1. Add a visible `🎯 Use cases` section with three to five scenario/result rows.
2. Add one explicit “Not a fit when” statement.
3. Link each use-case destination to the relevant plugin README, reference, or
   canonical example instead of leaving it as descriptive prose only.
4. Add three concise FAQs covering installation effects, boundaries, and update or
   rollback.
5. Show the plugin version and immutable release/tag link when one exists.

## Wiki recommendation

Do not create a Wiki merely to compensate for README length. GitHub's own guidance
positions the README as the quick project entry point and Wikis as long-form
documentation. For this repository, the canonical contracts (`plugin.json`, skill
instructions, generated catalog, contributor rules, and release policy) belong in
the repository because they must change with code and be reviewed in commits.

A Wiki or GitHub Pages layer becomes useful only for curated, public, slower-changing
material such as tutorials, conceptual guides, FAQ, and marketplace usage journeys.
It should link back to the repository and never become a second authoritative source
for plugin behavior.

## External criteria used

- [GitHub: About repository README files](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)
  — README purpose, first-visitor role, typical content, automatic outline, relative
  links, and guidance to keep long-form content elsewhere.
- [GitHub: About wikis](https://docs.github.com/en/communities/documenting-your-project-with-wikis/about-wikis)
  — README versus Wiki role, public indexing limitation, and Wiki scale limitation.
- [GitHub: Classifying repositories with topics](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics)
  — topics as repository-level discovery metadata.
- [OpenAI: Package your plugin](https://developers.openai.com/plugins/build/plugins)
  — manifest/package contract, distinction between universal public plugins and
  repo marketplaces, marketplace catalog behavior, and current CLI commands.
- [Prettier: CLI](https://prettier.io/docs/next/cli/)
  — current CLI verification and exit-code behavior relevant to the hook README.
- [Astro releases](https://github.com/withastro/astro/releases)
  — current external-version verification source for the Astro compatibility note.

## Verification performed

The audit itself was non-mutating. The repository worktree remained clean. Local
README links resolved, but the recommendations above intentionally include semantic
claims and plain-text path references that a simple link checker cannot detect.
