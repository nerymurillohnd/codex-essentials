import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { formatError } = require("../scripts/error-utils.cjs") as {
  formatError(error: unknown): string;
};

describe("error formatting", () => {
  it.each([
    [new Error("disk full"), "disk full"],
    [new Error(), "Error"],
    ["plain failure", "plain failure"],
    [42, "42"],
    [null, "null"],
    [undefined, "undefined"],
  ])("formats %p as %s", (error, expected) => {
    expect(formatError(error)).toBe(expected);
  });
});
