import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
interface SourceDocument {
  marketplace: { name: string; displayName: string };
  plugins: Array<{ name: string; skills: Array<{ id: string }> }>;
}

const source = require("./source.cjs") as {
  assertNoTraversal(value: unknown, location: string): void;
  loadJson(path: string, kind: string): unknown;
  loadSource(root: string): SourceDocument;
  validateSchema(schema: unknown, payload: unknown, sourcePath: string): void;
  validateSemanticConstraints(payload: unknown): void;
};
const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);
const fixtures: string[] = [];

afterEach(() => {
  for (const fixture of fixtures.splice(0)) {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});

function createFixture(payload: unknown): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "codex-source-test-"));
  fixtures.push(root);
  fs.mkdirSync(path.join(root, "lib"), { recursive: true });
  fs.mkdirSync(path.join(root, "lib", "schemas"), { recursive: true });
  fs.copyFileSync(
    path.join(repositoryRoot, "lib", "schemas", "source.schema.json"),
    path.join(root, "lib", "schemas", "source.schema.json"),
  );
  fs.writeFileSync(
    path.join(root, "lib", "source.json"),
    `${JSON.stringify(payload, null, 2)}\n`,
    "utf8",
  );
  return root;
}

function basePlugin(name: string) {
  return {
    name,
    version: "1.0.0",
    description: "Contained plugin",
    author: { name: "Author" },
    repository: "https://example.test/plugins",
    license: "MIT",
    interface: {
      displayName: "Contained",
      shortDescription: "Contained plugin",
      longDescription: "Contained plugin description",
      developerName: "Author",
      category: "Productivity",
      capabilities: ["Skills"],
      defaultPrompt: "Use Contained",
    },
    marketplace: {
      category: "Productivity",
      installation: "AVAILABLE",
      authentication: "ON_INSTALL",
    },
    skills: [
      {
        id: "contained-skill",
        displayName: "Contained Skill",
        shortDescription: "Contained skill",
        defaultPrompt: "Use Contained Skill",
      },
    ],
  };
}

describe("declarative plugin source", () => {
  it("loads the repository source with one unique definition per published plugin", () => {
    const payload = source.loadSource(repositoryRoot);

    expect(payload.marketplace.name).toBe("codex-essentials");
    expect(payload.plugins.map((plugin) => plugin.name)).toEqual([
      "astro-cli-commands",
      "prettier-after-edit",
    ]);
    expect(payload.plugins[0]?.skills.map((skill) => skill.id)).toEqual([
      "astro-commands",
    ]);
  });

  it("rejects duplicate plugin identities before synchronization", () => {
    const root = createFixture({
      marketplace: { name: "catalog", displayName: "Catalog" },
      plugins: [basePlugin("duplicate"), basePlugin("duplicate")],
    });

    expect(() => source.loadSource(root)).toThrow("duplicate plugin name");
  });

  it("rejects source declarations whose asset path escapes a package", () => {
    const root = createFixture({
      marketplace: { name: "catalog", displayName: "Catalog" },
      plugins: [
        {
          ...basePlugin("contained"),
          interface: {
            ...basePlugin("contained").interface,
            logo: "./assets/../outside.png",
          },
        },
      ],
    });

    expect(() => source.loadSource(root)).toThrow("must not contain '..'");
  });

  it("reports unreadable JSON and schema failures with their source location", () => {
    expect(() => source.loadJson("/missing/source.json", "source")).toThrow(
      "unable to load source",
    );
    expect(() =>
      source.validateSchema({ type: "string" }, 42, "lib/source.json"),
    ).toThrow("lib/source.json is invalid");
  });

  it("rejects duplicate skill IDs and traversal nested in arrays or objects", () => {
    expect(() =>
      source.validateSemanticConstraints({
        plugins: [
          {
            name: "plugin",
            skills: [{ id: "skill" }, { id: "skill" }],
          },
        ],
      }),
    ).toThrow("duplicate skill id");
    expect(() =>
      source.assertNoTraversal({ entries: ["./safe", "../outside"] }, "plugin"),
    ).toThrow("must not contain '..'");
    expect(() => source.assertNoTraversal(null, "plugin")).not.toThrow();
    expect(() => source.assertNoTraversal(3, "plugin")).not.toThrow();
  });
});
