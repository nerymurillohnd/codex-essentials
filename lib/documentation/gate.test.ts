import { createRequire } from "node:module";
import childProcess from "node:child_process";
import { describe, expect, it, vi } from "vitest";

const require = createRequire(import.meta.url);
const gate = require("./gate.cjs") as {
  containsUnmaskedCredential(text: string): boolean;
  errorMessage(error: unknown): string;
  evaluateChanges(
    paths: readonly string[],
    diff?: string,
  ): { errors: string[]; plugins: string[] };
  parseArgs(argv: string[]): { base: string; head: string };
  resolveBase(base: string, runner?: (args: string[]) => string): string;
};

describe("documentation gate", () => {
  it("distinguishes documentation-only and product changes", () => {
    expect(gate.evaluateChanges(["plugins/example/README.md"])).toEqual({
      errors: [],
      plugins: ["example"],
    });
    expect(
      gate
        .evaluateChanges([
          "plugins/example/.codex-plugin/plugin.json",
          "plugins/example/skills/task/SKILL.md",
        ])
        .errors.join("\n"),
    ).toContain("README.md");
    expect(
      gate.evaluateChanges([
        "plugins/example/.codex-plugin/plugin.json",
        "plugins/example/README.md",
        "plugins/example/CHANGELOG.md",
      ]),
    ).toEqual({ errors: [], plugins: ["example"] });
  });

  it("blocks unmasked credentials and parses revision options", () => {
    expect(gate.containsUnmaskedCredential("api_key: abc123")).toBe(true);
    expect(gate.containsUnmaskedCredential("token=${TOKEN}")).toBe(false);
    expect(gate.evaluateChanges([], "secret = abc").errors).toContain(
      "diff contains an unmasked credential; use ${VAR}",
    );
    expect(gate.parseArgs([])).toEqual({ base: "HEAD~1", head: "HEAD" });
    expect(gate.parseArgs(["--base", "main", "--head", "feature"])).toEqual({
      base: "main",
      head: "feature",
    });
    expect(() => gate.parseArgs(["--base"])).toThrow("requires a revision");
    expect(() => gate.parseArgs(["--unknown"])).toThrow("unknown argument");
  });

  it("uses the empty tree only for a first-commit default base", () => {
    expect(
      gate.resolveBase("HEAD~1", () => {
        throw new Error("missing");
      }),
    ).toBe("4b825dc642cb6eb9a060e54bf8d69288fbee4904");
    expect(gate.resolveBase("HEAD~1", () => "ok")).toBe("HEAD~1");
    expect(() =>
      gate.resolveBase("missing", () => {
        throw new Error("missing");
      }),
    ).toThrow("missing");
    expect(gate.errorMessage("failure")).toBe("failure");
    expect(gate.errorMessage(new Error("failure"))).toBe("failure");
    expect(gate.containsUnmaskedCredential("token='quoted'")).toBe(false);
    expect(gate.evaluateChanges(["README.md"]).plugins).toEqual([]);
    vi.spyOn(childProcess, "execFileSync").mockReturnValue("ok" as never);
    expect(gate.resolveBase("main")).toBe("main");
  });
});
