# Description Design and Trigger Evaluation

Source: [Optimizing skill descriptions](https://agentskills.io/skill-creation/optimizing-descriptions),
checked 2026-09-06. Start further source discovery from the
[documentation index](https://agentskills.io/llms.txt).

## Write for selection

Describe the user's intended outcome and when to use the skill, using direct language
such as “Use when…”. Include indirect but relevant requests when the capability adds
value. Make applicability explicit without catchall claims or expanding the actual
workflow to win more triggers. Keep the description within 1024 characters and short
enough for discovery among many skills.

The description is a selection signal, not a guarantee. Host registration, policy,
competing skills, and whether a task needs specialized guidance also affect selection.
Instructions buried in the body cannot help a host decide to load that body initially.

## Build realistic labeled cases

Use user-like prompts with paths, concrete details, varied phrasing, terse and long
requests, and explicit and implicit domain references. Include relevant work embedded
inside larger tasks. Label each query before testing:

```json
[
  {
    "query": "Review ~/skills/invoice-check/SKILL.md for missing input handling",
    "should_trigger": true
  },
  {
    "query": "Summarize the totals in ~/Downloads/invoice-check.csv",
    "should_trigger": false
  }
]
```

Prioritize negative cases that share vocabulary but require a different capability.
For a dedicated optimization effort, roughly 20 balanced cases is a useful starting
point, not a required minimum for every edit. Clarify uncertain labels before tuning.

Split cases into fixed, stratified training and validation sets; approximately 60/40
is a starting choice. Preserve both positive and negative cases in each. Keep validation
prompts and per-case failures out of description revision inputs. Reserve additional
fresh cases if repeated candidate selection could overfit the validation set.

## Observe actual activation

Verify registration and invocation policy in the target host before measuring. Use
fresh, comparable sessions with the same model, settings, available skills, and tools.
Do not explicitly invoke the target or preload its body in implicit-trigger tests.

Detect an actual load of the target `SKILL.md` from supported host traces or tool
history. Check the observed event schema before implementing a detector; another
client's `Skill` tool-call example is not a portable Codex detection method.

Record each run as triggered, not triggered, or invalid/unobservable. Execution
failure, missing logs, timeouts, and truncated traces must not silently become
negative observations. Stop early only when the host trace establishes the outcome;
starting work alone may not exclude later activation in a multi-step request.

For stochastic behavior, repeat queries; three runs is a useful initial budget.
Compute trigger rate from observable runs and report failures separately. Predeclare
classification rules, such as positive rate greater than 0.5 and negative rate less
than 0.5; treat equality as inconclusive. These are tunable defaults, not quality guarantees.
Report false positives and false negatives separately, alongside overall pass rate.

## Improve and select

Evaluate the baseline before editing. Use training failures to identify conceptual
gaps or overly broad boundaries, then revise the description without accumulating
query-specific keywords. Compare candidates using the fixed validation set and keep
the best generalizing candidate, which may be an earlier version.

Set a run or cost budget and a stopping condition in advance. Roughly five iterations
is an example budget; stop earlier when gains plateau or inspect labeling and host
conditions if results remain poor. Use five to ten fresh mixed cases as an optional
final generalization check for a substantial optimization effort.

Validate frontmatter after applying the selected description. Report before/after
wording, test settings, observed rates, failures, and limitations. A manual boundary
review or an explicitly instructed subagent exercise is not an implicit-trigger
benchmark. Evaluate output quality separately: activation alone does not prove a
skill completes the user's task correctly.
