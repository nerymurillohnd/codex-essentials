#!/usr/bin/env node
// @ts-check

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");
const { configuredPaths } = require("./capture-release-please-outputs.cjs");

const RELEASE_TAG_PATTERN =
  /^plugin\/(?<name>[a-z0-9]+(?:-[a-z0-9]+)*)\/v(?<version>(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)(?:-(?:0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*))*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?)$/u;

/** @typedef {Record<string, unknown>} JsonObject */

/** @param {unknown} value @returns {value is JsonObject} */
function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** @param {unknown} value */
function isTrue(value) {
  return value === true || value === "true";
}

/** @param {unknown} value */
function parsePathsReleased(value) {
  if (Array.isArray(value)) {
    if (!value.every((entry) => typeof entry === "string")) {
      throw new Error("paths_released must contain only strings");
    }
    return value;
  }
  if (typeof value !== "string") {
    throw new Error("paths_released must be a JSON array string");
  }
  try {
    return parsePathsReleased(JSON.parse(value));
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("paths_released")) {
      throw error;
    }
    throw new Error(`paths_released is not valid JSON: ${value}`);
  }
}

/** @param {string[]} args @param {string} defaultRoot */
function parseArguments(args, defaultRoot) {
  let root = defaultRoot;
  let outputs;
  let expectedSha;
  let output;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    const value = args[index + 1];
    if (
      argument === "--root" ||
      argument === "--outputs" ||
      argument === "--expected-sha" ||
      argument === "--output"
    ) {
      if (!value || value.startsWith("--")) {
        throw new Error(usage());
      }
      if (argument === "--root") {
        root = path.resolve(value);
      }
      if (argument === "--outputs") {
        outputs = value;
      }
      if (argument === "--expected-sha") {
        expectedSha = value;
      }
      if (argument === "--output") {
        output = value;
      }
      index += 1;
    } else {
      throw new Error(usage());
    }
  }
  if (!outputs || !expectedSha || !output) {
    throw new Error(usage());
  }
  return { root, outputs, expectedSha, output };
}

function usage() {
  return "usage: [--root <repository-root>] --outputs <json> --expected-sha <sha> --output <json>";
}

/** @param {string} filePath */
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

/** @param {string} tag */
function parseReleaseTag(tag) {
  const match = RELEASE_TAG_PATTERN.exec(tag);
  if (!match?.groups) {
    return undefined;
  }
  return { name: match.groups.name, version: match.groups.version };
}

/** @param {string} root @param {string} tag */
function resolveTagSha(root, tag) {
  try {
    return childProcess
      .execFileSync("git", ["rev-list", "-n", "1", tag], {
        cwd: root,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      })
      .trim();
  } catch {
    return undefined;
  }
}

/** @param {string} root @param {string} pluginPath */
function readPluginManifest(root, pluginPath) {
  const manifestPath = path.join(
    root,
    pluginPath,
    ".codex-plugin",
    "plugin.json",
  );
  if (
    !fs.existsSync(manifestPath) ||
    fs.lstatSync(manifestPath).isSymbolicLink()
  ) {
    throw new Error(
      `missing plugin manifest: ${pluginPath}/.codex-plugin/plugin.json`,
    );
  }
  const manifest = readJson(manifestPath);
  if (!isObject(manifest)) {
    throw new Error(`plugin manifest must be an object: ${manifestPath}`);
  }
  return manifest;
}

/** @param {string} root @param {unknown} payload @param {string} expectedSha @param {(root: string, tag: string) => string | undefined} resolver */
function normalizeReleasePlan(
  root,
  payload,
  expectedSha,
  resolver = resolveTagSha,
) {
  if (!isObject(payload)) {
    throw new Error("release-please output payload must be an object");
  }
  if (!isTrue(payload.releases_created)) {
    throw new Error("release-please outputs do not report a created release");
  }
  if (!/^[0-9a-f]{40}$/u.test(expectedSha)) {
    throw new Error(
      `expected SHA must be a 40-character hexadecimal value: ${expectedSha}`,
    );
  }
  const pathsReleased = parsePathsReleased(payload.paths_released);
  if (pathsReleased.length === 0) {
    throw new Error("release-please outputs report no released paths");
  }
  const plan = [];
  for (const componentPath of configuredPaths(root)) {
    const prefix = `${componentPath}--`;
    if (!isTrue(payload[`${prefix}release_created`])) {
      continue;
    }
    if (!pathsReleased.includes(componentPath)) {
      throw new Error(
        `released component is missing from paths_released: ${componentPath}`,
      );
    }
    const tag = payload[`${prefix}tag_name`];
    const version = payload[`${prefix}version`];
    const sha = payload[`${prefix}sha`];
    if (
      typeof tag !== "string" ||
      typeof version !== "string" ||
      typeof sha !== "string"
    ) {
      throw new Error(
        `release-please outputs are incomplete for ${componentPath}`,
      );
    }
    if (sha !== expectedSha) {
      throw new Error(
        `release output SHA for ${componentPath} does not match ${expectedSha}`,
      );
    }
    if (resolver(root, tag) !== expectedSha) {
      throw new Error(`release tag ${tag} does not resolve to ${expectedSha}`);
    }
    const parsed = parseReleaseTag(tag);
    if (
      !parsed ||
      parsed.version !== version ||
      componentPath !== `plugins/${parsed.name}`
    ) {
      throw new Error(
        `release output tag does not match ${componentPath}: ${tag}`,
      );
    }
    const manifest = readPluginManifest(root, componentPath);
    if (manifest.name !== parsed.name) {
      throw new Error(
        `manifest name mismatch for ${componentPath}: expected ${parsed.name}, found ${String(manifest.name)}`,
      );
    }
    if (manifest.version !== version) {
      throw new Error(
        `manifest version mismatch for ${componentPath}: expected ${version}, found ${String(manifest.version)}`,
      );
    }
    plan.push({
      tag,
      pluginPath: componentPath,
      name: parsed.name,
      version,
      sha,
    });
  }
  if (plan.length === 0) {
    throw new Error(
      "release-please reported a release, but no component output was created",
    );
  }
  return plan.sort((left, right) =>
    left.pluginPath.localeCompare(right.pluginPath),
  );
}

/** @param {string} root @param {string} output */
function resolveContainedPath(root, output) {
  const resolvedRoot = path.resolve(root);
  const resolvedOutput = path.resolve(root, output);
  const relative = path.relative(resolvedRoot, resolvedOutput);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`output must remain inside repository root: ${output}`);
  }
  return resolvedOutput;
}

function main() {
  const options = parseArguments(
    process.argv.slice(2),
    path.resolve(__dirname, ".."),
  );
  const plan = normalizeReleasePlan(
    options.root,
    readJson(path.resolve(options.root, options.outputs)),
    options.expectedSha,
  );
  const outputPath = resolveContainedPath(options.root, options.output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(plan, null, 2)}\n`, "utf8");
  console.log(
    `Prepared ${plan.length} release plan entr${plan.length === 1 ? "y" : "ies"}.`,
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
  isTrue,
  normalizeReleasePlan,
  parseArguments,
  parsePathsReleased,
  parseReleaseTag,
  resolveTagSha,
};
