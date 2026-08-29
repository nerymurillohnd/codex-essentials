#!/usr/bin/env node
// @ts-check

const path = require("node:path");
const { validateLabelContract } = require("../lib/quality/github-labels.cjs");

try {
  const result = validateLabelContract(path.resolve(__dirname, ".."));
  console.log(
    `GitHub label contract passed: ${result.labels.length} labels, ${result.references.length} referenced`,
  );
} catch (error) {
  console.error(/** @type {Error} */ (error).message);
  process.exitCode = 1;
}
