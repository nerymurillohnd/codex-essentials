#!/usr/bin/env node
// @ts-check

const path = require("node:path");
const {
  loadPluginManifests,
  resolveRootFromArgs,
} = require("./marketplace-contract.cjs");

function main() {
  const root = resolveRootFromArgs(
    process.argv.slice(2),
    path.resolve(__dirname, ".."),
  );
  const plugins = loadPluginManifests(root);
  console.log(
    `Validated ${plugins.length} complete plugin manifests against the template profile.`,
  );
}

try {
  main();
} catch (error) {
  console.error(/** @type {Error} */ (error).message);
  process.exitCode = 1;
}
