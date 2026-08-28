# DocKeeper

## Purpose

DocKeeper gives Codex a safe, repeatable process for maintaining two document
types: `CHANGELOG.md` files or equivalent curated release history, and
architecture decision records (ADRs). It creates, completes, audits, updates,
and repairs them from verified evidence. It can also activate implicitly at the
end of implementation work when a notable change or explicit architectural
decision requires companion documentation.

DocKeeper does not invent history. It never publishes or mutates remote state;
an authorized owning workflow performs those actions after DocKeeper's document
pass.

The package-local `.codex-plugin/plugin.json` is the source of truth for this
plugin's identity and install metadata. The repository derives and validates
the marketplace catalog from it.

## Included Components

- `skills/doc-keeper/SKILL.md` routes each request and enforces shared evidence,
  authorization, save, and reporting rules.
- `skills/doc-keeper/references/changelog-maintenance.md` explains how to
  create, maintain, update, audit, repair, and save changelogs.
- `skills/doc-keeper/references/adr-maintenance.md` explains how to create,
  maintain, update, audit, repair, and save ADRs.
- `skills/doc-keeper/outputs/changelog-example.md` defines the default
  changelog shape when the repository has no local convention.
- `skills/doc-keeper/outputs/adr-example.md` defines the default ADR shape when
  the repository has no local convention.
- `skills/doc-keeper/agents/openai.yaml` provides Codex-facing skill metadata.

The plugin contains no scripts, hooks, apps, MCP servers, credentials, or
runtime dependencies. It uses Codex's native implicit skill matching instead of
adding a hook that would run on unrelated turns.

## Supported Environments

DocKeeper works in private projects and GitHub repositories that Codex can read.
It supports single-package repositories, monorepos, generated changelogs,
prereleases, and categorized ADR directories. Existing repository instructions
and document conventions govern unless an authorized repair corrects a proven
defect.
For prereleases, it preserves published prerelease sections and follows the
project's cumulative or delta convention. With no local convention, the stable
entry summarizes confirmed changes since the previous stable release while the
prerelease sections remain as history.
It detects release ownership from native GitHub release notes and established
tools such as release-please, semantic-release, Changesets, standard-version,
and git-extras without replacing their lifecycle.
It distinguishes `@semantic-release/github` ownership of GitHub Releases,
configured asset uploads, and issue or pull-request mutations from changelog,
version-calculation, asset-build, and registry-publication ownership.

## Inputs and Outputs

Provide:

- the requested document type;
- the mode: create, complete, audit, update, or repair;
- the repository or project in scope;
- any required release, decision, or authorization context.

DocKeeper reads only the evidence needed for the request. It produces a report
in audit mode or saves the authorized changelog, ADR, index, and reciprocal
links in editing modes. The reference explains the procedure. The matching
example defines the default output shape when no local convention exists.
Release rollover uses Update mode.

## Required Tools and Credentials

DocKeeper requires only the file, Git, repository, and authorized remote
inspection tools already available to Codex. It does not install or require a
release tool. Credentials are needed only when the requested evidence is private
and the user has authorized that access. It makes no runtime network request of
its own.

DocKeeper is infrastructure-first. When Codex, GitHub, an ADR manager, or the
repository's release tooling already provides an operation, the agent uses or
wires that native capability through its owning workflow. It does not create a
parallel implementation. A custom extension is justified only by a confirmed
gap and requires authorization.

## Permissions

DocKeeper needs read access to the in-scope repository evidence. Editing modes
also need write access to the requested documentation paths. Audit mode is
read-only. No administrative or organization permission is required.

## Side Effects

Repository documentation writes are the only normal side effect. Audit mode
does not write. Installation adds the plugin to Codex's managed plugin state;
it does not modify the target project.

## Human Approval Boundaries

A request to implement a change authorizes local companion documentation that
repository policy requires or that keeps the same change consistent. A document
request authorizes its relevant local file changes. Neither authorizes commits,
pushes, tags, releases, issues, pull requests, comments, tool installation, or
other remote mutations. DocKeeper never performs those actions itself. When
they are authorized, their owning workflow receives DocKeeper's validated
document state and performs them under its own controls.

## Installation Behavior

Add the marketplace branch that contains DocKeeper, then install the plugin:

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add doc-keeper@codex-essentials
codex plugin list
```

Use a release tag only after confirming that the tag contains `doc-keeper`.
Marketplace release tags are immutable snapshots and may predate this plugin.

Codex caches the marketplace and plugin in its managed plugin storage. It does
not add files or dependencies to the target project. Restart Codex if the
installed skill does not appear immediately.

## Use

Codex can invoke DocKeeper implicitly when a task matches its skill description,
including companion closeout after notable implementation work and changelog
preflight during an authorized release workflow. DocKeeper prepares or verifies
the documentation; the release workflow retains publication authority. Invoke
DocKeeper explicitly when you want a specific document operation:

```text
Use $doc-keeper to audit CHANGELOG.md without editing it.
```

```text
Use $doc-keeper to create an ADR for the accepted database isolation decision.
```

For every request, DocKeeper follows these steps:

1. Read repository instructions and existing conventions.
2. For implementation closeout, test whether the task crosses the changelog or
   ADR threshold before loading a reference.
3. Select only the changelog or ADR reference that applies.
4. Follow the matching example only when the repository does not already define
   its own format.
5. Select create, complete, audit, update, or repair mode.
6. Detect the repository's existing release or ADR infrastructure and preserve
   its ownership boundaries.
7. Gather the smallest sufficient evidence.
8. Write only confirmed facts and label necessary inferences.
9. Validate structure, links, scope, and the final diff.
10. Save only authorized files and report unresolved facts.

## Verification

Confirm that Codex lists `doc-keeper`, then ask for a read-only audit. The result
must identify the selected mode, evidence, validation, unresolved facts, and
remote actions not performed.

For behavioral verification, also exercise these cases after installation:

- a notable user-facing change triggers changelog closeout;
- an explicit durable decision triggers ADR closeout;
- a typo-only, formatting-only, test-only, or no-impact dependency change does
  not trigger document edits;
- an authorized release request performs changelog preflight but leaves remote
  publication to the owning workflow.

Package maintainers can validate the skill with:

```bash
npm run validate:plugins
npm run validate:marketplace
```

Both commands are repository-maintainer checks, not plugin runtime dependencies.

## Uninstall and Rollback Behavior

Remove the plugin without removing the marketplace:

```bash
codex plugin remove doc-keeper@codex-essentials
```

Removing DocKeeper does not revert documents it changed. Review the repository
diff and use the project's normal version-control process to restore an earlier
document version. Remove the marketplace only when no installed plugin still
depends on it:

```bash
codex plugin marketplace remove codex-essentials
```

## Known Limitations

- DocKeeper cannot recover facts absent from repository history or authorized
  external evidence. It leaves material gaps unresolved.
- It cannot confirm decision approval from implementation alone.
- It does not replace release automation, versioning policy, or architecture
  governance.
- Implicit activation is semantic, not deterministic. A future advisory hook
  should be added only if consumer evals demonstrate material missed closeouts.
- Generated documents may require changes to their owning configuration rather
  than direct edits.
- When an owning release or ADR mechanism is unavailable or prohibited,
  DocKeeper reports that operation as blocked instead of simulating its output
  manually.
- Private evidence must not be copied into public documentation.

## Failure and Recovery

If evidence conflicts, stop the affected claim, preserve valid content, report
the conflict, and request the missing authority or source. If validation fails,
keep the changes local, correct the reported defect, and validate again before
any commit or publication.

## Extend DocKeeper

DocKeeper currently authorizes only changelogs and ADRs. To add another document
type:

1. Add one self-contained Markdown reference under
   `skills/doc-keeper/references/`.
2. Add one matching example output under `skills/doc-keeper/outputs/`.
3. Define its create, maintain, update, audit, repair, validation, save, and
   failure-recovery instructions in the reference.
4. State the evidence rules and source attribution in the reference.
5. Add one exact route in `skills/doc-keeper/SKILL.md`.
6. Update this README and `CHANGELOG.md`.
7. Validate the complete plugin package.

Do not weaken the shared evidence or authorization rules when extending it.

## Documentation and Attribution

The ADR procedure and default example are aligned with the
[MADR 4 template](https://github.com/adr/madr/blob/develop/template/adr-template.md)
and guidance from [MADR](https://adr.github.io/madr/) and the
[AD Guidance Tool](https://github.com/adr/ad-guidance-tool). MADR is available
under MIT or CC0-1.0 terms.

The changelog procedure and default example use
[Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/) and, when the
project follows it,
[Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html). Its automation
guidance credits
[GitHub generated release notes](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes),
[release-please](https://github.com/googleapis/release-please),
[semantic-release](https://github.com/semantic-release/semantic-release),
[the semantic-release changelog plugin](https://github.com/semantic-release/changelog),
[@semantic-release/github](https://github.com/semantic-release/github),
[Changesets](https://github.com/changesets/changesets), and
[git-extras](https://github.com/tj/git-extras). It recognizes deprecated
[standard-version](https://github.com/conventional-changelog/standard-version)
only to maintain legacy repositories safely.

DocKeeper relies on [Codex implicit skill invocation](https://learn.chatgpt.com/docs/build-skills)
for default activation. It does not bundle a lifecycle hook.

These sources are documentation references. They are not bundled runtime
dependencies. DocKeeper is an independent project and is not officially
affiliated with the referenced projects. When bundled guidance and a current
upstream source conflict, verify the upstream source, preserve repository
policy, and report the difference before changing behavior.

## License

DocKeeper is distributed under the repository's [MIT license](LICENSE.md).
