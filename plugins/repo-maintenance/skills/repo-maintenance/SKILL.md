---
name: repo-maintenance
description:
  Use when auditing, creating, or updating repository READMEs, changelogs, ADRs,
  maintenance debt records, licenses, or Codex skill metadata. Ground changes in
  the target repository's actual conventions and evidence.
---

# Repository Maintenance

Maintain repository documentation from the target project's current evidence.
This skill does not implement source-code features, publish releases, mutate
remote Git state, or choose a legal license for the user.

## Inspect and route

Read applicable `AGENTS.md`, Git status, repository layout, existing records,
links, release model, and local format/check commands. Distinguish an audit from
a request to create or update a named document. Audits are read-only; a direct
instruction to edit a document authorizes that scoped local edit. Ask for a
structure choice only when multiple materially different document sets remain
possible after inspection. Do not add a routine approval checkpoint when the
user has already selected the target and scope.

Select only the relevant package-local asset:

| Target                                     | Asset to read                          |
| ------------------------------------------ | -------------------------------------- |
| Repository root README                     | `assets/repository-readme-template.md` |
| Distributable plugin/package README        | `assets/plugin-readme-template.md`     |
| Changelog                                  | `assets/changelog-template.md`         |
| Architecture decision                      | `assets/adr-template.md`               |
| Unresolved maintenance debt                | `assets/pending-debt-template.md`      |
| Verified debt resolution                   | `assets/resolved-debt-template.md`     |
| MIT license selected by the user           | `assets/mit-license-template.txt`      |
| Existing or requested Codex skill metadata | `assets/agents-openai-template.yaml`   |

The assets are coverage maps. Retain only sections supported by evidence and
useful to the audience. Replace every placeholder in a finished document and
remove unused examples or headings. Preserve the target repository's naming,
status vocabulary, locations, and links unless the user requested a change. Do
not create every document type simply because an asset exists.

## Record the right facts

- A README should match real installation, commands, permissions, side effects,
  and recovery behavior. A plugin README must distinguish package installation
  from actions the skill may later perform.
- A changelog entry describes an actual product change and release model. Do not
  invent versions, dates, tags, or published releases.
- An ADR records the decision, considered options, consequences, and
  confirmation. Supersede an accepted decision rather than rewriting its
  historical rationale.
- Pending debt needs observed evidence, impact, responsible area, a next action,
  and a review condition. Resolved debt needs proof that the original defect or
  risk was actually closed.
- MIT license text is used only after the license, holder, and year are
  established. `agents/openai.yaml` metadata must describe its actual skill; do
  not invent required MCP connections or invocation restrictions.

## Verify and deliver

Run the target repository's applicable formatter, link/documentation checks, and
broader required gate. Inspect the final document and diff for unsupported
claims, broken links, leftover placeholders, copied examples, and unrelated
changes. Report exact files, commands and outcomes, source limits, and remaining
decisions. A failed gate or missing source remains visible; do not claim a
release or a resolution from a draft record.

Do not write Codex memory as a side effect. A memory update requires the user's
direct request and the host-supported mechanism. Commits, pushes, PRs,
publication, deployment, and credential changes require their own task scope.
