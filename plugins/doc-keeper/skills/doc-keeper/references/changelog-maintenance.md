# Changelog Maintenance

Use this reference only for `CHANGELOG.md` files or an existing project-specific
equivalent. This file explains the procedure. The default output shape lives in
[outputs/changelog-example.md](../outputs/changelog-example.md).

## Output contract

- If the repository already has a changelog convention, preserve it unless the
  authorized task repairs a proven defect within that convention.
- If the repository has no convention, use
  [outputs/changelog-example.md](../outputs/changelog-example.md) as the exact
  baseline for title, heading order, category order, and entry style.
- The example defines the document format.
- This reference defines when to create, update, roll over, audit, repair, and
  save it.
- Remove all instructional placeholders before saving.

## What belongs in a changelog

Add or update an entry when confirmed evidence shows a notable change that
matters to users, operators, integrators, compatibility, installation,
migration, packaging, or security.

Do not add entries for:

- formatting-only work;
- internal refactors with no observable effect;
- speculative plans;
- unconfirmed releases, versions, or dates;
- merge commits, branch names, or automation output by themselves;
- lockfile churn without confirmed impact;
- test-only work that neither fixes nor documents a user-visible defect.

## Evidence

1. Read repository instructions and the existing changelog first.
2. Identify who owns versioning, changelog generation, release notes, tags, and
   publication before editing any of them.
3. Inspect only the smallest evidence set that proves the entry.
4. Use released tags, releases, and package metadata for published history.
5. Use current diffs, merged history, and confirmed unreleased work for
   `Unreleased`.
6. Treat issue titles, commit subjects, and automation output as leads unless
   the repository deliberately uses them as final changelog text.
7. If evidence conflicts, prefer direct repository evidence and published
   release metadata.

Do not write uncertain facts as history.

## Create

1. Confirm no existing changelog already owns the history under another name.
2. Check whether the repository already has its own format.
3. If it does not, start from
   [outputs/changelog-example.md](../outputs/changelog-example.md).
4. Replace placeholders only with confirmed project information.
5. Add past releases only when version and release state are verifiable.
6. If past history cannot be reconstructed safely, start at `Unreleased` and
   state that gap in the report.

## Complete

1. Inventory missing headings, entries, releases, dates, and links separately.
2. Preserve every valid existing entry and the established document order.
3. Fill each gap only from evidence that establishes that exact fact.
4. Keep confirmed but unreleased work under `Unreleased` unless an authorized
   release plan establishes its version and intended release date.
5. Leave an unprovable optional item absent. Report an unprovable required item
   as unresolved; never fill it with a placeholder or plausible history.
6. Continue through the audit and validation procedures before saving.

## Maintain and update

1. Preserve valid existing wording, order, and link style.
2. Write one bullet per coherent change.
3. Describe the result, not the implementation activity.
4. Place the change under exactly one primary category.
5. Add migration detail only when users must act.
6. Keep work under `Unreleased` until an authorized release plan or the owning
   automation confirms the exact version and release date.
7. Do not invent comparison links, release links, issue numbers, or PR numbers.

## Release rollover

Treat release rollover as **Update** mode.

1. Confirm the exact version, date, tag convention, and lifecycle state.
2. Move confirmed `Unreleased` entries into the new release section.
3. Recreate an empty `Unreleased` section only when local convention keeps one.
4. Remove empty categories unless local convention keeps them.
5. Update compare or release links only when their endpoints are confirmed.
6. Finish and validate the document pass before handing it to the release
   workflow.

DocKeeper does not create a commit, tag, release, publication, or other remote
state. When the user separately authorizes those actions, the owning release
workflow performs them after the document pass.

Distinguish a proposed release, local version commit, local tag, remote tag,
GitHub release, and registry publication. None proves the others. When release
automation owns versioning, use its version source, overrides, branch or channel
policy, and complete prerelease identifier. Do not recalculate the version from
the changelog or commit types.

An authorized release plan can establish the version and intended release date
for rollover before publication. It does not establish that the tag, GitHub
release, or package publication already exists; record those states only after
their own evidence confirms them.

## Audit

Check:

- one H1 title;
- `Unreleased` above released versions when the local convention uses it;
- released versions in the repository's established order;
- valid dates in the repository's established format;
- expected category order;
- no duplicate versions or speculative releases;
- no placeholders, fake links, fake dates, or guessed versions;
- links resolve when they were changed by the task;
- breaking and security changes are visible and safely worded.

In audit mode, report confirmed defects, unresolved uncertainties, and optional
improvements separately. Do not edit.

## Repair

1. Preserve recoverable history.
2. Separate structural defects from factual defects.
3. Normalize headings, order, and links only as far as the established
   convention or the default example requires.
4. Add a transparent correction note when a silent historical fix would mislead
   readers.
5. Re-run the audit after the repair.

## Special cases

### Private repositories

- Keep private evidence inside the authorized repository scope.
- Do not copy confidential issue text, internal URLs, customer data, or private
  discussion into public-facing changelogs.
- Summarize sensitive fixes at the safest useful level.

### Monorepos

1. Determine whether versions are fixed or independent.
2. Map each component path to its version source, changelog, tag pattern, and
   release workflow.
3. Update only the changelog that owns the changed package unless local policy
   also requires a shared summary.
4. For independently versioned packages, compare against the previous release
   of that same package.
5. Verify whether dependency-only changes trigger a release. Do not infer
   monorepo behavior from a tool name alone.

### Generated changelogs

1. Identify the generating tool, its configuration, and the sections it owns.
2. Change source inputs instead of directly editing generated output when direct
   edits would be overwritten.
3. Do not mix manual and generated ownership without a documented boundary.

### Release automation ownership

Use the configured owner's native files, commands, APIs, and lifecycle when the
authorized workflow needs them. Do not recreate version calculation, Release
PR orchestration, note generation, tagging, publication, or recovery inside
DocKeeper. DocKeeper supplies the curated-document pass when that responsibility
is not already owned.

- **GitHub generated release notes:** inspect `.github/release.yml` or
  `.github/release.yaml`. Generated release notes do not by themselves own a
  committed changelog.
- **release-please:** inspect its config, manifest, component mapping, changelog
  path, and active Release PR. Treat automation-owned PR titles, bodies,
  branches, labels, and manifests as release state. Do not normalize them as
  ordinary prose.
- **semantic-release:** inspect the ordered plugin list. `semantic-release`
  orchestrates release-note generation through its configured or default
  plugins, but writes a changelog file only when a changelog plugin is
  configured. Do not assume file ownership from the core package alone.
- **Changesets:** preserve package scopes, changeset intent, and the repository's
  fixed or independent version policy.
- **standard-version:** inspect its configured local bump, changelog, commit,
  and tag steps, including skipped steps. Treat only enabled steps as legacy
  ownership. It is deprecated; do not recommend it for new automation.
- **git-extras or another generator:** treat generated text as a draft unless
  the repository explicitly defines it as the final changelog format.

Tool presence alone does not prove ownership. Never introduce, migrate,
reconfigure, or run release automation unless the user authorizes that action.
Introduce custom automation only when the existing infrastructure cannot meet a
confirmed requirement; record the gap and keep the extension smaller than the
native capability it complements.

### Partial releases and dry runs

On a failed or partial release, inspect changelog, version files, manifest,
commit, tag, release, registry, and automation status separately. Do not repair
automation state from the changelog alone, delete published history, or assume
the workflow was atomic. Follow the owning tool's recovery procedure.

Treat dry-run output as evidence only for phases it executes. A
`semantic-release --dry-run` skips `prepare`, so it does not prove that a
changelog file will be persisted.

### Yanked releases

1. Require evidence that the specific release was withdrawn from its owning
   distribution channel.
2. Preserve the release in chronology and mark it `[YANKED]` when the local
   convention has no equivalent notation.
3. State the reason, affected channel, mitigation, or replacement version only
   when each fact is confirmed.
4. Do not delete the historical entry or infer that a GitHub release, tag, and
   registry artifact were all withdrawn together.

## Validate and save

1. Run the project's Markdown formatter or checker when available.
2. Run its documentation gate when available.
3. Search for placeholders, duplicate versions, impossible dates, and broken
   changed links.
4. Inspect the final diff for factual drift.
5. Save only the requested files.
6. Do not commit or publish. Report the validated document state to any
   separately authorized owning workflow.

## Sources and attribution

This procedure and its default example are aligned with:

- [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/)
- [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html) when the
  repository actually uses SemVer
- [GitHub generated release notes](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes)
- [release-please](https://github.com/googleapis/release-please)
- [semantic-release](https://github.com/semantic-release/semantic-release)
- [semantic-release changelog plugin](https://github.com/semantic-release/changelog)
- [@semantic-release/github](https://github.com/semantic-release/github)
- [Changesets](https://github.com/changesets/changesets)
- [standard-version](https://github.com/conventional-changelog/standard-version),
  retained only for legacy-project compatibility
- [git-extras](https://github.com/tj/git-extras)

These are documentation references, not runtime dependencies of DocKeeper.
