# Example — When Live Capability Validation Is Required

## No live capability check needed

User: “Write a prompt to improve the structure of this provided proposal.”

The prompt does not materially depend on current model/tool features.

## Live capability check required

User: “Write a prompt for the newest OpenAI coding model that uses subagents, browser tools, and the highest supported reasoning mode.”

Before drafting, verify current official OpenAI sources for:

- current model identity/availability;
- current reasoning modes;
- current subagent/multi-agent behavior;
- tool support on the intended surface.

Do not encode remembered capabilities as fact.
