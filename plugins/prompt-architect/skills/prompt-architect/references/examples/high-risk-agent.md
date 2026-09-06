# Example — High-Risk Agent Prompt

**Task:** Recover and then delete a specific Git stash after preserving useful material.

Expected classification:

- Risk: R3
- Density: D4
- Parallelism: P1/P2 depending on independent inspection streams

Prompt should include exact stash identification, backup/recovery gate, unrelated-work preservation, no full stash apply onto main, validation, conditional deletion, final Git state, and explicit completion conditions.

An independent reviewer may inspect whether deletion prerequisites were actually satisfied before the primary agent deletes or reports completion, if the execution surface safely supports that separation.
