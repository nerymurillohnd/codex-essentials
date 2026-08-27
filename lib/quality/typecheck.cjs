#!/usr/bin/env node
// @ts-check

const path = require("node:path");
const childProcess = require("node:child_process");

const TYPESCRIPT_EXECUTABLE = "node_modules/@typescript/native/bin/tsc";
const NO_EMIT_ARGUMENT = "--noEmit";

function runTypecheck(root = path.resolve(__dirname, "..", ".."), io = {}) {
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

function main() {
  process.exitCode = runTypecheck();
}

// The module guard is exercised by the CLI tests; Vitest imports this module for unit coverage.
/* c8 ignore next */
if (require.main === module) {
  main();
}

module.exports = {
  main,
  runTypecheck,
};
