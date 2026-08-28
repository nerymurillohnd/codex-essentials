import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { afterEach, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const labels = require("./github-labels.cjs") as {
  collectLabelReferences(root: string): Map<string, string[]>;
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
          { name: "bug", color: "d73a4a", description: "Bug" },
          {
            name: "plugin-change",
            color: "1d76db",
            description: "Plugin change",
          },
          {
            name: "skip-changelog",
            color: "ffffff",
            description: "Exclude from changelog",
          },
        ],
      },
      templates: [["plugin-change.yml", "labels:\n  - plugin-change\n"]],
      release:
        "changelog:\n  categories:\n    - title: Fixes\n      labels:\n        - bug\n  exclude:\n    labels:\n      - skip-changelog\n",
    });

    expect(labels.validateLabelContract(root)).toEqual({
      labels: expect.arrayContaining([
        expect.objectContaining({ name: "bug" }),
        expect.objectContaining({ name: "plugin-change" }),
      ]),
      references: expect.arrayContaining([
        "bug",
        "plugin-change",
        "skip-changelog",
      ]),
    });
  });

  it("reports every referenced label that is not declared", () => {
    const root = createFixture({
      contract: { labels: [{ name: "bug" }] },
      templates: [
        ["plugin-change.yml", 'labels:\n  - plugin-change\n  - 42\n  - "*"\n'],
      ],
      release:
        'changelog:\n  categories:\n    - title: Changes\n      labels:\n        - plugin-change\n        - "*"\n    - title: Empty\n      labels: not-a-list\n  exclude:\n    labels: [plugin-change]\n',
    });

    expect(() => labels.validateLabelContract(root)).toThrow(
      "undefined GitHub labels: plugin-change (.github/ISSUE_TEMPLATE/plugin-change.yml, .github/release.yml, .github/release.yml)",
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

    const duplicate = createFixture({
      contract: { labels: [{ name: "bug" }, { name: "bug" }] },
    });
    expect(() => labels.loadLabelContract(duplicate)).toThrow(
      ".github/label-contract.json contains duplicate label: bug",
    );
  });

  it("ignores files and YAML shapes that cannot declare labels", () => {
    const root = createFixture({
      contract: { labels: [] },
      templates: [
        ["empty.yml", "name: Empty\n"],
        ["scalar.yml", "just a scalar\n"],
        ["notes.txt", "labels:\n  - ignored\n"],
      ],
      release: "changelog:\n  categories:\n    - 42\n  exclude: not-a-map\n",
    });
    fs.mkdirSync(path.join(root, ".github", "ISSUE_TEMPLATE", "nested.yml"));

    expect(labels.collectLabelReferences(root)).toEqual(new Map());

    fs.writeFileSync(path.join(root, ".github", "release.yml"), "[]\n");
    expect(labels.collectLabelReferences(root)).toEqual(new Map());
  });
});
