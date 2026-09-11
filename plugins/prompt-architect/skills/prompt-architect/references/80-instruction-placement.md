# Instruction Placement

A Prompt Architect must decide not only _what_ to specify, but _where_ enforcement belongs.

Use the narrowest reliable layer:

| Layer                     | Best for                                                        |
| ------------------------- | --------------------------------------------------------------- |
| Prompt text               | task-specific intent, context, outcomes, behavioral constraints |
| Skill                     | reusable workflow and judgment rules                            |
| Reference                 | heavy domain procedure, canon, examples                         |
| Structured output/schema  | machine-readable response shape                                 |
| Tool/API schema           | tool parameters and contracts                                   |
| Application configuration | model, reasoning, verbosity, limits, caching, runtime settings  |
| Project instruction file  | repository/project-wide durable constraints                     |
| Runtime permissions       | actual authorization/security boundary                          |

Do not solve every requirement by adding prose to the prompt.

If a requirement can be enforced more reliably by schema, configuration, permissions, or code, recommend that layer and keep the prompt focused on what the model must reason about.
