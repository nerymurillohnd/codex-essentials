# Audit and Proposal Report

Use this structure for a read-only audit or proposal. Do not force it onto a
direct implementation request, where the user expects changed files and
verification results.

## Scope

State the target repository or workspace, included packages, excluded locations,
and any user-level or sibling locations explicitly included.

## Inventory

List Prettier location and version, effective configuration, plugins, package
manager, lockfile, scripts, CLI/editor paths, ignore behavior, hooks, CI, other
formatters, and relevant file types.

## Formatting Contract

List each convention with evidence. Label it as explicit configuration, shared
config, automation, `.editorconfig`, inferred source pattern, documented
default, or unresolved.

## Conflicts And Risks

For each issue, state severity, evidence, impact, and the smallest realistic
options.

## Recommendations

Order items as required, recommended, optional, and not recommended now. Each
item must name affected files, exact change, local evidence, official evidence,
side effects, validation command, and whether it can be approved independently.

## Proposed Changes

Provide a complete unified diff or full replacement file for every proposed
file. State explicitly when no file change is needed. Separate dependency,
configuration, source-formatting, editor, hook, and CI changes.

## Missing Decision

If the user requested only a plan, or a material choice remains unresolved,
close with the exact decision needed. For example:

```text
No changes have been made.
Choose whether the requested setup should also format existing source files.
That would change N files beyond configuration and CI.
```

Do not ask the user to approve the same scoped implementation twice.
