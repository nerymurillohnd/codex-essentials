#!/usr/bin/env node
// @ts-check

const path = require("node:path");
const {
  buildMarketplace,
  loadPluginManifests,
  resolveRootFromArgs,
  writeMarketplace,
} = require("./marketplace-contract.cjs");

function main() {
  const root = resolveRootFromArgs(
    process.argv.slice(2),
    path.resolve(__dirname, ".."),
  );
  const plugins = loadPluginManifests(root);
  const marketplace = buildMarketplace(root, plugins);
  writeMarketplace(root, marketplace);
  console.log(
    `Generated .agents/plugins/marketplace.json from ${plugins.length} plugin manifests.`,
  );
}

try {
  main();
} catch (error) {
  console.error(/** @type {Error} */ (error).message);
  process.exitCode = 1;
}
