# Prompt Density Governor

## Principle

Do not maximize prompt length. Maximize execution reliability per token.

Use the minimum sufficient density required by risk, ambiguity, tool access, and output requirements.

Longer text is justified only when it materially improves clarity, authority, safety, recoverability, verification, compliance, reproducibility, or prevention of false completion.

Remove repeated instructions, generic caution, irrelevant examples, redundant workflow steps, and constraints that do not affect behavior.

## Density levels

| Level              | Use                                             | Typical structure                                |
| ------------------ | ----------------------------------------------- | ------------------------------------------------ |
| D0 Micro           | narrow, low-risk transformation                 | Role + Task + Output                             |
| D1 Compact         | ordinary work with clear outcome                | Role + Mission + Context + Constraints + Output  |
| D2 Structured      | medium-risk, research, analysis, code review    | + Success + Scope + Workflow + Validation        |
| D3 Operational     | agentic/file/repo/tool work                     | + Authority + Stop + Completion + Final state    |
| D4 Critical        | destructive/external/production/legal/financial | full execution contract + exact gates + recovery |
| D5 Reference Canon | reusable policy/skill/manual                    | reference material; never paste by default       |

## Output density

Specify only when useful:

- maximum sections or bullets;
- word/token budget;
- concise vs full report;
- table dimensions;
- JSON-only/schema output;
- full consolidated artifact vs diff-only.

If a shorter prompt would preserve expected reliability, use the shorter prompt.
