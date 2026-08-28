#!/usr/bin/env node
// @ts-check

const path = require("node:path");
const { spawnSync } = require("node:child_process");

/** @param {string[]} args @param {string} defaultRoot */
function parseArguments(args, defaultRoot) {
  let root = defaultRoot;
  let base;
  let head;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    const value = args[index + 1];
    if (argument === "--root" && value) {
      root = path.resolve(value);
      index += 1;
    } else if (argument === "--base" && value) {
      base = value;
      index += 1;
    } else if (argument === "--head" && value) {
      head = value;
      index += 1;
    } else {
      throw new Error("usage: --base <base> --head <head>");
    }
  }
  if (!base || !head) {
    throw new Error("usage: --base <base> --head <head>");
  }
  return { root, base, head };
}

/** @param {string} root @param {string} base @param {string} head */
function changedPluginFiles(root, base, head) {
  const result = spawnSync(
    "git",
    ["diff", "--name-only", `${base}...${head}`, "--", "plugins"],
    { cwd: root, encoding: "utf8" },
  );
  if (result.status !== 0) {
    throw new Error(
      (result.stderr || "unable to inspect plugin changes").trim(),
    );
  }
  return (result.stdout || "")
    .split(/\r?\n/u)
    .map((file) => file.trim())
    .filter(Boolean);
}

/** @param {string[]} files */
function validatePluginDocumentation(files) {
  const pluginFiles = new Map();
  for (const file of files) {
    const match = /^plugins\/([^/]+)\/(.+)$/u.exec(file);
    if (!match) {
      continue;
    }
    const pluginId = match[1];
    const relativeFile = match[2];
    const changed = pluginFiles.get(pluginId) || new Set();
    changed.add(relativeFile);
    pluginFiles.set(pluginId, changed);
  }
  const errors = [];
  for (const [pluginId, changed] of pluginFiles) {
    const productChanged = [...changed].some(
      (file) => file !== "README.md" && file !== "CHANGELOG.md",
    );
    if (!productChanged) {
      continue;
    }
    if (!changed.has("README.md")) {
      errors.push(
        `plugins/${pluginId}/README.md must change with product files`,
      );
    }
    if (!changed.has("CHANGELOG.md")) {
      errors.push(
        `plugins/${pluginId}/CHANGELOG.md must change with product files`,
      );
    }
  }
  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }
}

function main() {
  const { root, base, head } = parseArguments(
    process.argv.slice(2),
    path.resolve(__dirname, ".."),
  );
  validatePluginDocumentation(changedPluginFiles(root, base, head));
  console.log("Plugin documentation gate passed.");
}

try {
  main();
} catch (error) {
  console.error(/** @type {Error} */ (error).message);
  process.exitCode = 1;
}

module.exports = {
  changedPluginFiles,
  parseArguments,
  validatePluginDocumentation,
};
