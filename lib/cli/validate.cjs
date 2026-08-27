#!/usr/bin/env node
// @ts-check

const path = require("node:path");
const fs = require("node:fs");

const { loadJson, loadSource, validateSchema } = require("../core/source.cjs");
const { syncAll } = require("./sync.cjs");
const { validatePackage } = require("../validate/package.cjs");

const MARKETPLACE_PATH = path.join(".agents", "plugins", "marketplace.json");
const MARKETPLACE_SCHEMA = path.join(
  "lib",
  "schemas",
  "marketplace.schema.json",
);

/** @param {string} root */
function validateAll(root) {
  let source;
  try {
    source = loadSource(root);
  } catch (error) {
    return [/** @type {Error} */ (error).message];
  }
  const errors = [...syncAll(root), ...validateMarketplace(root)];
  const declared = new Set(source.plugins.map((plugin) => plugin.name));
  for (const pluginName of findPluginDirectories(root)) {
    if (!declared.has(pluginName)) {
      errors.push(`plugins/${pluginName} is not declared in lib/source.json`);
    }
  }
  for (const plugin of source.plugins) {
    errors.push(...validatePackage(root, plugin.name));
  }
  return errors;
}

/** @param {string} root */
function findPluginDirectories(root) {
  const pluginsRoot = path.join(root, "plugins");
  try {
    return fs
      .readdirSync(pluginsRoot, { withFileTypes: true })
      .filter((entry) => !entry.name.startsWith(".") && entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  } catch {
    return [];
  }
}

/** @param {string} root */
function validateMarketplace(root) {
  const marketplacePath = path.join(root, MARKETPLACE_PATH);
  try {
    validateSchema(
      loadJson(path.join(root, MARKETPLACE_SCHEMA), "marketplace schema"),
      loadJson(marketplacePath, "marketplace catalog"),
      marketplacePath,
    );
    return [];
  } catch (error) {
    return [/** @type {Error} */ (error).message];
  }
}

function main() {
  const args = process.argv.slice(2);
  const rootIndex = args.indexOf("--root");
  const rootArgument = rootIndex === -1 ? undefined : args[rootIndex + 1];
  if (rootIndex !== -1 && !rootArgument) {
    throw new Error("--root requires a path");
  }
  for (const argument of args) {
    if (argument !== "--root" && argument !== rootArgument) {
      throw new Error(`unknown argument: ${argument}`);
    }
  }
  const root = rootArgument
    ? path.resolve(rootArgument)
    : path.resolve(__dirname, "..", "..");
  const errors = validateAll(root);
  if (errors.length === 0) {
    console.log(`Validation passed: ${root}`);
    return;
  }
  for (const error of errors) {
    console.error(error);
  }
  process.exitCode = 1;
}

/* c8 ignore next */
if (require.main === module) {
  main();
}

module.exports = {
  findPluginDirectories,
  main,
  validateAll,
  validateMarketplace,
};
