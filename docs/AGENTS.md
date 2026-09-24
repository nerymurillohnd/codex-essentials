# Documentation instructions

- Keep durable architecture, operational runbooks, decisions, audits, specs, and
  plans in `docs/`, in English. Date change-sensitive claims and cite the
  inspected source and repository revision.
- Keep a single authoritative description of each contract and link to it from
  other documents. Historical evidence from `deprecated` must be labeled as
  historical, not copied as a current command or policy.
- Record exact commands, expected results, failure handling, and recovery in
  operational runbooks. Report skipped checks and unverified assumptions.
- Run Markdown/YAML formatting and `npm run check` after documentation edits.
