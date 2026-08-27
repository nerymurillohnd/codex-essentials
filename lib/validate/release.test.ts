import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { afterEach, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const release = require("./release.cjs") as {
  isDirectory(target: string): boolean;
  relative(root: string, target: string): string;
  resolvesInside(root: string, target: string): boolean;
  validateReleaseTree(root: string, pluginName: string): string[];
};
const fixtures: string[] = [];

afterEach(() => {
  for (const fixture of fixtures.splice(0)) {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});

function createFixture(): { root: string; pluginRoot: string } {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), "codex-release-tree-test-"),
  );
  fixtures.push(root);
  const pluginRoot = path.join(root, "plugins", "released");
  fs.mkdirSync(path.join(pluginRoot, "assets"), { recursive: true });
  fs.writeFileSync(path.join(pluginRoot, "README.md"), "# Released\n", "utf8");
  fs.writeFileSync(path.join(pluginRoot, "assets", "icon.png"), "png", "utf8");
  return { root, pluginRoot };
}

describe("release tree validation", () => {
  it("accepts an ordinary self-contained package tree", () => {
    const { root } = createFixture();

    expect(release.validateReleaseTree(root, "released")).toEqual([]);
  });

  it("rejects a symlink whose effective target is outside the archive root", () => {
    const { root, pluginRoot } = createFixture();
    const external = path.join(root, "external.png");
    fs.writeFileSync(external, "png", "utf8");
    fs.rmSync(path.join(pluginRoot, "assets", "icon.png"));
    fs.symlinkSync(external, path.join(pluginRoot, "assets", "icon.png"));

    expect(release.validateReleaseTree(root, "released")).toContain(
      "assets/icon.png must not be a symbolic link",
    );
  });

  it("reports a missing release package and rejects contained relative links", () => {
    const { root, pluginRoot } = createFixture();
    expect(release.validateReleaseTree(root, "missing")).toEqual([
      "plugins/missing is missing",
    ]);
    fs.symlinkSync(
      "icon.png",
      path.join(pluginRoot, "assets", "contained-icon.png"),
    );
    expect(release.validateReleaseTree(root, "released")).toContain(
      "assets/contained-icon.png must not be a symbolic link",
    );
  });

  it("handles cycles, invalid filesystem targets, and root-relative paths", () => {
    const { root, pluginRoot } = createFixture();
    fs.symlinkSync("assets", path.join(pluginRoot, "assets-link"));
    expect(release.validateReleaseTree(root, "released")).toContain(
      "assets-link must not be a symbolic link",
    );
    expect(release.isDirectory(path.join(root, "missing"))).toBe(false);
    expect(release.isDirectory(pluginRoot)).toBe(true);
    expect(release.resolvesInside(pluginRoot, path.join(root, "missing"))).toBe(
      false,
    );
    expect(release.relative(pluginRoot, pluginRoot)).toBe(".");
    const externalPlugin = path.join(root, "external-plugin");
    fs.mkdirSync(externalPlugin);
    fs.symlinkSync(externalPlugin, path.join(root, "plugins", "linked"));
    expect(release.validateReleaseTree(root, "linked")).toEqual([
      "plugins/linked resolves outside the plugins directory",
    ]);
  });
});
