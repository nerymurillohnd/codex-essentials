import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";

const require = createRequire(import.meta.url);
const scaffold = require("./scaffold.cjs") as {
  main(): void;
  scaffoldPlugin(root: string, pluginName: string): void;
  writeTemplate(
    root: string,
    target: string,
    templateName: string,
    values: Record<string, string>,
  ): void;
};
const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);
const fixtures: string[] = [];

afterEach(() => {
  process.exitCode = undefined;
  for (const fixture of fixtures.splice(0)) {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});

function createFixture(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "codex-scaffold-test-"));
  fixtures.push(root);
  fs.cpSync(path.join(repositoryRoot, "lib"), path.join(root, "lib"), {
    recursive: true,
  });
  return root;
}

describe("plugin scaffolding", () => {
  it("adds a source definition and initializes one self-contained package", () => {
    const root = createFixture();

    scaffold.scaffoldPlugin(root, "new-plugin");

    const source = JSON.parse(
      fs.readFileSync(path.join(root, "lib", "source.json"), "utf8"),
    );
    expect(source.plugins.at(-1)).toMatchObject({
      name: "new-plugin",
      skills: [{ id: "new-plugin" }],
    });
    expect(
      fs.readFileSync(
        path.join(
          root,
          "plugins",
          "new-plugin",
          "skills",
          "new-plugin",
          "SKILL.md",
        ),
        "utf8",
      ),
    ).toContain("# New Plugin");
    expect(
      fs.existsSync(path.join(root, "plugins", "new-plugin", "README.md")),
    ).toBe(true);
    expect(
      fs.existsSync(path.join(root, "plugins", "new-plugin", "CHANGELOG.md")),
    ).toBe(true);
  });

  it("rejects a duplicate source identity without overwriting authored files", () => {
    const root = createFixture();
    scaffold.scaffoldPlugin(root, "new-plugin");
    const skill = path.join(
      root,
      "plugins",
      "new-plugin",
      "skills",
      "new-plugin",
      "SKILL.md",
    );
    fs.writeFileSync(skill, "# Authored\n", "utf8");

    expect(() => scaffold.scaffoldPlugin(root, "new-plugin")).toThrow(
      "already exists in lib/source.json",
    );
    expect(fs.readFileSync(skill, "utf8")).toBe("# Authored\n");
  });

  it("runs the CLI with an explicit root and rejects missing identifiers", () => {
    const root = createFixture();
    const argv = process.argv;
    process.argv = [
      process.execPath,
      "scaffold.cjs",
      "cli-plugin",
      "--root",
      root,
    ];
    scaffold.main();
    expect(
      fs.existsSync(path.join(root, "plugins", "cli-plugin", "README.md")),
    ).toBe(true);
    process.argv = [process.execPath, "scaffold.cjs"];
    expect(() => scaffold.main()).toThrow("plugin identifier is required");
    process.argv = argv;
    vi.restoreAllMocks();
  });

  it("rejects malformed plugin identifiers", () => {
    const root = createFixture();
    expect(() => scaffold.scaffoldPlugin(root, "../escape")).toThrow(
      "invalid plugin identifier",
    );
  });

  it("does not replace an existing template target", () => {
    const root = createFixture();
    const target = path.join(root, "existing.md");
    fs.writeFileSync(target, "authored\n", "utf8");
    scaffold.writeTemplate(root, target, "README.md", { PLUGIN_NAME: "x" });
    expect(fs.readFileSync(target, "utf8")).toBe("authored\n");
  });
});
