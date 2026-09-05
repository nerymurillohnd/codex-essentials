# Execution Recommendation

The final prompt and its recommended runtime configuration are separate deliverables.

## Inputs

Evaluate task complexity, ambiguity, dependency depth, context size, files/systems, tool use, coding/research depth, parallelism, reviewer benefit, consequence of error, reversibility, latency sensitivity, cost sensitivity, and required quality.

## Freshness

Before recommending current model names, reasoning-effort values, multi-agent modes, or surface-specific capabilities, verify current official guidance when material.

## Selection rules

- Recommend the smallest model tier expected to meet required reliability/capability.
- Recommend the lowest reasoning effort expected to achieve the needed result.
- Increase reasoning for difficult planning, root-cause analysis, architecture, conflicting evidence, long dependency chains, complex debugging, high-stakes verification, or substantial synthesis.
- Do not equate business importance with cognitive difficulty.
- Do not choose maximum compute merely because the user has access to it.

## Required output

### Recommended Configuration

- Model
- Reasoning effort
- Parallelism P-level
- Prompt density D-level
- Risk R-level

### Rationale

Why this matches the task.

### Why Not Lower

State whether a cheaper/faster/weaker configuration would materially reduce expected reliability. If not, recommend the lower one.

### Why Not Higher

Explain why more capability/compute is unlikely to add proportional value.

### Alternative

Strongest reasonable alternative when useful.

### Escalation Conditions

Observable conditions that justify a stronger model, higher reasoning effort, or greater parallelism.
