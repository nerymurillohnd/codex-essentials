# Example — Vague Intent to Ready Prompt

**User:** “Write me a prompt to clean up my repo.”

## Correct architect behavior

Do not immediately emit a 200-line Git prompt.

Infer safely:

- domain = Git/repository;
- mutation may be possible;
- unrelated work must be preserved;
- current repository state must be inspected first.

Ask only material unknowns, for example:

1. Should the executor only audit/propose, or may it modify files and Git state?
2. Are commit/push authorized, or should it stop after local verification?
3. What final state do you want: clean working tree, dependency cleanup, branch cleanup, or all of these?

After answers, select R/D/P levels and generate the smallest sufficient prompt.
