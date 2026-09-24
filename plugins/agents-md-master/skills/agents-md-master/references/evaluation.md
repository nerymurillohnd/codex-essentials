# Evaluation

Use this reference when comparing an instruction proposal against a baseline or
when the user asks whether an `AGENTS.md` change improves behavior.

## Method

Compare baseline and candidate under the same conditions:

- repository revision and working tree;
- target task prompt;
- current working directory and effective instruction chain;
- model or host when known;
- available tools and permissions;
- external services and credentials, if any;
- grading rubric and acceptance criteria.

Record exact command output, file diffs, artifacts, or reviewer findings that
support each score. Do not estimate token, time, cost, or invocation data unless
the host exposes it.

## Rubric

Use a 0-3 score for each applicable criterion:

- source accuracy;
- scope and placement;
- command and validation correctness;
- actionability;
- approval and external-state boundaries;
- policy versus enforcement routing;
- contradiction handling;
- duplication and intentional reinforcement handling;
- progressive disclosure and context economy;
- recovery and maintenance path.

Score 0 means absent, false, unsafe, or unverifiable. Score 1 means partial or
vague. Score 2 means correct with bounded gaps. Score 3 means current,
scope-correct, actionable, and evidenced.

The candidate fails regardless of score if it invents commands, hides a material
contradiction, claims unsupported Codex behavior, treats prose as enforcement,
weakens a required control, exposes secrets, or claims a successful outcome
without evidence.

## Scenarios

Use scenarios that match the requested risk. Useful fixtures include:

- new small repository with no instruction file;
- monorepo with package-specific commands;
- bloated root file with conditional details;
- contradictory root and nested instructions;
- stale tooling claim;
- prose-enforced security boundary;
- repeated incident with root-cause evidence;
- nearby non-AGENTS Markdown edit that should not trigger this skill.

Report what the observed comparison supports and what remains untested. A
candidate can improve one scenario and regress another.
