import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);

interface DocumentationGateModule {
  evaluateChanges(
    changedPaths: readonly string[],
    diffText?: string,
  ): { errors: string[]; plugins: string[] };
  containsUnmaskedCredential(text: string): boolean;
  parseArgs(argv: string[]): { base: string; head: string };
  errorMessage(error: unknown): string;
}

const gate =
  require("../scripts/documentation_gate.cjs") as DocumentationGateModule;

describe("documentation gate", () => {
  it("allows documentation-only plugin changes", () => {
    expect(gate.evaluateChanges(["plugins/example/README.md"], "")).toEqual({
      errors: [],
      plugins: ["example"],
    });
    expect(gate.evaluateChanges(["plugins/example/CHANGELOG.md"], "")).toEqual({
      errors: [],
      plugins: ["example"],
    });
  });

  it("requires README and changelog for product changes", () => {
    const result = gate.evaluateChanges([
      "plugins/example/.codex-plugin/plugin.json",
      "plugins/example/skills/task/SKILL.md",
    ]);
    expect(result.plugins).toEqual(["example"]);
    expect(result.errors.join("\n")).toContain("README.md");
    expect(result.errors.join("\n")).toContain("CHANGELOG.md");
  });

  it("passes when product changes include both documents", () => {
    expect(
      gate.evaluateChanges([
        "plugins/example/.codex-plugin/plugin.json",
        "plugins/example/README.md",
        "plugins/example/CHANGELOG.md",
      ]),
    ).toEqual({ errors: [], plugins: ["example"] });
  });

  it("rejects unmasked credentials and accepts variable masks", () => {
    expect(gate.containsUnmaskedCredential("api_key: abc123")).toBe(true);
    expect(gate.containsUnmaskedCredential("token=${TOKEN}")).toBe(false);
    expect(gate.containsUnmaskedCredential("permissions and credentials")).toBe(
      false,
    );
  });

  it("parses revisions and rejects malformed options", () => {
    expect(gate.parseArgs([])).toEqual({ base: "HEAD~1", head: "HEAD" });
    expect(gate.parseArgs(["--base", "origin/main", "--head", "tip"])).toEqual({
      base: "origin/main",
      head: "tip",
    });
    expect(() => gate.parseArgs(["--base"])).toThrow("requires a revision");
    expect(() => gate.parseArgs(["--unknown"])).toThrow("unknown argument");
  });

  it("ignores non-plugin paths and scans the complete diff", () => {
    expect(
      gate.evaluateChanges(["README.md", ".github/workflows/quality.yml"], ""),
    ).toEqual({ errors: [], plugins: [] });
    const result = gate.evaluateChanges([], "secret = abc");
    expect(result.errors).toContain(
      "diff contains an unmasked credential; use ${VAR}",
    );
    expect(gate.errorMessage(new Error("failure"))).toBe("failure");
    expect(gate.errorMessage("failure")).toBe("failure");
  });
});
