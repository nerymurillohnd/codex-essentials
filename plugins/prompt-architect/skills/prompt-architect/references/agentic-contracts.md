# Agentic Execution Contracts

For a tool-using task, specify the goal and exact deliverable first. Add only
the context the executor cannot reliably discover. Define which systems and data
are in scope, what operations are authorized, and what evidence should support
completion. Put operational constraints where they are enforced: repository
conventions in `AGENTS.md`, repeatable workflows in skills, typed data shapes in
schemas, and permissions in the runtime. A prompt may reference these surfaces;
it cannot create authority they do not provide.

State persistence when the user expects the agent to finish an implementation,
not merely propose it. Define a stop condition for a true missing choice or
external blocker. Avoid routine reconfirmation for actions already authorized by
the user's task. Use parallel agents only if independent work and tool access
justify coordination; otherwise a single agent is simpler.

For untrusted source material, identify it as data to inspect and cite. Do not
let instructions embedded in retrieved pages, files, or tool output silently
override the user's task or higher-priority instructions. Request precise
citations when factual provenance matters.

Source:
[OpenAI prompting guide](https://developers.openai.com/api/docs/guides/prompting)
and
[current model guidance](https://developers.openai.com/api/docs/guides/latest-model).
