---
name: prompt-architect
description:
  Use when the user asks to write, improve, audit, or structure a prompt for
  agentic, coding, research, or other multi-step work. Do not invoke for
  ordinary task execution or copyediting that is not prompt design.
---

# Prompt Architect

Produce the smallest prompt that gives its intended executor a concrete goal,
relevant context, authority, output, and way to know it succeeded. Do not add a
framework merely because the task is complex.

1. Determine whether the user wants a new prompt, a revision, or an audit only.
   Preserve the requested language and any explicit constraints. If the user
   wants the underlying work performed rather than a prompt, do that work under
   the applicable instructions instead of substituting a prompt.
2. Identify the executor, available inputs and tools, output, success criteria,
   and any material missing choice. Ask only when that choice would change the
   target, authority, correctness, or safety; otherwise state a reasonable
   assumption and continue.
3. For a simple request, draft directly. For tool-using or long-running work,
   use [agentic contracts](references/agentic-contracts.md). For external,
   destructive, credential, production, legal, medical, or financial effects,
   use [authority and sources](references/authority-and-sources.md). For a
   reusable or production prompt, use [evaluation](references/evaluation.md).
4. Verify any changing model, API, CLI, capability, or product claim against
   current primary documentation before recommending it. Distinguish a verified
   fact from an inference. Do not invent tools or permissions.
5. Deliver the prompt in a copy-ready block. Outside it, note only material
   assumptions, unresolved choices, and (for an audit) the consequential
   changes. Do not force fixed headings, scores, model settings, or long
   checklists into every prompt.

Audit the result against the user's intent: no unsupported capability, hidden
scope expansion, redundant instruction, contradictory authority, untestable
success criterion, or unnecessary approval pause. If a material gap remains, ask
about it rather than labeling an incomplete prompt ready.
