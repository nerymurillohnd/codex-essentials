#!/usr/bin/env node
// @ts-check

const fs = require("node:fs");
const path = require("node:path");
const { loadPluginManifests } = require("./marketplace-contract.cjs");

const RELEASE_TAG_PATTERN =
  /^plugin\/([a-z0-9]+(?:-[a-z0-9]+)*)\/v((?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)(?:-(?:0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*))*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?)$/u;

/** @param {string[]} args @param {string} defaultRoot */
function parseArguments(args, defaultRoot) {
  let root = defaultRoot;
  /** @type {string | undefined} */
  let tag;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    const value = args[index + 1];
    if (argument === "--root") {
      if (!value || value.startsWith("--")) {
        throw new Error(
          "usage: [--root <repository-root>] plugin/<id>/v<semver>",
        );
      }
      root = path.resolve(value);
      index += 1;
    } else if (argument.startsWith("--")) {
      throw new Error(
        "usage: [--root <repository-root>] plugin/<id>/v<semver>",
      );
    } else if (!tag) {
      tag = argument;
    } else {
      throw new Error(
        "usage: [--root <repository-root>] plugin/<id>/v<semver>",
      );
    }
  }
  if (!tag) {
    throw new Error("usage: [--root <repository-root>] plugin/<id>/v<semver>");
  }
  return { root, tag };
}

/** @param {string} tag */
function parseReleaseTag(tag) {
  const match = RELEASE_TAG_PATTERN.exec(tag);
  if (!match) {
    throw new Error(`invalid release tag: ${tag}`);
  }
  return { pluginId: match[1], version: match[2] };
}

/** @param {string} root @param {string} tag */
function validateRelease(root, tag) {
  const { pluginId, version } = parseReleaseTag(tag);
  const plugins = loadPluginManifests(root);
  const plugin = plugins.find((entry) => entry.name === pluginId);
  if (!plugin) {
    throw new Error(`release tag plugin is not present: ${pluginId}`);
  }
  if (plugin.manifest.version !== version) {
    throw new Error(
      `${tag} does not match manifest version ${plugin.manifest.version}`,
    );
  }
  const changelogPath = path.join(plugin.pluginRoot, "CHANGELOG.md");
  const changelog = fs.readFileSync(changelogPath, "utf8");
  const heading = new RegExp(
    `^## \\[${escapeRegExp(version)}\\] - \\d{4}-\\d{2}-\\d{2}\\s*$`,
    "mu",
  );
  if (!heading.test(changelog)) {
    throw new Error(
      `plugins/${pluginId}/CHANGELOG.md is missing release section for ${version}`,
    );
  }
  return { pluginId, version };
}

/** @param {string} value */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function main() {
  const { root, tag } = parseArguments(
    process.argv.slice(2),
    path.resolve(__dirname, ".."),
  );
  const { pluginId, version } = validateRelease(root, tag);
  console.log(`Release validation passed: ${pluginId} ${version}`);
}

try {
  main();
} catch (error) {
  console.error(/** @type {Error} */ (error).message);
  process.exitCode = 1;
}

module.exports = { parseArguments, parseReleaseTag, validateRelease };
