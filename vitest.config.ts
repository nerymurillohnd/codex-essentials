import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: ["lib/**/*.cjs"],
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
