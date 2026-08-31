#!/usr/bin/env node
// @ts-check

const path = require("node:path");
const { validateLabelContract } = require("./github-labels.cjs");
const { formatError } = require("./error-utils.cjs");

/** @param {string[] | string} args @param {string} defaultRoot */
function resolveRootFromArgs(args, defaultRoot) {
  if (typeof args === "string") {
    return args;
  }
  if (args.length === 0) {
    return defaultRoot;
  }
  if (args.length === 2 && args[0] === "--root" && !args[1].startsWith("--")) {
    return path.resolve(args[1]);
  }
  throw new Error("usage: --root <repository-root>");
}

/** @param {string[] | string} args */
function main(args = process.argv.slice(2)) {
  const root = resolveRootFromArgs(args, path.resolve(__dirname, ".."));
  const result = validateLabelContract(root);
  return `GitHub label contract passed: ${result.labels.length} labels, ${result.references.length} referenced`;
}

/** @param {string[] | string} args @param {{log(message: string): void, error(message: string): void}} io */
function run(args = process.argv.slice(2), io = console) {
  try {
    io.log(main(args));
    return 0;
  } catch (error) {
    io.error(formatError(error));
    return 1;
  }
}

/* c8 ignore next 3 -- exercised through child-process integration tests. */
if (require.main === module) {
  process.exitCode = run();
}

module.exports = { main, resolveRootFromArgs, run };
