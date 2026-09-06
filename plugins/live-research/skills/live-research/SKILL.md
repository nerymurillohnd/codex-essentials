---
name: live-research
description: Use when a task involves time-sensitive or change-sensitive facts about software, APIs, integrations, regulations, statistics, people, products, compatibility, prices, schedules, or current events, even when the user does not explicitly ask to browse.
---

# Live Research

Use current evidence instead of training data whenever a material fact may have
changed. Activate for change-sensitive people, organizations, prices, products,
laws, standards, statistics, news, software, APIs, dependencies, integrations,
infrastructure, configuration, architecture, or compatibility.

Skip retrieval for mathematics, pure logic, literal translation, mechanical
transformation, creative writing without external claims, and content fully
grounded in user-provided material. If a request mixes stable and changing
claims, research only the changing portion.

## Evidence Routing

Use the first suitable route that is callable in the current session:

1. Specialized MCP, plugin, skill, app, or domain tool already available.
2. Authoritative official website, documentation, repository, regulator, or
   standards source.
3. Context7 or equivalent library documentation service.
4. General web search.
5. Secondary reporting only when primary evidence is unavailable.

Before using a generic route, inspect the session's exposed capabilities. A
configured MCP may not be connected, and an installed plugin or standalone
skill may not be callable. Confirm availability and suitability first.

Prefer each capability for its own domain: a browser/data skill can perform
interactive extraction while a domain MCP can provide official API or
framework material. Live Research owns the evidence standard, comparison,
uncertainty, and citations; it does not require or install a companion tool.

Never install plugins, enable MCPs, add credentials, or transfer sensitive
content just to satisfy this preference. If no suitable capability is callable,
continue with the next route and state the material limitation.

Prioritize primary sources, official documentation, peer-reviewed material,
regulatory filings, and regulator publications. Deprioritize blogs, aggregators,
and secondary commentary. Use strong editorial reporting for reported events
when needed, but not as a substitute for official technical or regulatory
requirements.

Start retrieval within the seven days immediately preceding the session date and
work backward. Prefer evidence published or updated within the last twelve
months, while using older evidence when the subject, applicable version,
historical period, or controlling authority requires it.

For statistics, require an identifiable methodology, issuing organization,
measurement period, population or sample, and material limitations. Do not
present a number whose methodology cannot be established as equivalent to a
verified statistic.

## Technical Systems Review

For stack, development dependency, adapter, integration, configuration, or
infrastructure work, inspect the actual project and environment before drawing
conclusions when access is available. Determine the material:

- Operating system, version, architecture, and shell.
- Language runtimes, frameworks, package manager, lockfiles, and declared or installed versions.
- Build, test, lint, deployment, and other relevant toolchain components.
- Direct and peer dependencies, adapters, SDKs, APIs, plugins, and provider contracts.
- Compatibility matrices, supported ranges, deprecations, migrations, and known platform-specific constraints.

Research the full material compatibility chain, not only the primary framework
or infrastructure provider. A component is material when its version or behavior
could change the conclusion or implementation. Do not expand into unrelated
components.

If decisive environment data is unavailable, ask for it or state a narrow
explicit assumption; never invent the user's operating system, versions,
configuration, or project state.

## Official Verification Gate

Before presenting a retrieval-derived conclusion, compare every material finding
with the relevant official website or repository.

Review official changelogs, release notes, releases, Git tags, or official
announcements from the session date backward through the immediately preceding
six months, newest first. If that window contains no relevant finding, expand the
review backward through the immediately preceding twelve months.

If no changelog exists, use official releases, tags, release notes, or
announcements and state that limitation. If no relevant official change is found
within twelve months, say so explicitly. Absence of a published change does not
prove compatibility or unchanged behavior.

Preserve the exact date and version checked. A current documentation page
without a publication or update date may support a material claim only when
labeled `undated; accessed YYYY-MM-DD` and corroborated by dated official
evidence when the claim is version-sensitive.

## Project Conflict Gate

Compare current evidence with direct user instructions and available project
authority or evidence, including `AGENTS.md`, repository documentation,
configuration, manifests, lockfiles, and documented local conventions.

Classify a material disagreement as one of:

- **Factual conflict:** Local documentation contains a demonstrably outdated or incorrect claim.
- **Compatibility conflict:** Documented versions or configurations conflict with current compatibility evidence.
- **Intentional project constraint:** The project deliberately retains an older version, behavior, or policy.
- **Unknown intent:** The evidence conflicts, but intent cannot be established.

Surface the conflict immediately with the exact local instruction or fact,
current cited evidence, practical impact, and available options. Do not silently
override or rewrite project instructions. Pause only the affected work and let
the user decide whether to update the project or preserve the documented choice.

A current direct user instruction retains operational authority unless it
conflicts with a higher-priority instruction. Warn clearly when it is outdated,
incompatible, or risky; do not silently disobey it.

## Grounding and Citations

Start with a direct one- or two-sentence answer. Use clear Markdown headers and
bullets or tables when they improve comprehension.

Cite every material claim immediately with a dated Markdown link in this form:
`[Source name — domain, YYYY-MM-DD](URL)`. Use the source's publication or
update date. When permitted under the verification gate, use
`[Source name — domain, undated; accessed YYYY-MM-DD](URL)`.

Treat a claim as material when changing or removing it could alter the
conclusion, recommendation, implementation, risk assessment, or user decision.
Do not attach citations to pure reasoning, user-provided facts clearly
attributed to the user, or stable common knowledge unless verification is
relevant.

Classify evidence faithfully:

- **Verified fact:** Directly supported by cited evidence.
- **Interpretation:** Reasoning derived from stated verified facts; label it as interpretation.
- **Unverified:** Not corroborated; do not present it as a conclusion.
- **Conflicting evidence:** Lead with the higher-authority position and disclose the disagreement.
- **Non-matching evidence:** State the mismatch first, including wrong year, version, entity, parent company, product, or jurisdiction.

Never speculate beyond retrieved evidence. Never invent data, quotations,
dates, versions, sources, or links. If alternative relevant retrieval routes
produce no matching result, state that no relevant result could be verified. Say
`I could not verify` rather than substituting training data.

Do not narrate the search process or tool sequence. Report only the evidence,
verification status, dates or versions checked, conflicts, mismatches,
assumptions, and limitations needed to audit the conclusion.

Provide complete, ready-to-use examples, commands, snippets, and scripts. When
asked to update or correct a file, script, configuration, or code block, return
the complete updated version with the requested change integrated, never only a
diff or fragment.

For complex answers, end with two or three precise next steps when they add
value. Ask follow-up questions only when missing information or a user decision
materially blocks a reliable conclusion or safe execution.

---

## Internal Pre-Finalization Checklist

Complete this checklist internally before finalizing. Do not print it unless the
user requests it or an unmet item materially limits the result.

- [ ] Identified every change-sensitive and material claim across stack, config, APIs, and claims.
- [ ] Inspected session capabilities to prioritize verified, callable domain MCPs, plugins, or tools before generic search.
- [ ] Inspected local project evidence (manifests, lockfiles, `AGENTS.md`, environment) without inventing specs.
- [ ] Confirmed full material compatibility chain (OS, architecture, runtime, lockfile, toolchain, dependencies).
- [ ] Started retrieval within 7 days backward from the session date; prioritized primary and official sources.
- [ ] Verified claims against official release notes, tags, or announcements (6 months first; expanded to 12 months if null).
- [ ] Stated explicit limitation if no changelog exists or no changes occurred within 12 months.
- [ ] Verified statistics meet methodological criteria (identifiable method, issuer, sample, period, limitations).
- [ ] Formatted every material citation as `[Source name — domain, YYYY-MM-DD](URL)` (or `undated; accessed YYYY-MM-DD`).
- [ ] Separated evidence strictly into Verified Fact, Interpretation, Unverified, Conflicting, and Non-Matching.
- [ ] Identified and classified project conflicts (factual, compatibility, intentional constraint, unknown intent).
- [ ] Preserved user operational authority without silent overrides; surfaced exact conflict, impact, and options.
- [ ] Omitted tool narration, search diagnostics, and substituted training-data claims (used `I could not verify`).
- [ ] Provided full, integrated, ready-to-use artifacts, files, or scripts instead of diffs or snippets.
- [ ] Declared all narrow assumptions, access limitations, and uncorroborated areas explicitly.

## Failure and recovery

- If a preferred route fails, use the strongest safe alternative and disclose
  the routing limitation.
- If sources disagree, lead with the most authoritative source and disclose the
  conflict and practical impact.
- If project or environment evidence is missing, state a narrow assumption or
  stop and request the missing evidence.
- Never publish, deploy, install dependencies, change credentials, or modify
  files without separate authorization.
