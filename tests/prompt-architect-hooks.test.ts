import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const repositoryRoot = resolve(import.meta.dirname, "..");
const pluginRoot = resolve(repositoryRoot, "plugins", "prompt-architect");
const validatorPath = resolve(
  pluginRoot,
  "skills",
  "prompt-architect",
  "scripts",
  "validate-final-output.py",
);

function runValidator(payload: unknown) {
  return spawnSync("python3", [validatorPath], {
    cwd: repositoryRoot,
    encoding: "utf8",
    input: JSON.stringify(payload),
  });
}

describe("prompt-architect final-output hook", () => {
  it("accepts a Ready output with compact gate evidence", () => {
    const result = runValidator({
      response: `
**Result** - Ready
**Assumptions** - None.
**Final Prompt** - Do the work.
**Execution Recommendation** - model: gpt-5.5; reasoning: medium; P-level: P1; D-level: D3; R-level: R2.
Gate Evidence: intake=pass; classification=R2/D3/P1; references=pass; placement=pass; template=pass; output=pass; self-audit=pass.
`,
    });

    expect(result.status, result.stdout + result.stderr).toBe(0);
    expect(result.stdout).toBe("");
  });

  it("blocks a Ready output that skipped the gate evidence", () => {
    const result = runValidator({
      response: `
**Result** - Ready
**Assumptions** - None.
**Final Prompt** - Do the work.
**Execution Recommendation** - model: gpt-5.5; reasoning: medium; P-level: P1; D-level: D3; R-level: R2.
`,
    });

    expect(result.status).toBe(2);
    expect(result.stdout).toContain("prompt-architect-final-check: blocked");
    expect(result.stdout).toContain("missing compact Gate Evidence pass line");
  });

  it("accepts Needs Clarification only when no final prompt is included", () => {
    const result = runValidator({
      response: `
**Result** - Needs Clarification
**Assumptions** - None.
**Clarification Questions** - What target repository should the prompt govern?
`,
    });

    expect(result.status, result.stdout + result.stderr).toBe(0);
  });

  it("skips unrelated Stop payloads", () => {
    const hooksConfig = JSON.parse(
      readFileSync(resolve(pluginRoot, "hooks", "hooks.json"), "utf8"),
    ) as {
      hooks: { Stop: Array<{ hooks: Array<{ command: string }> }> };
    };

    const result = runValidator({ response: "ordinary assistant response" });

    expect(hooksConfig.hooks.Stop[0]?.hooks[0]?.command).toContain(
      "validate-final-output.py",
    );
    expect(result.status, result.stdout + result.stderr).toBe(0);
    expect(result.stdout).toBe("");
  });
});
