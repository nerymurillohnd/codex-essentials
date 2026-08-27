import childProcess from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { SpawnSyncReturns } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(currentDirectory, "..");
const templatesDirectory = path.resolve(currentDirectory, "..", "templates");
const scriptsDirectory = path.resolve(currentDirectory, "..", "scripts");
const typescriptNativeBinary = path.join(
  repositoryRoot,
  "node_modules/@typescript/native/bin/tsc",
);
const typescriptApiBinary = path.join(
  repositoryRoot,
  "node_modules/typescript/bin/tsc6",
);
const buildConfig = path.join(repositoryRoot, "tsconfig.build.json");
const scriptsTypecheckConfig = path.join(
  repositoryRoot,
  "tsconfig.scripts.json",
);
const editorScriptsTypecheckConfig = path.join(
  repositoryRoot,
  "scripts/tsconfig.json",
);

const javascriptExtensions = new Set([".js", ".cjs", ".mjs"]);
const ignoredJavaScriptDirectories = new Set([
  ".codex",
  ".diagnostics",
  ".git",
  "coverage",
  "dist",
  "node_modules",
]);

interface MarketplaceSchema {
  $schema: string;
  type: string;
  additionalProperties: boolean;
  required: string[];
  $defs: {
    pluginEntry: { required: string[] };
    policy: { properties: { installation: { enum: string[] } } };
  };
}

interface PluginSchema {
  $schema: string;
  type: string;
  additionalProperties: boolean;
  required: string[];
  $defs: {
    interface: {
      required: string[];
      properties: { screenshots: { items: { $ref: string } } };
    };
  };
}

function loadSchema(fileName: string): unknown {
  const filePath = path.join(templatesDirectory, fileName);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function createFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "codex-essentials-test-"));
  fs.cpSync(templatesDirectory, path.join(root, "templates"), {
    recursive: true,
  });
  fs.mkdirSync(path.join(root, "plugins"), { recursive: true });
  return root;
}

function collectJavaScriptFiles(directory: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredJavaScriptDirectories.has(entry.name)) {
      continue;
    }
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectJavaScriptFiles(entryPath));
      continue;
    }
    if (entry.isFile() && javascriptExtensions.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }
  return files.sort();
}

function runScript(
  scriptName: string,
  args: string[],
  root: string,
): SpawnSyncReturns<string> {
  return childProcess.spawnSync(
    process.execPath,
    [path.join(scriptsDirectory, scriptName), ...args, "--root", root],
    { encoding: "utf8" },
  );
}

describe("JSON Schema templates", () => {
  it("requires the marketplace contract fields", () => {
    const schema = loadSchema("marketplace.schema.json") as MarketplaceSchema;

    expect(schema.$schema).toBe("https://json-schema.org/draft/2020-12/schema");
    expect(schema.type).toBe("object");
    expect(schema.additionalProperties).toBe(false);
    expect(schema.required).toEqual(["name", "interface", "plugins"]);
    expect(schema.$defs.pluginEntry.required).toEqual([
      "name",
      "source",
      "policy",
      "category",
    ]);
    expect(schema.$defs.policy.properties.installation.enum).toEqual([
      "NOT_AVAILABLE",
      "AVAILABLE",
      "INSTALLED_BY_DEFAULT",
    ]);
  });

  it("requires the plugin manifest and interface contract fields", () => {
    const schema = loadSchema("plugin.schema.json") as PluginSchema;

    expect(schema.$schema).toBe("https://json-schema.org/draft/2020-12/schema");
    expect(schema.type).toBe("object");
    expect(schema.additionalProperties).toBe(false);
    expect(schema.required).toEqual([
      "name",
      "version",
      "description",
      "author",
      "interface",
    ]);
    expect(schema.$defs.interface.required).toEqual([
      "displayName",
      "shortDescription",
      "longDescription",
      "developerName",
      "category",
      "capabilities",
    ]);
    expect(schema.$defs.interface.properties.screenshots.items.$ref).toBe(
      "#/$defs/screenshotPath",
    );
  });

  it("validates an empty marketplace structure", () => {
    const root = createFixture();
    try {
      const generation = runScript(
        "generate_manifests.cjs",
        ["marketplace"],
        root,
      );
      const validation = runScript("validate_manifests.cjs", ["all"], root);

      expect(generation.status).toBe(0);
      expect(validation.status).toBe(0);
      expect(validation.stdout).toContain("Validation passed: all");
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("generates and validates a plugin against the plugin schema", () => {
    const root = createFixture();
    try {
      const generation = runScript(
        "generate_manifests.cjs",
        ["plugin", "sample-plugin"],
        root,
      );
      const validation = runScript("validate_manifests.cjs", ["all"], root);

      expect(generation.status).toBe(0);
      expect(validation.status).toBe(0);
      expect(
        fs.existsSync(
          path.join(root, "plugins/sample-plugin/.codex-plugin/plugin.json"),
        ),
      ).toBe(true);
      expect(validation.stdout).toContain("Validation passed: all");
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("completes missing marketplace and plugin manifests", () => {
    const root = createFixture();
    try {
      const marketplace = runScript(
        "generate_manifests.cjs",
        ["complete", "marketplace"],
        root,
      );
      const plugin = runScript(
        "generate_manifests.cjs",
        ["complete", "plugin", "completed-plugin"],
        root,
      );
      const validation = runScript("validate_manifests.cjs", ["all"], root);

      expect(marketplace.status).toBe(0);
      expect(plugin.status).toBe(0);
      expect(validation.status).toBe(0);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects a plugin directory without its manifest", () => {
    const root = createFixture();
    try {
      fs.mkdirSync(path.join(root, "plugins/orphan-plugin"), {
        recursive: true,
      });
      const validation = runScript("validate_manifests.cjs", ["plugins"], root);

      expect(validation.status).toBe(1);
      expect(validation.stderr).toContain(
        "plugins/orphan-plugin is missing .codex-plugin/plugin.json",
      );
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("reports missing required plugin fields", () => {
    const root = createFixture();
    try {
      const generation = runScript(
        "generate_manifests.cjs",
        ["plugin", "broken-plugin"],
        root,
      );
      const manifestPath = path.join(
        root,
        "plugins/broken-plugin/.codex-plugin/plugin.json",
      );
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      delete manifest.description;
      fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

      const validation = runScript("validate_manifests.cjs", ["plugins"], root);

      expect(generation.status).toBe(0);
      expect(validation.status).toBe(1);
      expect(validation.stderr).toContain(
        "must have required property 'description'",
      );
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("TypeScript project boundaries", () => {
  it("includes type contracts and excludes runtime JavaScript", () => {
    const result = childProcess.spawnSync(
      process.execPath,
      [typescriptNativeBinary, "--showConfig", "--pretty", "false"],
      { cwd: repositoryRoot, encoding: "utf8" },
    );

    expect(result.status).toBe(0);
    const config = JSON.parse(result.stdout);
    expect(config.compilerOptions.allowJs).toBe(false);
    expect(config.compilerOptions.noEmit).toBe(true);
    expect(config.compilerOptions.skipLibCheck).toBe(false);
    expect(config.compilerOptions.noUncheckedIndexedAccess).toBe(true);
    expect(config.compilerOptions.exactOptionalPropertyTypes).toBe(true);
    expect(config.include).toEqual([
      "adapters/**/*.ts",
      "config/**/*.ts",
      "plugins/**/*.ts",
      "tests/**/*.ts",
      "types/**/*.d.ts",
      "*.ts",
    ]);
    expect(config.exclude).toEqual(
      expect.arrayContaining([
        "scripts/**/*.cjs",
        "scripts/**/*.mjs",
        "*.config.cjs",
        "*.config.mjs",
      ]),
    );
    expect(config.files).toEqual(
      expect.arrayContaining([
        expect.stringContaining("types/manifests.d.ts"),
        expect.stringContaining("tests/schemas.test.ts"),
        expect.stringContaining("tests/scripts.coverage.test.ts"),
      ]),
    );
    expect(config.files).not.toEqual(
      expect.arrayContaining([expect.stringMatching(/\.(?:cjs|mjs)$/u)]),
    );
  });

  it("keeps the distribution build config accepted by TypeScript", () => {
    const result = childProcess.spawnSync(
      process.execPath,
      [
        typescriptNativeBinary,
        "--project",
        buildConfig,
        "--noEmit",
        "--pretty",
        "false",
      ],
      { cwd: repositoryRoot, encoding: "utf8" },
    );

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
  });

  it("checks every JavaScript source and requires its check directive", () => {
    for (const configPath of [
      scriptsTypecheckConfig,
      editorScriptsTypecheckConfig,
    ]) {
      const result = childProcess.spawnSync(
        process.execPath,
        [typescriptNativeBinary, "--project", configPath, "--pretty", "false"],
        { cwd: repositoryRoot, encoding: "utf8" },
      );

      expect(result.status, configPath).toBe(0);
      expect(result.stderr, configPath).toBe("");
    }

    for (const filePath of collectJavaScriptFiles(repositoryRoot)) {
      const firstLines = fs
        .readFileSync(filePath, "utf8")
        .split("\n")
        .slice(0, 2)
        .map((line) => line.trim());
      expect(firstLines, filePath).toContain("// @ts-check");
    }
  });

  it("keeps TypeScript 7 CLI and TypeScript 6 API aliases available", () => {
    const native = childProcess.spawnSync(
      process.execPath,
      [typescriptNativeBinary, "--version"],
      { cwd: repositoryRoot, encoding: "utf8" },
    );
    const api = childProcess.spawnSync(
      process.execPath,
      [typescriptApiBinary, "--version"],
      { cwd: repositoryRoot, encoding: "utf8" },
    );

    expect(native.status).toBe(0);
    expect(native.stdout).toMatch(/^Version 7\./u);
    expect(api.status).toBe(0);
    expect(api.stdout).toMatch(/^Version 6\./u);
  });
});
