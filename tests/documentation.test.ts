import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const scriptsDirectory = path.join(repositoryRoot, "scripts");
const templatesDirectory = path.join(repositoryRoot, "templates");
const nodeExecutable = process.execPath;
const require = createRequire(import.meta.url);

interface ValidatorModule {
  validatePluginDocumentation(
    root: string,
    pluginRoot: string,
    errors: string[],
  ): void;
}

interface GeneratorModule {
  writeDocumentationTemplates(
    root: string,
    pluginRoot: string,
    values: { pluginName: string; displayName: string },
  ): void;
}

const validator =
  require("../scripts/validate_manifests.cjs") as ValidatorModule;
const generator =
  require("../scripts/generate_manifests.cjs") as GeneratorModule;

function createFixture(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "codex-docs-test-"));
  fs.cpSync(templatesDirectory, path.join(root, "templates"), {
    recursive: true,
  });
  fs.mkdirSync(path.join(root, "plugins"), { recursive: true });
  return root;
}

function runGenerator(root: string, args: string[]): string {
  const result = Bunless.spawn(nodeExecutable, [
    path.join(scriptsDirectory, "generate_manifests.cjs"),
    ...args,
    "--root",
    root,
  ]);
  expect(result.status).toBe(0);
  return result.stdout;
}

class Bunless {
  static spawn(executable: string, args: string[]): SpawnOutput {
    const childProcess = require("node:child_process") as {
      spawnSync: (
        command: string,
        commandArgs: string[],
        options: { encoding: "utf8" },
      ) => SpawnOutput;
    };
    return childProcess.spawnSync(executable, args, { encoding: "utf8" });
  }
}

interface SpawnOutput {
  status: number | null;
  stdout: string;
  stderr: string;
}

describe("plugin documentation scaffolding", () => {
  it("creates README and CHANGELOG from canonical templates", () => {
    const root = createFixture();
    try {
      runGenerator(root, ["plugin", "docs-plugin"]);

      const pluginRoot = path.join(root, "plugins", "docs-plugin");
      const readme = fs.readFileSync(
        path.join(pluginRoot, "README.md"),
        "utf8",
      );
      const changelog = fs.readFileSync(
        path.join(pluginRoot, "CHANGELOG.md"),
        "utf8",
      );

      expect(readme).toContain("# Docs Plugin");
      expect(readme).toContain("## Human Approval Boundaries");
      expect(changelog).toContain("## [Unreleased]");
      expect(changelog).not.toContain("{{PLUGIN_NAME}}");
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("completion preserves authored documentation", () => {
    const root = createFixture();
    try {
      runGenerator(root, ["plugin", "preserved-plugin"]);
      const pluginRoot = path.join(root, "plugins", "preserved-plugin");
      const readmePath = path.join(pluginRoot, "README.md");
      const changelogPath = path.join(pluginRoot, "CHANGELOG.md");
      const authoredReadme = "# Authored documentation\n";
      const authoredChangelog = "# Changelog\n\n## [Unreleased]\n\n### Added\n";
      fs.writeFileSync(readmePath, authoredReadme, "utf8");
      fs.writeFileSync(changelogPath, authoredChangelog, "utf8");

      runGenerator(root, ["complete", "plugin", "preserved-plugin"]);

      expect(fs.readFileSync(readmePath, "utf8")).toBe(authoredReadme);
      expect(fs.readFileSync(changelogPath, "utf8")).toBe(authoredChangelog);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("validator accepts generated documentation", () => {
    const root = createFixture();
    try {
      runGenerator(root, ["plugin", "validated-plugin"]);
      const result = Bunless.spawn(nodeExecutable, [
        path.join(scriptsDirectory, "validate_manifests.cjs"),
        "all",
        "--root",
        root,
      ]);

      expect(result.status).toBe(0);
      expect(result.stdout).toContain("Validation passed: all");
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects a plugin with missing product documentation", () => {
    const root = createFixture();
    try {
      runGenerator(root, ["plugin", "missing-docs"]);
      fs.rmSync(path.join(root, "plugins/missing-docs/README.md"));
      const result = Bunless.spawn(nodeExecutable, [
        path.join(scriptsDirectory, "validate_manifests.cjs"),
        "plugins",
        "--root",
        root,
      ]);

      expect(result.status).toBe(1);
      expect(result.stderr).toContain(
        "plugins/missing-docs/README.md is missing",
      );
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects documentation without required headings", () => {
    const root = createFixture();
    try {
      runGenerator(root, ["plugin", "incomplete-docs"]);
      fs.writeFileSync(
        path.join(root, "plugins/incomplete-docs/README.md"),
        "# Incomplete\n",
        "utf8",
      );
      const result = Bunless.spawn(nodeExecutable, [
        path.join(scriptsDirectory, "validate_manifests.cjs"),
        "plugins",
        "--root",
        root,
      ]);

      expect(result.status).toBe(1);
      expect(result.stderr).toContain("README.md is missing required heading");
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects a changelog without an Unreleased section", () => {
    const root = createFixture();
    try {
      runGenerator(root, ["plugin", "invalid-changelog"]);
      fs.writeFileSync(
        path.join(root, "plugins/invalid-changelog/CHANGELOG.md"),
        "# Changelog\n",
        "utf8",
      );
      const result = Bunless.spawn(nodeExecutable, [
        path.join(scriptsDirectory, "validate_manifests.cjs"),
        "plugins",
        "--root",
        root,
      ]);

      expect(result.status).toBe(1);
      expect(result.stderr).toContain(
        "CHANGELOG.md must include ## [Unreleased]",
      );
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("covers direct documentation validation and missing templates", () => {
    const root = createFixture();
    try {
      const pluginRoot = path.join(root, "plugins", "direct-plugin");
      fs.mkdirSync(pluginRoot, { recursive: true });
      fs.writeFileSync(
        path.join(pluginRoot, "README.md"),
        "# Direct\n",
        "utf8",
      );
      fs.writeFileSync(
        path.join(pluginRoot, "CHANGELOG.md"),
        "# Changelog\n",
        "utf8",
      );
      const errors: string[] = [];
      validator.validatePluginDocumentation(root, pluginRoot, errors);
      expect(errors.length).toBeGreaterThan(1);

      const missingTemplateRoot = fs.mkdtempSync(
        path.join(os.tmpdir(), "codex-missing-template-"),
      );
      try {
        expect(() =>
          generator.writeDocumentationTemplates(
            missingTemplateRoot,
            path.join(missingTemplateRoot, "plugin"),
            { pluginName: "plugin", displayName: "Plugin" },
          ),
        ).toThrow("missing documentation template");
      } finally {
        fs.rmSync(missingTemplateRoot, { recursive: true, force: true });
      }
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
