import childProcess from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const require = createRequire(import.meta.url);
const typecheck = require("../scripts/typecheck.cjs") as {
  main(): void;
  resolveRootFromArgs(args: string[], defaultRoot: string): string;
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

  it("preserves native typecheck success and failure as process exit codes", () => {
    const missingRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), "codex-typecheck-missing-"),
    );
    fixtures.push(missingRoot);
    const repositoryRoot = path.resolve(import.meta.dirname, "..");
    const success = childProcess.spawnSync(
      process.execPath,
      ["scripts/typecheck.cjs", "--root", repositoryRoot],
      { cwd: repositoryRoot, encoding: "utf8" },
    );
    const failure = childProcess.spawnSync(
      process.execPath,
      ["scripts/typecheck.cjs", "--root", missingRoot],
      { cwd: repositoryRoot, encoding: "utf8" },
    );

    expect(success.status).toBe(0);
    expect(failure.status).toBe(1);
    expect(failure.stderr).not.toBe("");
  });

  it("parses explicit typecheck roots without accepting ambiguous arguments", () => {
    const root = path.resolve(import.meta.dirname, "..");

    expect(typecheck.resolveRootFromArgs([], root)).toBe(root);
    expect(typecheck.resolveRootFromArgs(["--root", root], "unused")).toBe(
      root,
    );
    expect(() =>
      typecheck.resolveRootFromArgs(["--root", "--invalid"], root),
    ).toThrow("usage: --root <repository-root>");
    expect(() =>
      typecheck.resolveRootFromArgs(["--invalid", root], root),
    ).toThrow("usage: --root <repository-root>");
  });
});
