# Changelog maintenance

Read this reference only for a changelog, curated release history, or release
document preflight. Use the target repository's convention first; use the
[default example](../outputs/changelog-example.md) only when none exists. The
example is a starting shape, not evidence that a release happened.

## Establish ownership

Inspect the changelog, package versions, tags, Releases, CI/release workflow,
and relevant diff. Identify whether the changelog is authored or generated. If a
tool owns the file, use its configured inputs and lifecycle; do not hand edit
output that the next run will replace. Do not build a parallel release engine
inside DocKeeper.

For a new entry, use confirmed behavior, compatibility, installation, migration,
security, or operator impact. A commit subject or issue title is a lead, not
final release prose. Formatting-only work, speculative plans, and tests without
a user-visible correction do not require an entry.

## Create, update, or repair

1. Preserve established title, ordering, categories, dates, links, and valid
   wording. If there is no convention, use `Unreleased` above dated versions and
   include only categories with confirmed entries.
2. Write one concise bullet per coherent user-visible change. Explain required
   migration rather than relying on a `BREAKING CHANGE` label alone.
3. Keep unreleased work under `Unreleased` until the owning process sets an
   exact version and intended release date. Version in a manifest, local tag,
   remote tag, GitHub Release, and registry publication require separate
   evidence; none implies all the others.
4. For release rollover, confirm the version, date, package scope, tag naming,
   and owner. Move only confirmed entries, leave an empty `Unreleased` section
   if the local convention uses one, and add comparison links only when both
   endpoints exist.
5. For a historical error, preserve recoverable history and add a transparent
   correction if silent rewriting would mislead readers. A yanked release
   remains in chronology with the affected channel and mitigation only when
   withdrawal is independently confirmed.

## Special cases

- **Monorepo:** map each package to its own version, changelog, and tag. Update
  only the package that owns the change unless a shared record is required.
- **Prerelease:** keep each published prerelease section. Confirm whether the
  stable release is cumulative or delta under local policy; do not infer
  inclusion from matching core version numbers.
- **Partial automation:** inspect manifest, changelog, commit, tag, Release, and
  registry separately. A dry run proves only phases it executes; never simulate
  the missing owner operation by editing its outputs.
- **Private/security changes:** summarize at the safest useful level and keep
  confidential issue text, URLs, credentials, and customer data out of public
  notes.

## Verify

Check duplicate versions, date/order consistency, unused headings, leftover
placeholders, changed links, and notable changes missing from the relevant
scope. Run the repository's Markdown and release-document gates. Inspect the
final diff and report any history or publication state that remains unknown.

Source: [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/),
consulted 2026-09-24. Follow the repository's own release policy where it
deliberately differs.
