import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const policy = require("./direct-push-policy.cjs") as {
  classifyDirectPushPaths(paths: string[]): {
    allowed: boolean;
    disallowedPaths: string[];
  };
};

describe("direct push policy", () => {
  it("allows documentation and agent guidance paths", () => {
    expect(
      policy.classifyDirectPushPaths([
        "AGENTS.md",
        "docs/AGENTS.md",
        "docs/audits/2026-08-30-repository-state-review.md",
      ]),
    ).toEqual({ allowed: true, disallowedPaths: [] });
  });

  it("rejects plugin and repository behavior changes", () => {
    expect(
      policy.classifyDirectPushPaths([
        "docs/maintenance/pending-debt.md",
        "plugins/doc-keeper/.codex-plugin/plugin.json",
        ".github/workflows/quality.yml",
      ]),
    ).toEqual({
      allowed: false,
      disallowedPaths: [
        "plugins/doc-keeper/.codex-plugin/plugin.json",
        ".github/workflows/quality.yml",
      ],
    });
  });

  it("fails closed for unknown paths", () => {
    expect(policy.classifyDirectPushPaths(["scripts/new-check.cjs"])).toEqual({
      allowed: false,
      disallowedPaths: ["scripts/new-check.cjs"],
    });
  });
});
