# Semantic Governance for AGENTS.md

Use this reference for an audit that asks about semantic duplication within one
file, overlap across an effective instruction chain, contradictions, deletion,
density, writing quality, or linked guidance.

## Evidence and source authority

Inspect the complete effective chain, including global instructions, repository
root, nested files, overrides, and configured fallbacks. Classify evidence as
current official documentation, repository implementation, accepted project
record, community heuristic, or unverified claim. Community posts and gists may
suggest questions; they do not establish Codex behavior or override executable
repository evidence.

## Normalize each material instruction

Give every material instruction a stable ID and record these fields:

| Field                        | Record                                                              |
| ---------------------------- | ------------------------------------------------------------------- |
| Evidence                     | File, heading or line, and a short quotation or faithful paraphrase |
| Actor                        | Who must act                                                        |
| Modality                     | Requirement, prohibition, permission, recommendation, or context    |
| Action and object            | What operation applies to what target                               |
| Condition and phase          | When it applies, including lifecycle or task trigger                |
| Scope                        | Global, repository, subtree, package, document, or task             |
| Source and enforcement owner | Where the fact comes from and what can enforce it                   |
| Retrieval rationale          | Why it must remain visible at this layer                            |

Do not compare headings, keywords, or wording alone. A lexical match without
equivalent actor, action, condition, scope, and effect is not a duplicate.

## Compare in two passes

1. Compare normalized instructions within one file. Identify internal duplicate
   obligations, repeated commands, repeated ownership claims, and repeated
   approval boundaries before inspecting another layer.
2. Compare retained instructions across the effective chain. An inherited rule
   is earlier guidance; a local rule may refine it only with a stated local
   condition or retrieval rationale.

Classify every material pair:

| Classification                 | Meaning                                                                | Default disposition                       |
| ------------------------------ | ---------------------------------------------------------------------- | ----------------------------------------- |
| Exact duplicate                | Same decision under the same condition and scope                       | Consolidate behind one canonical owner    |
| Partial overlap                | Same core rule, but one adds a phase or condition                      | Retain only the differential material     |
| Intentional reinforcement      | A concise repeat is needed at a high-risk local decision               | Retain and state why retrieval matters    |
| Local refinement               | A nested rule narrows inherited guidance                               | Retain both and state the local condition |
| Policy-guide-enforcement triad | Policy, explanatory guide, and mechanical control have distinct owners | Retain all three and label their roles    |
| Contradiction                  | Applicable rules prescribe incompatible actions                        | Resolve by authority or ask the user      |
| Lexical-only match             | Similar words, different decision                                      | Retain without a duplication finding      |

## Find contradictions

First determine whether both instructions apply to the same actor, target,
condition, and phase. Current configuration, code, scripts, tests, CI, and
official documentation outrank stale prose about the same fact. If authority
does not resolve the conflict, report:

```md
## Contradiction Found

**Instruction A:** [short quote with evidence]
**Instruction B:** [short quote with evidence]

**Applicable scope and condition:** [where both apply]
**Authority analysis:** [why neither rule yet wins]
**Recommendation:** [safe conditional, owner, or precedence proposal]
**Decision required:** Which rule should govern, or what condition separates them?
```

Do not silently choose an interpretation or edit dependent instructions before
the user resolves a material contradiction.

## Flag for deletion or review

Flag, but never automatically remove, a rule that is generic without a
repository-specific consequence, vague without an action or evidence owner,
obvious without retrieval value, default behavior without a deliberate override,
or stale against current evidence. Use this ledger:

| Instruction | Classification | Removal case | Retention case | Recommendation | User decision |
| ----------- | -------------- | ------------ | -------------- | -------------- | ------------- |

Explicit controls for secrets, approvals, releases, deletion, source of truth,
CI, recovery, and security are presumptively valuable. A global control may be
reinforced locally only when the local task makes the control salient; otherwise
replace repetition with a pointer or remove it after approval.

## Review root density and writing quality

Treat more than 60 root lines as a signal to inspect, never a pass/fail limit.
For every retained inclusion above that signal, record the repository-wide task
trigger, source owner, retrieval value, and why a nested file, documentation,
skill, schema, script, CI, or runtime control is not the safer location.

Check that operational instructions name an actor, modality, action, condition,
and evidence. Flag slogans such as “write clean code”, “follow best practices”,
or “run the usual checks” unless repository evidence makes them actionable. Do
not treat shorter prose as proven better.

## Verify linked guidance

Verify each local Markdown target resolves and each stable heading anchor exists.
Treat linked documents as navigation, not automatically loaded instructions.
For any document required by a task, check that it identifies its scope,
authority, prerequisites, commands, and limitations or recovery boundary. Mark
external links as verified, unavailable, or unverified; a rendered link is not
current technical evidence.
