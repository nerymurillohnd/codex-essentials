import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const hookPath = path.join(repositoryRoot, ".husky", "pre-commit");
const executableBits = 0o111;
const expectedHookLines = ["#!/usr/bin/env sh", "npx --no-install lint-staged"];

describe("Husky pre-commit hook", () => {
  it("uses a direct lint-staged invocation without the legacy Husky shim", () => {
    const hook = fs.readFileSync(hookPath, "utf8");
    const mode = fs.statSync(hookPath).mode;

    expect((mode & executableBits) > 0).toBe(true);
    expect(hook.trim().split(/\r?\n/u)).toEqual(expectedHookLines);
    expect(hook).toContain("npx --no-install lint-staged");
    expect(hook).not.toContain("_/husky.sh");
    expect(hook).not.toContain("HUSKY_SKIP_HOOKS");
    expect(hook).not.toContain("npm install");
    expect(hook).not.toContain("npx lint-staged");
  });
});
