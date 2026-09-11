# Current Guidance and Capability Validation

## Trigger

Live validation is mandatory when prompt design or execution advice materially depends on a model, product surface, API, SDK, CLI, tool, feature, permission, limit, parameter, pricing rule, availability, or recommendation that may have changed.

Skip live research when volatile capability facts do not affect the prompt.

## Source hierarchy

Prefer, in order of relevance and specificity:

1. current official product/model documentation;
2. official prompting/model guides;
3. official API/SDK reference;
4. official changelogs and release notes;
5. official Help Center / Academy;
6. official source repositories;
7. runtime/project evidence.

Use secondary sources only when primary sources are insufficient, and label them.

## Protocol

1. Identify every volatile claim that could alter the prompt or recommendation.
2. Search current official sources.
3. Verify publication/update dates and product/model applicability.
4. Cross-check positive and negative capability claims; treat “not supported” claims with extra caution.
5. Resolve conflicts using the more current, specific, authoritative source.
6. Adjust prompt architecture to current reality.
7. If local references conflict, follow current authoritative evidence for this task and flag the local reference as stale.
8. Do not mutate the skill/reference automatically unless the user asked to update it.

## Record only material changes

Use **Current Guidance Notes** only when live evidence changed, constrained, or contradicted the locally expected design.

Do not hard-code volatile model IDs, exact reasoning levels, prices, or product availability into durable prompts unless the task explicitly requires a snapshot.
