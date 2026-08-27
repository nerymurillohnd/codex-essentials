import childProcess from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";

const require = createRequire(import.meta.url);

interface PluginInterfaceFixture {
  displayName: string;
  shortDescription: string;
  longDescription: string;
  developerName: string;
  category: string;
  capabilities: string[];
  defaultPrompt: string;
  composerIcon?: string;
  logo?: string;
  logoDark?: string;
  screenshots?: unknown[];
}

interface PluginFixture {
  name: string;
  version: string;
  description: string;
  author: { name: string; url?: string };
  interface: PluginInterfaceFixture;
  skills?: string;
  apps?: string;
  mcpServers?: string | Record<string, object>;
}

interface NullablePluginFixture extends Omit<PluginFixture, "interface"> {
  interface: PluginInterfaceFixture | null;
}

interface MarketplaceEntryFixture {
  name: string;
  source: { source: string; path?: string; url?: string };
  policy: { installation: string; authentication: string };
  category: string;
}

interface MarketplaceFixture {
  name: string;
  interface: { displayName: string };
  plugins: (MarketplaceEntryFixture | null)[];
}

interface MarketplaceWithoutPluginsFixture extends Omit<
  MarketplaceFixture,
  "plugins"
> {
  plugins: null;
}

interface ValidationResult {
  errors: string[];
  entries: Map<string, unknown>;
}

interface PluginValidationResult {
  errors: string[];
  names: Set<string>;
}

interface ValidationModule {
  checkAsset(
    pluginRoot: string,
    rawPath: unknown,
    location: string,
    errors: string[],
  ): void;
  loadJson(filePath: string, errors: string[], kind: string): unknown;
  main(): void;
  parseArgs(argv: string[]): { root: string; scope: string };
  relativePath(root: string, target: string): string;
  resolveInside(root: string, rawPath: unknown): string | undefined;
  validateAgainstSchema(
    schema: unknown,
    payload: unknown,
    manifestPath: string,
    errors: string[],
  ): void;
  validateMarketplace(root: string, schema?: unknown): ValidationResult;
  validatePlugins(
    root: string,
    options?: { pluginSchema?: unknown; requireDirectory?: boolean },
  ): PluginValidationResult;
  validateScope(root: string, scope: string): ValidationResult;
}

interface GeneratorOptions {
  root: string;
  name?: string;
  displayName?: string;
  description?: string;
  version?: string;
  pluginName?: string;
  command?: string;
  type?: string;
  force: boolean;
  withoutMarketplace?: boolean;
}

interface GeneratorResult {
  messages: string[];
}

interface GeneratorModule {
  buildMarketplace(name: string, displayName: string): MarketplaceFixture;
  buildPlugin(
    name: string,
    displayName: string,
    description: string,
    version: string,
  ): PluginFixture;
  completeManifest(options: GeneratorOptions): GeneratorResult;
  generateMarketplace(options: GeneratorOptions): GeneratorResult;
  generatePlugin(options: GeneratorOptions): GeneratorResult;
  main(): void;
  parseArgs(argv: string[]): GeneratorOptions & {
    command: string;
    type: string;
  };
  readObjectIfPresent(target: string): Record<string, unknown> | undefined;
  titleCase(value: string): string;
  writeValidatedJson(
    target: string,
    payload: unknown,
    schemaPath: string,
    options: { force: boolean },
  ): void;
}

interface TypecheckModule {
  main(): void;
  runTypecheck(
    root?: string,
    io?: { log?: (...args: unknown[]) => void; stdio?: "ignore" | "inherit" },
  ): number;
}

const validate =
  require("../scripts/validate_manifests.cjs") as unknown as ValidationModule;
const generate =
  require("../scripts/generate_manifests.cjs") as unknown as GeneratorModule;
const typecheck =
  require("../scripts/typecheck.cjs") as unknown as TypecheckModule;

const templatesDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "templates",
);

function createFixture({
  withMarketplace = true,
  withPlugins = true,
}: {
  withMarketplace?: boolean;
  withPlugins?: boolean;
} = {}): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "codex-essentials-unit-"));
  fs.cpSync(templatesDirectory, path.join(root, "templates"), {
    recursive: true,
  });
  if (withPlugins) {
    fs.mkdirSync(path.join(root, "plugins"), { recursive: true });
  }
  if (withMarketplace) {
    generate.generateMarketplace({
      root,
      name: "unit-marketplace",
      displayName: "Unit Marketplace",
      force: false,
    });
  }
  return root;
}

function removeFixture(root: string): void {
  fs.rmSync(root, { recursive: true, force: true });
}

function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function readJson<T extends object = Record<string, unknown>>(
  filePath: string,
): T {
  const value: unknown = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!value || typeof value !== "object") {
    throw new TypeError(`Expected an object in ${filePath}`);
  }
  return value as T;
}

function basePlugin(name = "unit-plugin"): PluginFixture {
  return generate.buildPlugin(name, "Unit Plugin", "Unit plugin", "0.1.0");
}

type SpawnResult = ReturnType<typeof childProcess.spawnSync>;

function spawnResult(status: number | null): SpawnResult {
  return { status } as unknown as SpawnResult;
}

afterEach(() => {
  vi.restoreAllMocks();
  process.exitCode = undefined;
});

describe("manifest validator internals", () => {
  it("parses valid scopes and rejects malformed arguments", () => {
    expect(validate.parseArgs(["marketplace"]).scope).toBe("marketplace");
    expect(validate.parseArgs(["plugins"]).scope).toBe("plugins");
    expect(validate.parseArgs(["all"])).toEqual({
      root: path.resolve("."),
      scope: "all",
    });
    expect(validate.parseArgs(["plugins", "--root", "."])).toEqual({
      root: path.resolve("."),
      scope: "plugins",
    });
    expect(() => validate.parseArgs(["all", "--root"])).toThrow(
      "--root requires a path",
    );
    expect(() => validate.parseArgs(["all", "--unknown"])).toThrow(
      "unknown argument",
    );
    expect(() => validate.parseArgs(["unknown"])).toThrow("usage:");
  });

  it("loads JSON and reports missing, malformed, and unreadable files", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "codex-json-"));
    try {
      const errors: string[] = [];
      const validPath = path.join(root, "valid.json");
      writeJson(validPath, { ok: true });
      expect(validate.loadJson(validPath, errors, "fixture")).toEqual({
        ok: true,
      });

      const missing = validate.loadJson(
        path.join(root, "missing.json"),
        errors,
        "fixture",
      );
      expect(missing).toBeUndefined();
      fs.writeFileSync(path.join(root, "broken.json"), "{", "utf8");
      expect(
        validate.loadJson(path.join(root, "broken.json"), errors, "fixture"),
      ).toBeUndefined();
      fs.mkdirSync(path.join(root, "directory"));
      expect(
        validate.loadJson(path.join(root, "directory"), errors, "fixture"),
      ).toBeUndefined();
      expect(errors).toHaveLength(3);
      expect(errors.join("\n")).toContain("invalid JSON");
      expect(errors.join("\n")).toContain("unable to read");
    } finally {
      removeFixture(root);
    }
  });

  it("validates schemas, including schema compilation errors", () => {
    const errors: string[] = [];
    validate.validateAgainstSchema(
      {
        type: "object",
        required: ["name"],
        properties: { name: { type: "string" } },
      },
      {},
      "fixture.json",
      errors,
    );
    expect(errors[0]).toContain("must have required property 'name'");

    const validErrors: string[] = [];
    validate.validateAgainstSchema(
      { type: "object", properties: { name: { type: "string" } } },
      { name: "valid" },
      "fixture.json",
      validErrors,
    );
    expect(validErrors).toEqual([]);

    const compileErrors: string[] = [];
    validate.validateAgainstSchema(
      { type: "not-a-json-schema-keyword" },
      {},
      "bad-schema.json",
      compileErrors,
    );
    expect(compileErrors[0]).toContain("schema compilation failed");
  });

  it("validates marketplace entries and filesystem targets", () => {
    const root = createFixture();
    try {
      const marketplacePath = path.join(
        root,
        ".agents/plugins/marketplace.json",
      );
      const marketplace = readJson<MarketplaceFixture>(marketplacePath);
      marketplace.plugins = [
        {
          name: "remote",
          source: { source: "url", url: "https://example.com/plugin.git" },
          policy: { installation: "AVAILABLE", authentication: "ON_USE" },
          category: "Productivity",
        },
        {
          name: "local-valid",
          source: { source: "local", path: "./plugins/local-valid" },
          policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
          category: "Productivity",
        },
        {
          name: "local-missing",
          source: { source: "local", path: "./plugins/local-missing" },
          policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
          category: "Productivity",
        },
        {
          name: "local-outside",
          source: { source: "local", path: "../outside" },
          policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
          category: "Productivity",
        },
        null,
      ];
      writeJson(marketplacePath, marketplace);
      fs.mkdirSync(path.join(root, "plugins/local-valid"), {
        recursive: true,
      });

      const result = validate.validateMarketplace(root);
      expect(result.entries.get("remote")).toBe("url");
      expect(result.entries.get("local-valid")).toBe("local");
      expect(result.errors.join("\n")).toContain(
        "plugins[2].source.path does not point to an existing plugin directory",
      );
      expect(result.errors.join("\n")).toContain(
        "plugins[3].source.path must stay inside the repository",
      );

      const missingManifestRoot = fs.mkdtempSync(
        path.join(os.tmpdir(), "codex-marketplace-missing-"),
      );
      try {
        const missingResult = validate.validateMarketplace(missingManifestRoot);
        expect(missingResult.errors.join("\n")).toContain(
          "marketplace.json is missing",
        );
      } finally {
        removeFixture(missingManifestRoot);
      }

      const nonArrayMarketplace =
        readJson<MarketplaceWithoutPluginsFixture>(marketplacePath);
      nonArrayMarketplace.plugins = null;
      writeJson(marketplacePath, nonArrayMarketplace);
      expect(validate.validateMarketplace(root).errors.length).toBeGreaterThan(
        0,
      );
    } finally {
      removeFixture(root);
    }
  });

  it("validates plugin directories, components, and assets", () => {
    const root = createFixture();
    try {
      const pluginRoot = path.join(root, "plugins", "unit-plugin");
      fs.mkdirSync(path.join(pluginRoot, ".codex-plugin"), {
        recursive: true,
      });
      const plugin = basePlugin("different-name");
      plugin.apps = "./.app.json";
      plugin.mcpServers = "./.mcp.json";
      plugin.interface.composerIcon = "./assets/icon.png";
      plugin.interface.logo = "./outside.png";
      plugin.interface.logoDark = "./assets/missing.png";
      plugin.interface.screenshots = ["./assets/screenshot.png", 42];
      writeJson(path.join(pluginRoot, ".codex-plugin/plugin.json"), plugin);
      fs.mkdirSync(path.join(pluginRoot, "skills"), { recursive: true });
      fs.mkdirSync(path.join(pluginRoot, "assets"), { recursive: true });
      fs.writeFileSync(path.join(pluginRoot, "assets/icon.png"), "png");
      fs.writeFileSync(path.join(pluginRoot, "assets/screenshot.png"), "png");

      const result = validate.validatePlugins(root);
      expect(result.names).toEqual(new Set(["unit-plugin"]));
      expect(result.errors.join("\n")).toContain("must match directory");
      expect(result.errors.join("\n")).toContain("missing .app.json");
      expect(result.errors.join("\n")).toContain("missing .mcp.json");
      expect(result.errors.join("\n")).toContain("must stay under ./assets/");
      expect(result.errors.join("\n")).toContain("missing file");

      const hidden = path.join(root, "plugins", ".hidden");
      fs.mkdirSync(hidden);
      fs.writeFileSync(path.join(root, "plugins", "not-a-directory"), "x");
      expect(validate.validatePlugins(root).names).toEqual(
        new Set(["unit-plugin"]),
      );

      const noSkillsRoot = path.join(root, "plugins", "no-skills");
      fs.mkdirSync(path.join(noSkillsRoot, ".codex-plugin"), {
        recursive: true,
      });
      const noSkills = basePlugin("no-skills");
      delete noSkills.skills;
      noSkills.mcpServers = { local: {} };
      writeJson(path.join(noSkillsRoot, ".codex-plugin/plugin.json"), noSkills);
      const noSkillsResult = validate.validatePlugins(root);
      expect(noSkillsResult.errors.join("\n")).not.toContain(
        "no-skills/.codex-plugin/plugin.json field 'skills'",
      );

      const missingSkillsRoot = path.join(root, "plugins", "missing-skills");
      fs.mkdirSync(path.join(missingSkillsRoot, ".codex-plugin"), {
        recursive: true,
      });
      writeJson(
        path.join(missingSkillsRoot, ".codex-plugin/plugin.json"),
        basePlugin("missing-skills"),
      );
      const missingSkillsResult = validate.validatePlugins(root);
      expect(missingSkillsResult.errors.join("\n")).toContain(
        "missing-skills/.codex-plugin/plugin.json field 'skills'",
      );

      const nullInterfaceRoot = path.join(root, "plugins", "null-interface");
      fs.mkdirSync(path.join(nullInterfaceRoot, ".codex-plugin"), {
        recursive: true,
      });
      const nullInterface = basePlugin(
        "null-interface",
      ) as unknown as NullablePluginFixture;
      nullInterface.interface = null;
      delete nullInterface.skills;
      nullInterface.mcpServers = { local: {} };
      writeJson(
        path.join(nullInterfaceRoot, ".codex-plugin/plugin.json"),
        nullInterface,
      );
      expect(validate.validatePlugins(root).errors.join("\n")).toContain(
        "/interface must be object",
      );

      const nullManifestRoot = path.join(root, "plugins", "null-manifest");
      fs.mkdirSync(path.join(nullManifestRoot, ".codex-plugin"), {
        recursive: true,
      });
      fs.writeFileSync(
        path.join(nullManifestRoot, ".codex-plugin/plugin.json"),
        "null",
        "utf8",
      );
      expect(validate.validatePlugins(root).errors.join("\n")).not.toContain(
        "null-manifest field",
      );
    } finally {
      removeFixture(root);
    }
  });

  it("handles missing or invalid plugin roots and all-scope cross-checks", () => {
    const missingRoot = createFixture({
      withMarketplace: false,
      withPlugins: false,
    });
    try {
      expect(validate.validatePlugins(missingRoot).errors).toEqual([]);
      expect(
        validate.validatePlugins(missingRoot, { requireDirectory: true })
          .errors,
      ).toEqual(["plugins/ directory is missing"]);
      writeJson(path.join(missingRoot, "plugins"), { not: "a directory" });
      expect(validate.validatePlugins(missingRoot).errors).toEqual([
        "plugins/ must be a directory",
      ]);

      const missingSchemasRoot = fs.mkdtempSync(
        path.join(os.tmpdir(), "codex-schemas-missing-"),
      );
      try {
        const result = validate.validateScope(missingSchemasRoot, "all");
        expect(result.errors.join("\n")).toContain(
          "templates/marketplace.schema.json could not be loaded",
        );
        expect(result.errors.join("\n")).toContain(
          "templates/plugin.schema.json could not be loaded",
        );
      } finally {
        removeFixture(missingSchemasRoot);
      }
    } finally {
      removeFixture(missingRoot);
    }

    const root = createFixture();
    try {
      generate.generatePlugin({
        root,
        pluginName: "registered",
        version: "0.1.0",
        force: false,
        withoutMarketplace: false,
      });
      fs.mkdirSync(path.join(root, "plugins", "unregistered"));
      const marketplace = readJson<MarketplaceFixture>(
        path.join(root, ".agents/plugins/marketplace.json"),
      );
      marketplace.plugins.push({
        name: "missing-directory",
        source: { source: "local", path: "./plugins/missing-directory" },
        policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
        category: "Productivity",
      });
      writeJson(
        path.join(root, ".agents/plugins/marketplace.json"),
        marketplace,
      );
      const result = validate.validateScope(root, "all");
      expect(result.errors.join("\n")).toContain("unregistered");
      expect(result.errors.join("\n")).toContain("missing-directory");
    } finally {
      removeFixture(root);
    }
  });

  it("covers path and CLI branches", () => {
    expect(validate.resolveInside("/tmp/root", "assets/file")).toBeUndefined();
    expect(validate.resolveInside("/tmp/root", 42)).toBeUndefined();
    expect(validate.resolveInside("/tmp/root", "./../outside")).toBeUndefined();
    expect(validate.relativePath("/tmp/root", "/tmp/root")).toBe(".");
    const assetErrors: string[] = [];
    validate.checkAsset("/tmp/root", 42, "asset", assetErrors);
    expect(assetErrors).toContain("asset must stay under ./assets/");

    const root = createFixture();
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const originalArgv = process.argv;
    try {
      process.argv = [
        process.execPath,
        "validate_manifests.cjs",
        "marketplace",
        "--root",
        root,
      ];
      validate.main();
      process.argv = [
        process.execPath,
        "validate_manifests.cjs",
        "plugins",
        "--root",
        root,
      ];
      validate.main();
      process.argv = [
        process.execPath,
        "validate_manifests.cjs",
        "invalid",
        "--root",
        root,
      ];
      validate.main();
      expect(error).toHaveBeenCalledWith(
        expect.stringContaining("Validation command failed"),
      );

      const invalidManifestPath = path.join(
        root,
        ".agents/plugins/marketplace.json",
      );
      fs.writeFileSync(invalidManifestPath, "{", "utf8");
      process.argv = [
        process.execPath,
        "validate_manifests.cjs",
        "marketplace",
        "--root",
        root,
      ];
      validate.main();
      expect(error).toHaveBeenCalledWith(
        expect.stringContaining("Validation failed"),
      );
      expect(log).toHaveBeenCalled();
    } finally {
      process.argv = originalArgv;
      removeFixture(root);
    }
  });
});

describe("manifest generator internals", () => {
  it("builds defaults and parses every supported option", () => {
    expect(generate.titleCase("my_plugin.v2-name")).toBe("My Plugin V2 Name");
    expect(generate.buildMarketplace("market", "Market")).toEqual({
      name: "market",
      interface: { displayName: "Market" },
      plugins: [],
    });
    expect(
      generate.buildPlugin("plugin", "Plugin", "Description", "1.0.0"),
    ).toMatchObject({
      name: "plugin",
      version: "1.0.0",
      skills: "./skills/",
      license: "MIT",
    });
    expect(
      generate.parseArgs([
        "plugin",
        "plugin-name",
        "--root",
        ".",
        "--name",
        "market",
        "--display-name",
        "Display",
        "--description",
        "Description",
        "--version",
        "1.2.3",
        "--force",
        "--without-marketplace",
      ]),
    ).toMatchObject({
      command: "plugin",
      pluginName: "plugin-name",
      name: "market",
      displayName: "Display",
      description: "Description",
      version: "1.2.3",
      force: true,
      withoutMarketplace: true,
    });
    expect(
      generate.parseArgs(["complete", "marketplace", "--name", "x"]),
    ).toMatchObject({
      command: "complete",
      type: "marketplace",
      name: "x",
    });
    expect(
      generate.parseArgs(["complete", "plugin", "plugin-name"]),
    ).toMatchObject({
      command: "complete",
      type: "plugin",
      pluginName: "plugin-name",
    });
    expect(generate.parseArgs(["marketplace"]).type).toBe("marketplace");
    expect(generate.parseArgs(["plugin", "plugin-name"]).type).toBe("plugin");
    expect(() => generate.parseArgs(["complete", "invalid"])).toThrow("usage:");
    expect(() => generate.parseArgs(["plugin"])).toThrow(
      "requires a plugin name",
    );
    expect(() => generate.parseArgs(["plugin", "bad/name"])).toThrow(
      "invalid plugin identifier",
    );
    expect(() => generate.parseArgs(["marketplace", "--unknown"])).toThrow(
      "unknown argument",
    );
    expect(() => generate.parseArgs(["marketplace", "--name"])).toThrow(
      "requires a value",
    );
  });

  it("generates, refuses overwrite, and updates marketplace entries", () => {
    const root = createFixture();
    try {
      expect(() =>
        generate.generateMarketplace({
          root,
          name: "new-market",
          displayName: "New Market",
          force: false,
        }),
      ).toThrow("already exists");
      generate.generateMarketplace({
        root,
        name: "new-market",
        displayName: "New Market",
        force: true,
      });
      generate.generatePlugin({
        root,
        pluginName: "new-plugin",
        version: "0.1.0",
        force: false,
        withoutMarketplace: true,
      });
      generate.generatePlugin({
        root,
        pluginName: "new-plugin",
        version: "0.2.0",
        force: true,
        withoutMarketplace: false,
      });
      generate.generatePlugin({
        root,
        pluginName: "new-plugin",
        version: "0.3.0",
        force: true,
        withoutMarketplace: false,
      });
      const marketplace = readJson<MarketplaceFixture>(
        path.join(root, ".agents/plugins/marketplace.json"),
      );
      expect(marketplace.plugins).toHaveLength(1);
      expect(marketplace.plugins[0]?.name).toBe("new-plugin");
      expect(
        readJson<PluginFixture>(
          path.join(root, "plugins/new-plugin/.codex-plugin/plugin.json"),
        ).version,
      ).toBe("0.3.0");

      const emptyMarketplaceRoot = createFixture({ withMarketplace: false });
      try {
        writeJson(
          path.join(emptyMarketplaceRoot, ".agents/plugins/marketplace.json"),
          { plugins: [] },
        );
        generate.generatePlugin({
          root: emptyMarketplaceRoot,
          pluginName: "fallback-plugin",
          version: "0.1.0",
          force: false,
          withoutMarketplace: false,
        });
        const fallbackMarketplace = readJson<MarketplaceFixture>(
          path.join(emptyMarketplaceRoot, ".agents/plugins/marketplace.json"),
        );
        expect(fallbackMarketplace.name).toBe("codex-essentials");
        expect(fallbackMarketplace.interface.displayName).toBe(
          "Codex Essentials",
        );
      } finally {
        removeFixture(emptyMarketplaceRoot);
      }
    } finally {
      removeFixture(root);
    }
  });

  it("completes existing manifests and preserves authored fields", () => {
    const root = createFixture();
    try {
      const marketplacePath = path.join(
        root,
        ".agents/plugins/marketplace.json",
      );
      writeJson(marketplacePath, {
        name: "authored",
        interface: { displayName: "Authored" },
        plugins: [],
      });
      generate.completeManifest({
        root,
        type: "marketplace",
        force: false,
      });
      expect(
        readJson<MarketplaceFixture>(marketplacePath).interface.displayName,
      ).toBe("Authored");

      const defaultRoot = createFixture({ withMarketplace: false });
      try {
        generate.completeManifest({
          root: defaultRoot,
          type: "marketplace",
          force: false,
        });
        expect(
          readJson<MarketplaceFixture>(
            path.join(defaultRoot, ".agents/plugins/marketplace.json"),
          ).name,
        ).toBe("codex-essentials");
      } finally {
        removeFixture(defaultRoot);
      }

      const pluginRoot = path.join(root, "plugins", "authored-plugin");
      fs.mkdirSync(path.join(pluginRoot, ".codex-plugin"), { recursive: true });
      writeJson(path.join(pluginRoot, ".codex-plugin/plugin.json"), {
        name: "authored-plugin",
        version: "1.0.0",
        description: "Authored description",
        author: { name: "Custom author" },
        interface: {
          displayName: "Custom display",
          shortDescription: "Custom short",
          longDescription: "Custom long",
          developerName: "Custom developer",
          category: "Productivity",
          capabilities: ["Custom"],
          defaultPrompt: "Custom prompt",
        },
      });
      generate.completeManifest({
        root,
        type: "plugin",
        pluginName: "authored-plugin",
        version: "1.0.0",
        force: false,
        withoutMarketplace: true,
      });
      const plugin = readJson<PluginFixture>(
        path.join(pluginRoot, ".codex-plugin/plugin.json"),
      );
      expect(plugin.description).toBe("Authored description");
      expect(plugin.author.name).toBe("Custom author");
      expect(plugin.skills).toBe("./skills/");

      const newRoot = createFixture({ withMarketplace: false });
      try {
        generate.completeManifest({
          root: newRoot,
          type: "marketplace",
          displayName: "Generated",
          force: false,
        });
        generate.completeManifest({
          root: newRoot,
          type: "plugin",
          pluginName: "new-completed",
          version: "0.1.0",
          force: false,
          withoutMarketplace: false,
        });
        expect(
          readJson<PluginFixture>(
            path.join(
              newRoot,
              "plugins/new-completed/.codex-plugin/plugin.json",
            ),
          ).name,
        ).toBe("new-completed");
      } finally {
        removeFixture(newRoot);
      }
    } finally {
      removeFixture(root);
    }
  });

  it("rejects invalid existing objects and schema writes", () => {
    const root = createFixture();
    try {
      const malformed = path.join(root, "malformed.json");
      fs.writeFileSync(malformed, "{", "utf8");
      expect(() => generate.readObjectIfPresent(malformed)).toThrow(
        "invalid JSON",
      );
      const arrayPath = path.join(root, "array.json");
      writeJson(arrayPath, []);
      expect(() => generate.readObjectIfPresent(arrayPath)).toThrow(
        "must contain a JSON object",
      );
      expect(
        generate.readObjectIfPresent(path.join(root, "missing.json")),
      ).toBe(undefined);
      expect(() =>
        generate.writeValidatedJson(
          path.join(root, "invalid.json"),
          { invalid: true },
          path.join(root, "templates/plugin.schema.json"),
          { force: false },
        ),
      ).toThrow("must have required property");
      expect(() =>
        generate.writeValidatedJson(
          path.join(root, "missing-schema.json"),
          {},
          path.join(root, "templates/missing.json"),
          { force: false },
        ),
      ).toThrow("is missing");
    } finally {
      removeFixture(root);
    }
  });

  it("runs the generator main entry point for success and failure", () => {
    const root = createFixture({ withMarketplace: false });
    const originalArgv = process.argv;
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      process.argv = [
        process.execPath,
        "generate_manifests.cjs",
        "marketplace",
        "--root",
        root,
      ];
      generate.main();
      expect(log).toHaveBeenCalledWith(
        expect.stringContaining("Generated marketplace"),
      );
      process.argv = [
        process.execPath,
        "generate_manifests.cjs",
        "plugin",
        "cli-plugin",
        "--root",
        root,
        "--without-marketplace",
      ];
      generate.main();
      process.argv = [
        process.execPath,
        "generate_manifests.cjs",
        "complete",
        "marketplace",
        "--root",
        root,
      ];
      generate.main();
      process.argv = [process.execPath, "generate_manifests.cjs", "unknown"];
      generate.main();
      expect(process.exitCode).toBe(1);
      expect(error).toHaveBeenCalledWith(
        expect.stringContaining("Generation failed"),
      );
    } finally {
      process.argv = originalArgv;
      removeFixture(root);
    }
  });
});

describe("typecheck wrapper", () => {
  it("invokes the local compiler and returns its status", () => {
    const sourceRoot = fs.mkdtempSync(path.join(os.tmpdir(), "codex-source-"));
    try {
      const spawn = vi
        .spyOn(childProcess, "spawnSync")
        .mockReturnValueOnce(spawnResult(7))
        .mockReturnValueOnce(spawnResult(null))
        .mockReturnValueOnce(spawnResult(0));
      expect(typecheck.runTypecheck(sourceRoot, { stdio: "ignore" })).toBe(7);
      expect(typecheck.runTypecheck(sourceRoot, { stdio: "ignore" })).toBe(1);
      expect(typecheck.runTypecheck(sourceRoot)).toBe(0);
      expect(spawn).toHaveBeenCalledTimes(3);
      expect(spawn).toHaveBeenLastCalledWith(
        process.execPath,
        [
          path.join(sourceRoot, "node_modules/@typescript/native/bin/tsc"),
          "--noEmit",
        ],
        { cwd: sourceRoot, stdio: "inherit" },
      );
    } finally {
      removeFixture(sourceRoot);
    }

    vi.spyOn(childProcess, "spawnSync").mockReturnValue(spawnResult(0));
    typecheck.main();
    expect(process.exitCode).toBe(0);
  });
});
