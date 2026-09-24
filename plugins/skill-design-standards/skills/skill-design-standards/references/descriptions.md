# Description and activation evaluation

Source:
[Optimizing skill descriptions](https://agentskills.io/skill-creation/optimizing-descriptions),
consulted 2026-09-24.

Write the frontmatter description for selection: the user outcome, relevant
request terms, and when the skill applies. Include a nearby exclusion only when
it prevents plausible misrouting. A broad catchall can increase false positives
without improving the skill's actual work.

Build realistic labeled prompts before editing: clear matches, indirect matches
inside larger tasks, and near-misses that share vocabulary. Keep a fixed
validation set separate from the prompts used to revise the description. Check
registration and invocation policy in the actual host. For implicit-trigger
tests, do not explicitly invoke or preload the skill; observe a real skill-load
event in a supported trace. Missing traces and execution errors are
unobservable, not negative observations.

Report false positives and false negatives separately. Repeated runs help when
activation is stochastic; a handful of cases is useful for diagnosis but not a
universal reliability estimate. Output quality needs a separate evaluation after
the skill loads.
