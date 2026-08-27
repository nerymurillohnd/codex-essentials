import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { afterEach, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const release = require("./release-tag.cjs") as {
  errorMessage(error: unknown): string;
  hasPluginPackages(root: string): boolean;
  parseArgs(argv: string[]): { root: string; tag: string };
  parsePluginTag(
    tag: string,
  ): { pluginName: string; version: string } | undefined;
  validateRelease(
    root: string,
    tag: string,
  ): {
    errors: string[];
    pluginName?: string;
    version?: string;
  };
};
const fixtures: string[] = [];

afterEach(() => {
  for (const fixture of fixtures.splice(0)) {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});

function createFixture(): string {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), "codex-release-tag-test-"),
  );
  fixtures.push(root);
  fs.mkdirSync(path.join(root, "plugins/example/.codex-plugin"), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(root, "plugins/example/.codex-plugin/plugin.json"),
    JSON.stringify({ name: "example", version: "1.2.3" }),
    "utf8",
  );
  fs.writeFileSync(
    path.join(root, "plugins/example/CHANGELOG.md"),
    "# Changelog\n\n## [Unreleased]\n\n## [1.2.3] - 2026-08-27\n",
    "utf8",
  );
  return root;
}

describe("independent plugin release tags", () => {
  it("accepts a matching tag, manifest, and changelog", () => {
    const root = createFixture();
    expect(release.parsePluginTag("plugin/example/v1.2.3")).toEqual({
      pluginName: "example",
      version: "1.2.3",
    });
    expect(release.validateRelease(root, "plugin/example/v1.2.3")).toEqual({
      errors: [],
      pluginName: "example",
      version: "1.2.3",
    });
  });

  it("reports invalid tags, missing artifacts, and manifest/changelog mismatches", () => {
    const root = createFixture();
    expect(release.parsePluginTag("v1.2.3")).toBeUndefined();
    expect(
      release.validateRelease(root, "plugin/missing/v1.0.0").errors.join("\n"),
    ).toContain("plugin manifest is missing");
    expect(
      release.validateRelease(root, "plugin/example/v2.0.0").errors.join("\n"),
    ).toContain("version must match tag");
    fs.writeFileSync(
      path.join(root, "plugins/example/.codex-plugin/plugin.json"),
      "{",
      "utf8",
    );
    expect(
      release.validateRelease(root, "plugin/example/v1.2.3").errors.join("\n"),
    ).toContain("plugin manifest is invalid");
    fs.writeFileSync(
      path.join(root, "plugins/example/.codex-plugin/plugin.json"),
      JSON.stringify({ name: "different", version: "1.2.3" }),
      "utf8",
    );
    expect(
      release.validateRelease(root, "plugin/example/v1.2.3").errors.join("\n"),
    ).toContain("manifest name must match tag");
    fs.writeFileSync(
      path.join(root, "plugins/example/.codex-plugin/plugin.json"),
      JSON.stringify({ name: "example", version: "1.2.3" }),
      "utf8",
    );
    fs.writeFileSync(
      path.join(root, "plugins/example/CHANGELOG.md"),
      "# Changelog\n",
      "utf8",
    );
    expect(
      release.validateRelease(root, "plugin/example/v1.2.3").errors.join("\n"),
    ).toContain("must include ## [Unreleased]");
    fs.rmSync(path.join(root, "plugins/example/CHANGELOG.md"));
    expect(
      release.validateRelease(root, "plugin/example/v1.2.3").errors.join("\n"),
    ).toContain("changelog is missing");
  });

  it("requires a release heading and validates CLI argument grammar", () => {
    const root = createFixture();
    fs.writeFileSync(
      path.join(root, "plugins/example/CHANGELOG.md"),
      "# Changelog\n\n## [Unreleased]\n",
      "utf8",
    );
    expect(
      release.validateRelease(root, "plugin/example/v1.2.3").errors.join("\n"),
    ).toContain("must include ## [1.2.3]");
    expect(release.parseArgs(["plugin/example/v1.2.3"])).toMatchObject({
      tag: "plugin/example/v1.2.3",
    });
    expect(() => release.parseArgs(["--root"])).toThrow(
      "--root requires a path",
    );
    expect(() => release.parseArgs(["plugin/example/v1.2.3", "extra"])).toThrow(
      "unknown argument",
    );
    expect(
      release.parseArgs(["--root", root, "plugin/example/v1.2.3"]),
    ).toMatchObject({
      root,
      tag: "plugin/example/v1.2.3",
    });
    expect(release.validateRelease(root, "not-a-tag").errors).toEqual([
      "tag 'not-a-tag' must match plugin/<id>/v<semver>",
    ]);
  });

  it("rejects an external symlink before a tagged package can be released", () => {
    const root = createFixture();
    const pluginRoot = path.join(root, "plugins", "example");
    const external = path.join(root, "external.txt");
    fs.writeFileSync(external, "external", "utf8");
    fs.symlinkSync(external, path.join(pluginRoot, "external-link.txt"));

    expect(
      release.validateRelease(root, "plugin/example/v1.2.3").errors,
    ).toContain("external-link.txt resolves outside the release package");
  });

  it("detects releaseable packages and formats unknown errors", () => {
    const root = fs.mkdtempSync(
      path.join(os.tmpdir(), "codex-release-empty-test-"),
    );
    fixtures.push(root);
    expect(release.hasPluginPackages(root)).toBe(false);
    fs.mkdirSync(path.join(root, "plugins/.internal"), { recursive: true });
    expect(release.hasPluginPackages(root)).toBe(false);
    fs.mkdirSync(path.join(root, "plugins/example"), { recursive: true });
    expect(release.hasPluginPackages(root)).toBe(true);
    expect(release.errorMessage(new Error("failure"))).toBe("failure");
    expect(release.errorMessage("failure")).toBe("failure");
  });
});
