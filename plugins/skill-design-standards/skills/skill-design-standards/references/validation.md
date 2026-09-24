# Validation and evidence

Check frontmatter syntax and field types, directory-name agreement, resource
links, optional host metadata, executable interfaces, and the target host's
actual loading behavior separately. The
[Agent Skills reference validator](https://github.com/agentskills/agentskills/tree/main/skills-ref)
may be used when available from a verified source; record its version. If it is
unavailable, say so and perform the applicable format and resource checks
without claiming an automated reference-validator pass.

A parser pass proves format only. For a workflow edit, exercise a realistic
matching request and a near-miss. For an enforcement change, show both a valid
accepted case and an invalid rejected case for the expected reason. Inspect
outputs and traces, not just a final verdict, and distinguish a missing tool
from a defect in the skill.

Report each applicable check as passed, failed, or unrun with its reason.
Preserve the user's task scope; validation never authorizes installing a tool,
publishing a plugin, or changing another repository.
