# Delegation and Multi-Agent Orchestration

## Principle

Use subagents only when parallelism, specialization, independent investigation, or independent verification materially improves speed, coverage, or quality.

## Parallelism levels

- P0 Single agent preferred: small, sequential, unified-context task.
- P1 Optional delegation: specialist/reviewer could help but is not necessary.
- P2 Parallel delegation recommended: 2+ independent workstreams with clear partitioning.
- P3 Multi-agent orchestration strongly recommended: multiple substantial streams, specialization, broad research/multi-file analysis, and meaningful independent review value.

## Gate

Evaluate:

- independent/weakly coupled workstreams;
- specialist benefit;
- reviewer benefit;
- shared mutable state;
- deterministic reconciliation;
- coordination/token overhead;
- current surface/model support.

If capability is surface/model-specific, run current-guidance validation first.

## Delegation contract

Each subtask should define objective, bounded scope, relevant inputs, expected deliverable, prohibited actions, validation, and evidence returned to the primary agent.

The primary agent owns decomposition, non-overlapping assignment, conflict resolution, integration, final validation, and Definition of Done.

Prefer parallel read-only analysis. Serialize writes when ownership cannot be safely partitioned. Never assume subagent completion means parent-task completion.

For medium/high-risk work, consider an independent reviewer when it materially improves defect detection.
