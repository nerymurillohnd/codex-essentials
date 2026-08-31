#!/usr/bin/env node
// @ts-check

const path = require("node:path");
const { formatError } = require("./error-utils.cjs");
const {
  buildMarketplace,
  loadPluginManifests,
  resolveRootFromArgs,
  writeMarketplace,
} = require("./marketplace-contract.cjs");

/** @param {string[]} args */
function main(args = process.argv.slice(2)) {
  const root = resolveRootFromArgs(args, path.resolve(__dirname, ".."));
  const plugins = loadPluginManifests(root);
  const marketplace = buildMarketplace(root, plugins);
  writeMarketplace(root, marketplace);
  console.log(
    `Generated .agents/plugins/marketplace.json from ${plugins.length} plugin manifests.`,
  );
}

/** @param {string[]} args */
function run(args = process.argv.slice(2)) {
  try {
    main(args);
    return 0;
  } catch (error) {
    console.error(formatError(error));
    return 1;
  }
}

/* c8 ignore next 3 -- exercised through the child-process integration test. */
if (require.main === module) {
  process.exitCode = run();
}

module.exports = { main, run };
