import {
  mkdtempSync,
  mkdirSync,
  realpathSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import { afterEach, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { resolveContainedPath } = require("../scripts/path-utils.cjs") as {
  resolveContainedPath(root: string, relativePath: string): string;
};
const temporaryRoots: string[] = [];

function createRoot() {
  const root = mkdtempSync(join(tmpdir(), "codex-essentials-path-utils-"));
  temporaryRoots.push(root);
  return root;
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    require("node:fs").rmSync(root, { force: true, recursive: true });
  }
});

describe("contained path resolution", () => {
  it("resolves existing and future paths inside a real root", () => {
    const root = createRoot();
    mkdirSync(join(root, "nested"));
    writeFileSync(join(root, "nested", "file.txt"), "content\n");

    expect(resolveContainedPath(root, "nested/file.txt")).toBe(
      join(realpathSync(root), "nested", "file.txt"),
    );
    expect(resolveContainedPath(root, "nested/future.txt")).toBe(
      join(realpathSync(root), "nested", "future.txt"),
    );
  });

  it("rejects traversal and symlink escapes", () => {
    const root = createRoot();
    mkdirSync(join(root, "nested"));
    symlinkSync(tmpdir(), join(root, "nested", "external"));
    symlinkSync(join(root, "missing-target"), join(root, "nested", "broken"));
    symlinkSync("loop", join(root, "nested", "loop"));

    expect(() => resolveContainedPath(root, "../outside")).toThrow(
      "must remain inside repository root",
    );
    expect(() =>
      resolveContainedPath(root, "nested/external/file.txt"),
    ).toThrow("must remain inside repository root");
    expect(() => resolveContainedPath(root, "nested/broken/file.txt")).toThrow(
      "contains an unresolved symbolic link",
    );
    expect(() => resolveContainedPath(root, "nested/loop/file.txt")).toThrow();
  });
});
