import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const releaseScriptPath = path.join(
  repositoryRoot,
  "scripts/validate_release.cjs",
);
const nodeExecutable = process.execPath;

interface ReleaseModule {
  hasPluginPackages(root: string): boolean;
  parsePluginTag(
    tag: string,
  ): { pluginName: string; version: string } | undefined;
  parseArgs(argv: string[]): { root: string; tag: string };
  validateRelease(
    root: string,
    tag: string,
  ): { errors: string[]; pluginName?: string; version?: string };
  errorMessage(error: unknown): string;
}

const release = require("../scripts/validate_release.cjs") as ReleaseModule;

interface SpawnOutput {
  status: number | null;
  stdout: string;
  stderr: string;
}

function spawnRelease(root: string, args: string[]): SpawnOutput {
  const childProcess = require("node:child_process") as {
    spawnSync: (
      command: string,
      commandArgs: string[],
      options: { encoding: "utf8" },
    ) => SpawnOutput;
  };
  return childProcess.spawnSync(
    nodeExecutable,
    [releaseScriptPath, ...args, "--root", root],
    { encoding: "utf8" },
  );
}

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
    "# Changelog\n\n## [Unreleased]\n\n## [1.2.3] - 2026-08-27\n",
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

  it("requires a released changelog heading matching the tag version", () => {
    const root = createFixture();
    try {
      fs.writeFileSync(
        path.join(root, "plugins/example/CHANGELOG.md"),
        "# Changelog\n\n## [Unreleased]\n",
        "utf8",
      );

      expect(
        release
          .validateRelease(root, "plugin/example/v1.2.3")
          .errors.join("\n"),
      ).toContain("must include ## [1.2.3]");
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("formats unknown thrown values for safe CLI diagnostics", () => {
    expect(release.errorMessage(new Error("failure"))).toBe("failure");
    expect(release.errorMessage("failure")).toBe("failure");
  });

  it("allows no tag only when there is no plugin package to release", () => {
    const emptyRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), "codex-empty-release-test-"),
    );
    try {
      fs.mkdirSync(path.join(emptyRoot, "plugins"));

      const result = spawnRelease(emptyRoot, []);

      expect(result.status).toBe(0);
      expect(result.stdout).toContain("Release validation skipped");
    } finally {
      fs.rmSync(emptyRoot, { recursive: true, force: true });
    }

    const pluginRoot = createFixture();
    try {
      const result = spawnRelease(pluginRoot, []);

      expect(result.status).toBe(1);
      expect(result.stderr).toContain("release tag is required");
    } finally {
      fs.rmSync(pluginRoot, { recursive: true, force: true });
    }
  });

  it("parses CLI arguments and rejects malformed release options", () => {
    expect(release.parseArgs(["plugin/example/v1.2.3"])).toMatchObject({
      tag: "plugin/example/v1.2.3",
    });
    expect(release.parseArgs(["--root", "/tmp/release-root"])).toEqual({
      root: "/tmp/release-root",
      tag: "",
    });
    expect(() => release.parseArgs(["--root"])).toThrow(
      "--root requires a path",
    );
    expect(() => release.parseArgs(["plugin/example/v1.2.3", "extra"])).toThrow(
      "unknown argument: extra",
    );
  });

  it("detects releaseable plugin package directories", () => {
    const root = fs.mkdtempSync(
      path.join(os.tmpdir(), "codex-plugin-detect-test-"),
    );
    try {
      expect(release.hasPluginPackages(root)).toBe(false);
      fs.mkdirSync(path.join(root, "plugins/.internal"), { recursive: true });
      expect(release.hasPluginPackages(root)).toBe(false);
      fs.mkdirSync(path.join(root, "plugins/example"), { recursive: true });
      expect(release.hasPluginPackages(root)).toBe(true);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
