---
name: live-research
description: Verify time-sensitive and change-sensitive claims with current authoritative sources. Use for current facts about software, APIs, integrations, regulations, statistics, people, products, compatibility, prices, schedules, or news, even when the user does not explicitly ask to browse.
---

# Live Research

Use current evidence instead of training data whenever a material fact may have
changed. This skill owns the evidence standard, routing decisions, source
comparison, uncertainty handling, and citation requirements. It does not require
or install a companion plugin, MCP server, app, credential, or standalone skill.

Skip live retrieval for pure mathematics, pure logic, literal translation,
mechanical transformation, creative writing without external factual claims, and
answers fully grounded in user-provided material. If a request mixes stable and
change-sensitive claims, research only the change-sensitive portion.

## Required Inputs

Required:

- The user's question, claim, recommendation request, implementation task, or
  decision that may depend on current facts.

Optional but useful:

- Target jurisdiction, version, product edition, deployment environment, date
  range, budget, risk tolerance, or preferred source class.
- Local project files, manifests, lockfiles, configuration, policies, or logs
  when the answer depends on a specific environment.
- User-authorized private evidence when public or local sources are not enough.

If a required fact cannot be verified from user input, local evidence, authorized
tools, or public sources, ask a focused question, continue with a labeled
limitation, or stop when the missing fact would make the result misleading.

## Use Cases

- Verify whether a software library, API, CLI, platform, dependency, or
  compatibility chain has changed before recommending or modifying code.
- Research a current product, price, policy, schedule, regulation, standard,
  market fact, statistic, or public event before advising the user.
- Resolve conflicts between local project instructions and current external
  evidence before applying an operational or technical change.

## Workflow

1. Identify every material claim that may have changed. Treat a claim as material
   when changing or removing it could alter the conclusion, recommendation,
   implementation, risk assessment, or user decision.
2. Inspect available project and session evidence before external retrieval when
   the request depends on a local environment. Use manifests, lockfiles,
   configuration, `AGENTS.md`, repository docs, tool output, and explicit user
   instructions when available.
3. Inspect currently callable capabilities when possible. Distinguish configured,
   installed, connected, and callable tools; do not assume a listed MCP, plugin,
   app, or skill can be used until the session exposes it.
4. Use the first suitable retrieval route that is callable and safe:
   - Specialized domain MCP, plugin, app, skill, or built-in tool already
     available for the subject.
   - Authoritative official website, documentation, repository, regulator,
     standards body, filing system, or primary publication.
   - Current library or framework documentation service, such as Context7, when
     it is available and appropriate for the technical subject.
   - General web search, using primary sources from the results whenever possible.
   - Secondary reporting only when primary evidence is unavailable, inaccessible,
     or insufficient for the specific question.
5. Start retrieval within the seven days immediately preceding the session date
   and work backward. Prefer evidence published or updated within the last twelve
   months, while using older evidence when the controlling authority, historical
   period, target version, or subject requires it.
6. Compare each material finding against the relevant official source or
   repository before presenting it as a conclusion.
7. For version-sensitive technical claims, review official changelogs, release
   notes, releases, tags, or announcements from the session date backward through
   the immediately preceding six months. Expand to twelve months when the
   six-month window does not establish the answer.
8. If official changelogs or dated releases are unavailable, use the strongest
   official source that exists and state the limitation. Absence of a published
   change does not prove compatibility or unchanged behavior.
9. Compare retrieved evidence with direct user instructions and local project
   authority. Surface material conflicts before continuing with affected work.
10. Prepare the final answer with only the evidence, verification status, dates,
    versions, conflicts, assumptions, limitations, and next steps needed to audit
    the conclusion.

## Source Standards

Prioritize primary sources, official documentation, peer-reviewed material,
regulatory filings, regulator publications, standards bodies, official
repositories, and authoritative release channels. Use strong editorial reporting
for reported events when needed, but not as a substitute for official technical,
legal, regulatory, or compatibility requirements.

For statistics, require an identifiable methodology, issuing organization,
measurement period, population or sample, and material limitations. Do not
present a number as verified when its methodology cannot be established as
equivalent to the requested statistic.

Use current undated pages only when labeled `undated; accessed YYYY-MM-DD`. For
version-sensitive claims, corroborate undated documentation with dated official
evidence when possible.

## Technical Systems Review

For stack, dependency, adapter, integration, configuration, infrastructure, SDK,
or API work, inspect the actual project and environment before drawing
conclusions when access is available. Determine the material:

- Operating system, version, architecture, and shell.
- Language runtimes, frameworks, package manager, lockfiles, and declared or
  installed versions.
- Build, test, lint, deployment, and other relevant toolchain components.
- Direct and peer dependencies, adapters, SDKs, APIs, plugins, and provider
  contracts.
- Compatibility matrices, supported ranges, deprecations, migrations, and known
  platform-specific constraints.

Research the full material compatibility chain, not only the primary framework
or infrastructure provider. Do not expand into unrelated components.

## Project Conflict Gate

Classify material disagreement between current evidence and project authority as:

- **Factual conflict:** local documentation contains a demonstrably outdated or
  incorrect claim.
- **Compatibility conflict:** documented versions or configurations conflict with
  current compatibility evidence.
- **Intentional project constraint:** the project deliberately retains an older
  version, behavior, or policy.
- **Unknown intent:** the evidence conflicts, but intent cannot be established.

When a conflict affects the answer or planned action, report the exact local
instruction or fact, current cited evidence, practical impact, and viable
options. Do not silently override user or project instructions. A current direct
user instruction retains operational authority unless it conflicts with a
higher-priority instruction.

## Non-Inference Rules

- Do not invent data, quotations, dates, versions, sources, URLs, approvals,
  tool availability, project state, operating systems, credentials, or
  compatibility.
- Do not treat a search snippet, stale cache, model memory, or secondary summary
  as authoritative evidence.
- Do not claim a tool action succeeded unless the tool result confirms it.
- Do not install plugins, enable MCPs, add credentials, publish, deploy, send
  messages, or modify files unless the user separately authorized that action.
- Do not transfer sensitive code, credentials, or private data to a remote source
  unless the user explicitly authorized that source and transfer.

## Ask, Stop, And Decline

Ask a focused question when:

- A missing jurisdiction, version, date range, environment, source target, or
  decision criterion materially changes the answer.
- Multiple valid output targets or interpretations exist and the user has not
  chosen one.
- Continuing would require inventing facts or using private evidence without
  authorization.
- A requested action may be destructive, external, production-impacting,
  irreversible, or credential-sensitive.

Stop and explain the blocker when:

- Required evidence, local files, credentials, tools, or network access are
  unavailable and no safe fallback can meet the minimum success criteria.
- A source or tool result is ambiguous in a way that would make the conclusion
  misleading.
- The task drifts outside live research into unauthorized implementation,
  publication, deployment, account mutation, or credential handling.

Decline when:

- The user asks to fabricate evidence, citations, logs, tool output, approvals,
  dates, or source content.
- The requested action conflicts with platform, workspace, repository, legal,
  safety, or credential restrictions.
- The request cannot be performed safely with the available tools and
  authorization.

## Output Format

Start with a direct one- or two-sentence answer. Use Markdown headings, bullets,
or tables only when they improve comprehension.

Cite every material external claim immediately with a dated Markdown link:

```text
[Source name - domain, YYYY-MM-DD](URL)
```

Use the source publication or update date. When an undated current page is the
strongest permitted evidence, cite it as:

```text
[Source name - domain, undated; accessed YYYY-MM-DD](URL)
```

Classify evidence faithfully:

- **Verified fact:** directly supported by cited evidence.
- **Interpretation:** reasoning derived from stated verified facts.
- **Unverified:** not corroborated; do not present it as a conclusion.
- **Conflicting evidence:** lead with the higher-authority source and disclose
  the disagreement.
- **Non-matching evidence:** state the mismatch first, including wrong year,
  version, entity, parent company, product, or jurisdiction.

Do not narrate the search process or tool sequence. Report the evidence,
verification status, dates or versions checked, conflicts, assumptions, and
limitations needed to audit the answer.

When asked to update or correct a file, script, configuration, or code block,
return the complete updated version with the requested change integrated unless
the user asks for a patch or summary.

For complex answers, end with two or three precise next steps when they add
value. Ask follow-up questions only when missing information or a user decision
materially blocks a reliable conclusion or safe execution.

## Success Criteria

A successful Live Research result:

- Identifies the material change-sensitive claims.
- Uses the strongest callable and authorized evidence route for each claim.
- Checks official or primary sources before making retrieval-derived
  conclusions.
- Separates verified facts, interpretation, uncertainty, conflicts, and
  limitations.
- Provides citations with source dates, access dates for undated pages, and exact
  versions or date ranges when relevant.
- Preserves user and project authority without silently overriding local
  constraints.
- Avoids unauthorized side effects and credential exposure.

## Internal Pre-Finalization Checklist

Complete this checklist internally before finalizing. Do not print it unless the
user requests it or an unmet item materially limits the result.

- [ ] Identified every change-sensitive and material claim across stack,
      configuration, APIs, sources, and recommendations.
- [ ] Inspected session capabilities to prioritize callable domain MCPs, plugins,
      apps, skills, or tools before generic retrieval.
- [ ] Inspected local project evidence when the answer depends on a specific
      repository, environment, or user-provided artifact.
- [ ] Confirmed the material compatibility chain for technical conclusions.
- [ ] Started retrieval within seven days backward from the session date and
      prioritized primary or official sources.
- [ ] Checked official release notes, tags, changelogs, announcements, or
      repositories across the required six-month or twelve-month window.
- [ ] Stated explicit limitations when official dated evidence was unavailable.
- [ ] Verified statistics against methodology, issuer, sample or population,
      measurement period, and limitations.
- [ ] Formatted every material citation with source name, domain, and date or
      access date.
- [ ] Separated verified facts, interpretation, unverified claims, conflicts, and
      non-matching evidence.
- [ ] Identified and classified project conflicts before affected work continued.
- [ ] Preserved direct user instructions unless they conflicted with higher
      priority instructions.
- [ ] Avoided substituting training data, snippets, stale caches, or memory for
      current evidence.
- [ ] Declared narrow assumptions, access limitations, and uncorroborated areas.

## Failure And Recovery

- If a preferred retrieval route fails, use the strongest safe alternative and
  disclose the routing limitation.
- If sources disagree, lead with the most authoritative source and disclose the
  conflict, date, and practical impact.
- If project or environment evidence is missing, state a narrow assumption or
  stop and request the missing evidence.
- If a command, source, or verification gate fails, preserve the exact failure
  that affects the conclusion and report what remains unverified.
