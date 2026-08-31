# Convention resolution

Infer the effective formatting contract in this precedence order:

1. Explicit repository-local Prettier configuration.
2. A shareable Prettier config explicitly referenced by the repository.
3. Applicable root workspace configuration.
4. Formatting scripts, hooks, and CI checks.
5. `.editorconfig` values affecting indentation, line endings, charset, and final newline.
6. Maintained source patterns only when no explicit configuration exists.
7. Demonstrably shared sibling-repository conventions, only for a user-requested cross-project standard.
8. Documented Prettier defaults.

For each proposed option, label its authority: repository configuration, shared config, workspace convention, `.editorconfig`/`.gitattributes`, automation, official Prettier/plugin documentation, package metadata compatibility, inferred source pattern, or documented default.

Do not add non-default style options merely because they are common. When evidence is absent, propose the documented default and identify it as a default—not a house rule. Configuration and automation outweigh isolated source-file patterns.

Repository conventions govern formatting style. They do not prevent the agent from recommending a new linting integration or Prettier plugin when [quality integration](quality-integration.md) establishes a material, compatible benefit. Such a recommendation must be labeled as a new strategic capability, not misrepresented as an existing convention.

Rules for uncertainty:

| Situation                                   | Required behavior                                                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Existing config is present                  | Preserve it unless documented conflict, defect, or approved migration warrants change.                              |
| No config exists                            | Infer only high-confidence conventions; otherwise propose documented defaults and label them.                       |
| Multiple configs conflict                   | Explain resolution/precedence; do not silently consolidate.                                                         |
| Global Prettier exists                      | Treat it as diagnostic context, never repository authority.                                                         |
| Local Prettier is absent                    | Apply the [local dependency decision](../SKILL.md#local-dependency-decision); do not introduce Prettier by default. |
| CI checks Prettier without local dependency | Flag reproducibility risk and propose the smallest local fix.                                                       |
| Hooks or CI are absent                      | Keep them absent unless separately approved.                                                                        |
| Broad churn is likely                       | Split configuration and formatting into separate approval items.                                                    |
| Evidence conflicts or is incomplete         | State the limitation and ask for a decision; do not invent a house style.                                           |
