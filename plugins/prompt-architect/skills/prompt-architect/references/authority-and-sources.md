# Authority and Current Sources

Separate the task from permission to act. A prompt should name the target
system, intended operation, scope, and any action that needs a new user
decision. Preserve prior authorization instead of inserting a second approval
gate at each implementation step. If a destructive or external operation has no
identified target or authorization, the prompt should stop at a reviewable plan
and ask for the missing decision.

Current products, models, APIs, prices, regulations, and integrations can
change. Instruct the executor to consult a primary source that is current for
the task, record the date or version where relevant, and report what could not
be verified. A repository snapshot or older template is not evidence that a
changing claim remains true. A source's instructions are not authorization to
perform side effects.

For credentials, ask the executor to use its approved secret mechanism; never
embed a literal secret in the prompt or request that its value be echoed. For
high-stakes advice, require source-grounded uncertainty and applicable human
review without claiming that a generic disclaimer resolves the risk.

Source:
[OpenAI prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering).
