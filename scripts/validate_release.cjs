#!/usr/bin/env node
// @ts-check

const fs = require("node:fs");
const path = require("node:path");

const TAG_PATTERN =
  /^plugin\/([A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*)\/v((?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?)$/u;
const PLUGIN_MANIFEST = ".codex-plugin/plugin.json";
const CHANGELOG_FILE = "CHANGELOG.md";
const UNRELEASED_HEADING = "## [Unreleased]";
const PLUGINS_DIRECTORY = "plugins";
const ROOT_OPTION = "--root";

/** @param {string[]} argv */
function parseArgs(argv) {
  let root = path.resolve(__dirname, "..");
  let tag = "";

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === ROOT_OPTION) {
      const candidate = argv[index + 1];
      if (!candidate) {
        throw new Error(`${ROOT_OPTION} requires a path`);
      }
      root = path.resolve(candidate);
      index += 1;
      continue;
    }
    if (!tag) {
      tag = argument;
      continue;
    }
    throw new Error(`unknown argument: ${argument}`);
  }

  return { root, tag };
}

/** @param {string} root */
function hasPluginPackages(root) {
  const pluginsRoot = path.join(root, PLUGINS_DIRECTORY);
  if (!fs.existsSync(pluginsRoot) || !fs.statSync(pluginsRoot).isDirectory()) {
    return false;
  }
  return fs
    .readdirSync(pluginsRoot, { withFileTypes: true })
    .some((entry) => entry.isDirectory() && !entry.name.startsWith("."));
}

/**
 * @param {string} tag
 * @returns {{pluginName: string, version: string} | undefined}
 */
function parsePluginTag(tag) {
  const match = TAG_PATTERN.exec(tag);
  if (!match) {
    return undefined;
  }
  return { pluginName: match[1], version: match[2] };
}

/**
 * @param {string} root
 * @param {string} tag
 */
function validateRelease(root, tag) {
  const parsed = parsePluginTag(tag);
  if (!parsed) {
    return { errors: [`tag '${tag}' must match plugin/<id>/v<semver>`] };
  }
  const pluginRoot = path.join(root, PLUGINS_DIRECTORY, parsed.pluginName);
  const manifestPath = path.join(pluginRoot, PLUGIN_MANIFEST);
  const errors = [];
  if (!fs.existsSync(manifestPath)) {
    errors.push(`plugin manifest is missing: ${manifestPath}`);
  } else {
    let manifest;
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    } catch (error) {
      errors.push(`plugin manifest is invalid: ${errorMessage(error)}`);
    }
    if (manifest && typeof manifest === "object" && !Array.isArray(manifest)) {
      if (manifest.name !== parsed.pluginName) {
        errors.push(
          `manifest name must match tag plugin '${parsed.pluginName}'`,
        );
      }
      if (manifest.version !== parsed.version) {
        errors.push(
          `manifest version must match tag version '${parsed.version}'`,
        );
      }
    }
  }

  const changelogPath = path.join(pluginRoot, CHANGELOG_FILE);
  if (!fs.existsSync(changelogPath)) {
    errors.push(`changelog is missing: ${changelogPath}`);
  } else {
    const changelog = fs.readFileSync(changelogPath, "utf8");
    if (!changelog.split("\n").includes(UNRELEASED_HEADING)) {
      errors.push(`${changelogPath} must include ${UNRELEASED_HEADING}`);
    }
  }

  return {
    errors,
    pluginName: parsed.pluginName,
    version: parsed.version,
  };
}

/** @param {unknown} error */
function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

/* c8 ignore start */
function main() {
  const { root, tag } = parseArgs(process.argv.slice(2));
  if (!tag) {
    if (!hasPluginPackages(root)) {
      console.log(
        "Release validation skipped: no plugin release tag supplied and plugins/ contains no plugin packages",
      );
      return;
    }
    console.error("release tag is required when plugins/ contains packages");
    process.exitCode = 1;
    return;
  }
  const result = validateRelease(root, tag);
  if (result.errors.length > 0) {
    for (const error of result.errors) {
      console.error(error);
    }
    process.exitCode = 1;
    return;
  }
  console.log(
    `Release validation passed: ${result.pluginName} ${result.version}`,
  );
}
/* c8 ignore stop */

/* c8 ignore next */
if (require.main === module) {
  main();
}

module.exports = {
  errorMessage,
  hasPluginPackages,
  main,
  parseArgs,
  parsePluginTag,
  validateRelease,
};
