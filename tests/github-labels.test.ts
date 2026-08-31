import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { afterEach, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const labels = require("../scripts/github-labels.cjs") as {
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

function createFixture(
  contract: unknown,
  templates: Array<[string, string]> = [],
) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "github-labels-test-"));
  fixtures.push(root);
  fs.mkdirSync(path.join(root, ".github", "ISSUE_TEMPLATE"), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(root, ".github", "label-contract.json"),
    JSON.stringify(contract),
  );
  for (const [file, content] of templates) {
    fs.writeFileSync(
      path.join(root, ".github", "ISSUE_TEMPLATE", file),
      content,
    );
  }
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
  it("accepts issue templates using declared labels", () => {
    const root = createFixture(
      { labels: [definition("bug"), definition("plugin-change")] },
      [
        ["plugin-change.yml", "labels:\n  - plugin-change\n"],
        ["legacy.md", "---\nlabels: bug, plugin-change\n---\n# Legacy\n"],
      ],
    );

    expect(labels.validateLabelContract(root)).toEqual({
      labels: expect.arrayContaining([
        expect.objectContaining({ name: "bug" }),
        expect.objectContaining({ name: "plugin-change" }),
      ]),
      references: ["bug", "plugin-change"],
    });
  });

  it("rejects undeclared and wildcard labels", () => {
    const root = createFixture({ labels: [definition("bug")] }, [
      ["plugin-change.yml", 'labels:\n  - plugin-change\n  - "*"\n'],
    ]);

    const collection = labels.collectLabelReferences(root);
    expect(collection.errors).toContain(
      ".github/ISSUE_TEMPLATE/plugin-change.yml may not use the wildcard label",
    );
    expect(() => labels.validateLabelContract(root)).toThrow(
      /undefined GitHub labels: plugin-change/u,
    );
  });

  it("fails closed for malformed front matter and contract definitions", () => {
    const root = createFixture({ labels: [definition("bug")] }, [
      ["broken.md", "---\nlabels: bug\n# missing delimiter\n"],
    ]);
    expect(labels.collectLabelReferences(root).errors).toContain(
      ".github/ISSUE_TEMPLATE/broken.md has malformed or unterminated front matter",
    );

    const invalid = createFixture({ labels: [{ name: "bug" }] });
    expect(() => labels.loadLabelContract(invalid)).toThrow(
      "must have a six-character hex color",
    );
  });

  it("covers invalid template shapes and manifest definitions", () => {
    const root = createFixture({ labels: [definition("bug")] }, [
      ["scalar.yml", "- scalar\n"],
      ["invalid.yml", 'labels:\n  - 42\n  - ""\n'],
      ["wildcard.yml", 'labels:\n  - "*"\n'],
      ["empty.yml", "labels: scalar\n"],
      ["missing.yml", "name: Empty\n"],
      ["duplicate.yml", "labels:\n  - bug\n"],
      ["ignored.txt", "labels:\n  - ignored\n"],
      ["no-front-matter.md", "# No metadata\n"],
    ]);
    const collection = labels.collectLabelReferences(root);
    expect(collection.errors).toEqual(
      expect.arrayContaining([
        ".github/ISSUE_TEMPLATE/scalar.yml must contain a mapping",
        ".github/ISSUE_TEMPLATE/invalid.yml contains an invalid label entry",
        ".github/ISSUE_TEMPLATE/wildcard.yml may not use the wildcard label",
        ".github/ISSUE_TEMPLATE/empty.yml labels must be an array",
      ]),
    );

    expect(() => labels.loadLabelContract(createFixture({}))).toThrow(
      "must contain a labels array",
    );
    expect(() =>
      labels.loadLabelContract(createFixture({ labels: [{}] })),
    ).toThrow("must have a name");
    expect(() =>
      labels.loadLabelContract(
        createFixture({
          labels: [{ name: "bug", color: "fff", description: "Bug" }],
        }),
      ),
    ).toThrow("six-character hex color");
    expect(() =>
      labels.loadLabelContract(
        createFixture({
          labels: [{ name: "bug", color: "d73a4a", description: "" }],
        }),
      ),
    ).toThrow("must have a description");
    expect(() =>
      labels.loadLabelContract(
        createFixture({ labels: [definition("bug"), definition("bug")] }),
      ),
    ).toThrow("duplicate label");
  });
});
