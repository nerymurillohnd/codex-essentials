# Architecture Decision Records

Use [the ADR template](../../templates/adr/ADR_YYYY-MM-DD_decision-slug.md) when the user asks to record an important decision for Codex Essentials. Save the record here as `ADR_YYYY-MM-DD_<decision-slug>.md`. The date is the registration date and the slug is lowercase kebab-case.

## Create a record

1. Copy the template and replace every brace-delimited placeholder.
2. Keep the frontmatter `date` equal to the filename date. Use one `status`: `proposed`, `accepted`, `rejected`, `deprecated`, or `superseded`. Name accountable decision makers.
3. Omit unused `consulted` and `informed` fields. Keep the context, drivers, options, rationale, consequences, and confirmation concrete. Remove optional `Pros and cons` or `More information` sections when they add no value.
4. Link supporting issues, PRs, tests, or other evidence. Run `python3 scripts/validate_adrs.py` and review the rendered Markdown.

Recording a discussion does not imply acceptance. Keep accepted ADRs as historical records. To change one, create a new ADR, link both records, and mark the earlier one superseded without rewriting its rationale.

This project uses the MADR decision structure but omits Forestal MT document metadata. The filename and Git history already identify the record; unrelated corporate taxonomy and copyright fields do not improve this repository's decisions.
