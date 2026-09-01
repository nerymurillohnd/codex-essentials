import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const repositoryRoot = resolve(import.meta.dirname, "..");
const cli = resolve(repositoryRoot, "node_modules/.bin/markdownlint-cli2");
const ruleConfig = resolve(repositoryRoot, ".markdownlint-cli2.jsonc");
const roots: string[] = [];

function lint(source: string) {
  const root = mkdtempSync(join(tmpdir(), "markdownlint-config-"));
  roots.push(root);
  const target = join(root, "README.md");
  writeFileSync(target, source);
  return spawnSync(cli, ["--config", ruleConfig, "--no-globs", `:${target}`], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
}

function lintExisting(relativePath: string) {
  return spawnSync(
    cli,
    ["--config", ruleConfig, "--no-globs", `:${relativePath}`],
    {
      cwd: repositoryRoot,
      encoding: "utf8",
    },
  );
}

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("markdownlint repository configuration", () => {
  it("does not enforce Prettier-owned line length", () => {
    const result = lint(`# Title\n\n${"x".repeat(120)}\n`);
    expect(result.status, result.stderr).toBe(0);
  });

  it("allows the repository's intentional details markup", () => {
    const result = lint(
      "# Title\n\n<details>\n<summary>More</summary>\n\nText\n</details>\n",
    );
    expect(result.status, result.stderr).toBe(0);
  });

  it("rejects a second top-level heading", () => {
    const result = lint("# Title\n\n# Deliberate formatting error **\n");
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("MD025/single-title");
  });

  it("applies the license override", () => {
    const result = lintExisting("plugins/prettier-after-edit/LICENSE.md");
    expect(result.status, result.stderr).toBe(0);
  });

  it("applies the ADR template overrides", () => {
    const result = lintExisting("docs/decisions/adr-template.md");
    expect(result.status, result.stderr).toBe(0);
  });

  it("wires Markdown linting into check after formatting", () => {
    const packageJson = JSON.parse(
      readFileSync(resolve(repositoryRoot, "package.json"), "utf8"),
    ) as {
      scripts: Record<string, string>;
      "lint-staged": Record<string, string[]>;
    };
    expect(packageJson.scripts["check"]).toContain(
      "npm run format:check && npm run lint -- --max-warnings=0 && npm run lint:markdown",
    );
    expect(packageJson["lint-staged"]["*.{md,markdown}"]).toEqual([
      "prettier --write",
      "markdownlint-cli2 --fix --no-globs --",
    ]);
  });
});
