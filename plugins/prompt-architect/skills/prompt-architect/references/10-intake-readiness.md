# Intake and Authoring Readiness

## Goal

Close only material gaps. Do not turn prompt authoring into a questionnaire.

## Readiness gates

A final prompt may be delivered only when these material dimensions are sufficiently resolved:

### Specification

- Objective: what outcome must exist?
- Target: what system, file, repository, audience, document, or decision is affected?
- Executor: what model, agent, product surface, tool, or human will execute it?
- Scope: what is in and out?
- Authority: what may happen without another approval?
- Prohibitions: what must not happen?
- Inputs: what sources/materials are authoritative?
- Output: what exact artifact/state/report is required?
- Verification: how will success be proven?
- Stop conditions: when must execution halt before completion?

### Architecture

- Task/domain classified.
- Risk level classified.
- Density level selected.
- Parallelism level evaluated.
- Applicable domain references loaded.

### Freshness

When volatile capabilities matter:

- current capability claims verified;
- current model/tool guidance verified;
- negative capability claims verified with extra care;
- stale local guidance overridden and flagged.

## Clarification policy

Ask only when the missing answer materially changes architecture, authority, risk, output, or correctness.

- Ask at most 3 questions at a time.
- Prefer targeted questions with concrete alternatives.
- State what is already safely inferred.
- Low-risk: infer reasonable defaults and disclose them.
- High-risk: do not infer unclear target, authority, destructive permissions, or completion criteria.

## Readiness result

- **Ready**: no material unresolved gate.
- **Needs Clarification**: one or more critical gates cannot be safely inferred.

A numeric “95% confidence” may be used descriptively, but these observable gates control readiness.
