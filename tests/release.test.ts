import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);

interface ReleaseModule {
  parsePluginTag(
    tag: string,
  ): { pluginName: string; version: string } | undefined;
  validateRelease(
    root: string,
    tag: string,
  ): { errors: string[]; pluginName?: string; version?: string };
  errorMessage(error: unknown): string;
}

const release = require("../scripts/validate_release.cjs") as ReleaseModule;

function createFixture(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "codex-release-test-"));
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
    "# Changelog\n\n## [Unreleased]\n",
    "utf8",
  );
  return root;
}

describe("plugin release validation", () => {
  it("parses independent plugin tags", () => {
    expect(release.parsePluginTag("plugin/example/v1.2.3")).toEqual({
      pluginName: "example",
      version: "1.2.3",
    });
    expect(release.parsePluginTag("v1.2.3")).toBeUndefined();
    expect(release.parsePluginTag("plugin/example/not-semver")).toBeUndefined();
  });

  it("accepts a tag matching the manifest and changelog", () => {
    const root = createFixture();
    try {
      expect(release.validateRelease(root, "plugin/example/v1.2.3")).toEqual({
        errors: [],
        pluginName: "example",
        version: "1.2.3",
      });
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects missing plugin, version mismatch, and missing Unreleased", () => {
    const root = createFixture();
    try {
      expect(
        release
          .validateRelease(root, "plugin/missing/v1.0.0")
          .errors.join("\n"),
      ).toContain("plugin manifest is missing");
      expect(
        release
          .validateRelease(root, "plugin/example/v2.0.0")
          .errors.join("\n"),
      ).toContain("version must match tag");
      fs.writeFileSync(
        path.join(root, "plugins/example/.codex-plugin/plugin.json"),
        JSON.stringify({ name: "different", version: "1.2.3" }),
        "utf8",
      );
      expect(
        release
          .validateRelease(root, "plugin/example/v1.2.3")
          .errors.join("\n"),
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
        release
          .validateRelease(root, "plugin/example/v1.2.3")
          .errors.join("\n"),
      ).toContain("must include ## [Unreleased]");
      fs.rmSync(path.join(root, "plugins/example/CHANGELOG.md"));
      expect(
        release
          .validateRelease(root, "plugin/example/v1.2.3")
          .errors.join("\n"),
      ).toContain("changelog is missing");
      fs.writeFileSync(
        path.join(root, "plugins/example/.codex-plugin/plugin.json"),
        "{",
        "utf8",
      );
      expect(
        release
          .validateRelease(root, "plugin/example/v1.2.3")
          .errors.join("\n"),
      ).toContain("plugin manifest is invalid");
      expect(
        release.validateRelease(root, "not-a-plugin-tag").errors.join("\n"),
      ).toContain("must match plugin/<id>/v<semver>");
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("formats unknown thrown values for safe CLI diagnostics", () => {
    expect(release.errorMessage(new Error("failure"))).toBe("failure");
    expect(release.errorMessage("failure")).toBe("failure");
  });
});
