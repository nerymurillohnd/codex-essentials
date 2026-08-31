import { defineConfig } from "vitest/config";
import { resolveCoverageInclude } from "./coverage-profiles.js";

const coverageInclude = resolveCoverageInclude(process.argv);

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: coverageInclude,
      exclude: ["**/node_modules/**"],
      reporter: ["text", "json", "json-summary"],
      thresholds: {
        perFile: true,
        lines: 96,
        functions: 96,
        branches: 96,
        statements: 96,
      },
    },
  },
});
