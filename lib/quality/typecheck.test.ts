import childProcess from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { afterEach, describe, expect, it, vi } from "vitest";

const require = createRequire(import.meta.url);
const typecheck = require("./typecheck.cjs") as {
  main(): void;
  runTypecheck(root?: string, io?: { stdio?: "ignore" | "inherit" }): number;
};
const fixtures: string[] = [];

afterEach(() => {
  vi.restoreAllMocks();
  for (const fixture of fixtures.splice(0)) {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});

describe("native typecheck wrapper", () => {
  it("invokes the local native compiler and preserves its exit status", () => {
    const root = fs.mkdtempSync(
      path.join(os.tmpdir(), "codex-typecheck-test-"),
    );
    fixtures.push(root);
    const spawn = vi
      .spyOn(childProcess, "spawnSync")
      .mockReturnValueOnce({ status: 7 } as never)
      .mockReturnValueOnce({ status: null } as never)
      .mockReturnValueOnce({ status: 0 } as never);

    expect(typecheck.runTypecheck(root, { stdio: "ignore" })).toBe(7);
    expect(typecheck.runTypecheck(root, { stdio: "ignore" })).toBe(1);
    expect(typecheck.runTypecheck(root)).toBe(0);
    expect(spawn).toHaveBeenLastCalledWith(
      process.execPath,
      [path.join(root, "node_modules/@typescript/native/bin/tsc"), "--noEmit"],
      { cwd: root, stdio: "inherit" },
    );
  });

  it("sets the process exit code from the native compiler result", () => {
    vi.spyOn(childProcess, "spawnSync").mockReturnValue({ status: 3 } as never);
    typecheck.main();
    expect(process.exitCode).toBe(3);
  });
});
