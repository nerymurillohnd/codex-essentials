import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";

const require = createRequire(import.meta.url);
const scaffold = require("./scaffold.cjs") as {
  scaffoldPlugin(root: string, pluginName: string): void;
};
const validate = require("./validate.cjs") as {
  findPluginDirectories(root: string): string[];
  main(): void;
  validateAll(root: string): string[];
  validateMarketplace(root: string): string[];
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
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "codex-validate-test-"));
  fixtures.push(root);
  fs.cpSync(path.join(repositoryRoot, "lib"), path.join(root, "lib"), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(root, "lib", "source.json"),
    `${JSON.stringify(
      {
        marketplace: {
          name: "test-marketplace",
          displayName: "Test Marketplace",
        },
        plugins: [],
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  return root;
}

describe("repository validation command", () => {
  it("accepts a source-synchronized and self-contained package", () => {
    const root = createFixture();
    scaffold.scaffoldPlugin(root, "validated-plugin");

    expect(validate.validateAll(root)).toEqual([]);
  });

  it("reports drift and containment errors together", () => {
    const root = createFixture();
    scaffold.scaffoldPlugin(root, "validated-plugin");
    const pluginRoot = path.join(root, "plugins", "validated-plugin");
    fs.writeFileSync(
      path.join(pluginRoot, ".codex-plugin", "plugin.json"),
      "{}\n",
      "utf8",
    );
    const externalSkills = path.join(root, "external-skills");
    fs.renameSync(path.join(pluginRoot, "skills"), externalSkills);
    fs.symlinkSync(externalSkills, path.join(pluginRoot, "skills"));

    expect(validate.validateAll(root).join("\n")).toContain(
      "plugin.json has drifted from lib/source.json",
    );
    expect(validate.validateAll(root).join("\n")).toContain(
      "skills resolves outside the owning plugin package",
    );
  });

  it("rejects invalid catalogs and package directories outside the source", () => {
    const root = createFixture();
    scaffold.scaffoldPlugin(root, "validated-plugin");
    fs.mkdirSync(path.join(root, "plugins", "undeclared-plugin"));
    fs.writeFileSync(
      path.join(root, ".agents", "plugins", "marketplace.json"),
      "{}\n",
      "utf8",
    );

    expect(validate.findPluginDirectories(root)).toEqual([
      "undeclared-plugin",
      "validated-plugin",
    ]);
    expect(validate.validateMarketplace(root).join("\n")).toContain(
      "marketplace.json is invalid",
    );
    expect(validate.validateAll(root).join("\n")).toContain(
      "plugins/undeclared-plugin is not declared in lib/source.json",
    );
  });

  it("runs successful, failed, and invalid CLI argument paths", () => {
    const root = createFixture();
    scaffold.scaffoldPlugin(root, "validated-plugin");
    const argv = process.argv;
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const error = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    process.argv = [process.execPath, "validate.cjs", "--root", root];
    validate.main();
    expect(log).toHaveBeenCalled();
    fs.writeFileSync(
      path.join(root, ".agents", "plugins", "marketplace.json"),
      "{}\n",
      "utf8",
    );
    validate.main();
    expect(process.exitCode).toBe(1);
    expect(error).toHaveBeenCalled();
    process.argv = [process.execPath, "validate.cjs", "--root"];
    expect(() => validate.main()).toThrow("--root requires a path");
    process.argv = [process.execPath, "validate.cjs", "unknown"];
    expect(() => validate.main()).toThrow("unknown argument: unknown");
    process.argv = argv;
  });

  it("reports a missing source file instead of throwing from validation", () => {
    const root = fs.mkdtempSync(
      path.join(os.tmpdir(), "codex-missing-source-test-"),
    );
    fixtures.push(root);
    expect(validate.validateAll(root).join("\n")).toContain(
      "unable to load source",
    );
  });

  it("uses the repository default root when no CLI option is supplied", () => {
    const argv = process.argv;
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    process.argv = [process.execPath, "validate.cjs"];
    validate.main();
    expect(log).toHaveBeenCalled();
    process.argv = argv;
  });
});
