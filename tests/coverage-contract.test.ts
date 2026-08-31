import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  coverageProfiles,
  resolveCoverageInclude,
} from "../coverage-profiles.js";

const repositoryRoot = resolve(import.meta.dirname, "..");

describe("script coverage inventory", () => {
  it("includes every CJS module exactly once", () => {
    const discovered = readdirSync(resolve(repositoryRoot, "scripts"))
      .filter((file) => file.endsWith(".cjs"))
      .map((file) => `scripts/${file}`)
      .sort();
    const declared = Object.values(coverageProfiles).flat().sort();

    expect(declared).toEqual(discovered);
    expect(new Set(declared)).toHaveLength(declared.length);
  });

  it("unites each explicitly requested test profile", () => {
    expect(
      resolveCoverageInclude([
        "tests/github-labels.test.ts",
        "tests/path-utils.test.ts",
      ]).sort(),
    ).toEqual(
      [
        ...coverageProfiles["github-labels.test.ts"],
        ...coverageProfiles["path-utils.test.ts"],
      ].sort(),
    );
  });
});
