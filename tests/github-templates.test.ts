import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import { describe, expect, it } from "vitest";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const githubRoot = path.join(repositoryRoot, ".github");
const checkoutActionSha = "3d3c42e5aac5ba805825da76410c181273ba90b1";
const setupNodeActionSha = "820762786026740c76f36085b0efc47a31fe5020";

function read(relativePath: string): string {
  return fs.readFileSync(path.join(githubRoot, relativePath), "utf8");
}

describe("GitHub contribution contracts", () => {
  it("defines valid issue forms with required metadata", () => {
    for (const fileName of [
      "ISSUE_TEMPLATE/plugin-change.yml",
      "ISSUE_TEMPLATE/bug-report.yml",
    ]) {
      const document = YAML.parse(read(fileName)) as {
        name?: string;
        description?: string;
        body?: unknown[];
      };
      expect(document.name).toBeTypeOf("string");
      expect(document.description).toBeTypeOf("string");
      expect(document.body).toBeInstanceOf(Array);
      expect(document.body?.length).toBeGreaterThan(0);
    }
  });

  it("requires synchronization evidence in the pull request template", () => {
    const template = read("PULL_REQUEST_TEMPLATE.md");
    expect(template).toContain("README.md");
    expect(template).toContain("CHANGELOG.md");
    expect(template).toContain("plugin.json");
    expect(template).toContain("marketplace.json");
    expect(template).toContain("rollback");
  });

  it("defines release-note categories", () => {
    const document = YAML.parse(read("release.yml")) as {
      changelog?: { categories?: Array<{ title?: string }> };
    };
    const titles = document.changelog?.categories?.map(
      (category) => category.title,
    );
    expect(titles).toEqual(
      expect.arrayContaining([
        "Features",
        "Fixes",
        "Documentation",
        "Security",
        "Breaking Changes",
        "Maintenance",
      ]),
    );
  });

  it("defines secret-safe, pinned automation workflows", () => {
    for (const fileName of [
      "workflows/quality.yml",
      "workflows/documentation-gate.yml",
      "workflows/plugin-release.yml",
    ]) {
      const document = YAML.parse(read(fileName)) as {
        name?: string;
        permissions?: { contents?: string };
        jobs?: Record<string, unknown>;
      };
      expect(document.name).toBeTypeOf("string");
      expect(document.permissions?.contents).toBeTypeOf("string");
      expect(document.jobs).toBeTypeOf("object");
      const workflow = read(fileName);
      expect(workflow).toContain('node-version: "24"');
      expect(workflow).not.toContain("node-version-file:");
      expect(workflow).toContain(`uses: actions/checkout@${checkoutActionSha}`);
      expect(workflow).toContain(
        `uses: actions/setup-node@${setupNodeActionSha}`,
      );
    }
    const release = read("workflows/plugin-release.yml");
    expect(release).toContain(
      'gh release create "$RELEASE_TAG" "$PLUGIN_ARCHIVE" --draft --verify-tag',
    );
    expect(release).toContain("Changelog source: plugins/");
    expect(release).toContain('--repo "$GH_REPO"');
    expect(release).not.toContain("release-changelog-builder-action");
    expect(release).not.toContain("${{ steps.changelog.outputs.changelog }}");
    expect(release).not.toContain("cat ${{ secrets");
  });
});
