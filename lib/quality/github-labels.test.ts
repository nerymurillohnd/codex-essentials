import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { afterEach, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const labels = require("./github-labels.cjs") as {
  collectLabelReferences(root: string): {
    references: Map<string, string[]>;
    errors: string[];
  };
  loadLabelContract(root: string): Array<{
    name: string;
    color: string;
    description: string;
  }>;
  validateLabelContract(root: string): {
    labels: Array<{ name: string; color: string; description: string }>;
    references: string[];
  };
};
const fixtures: string[] = [];

function createFixture(options: {
  contract: unknown;
  release?: string;
  templates?: Array<[string, string]>;
}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "github-labels-test-"));
  fixtures.push(root);
  fs.mkdirSync(path.join(root, ".github", "ISSUE_TEMPLATE"), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(root, ".github", "label-contract.json"),
    JSON.stringify(options.contract),
  );
  for (const [file, content] of options.templates ?? []) {
    fs.writeFileSync(
      path.join(root, ".github", "ISSUE_TEMPLATE", file),
      content,
    );
  }
  fs.writeFileSync(
    path.join(root, ".github", "release.yml"),
    options.release ?? "changelog: {}\n",
  );
  return root;
}

function definition(name: string) {
  return { name, color: "d73a4a", description: name };
}

afterEach(() => {
  for (const fixture of fixtures.splice(0)) {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});

describe("GitHub label contract", () => {
  it("accepts issue and release configuration using declared labels", () => {
    const root = createFixture({
      contract: {
        labels: [
          definition("bug"),
          definition("plugin-change"),
          definition("skip-changelog"),
        ],
      },
      templates: [
        ["plugin-change.yml", "labels:\n  - plugin-change\n"],
        [
          "legacy.md",
          "---\nlabels: bug, plugin-change\n---\n# Legacy template\n",
        ],
        ["legacy-empty.md", "# No front matter\n"],
      ],
      release:
        'changelog:\n  categories:\n    - title: Fixes\n      labels:\n        - bug\n        - "*"\n  exclude:\n    labels:\n      - skip-changelog\n',
    });

    expect(labels.validateLabelContract(root)).toEqual({
      labels: expect.arrayContaining([
        expect.objectContaining({ name: "bug" }),
        expect.objectContaining({ name: "plugin-change" }),
      ]),
      references: ["bug", "plugin-change", "skip-changelog"],
    });
  });

  it("reports undefined labels and malformed declarations", () => {
    const root = createFixture({
      contract: { labels: [definition("bug")] },
      templates: [
        ["plugin-change.yml", 'labels:\n  - plugin-change\n  - 42\n  - "*"\n'],
        ["legacy-bad.md", "---\n- not a mapping\n---\n"],
        ["legacy-invalid-labels.md", "---\nlabels: 42\n---\n"],
      ],
      release:
        'changelog:\n  categories:\n    - title: Changes\n      labels:\n        - plugin-change\n        - "*"\n    - title: Empty\n      labels: not-a-list\n    - 42\n  exclude: not-a-map\n',
    });

    const collection = labels.collectLabelReferences(root);
    expect(collection.errors).toEqual(
      expect.arrayContaining([
        ".github/ISSUE_TEMPLATE/legacy-bad.md must contain a mapping",
        ".github/ISSUE_TEMPLATE/legacy-invalid-labels.md labels must be an array",
        ".github/ISSUE_TEMPLATE/plugin-change.yml contains an invalid label entry",
        ".github/ISSUE_TEMPLATE/plugin-change.yml may not use the wildcard label outside release categories",
        ".github/release.yml labels must be an array",
        ".github/release.yml category must be a mapping",
        ".github/release.yml exclude must be a mapping",
      ]),
    );
    expect(collection.errors).toHaveLength(7);
    expect(() => labels.validateLabelContract(root)).toThrow(
      /undefined GitHub labels: plugin-change \(/u,
    );
  });

  it("rejects malformed and duplicate contract definitions", () => {
    const malformed = createFixture({ contract: {} });
    expect(() => labels.loadLabelContract(malformed)).toThrow(
      ".github/label-contract.json must contain a labels array",
    );

    const unnamed = createFixture({ contract: { labels: [{}] } });
    expect(() => labels.loadLabelContract(unnamed)).toThrow(
      ".github/label-contract.json label 1 must have a name",
    );

    const invalidColor = createFixture({
      contract: {
        labels: [{ name: "bug", color: "fff", description: "Bug" }],
      },
    });
    expect(() => labels.loadLabelContract(invalidColor)).toThrow(
      "must have a six-character hex color",
    );

    const unnamedDescription = createFixture({
      contract: {
        labels: [{ name: "bug", color: "d73a4a", description: "" }],
      },
    });
    expect(() => labels.loadLabelContract(unnamedDescription)).toThrow(
      "must have a description",
    );

    const duplicate = createFixture({
      contract: { labels: [definition("bug"), definition("bug")] },
    });
    expect(() => labels.loadLabelContract(duplicate)).toThrow(
      ".github/label-contract.json contains duplicate label: bug",
    );
  });

  it("fails closed for invalid YAML shapes and ignores unrelated files", () => {
    const root = createFixture({
      contract: { labels: [] },
      templates: [
        ["empty.yml", "name: Empty\n"],
        ["scalar.yml", "name: Scalar\n"],
        ["notes.txt", "labels:\n  - ignored\n"],
      ],
      release: "changelog: {}\n",
    });
    fs.mkdirSync(path.join(root, ".github", "ISSUE_TEMPLATE", "nested.yml"));

    expect(labels.collectLabelReferences(root)).toEqual({
      references: new Map(),
      errors: [],
    });

    fs.writeFileSync(path.join(root, ".github", "release.yml"), "[]\n");
    expect(labels.collectLabelReferences(root).errors).toEqual([
      ".github/release.yml must contain a mapping",
    ]);
  });

  it("handles release configurations with optional and invalid sections", () => {
    const root = createFixture({
      contract: { labels: [] },
      release: "other: value\n",
    });
    expect(labels.collectLabelReferences(root)).toEqual({
      references: new Map(),
      errors: [],
    });

    fs.writeFileSync(
      path.join(root, ".github", "release.yml"),
      "changelog: scalar\n",
    );
    expect(labels.collectLabelReferences(root).errors).toEqual([
      ".github/release.yml changelog must be a mapping",
    ]);

    fs.writeFileSync(
      path.join(root, ".github", "release.yml"),
      "changelog:\n  categories: scalar\n",
    );
    expect(labels.collectLabelReferences(root).errors).toEqual([
      ".github/release.yml categories must be an array",
    ]);
  });
});
