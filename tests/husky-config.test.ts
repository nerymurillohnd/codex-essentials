import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const packageJsonPath = path.join(repositoryRoot, "package.json");
const npmrcPath = path.join(repositoryRoot, ".npmrc");
const expectedNodeEngine = ">=24";
const expectedHuskyVersion = "9.1.7";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readPackageJson(): Record<string, unknown> {
  const packageJson: unknown = JSON.parse(
    fs.readFileSync(packageJsonPath, "utf8"),
  );
  if (!isRecord(packageJson)) {
    throw new TypeError("package.json must contain a JSON object");
  }
  return packageJson;
}

function readStringRecord(
  object: Record<string, unknown>,
  key: string,
): Record<string, string> {
  const value = object[key];
  if (!isRecord(value)) {
    throw new TypeError(`${key} must contain an object`);
  }

  const entries = Object.entries(value);
  if (
    !entries.every(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    )
  ) {
    throw new TypeError(`${key} must contain string values`);
  }
  return Object.fromEntries(entries);
}

function readLintStagedConfig(
  packageJson: Record<string, unknown>,
): Record<string, readonly string[]> {
  const config = packageJson["lint-staged"];
  if (!isRecord(config)) {
    throw new TypeError("lint-staged must contain an object");
  }

  for (const [pattern, commands] of Object.entries(config)) {
    if (
      typeof pattern !== "string" ||
      !Array.isArray(commands) ||
      !commands.every((command) => typeof command === "string")
    ) {
      throw new TypeError("lint-staged entries must be command arrays");
    }
  }

  return config as Record<string, readonly string[]>;
}

describe("local hook package contract", () => {
  it("pins the Node.js runtime and npm engine policy", () => {
    const packageJson = readPackageJson();
    const engines = readStringRecord(packageJson, "engines");

    expect(engines["node"]).toBe(expectedNodeEngine);
    expect(fs.readFileSync(npmrcPath, "utf8").trim()).toBe(
      "engine-strict=true",
    );
  });

  it("declares Husky and lint-staged with the expected prepare script", () => {
    const packageJson = readPackageJson();
    const scripts = readStringRecord(packageJson, "scripts");
    const devDependencies = readStringRecord(packageJson, "devDependencies");

    expect(scripts["prepare"]).toBe("husky");
    expect(devDependencies["husky"]).toBe(expectedHuskyVersion);
    expect(devDependencies["lint-staged"]).toBeTypeOf("string");
  });

  it("formats authored files and lints only JavaScript-family files", () => {
    const packageJson = readPackageJson();
    const lintStaged = readLintStagedConfig(packageJson);

    expect(Object.keys(lintStaged).join("\n")).toContain("js");
    expect(Object.keys(lintStaged).join("\n")).toContain("cjs");
    expect(Object.keys(lintStaged).join("\n")).toContain("mjs");
    expect(Object.keys(lintStaged).join("\n")).toContain("ts");
    expect(Object.keys(lintStaged).join("\n")).toContain("json");
    expect(Object.keys(lintStaged).join("\n")).toContain("jsonc");
    expect(Object.keys(lintStaged).join("\n")).toContain("yaml");
    expect(Object.keys(lintStaged).join("\n")).toContain("md");

    const allCommands = Object.values(lintStaged).flat();
    expect(allCommands).toContain("prettier --write");
    expect(allCommands).toContain("eslint --fix --max-warnings=0");

    for (const [pattern, commands] of Object.entries(lintStaged)) {
      if (commands.includes("eslint --fix --max-warnings=0")) {
        expect(pattern).toContain("js");
        expect(pattern).toContain("cjs");
        expect(pattern).toContain("mjs");
        expect(pattern).not.toContain("ts");
      }
    }
  });
});
