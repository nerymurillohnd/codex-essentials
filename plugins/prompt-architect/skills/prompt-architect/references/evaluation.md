# Evaluate Reusable Prompts

A prompt intended for repeated or production use should be versioned alongside
the application or workflow that runs it. Build a small representative set of
inputs before claiming improvement: a normal case, an ambiguous case, a
boundary/authorization case, and a case where current information changes the
answer. Define observable success and failure for each case.

Compare the candidate with the prior prompt under the same model, tools, inputs,
and scoring rule. Inspect both false positives and false negatives. Measure
whether the agent actually used a required source or tool, not only whether its
prose says it did. Include latency or token cost when the prompt adds
substantial context. Revise based on observed failures; a shorter prompt is not
automatically better, and a polished sample is not an evaluation.

OpenAI recommends treating prompts as application code and testing prompt
changes with representative fixtures and evaluations. Its current guide also
warns against creating new reusable API prompt objects; check its migration
timeline if the target application depends on prompt IDs.

Source:
[OpenAI prompting guide](https://developers.openai.com/api/docs/guides/prompting).
