#!/usr/bin/env node
// @ts-check

const path = require("node:path");
const {
  buildMarketplace,
  loadMarketplace,
  loadPluginManifests,
  resolveRootFromArgs,
} = require("./marketplace-contract.cjs");

function main() {
  const root = resolveRootFromArgs(
    process.argv.slice(2),
    path.resolve(__dirname, ".."),
  );
  const marketplace = loadMarketplace(root);
  const plugins = loadPluginManifests(root);
  const expected = buildMarketplace(root, plugins);
  if (JSON.stringify(marketplace) !== JSON.stringify(expected)) {
    throw new Error(
      ".agents/plugins/marketplace.json does not exactly match the validated plugin manifests",
    );
  }
  console.log(
    `Validated marketplace schema and reverse-linked ${plugins.length} plugin manifests.`,
  );
}

try {
  main();
} catch (error) {
  console.error(/** @type {Error} */ (error).message);
  process.exitCode = 1;
}
