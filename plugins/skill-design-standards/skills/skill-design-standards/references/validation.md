# Validation and Evidence

## Structural checks

Run the reference validator when available:

```bash
skills-ref validate /path/to/skill
```

Use the [official skills-ref source](https://github.com/agentskills/agentskills/tree/main/skills-ref)
for installation or isolated execution under the environment's dependency policy.
Record its version or source revision; do not substitute an unverified package.

For Codex authoring, run a host-provided validator if one is available and relevant.
Discover its location and supported arguments in that environment; this plugin does
not require or bundle another skill's validator. If no validator is available,
perform the format and resource checks below and explicitly report automated
validation as unavailable. Do not present manual review as an automated pass.

Validators have different coverage. Inspect the actual implementation when results
conflict. For example, the reference implementation at revision
`69ef37e9424c0a7ea9dd2293b559e43ec8176379`, inspected 2026-09-06, accepts an empty
`compatibility` string despite the specification's stated minimum length. A validator
result never replaces checking all field types and constraints, resource integrity,
or host behavior.

Report a validator/specification mismatch with a minimal example and source evidence.
Do not delete valid metadata or weaken gates simply to obtain a pass. Determine
whether the target host actually rejects the field and report unresolved compatibility.

Also inspect:

- Exact `SKILL.md` casing, non-empty metadata, directory-name agreement, and YAML types.
- Referenced files, script callers, relative paths, and missing or unused resources.
- Existing `agents/openai.yaml` syntax and applicable host or package requirements.
- Formatting and linting applicable to changed files; script tests only when relevant.

## Behavioral checks

For a workflow change, try a realistic matching request and a nearby non-matching
request. Check the output and operations against the user's goal, input constraints,
authorization, and success criteria. Include a relevant missing or invalid input
case when that boundary changed. Validate outcomes rather than exact prose or headings.

When evaluating enforcement, prove both acceptance of a valid input and rejection
of the targeted invalid input for the expected reason. Check that the actual consumer
executes the gate rather than skipping it. A validator success does not establish
tool availability, runtime discovery, or reliable model invocation.

Scale evaluation to impact. Use independent evaluation for complex or risky revisions
when available and authorized, with isolated fixtures and no unnecessary external
effects. Give evaluators realistic requests and raw artifacts without revealing the
intended answer. Inspect their traces or artifacts, not just their verdict.

Record commands, outcomes, skipped checks, and remaining limitations. Stop repeated
testing once relevant evidence is sufficient unless new changes or failures justify it.
