#!/usr/bin/env node
// @ts-check

const fs = require("node:fs");
const path = require("node:path");
const { resolveContainedPath } = require("./path-utils.cjs");

const OUTPUT_FIELDS = [
  "release_created",
  "tag_name",
  "version",
  "sha",
  "upload_url",
  "html_url",
  "body",
];

/** @typedef {Record<string, unknown>} JsonObject */

/** @param {unknown} value @returns {value is JsonObject} */
function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** @param {string[]} args @param {string} defaultRoot */
function parseArguments(args, defaultRoot) {
  let root = defaultRoot;
  let output;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    const value = args[index + 1];
    if (argument === "--root" || argument === "--output") {
      if (!value || value.startsWith("--")) {
        throw new Error(usage());
      }
      if (argument === "--root") {
        root = path.resolve(value);
      }
      if (argument === "--output") {
        output = value;
      }
      index += 1;
    } else {
      throw new Error(usage());
    }
  }
  if (!output) {
    throw new Error(usage());
  }
  return { root, output };
}

function usage() {
  return "usage: [--root <repository-root>] --output <json>";
}

/** @param {string} root */
function configuredPaths(root) {
  const configPath = path.join(root, "release-please-config.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  if (!isObject(config) || !isObject(config.packages)) {
    throw new Error(
      "release-please-config.json must contain a packages object",
    );
  }
  return Object.keys(config.packages).sort();
}

/** @param {string} componentPath @param {string} field */
function environmentKey(componentPath, field) {
  const componentKey = componentPath
    .replace(/[^A-Za-z0-9]+/gu, "_")
    .toUpperCase();
  return `RELEASE_OUTPUT__${componentKey}__${field.toUpperCase()}`;
}

/** @param {string} root @param {Record<string, string | undefined>} environment */
function captureReleasePleaseOutputs(root, environment) {
  const outputs = {
    releases_created: environment.RELEASES_CREATED ?? "",
    paths_released: environment.PATHS_RELEASED ?? "[]",
    prs_created: environment.PRS_CREATED ?? "",
    pr: environment.PR ?? "",
    prs: environment.PRS ?? "",
  };
  for (const componentPath of configuredPaths(root)) {
    for (const field of OUTPUT_FIELDS) {
      outputs[`${componentPath}--${field}`] =
        environment[environmentKey(componentPath, field)] ?? "";
    }
  }
  return outputs;
}

function main() {
  const options = parseArguments(
    process.argv.slice(2),
    path.resolve(__dirname, ".."),
  );
  const outputs = captureReleasePleaseOutputs(options.root, process.env);
  const outputPath = resolveContainedPath(options.root, options.output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(outputs, null, 2)}\n`, "utf8");
  console.log(
    `Captured ${Object.keys(outputs).length} Release Please outputs.`,
  );
}

try {
  if (require.main === module) {
    main();
  }
} catch (error) {
  console.error(/** @type {Error} */ (error).message);
  process.exitCode = 1;
}

module.exports = {
  OUTPUT_FIELDS,
  captureReleasePleaseOutputs,
  configuredPaths,
  environmentKey,
  parseArguments,
};
