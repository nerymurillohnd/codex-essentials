#!/usr/bin/env node
// @ts-check

const path = require("node:path");
const childProcess = require("node:child_process");

const TYPESCRIPT_EXECUTABLE = "node_modules/@typescript/native/bin/tsc";
const NO_EMIT_ARGUMENT = "--noEmit";

/** @param {string[]} args @param {string} defaultRoot */
function resolveRootFromArgs(args, defaultRoot) {
  if (args.length === 0) {
    return defaultRoot;
  }
  if (args.length === 2 && args[0] === "--root" && !args[1].startsWith("--")) {
    return path.resolve(args[1]);
  }
  throw new Error("usage: --root <repository-root>");
}

function runTypecheck(root = path.resolve(__dirname, ".."), io = {}) {
  const tscPath = path.join(root, TYPESCRIPT_EXECUTABLE);
  const result = childProcess.spawnSync(
    process.execPath,
    [tscPath, NO_EMIT_ARGUMENT],
    {
      cwd: root,
      stdio: io.stdio ?? "inherit",
    },
  );
  return result.status ?? 1;
}

/** @param {string[]} args */
function main(args = process.argv.slice(2)) {
  process.exitCode = runTypecheck(
    resolveRootFromArgs(args, path.resolve(__dirname, "..")),
  );
}

// The module guard is exercised by the CLI tests; Vitest imports this module for unit coverage.
/* c8 ignore next */
if (require.main === module) {
  main();
}

module.exports = {
  main,
  resolveRootFromArgs,
  runTypecheck,
};
