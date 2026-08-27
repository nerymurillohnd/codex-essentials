import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function read(relativePath: string): string {
  return fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

function normalizeText(value: string): string {
  return value.replace(/\s+/gu, " ").trim();
}

describe("hooks and quality gate documentation contract", () => {
  it("records the hook and quality gate architecture decision", () => {
    const adr = read("docs/decisions/adr-0005-hooks-and-quality-gates.md");

    for (const heading of [
      "## Context",
      "## Decision",
      "## Alternatives",
      "## Consequences",
      "## Security and Permissions",
      "## Compatibility",
      "## Rollback",
      "## Verification",
    ]) {
      expect(adr).toContain(heading);
    }

    expect(adr).toContain("2026-08-27");
    expect(adr).toContain("Husky 9.1.7");
    expect(adr).toContain("lint-staged 17.4.1");
    expect(adr).toContain("Husky 10 has not shipped");
    expect(adr).toContain("https://github.com/typicode/husky/releases");
    expect(adr).toContain("https://github.com/lint-staged/lint-staged");
  });

  it("documents contributor quality commands and local hook boundaries", () => {
    const docs = normalizeText(
      [
        read("README.md"),
        read("docs/agent-guidelines/quality.md"),
        read("docs/agent-guidelines/tooling.md"),
      ].join("\n"),
    );

    for (const phrase of [
      "local hooks are advisory",
      "CI is authoritative",
      "HUSKY=0 in CI",
      "Node 24",
      "full SHA pins",
      "TypeScript 7",
      "TypeScript 6",
      "branch-protection required checks",
      "release environment approval",
      "Rollback",
      "no-shim",
      "npm run format:check",
      "npm run lint -- --max-warnings=0",
      "npm run typecheck",
      "npm run typecheck:scripts",
      "npx tsc6 --noEmit",
      "npm test",
      "npm run validate:all",
      "actionlint",
      "HUSKY=0",
      "--no-verify",
    ]) {
      expect(docs).toContain(phrase);
    }
  });

  it("tracks unresolved GitHub-side configuration as pending debt", () => {
    const pendingDebt = normalizeText(read("docs/maintenance/pending-debt.md"));

    expect(pendingDebt).toContain("2026-08-27");
    expect(pendingDebt).toContain("GitHub remote");
    expect(pendingDebt).toContain("branch protection");
    expect(pendingDebt).toContain("protected `release` environment");
    expect(pendingDebt).toContain("Dependabot/security settings");
  });
});
