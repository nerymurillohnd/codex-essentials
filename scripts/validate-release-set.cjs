#!/usr/bin/env node
// @ts-check

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const childProcess = require("node:child_process");
const {
  parseReleaseTag,
  resolveTagSha,
} = require("./prepare-release-plan.cjs");

/** @typedef {Record<string, unknown>} JsonObject */

/** @param {unknown} value @returns {value is JsonObject} */
function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** @param {string[]} args @param {string} defaultRoot */
function parseArguments(args, defaultRoot) {
  let root = defaultRoot;
  let plan;
  let archives = false;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    const value = args[index + 1];
    if (argument === "--root" || argument === "--plan") {
      if (!value || value.startsWith("--")) {
        throw new Error(usage());
      }
      if (argument === "--root") {
        root = path.resolve(value);
      }
      if (argument === "--plan") {
        plan = value;
      }
      index += 1;
    } else if (argument === "--archives") {
      archives = true;
    } else {
      throw new Error(usage());
    }
  }
  if (!plan) {
    throw new Error(usage());
  }
  return { root, plan, archives };
}

function usage() {
  return "usage: [--root <repository-root>] --plan <json> [--archives]";
}

/** @param {string} filePath */
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

/** @param {string} root @param {string} relativePath */
function containedFile(root, relativePath) {
  const rootPath = path.resolve(root);
  const filePath = path.resolve(root, relativePath);
  const relative = path.relative(rootPath, filePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`path escapes repository root: ${relativePath}`);
  }
  if (!fs.existsSync(filePath) || fs.lstatSync(filePath).isSymbolicLink()) {
    throw new Error(
      `required release file is missing or symbolic: ${relativePath}`,
    );
  }
  if (!fs.statSync(filePath).isFile()) {
    throw new Error(
      `required release file is not a regular file: ${relativePath}`,
    );
  }
  return filePath;
}

/** @param {string} root @param {JsonObject} entry */
function validateEntry(root, entry) {
  if (
    typeof entry.tag !== "string" ||
    typeof entry.pluginPath !== "string" ||
    typeof entry.name !== "string" ||
    typeof entry.version !== "string" ||
    typeof entry.sha !== "string"
  ) {
    throw new Error(
      "release plan entry is missing tag, path, name, version, or sha",
    );
  }
  const parsed = parseReleaseTag(entry.tag);
  if (
    !parsed ||
    parsed.name !== entry.name ||
    parsed.version !== entry.version
  ) {
    throw new Error(`release tag does not match plan entry: ${entry.tag}`);
  }
  if (entry.pluginPath !== `plugins/${entry.name}`) {
    throw new Error(
      `release path does not match plugin name: ${entry.pluginPath}`,
    );
  }
  if (resolveTagSha(root, entry.tag) !== entry.sha) {
    throw new Error(
      `release tag ${entry.tag} does not match planned SHA ${entry.sha}`,
    );
  }
  const manifestPath = containedFile(
    root,
    `${entry.pluginPath}/.codex-plugin/plugin.json`,
  );
  const manifest = readJson(manifestPath);
  if (!isObject(manifest) || manifest.name !== entry.name) {
    throw new Error(`manifest name does not match release ${entry.tag}`);
  }
  if (manifest.version !== entry.version) {
    throw new Error(`manifest version does not match release ${entry.tag}`);
  }
  const changelogPath = containedFile(root, `${entry.pluginPath}/CHANGELOG.md`);
  const changelog = fs.readFileSync(changelogPath, "utf8");
  const heading = new RegExp(
    `^## (?:\\[${escapeRegExp(entry.version)}\\] - \\d{4}-\\d{2}-\\d{2}|${escapeRegExp(entry.version)} \\(\\d{4}-\\d{2}-\\d{2}\\))\\s*$`,
    "mu",
  );
  if (!heading.test(changelog)) {
    throw new Error(
      `${entry.pluginPath}/CHANGELOG.md is missing release section for ${entry.version}`,
    );
  }
}

/** @param {string} root @param {JsonObject} entry */
function validateChecksum(root, entry) {
  if (typeof entry.archive !== "string" || typeof entry.checksum !== "string") {
    throw new Error(`release ${entry.tag} is missing archive metadata`);
  }
  const archivePath = containedFile(root, entry.archive);
  const checksumPath = containedFile(root, entry.checksum);
  const checksumLines = fs
    .readFileSync(checksumPath, "utf8")
    .trim()
    .split(/\r?\n/u);
  if (checksumLines.length !== 1) {
    throw new Error(
      `checksum file must contain exactly one line: ${entry.checksum}`,
    );
  }
  const match = /^([a-f0-9]{64}) {2}(.+)$/u.exec(checksumLines[0]);
  if (!match || match[2] !== path.basename(archivePath)) {
    throw new Error(
      `checksum file has invalid format or archive name: ${entry.checksum}`,
    );
  }
  const actual = crypto
    .createHash("sha256")
    .update(fs.readFileSync(archivePath))
    .digest("hex");
  if (actual !== match[1]) {
    throw new Error(`checksum mismatch for ${entry.archive}`);
  }
  return archivePath;
}

/** @param {string} member */
function isSensitiveMember(member) {
  const basename = member.split("/").pop() ?? "";
  const segments = member.split("/");
  return (
    segments.some(
      (segment) =>
        segment === ".git" ||
        segment === "node_modules" ||
        segment === "coverage" ||
        segment === "dist" ||
        segment === ".env" ||
        segment.startsWith(".env."),
    ) ||
    /\.(?:pem|key)$/iu.test(basename) ||
    basename === "id_rsa"
  );
}

/** @param {string} archivePath @param {JsonObject} entry */
function validateArchiveMembers(archivePath, entry) {
  const members = childProcess
    .execFileSync("tar", ["-tzf", archivePath], { encoding: "utf8" })
    .split(/\r?\n/u)
    .filter(Boolean);
  if (members.length === 0) {
    throw new Error(`release archive is empty: ${archivePath}`);
  }
  const archiveRoot = `${entry.name}-${entry.version}`;
  const pluginRoot = `${archiveRoot}/plugins/${entry.name}`;
  for (const member of members) {
    const normalized = member.replace(/\/+$/u, "");
    if (normalized.startsWith("/") || normalized.split("/").includes("..")) {
      throw new Error(`release archive contains an unsafe path: ${member}`);
    }
    if (isSensitiveMember(normalized)) {
      throw new Error(`release archive contains a sensitive path: ${member}`);
    }
    if (
      normalized !== archiveRoot &&
      normalized !== `${archiveRoot}/plugins` &&
      normalized !== pluginRoot &&
      !normalized.startsWith(`${pluginRoot}/`)
    ) {
      throw new Error(
        `release archive contains an out-of-package path: ${member}`,
      );
    }
  }
  const verbose = childProcess.execFileSync("tar", ["-tvzf", archivePath], {
    encoding: "utf8",
  });
  if (verbose.split(/\r?\n/u).some((line) => line.startsWith("l"))) {
    throw new Error(`release archive contains a symbolic link: ${archivePath}`);
  }
  const manifestMember = `${pluginRoot}/.codex-plugin/plugin.json`;
  let archivedManifest;
  try {
    archivedManifest = JSON.parse(
      childProcess.execFileSync("tar", ["-xOf", archivePath, manifestMember], {
        encoding: "utf8",
      }),
    );
  } catch {
    throw new Error(`release archive is missing ${manifestMember}`);
  }
  if (
    !isObject(archivedManifest) ||
    archivedManifest.name !== entry.name ||
    archivedManifest.version !== entry.version
  ) {
    throw new Error(`release archive manifest does not match ${entry.tag}`);
  }
}

/** @param {string} root @param {unknown} value @param {boolean} archives */
function validateReleaseSet(root, value, archives) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("release plan must be a non-empty array");
  }
  const seen = new Set();
  for (const entry of value) {
    if (!isObject(entry)) {
      throw new Error("release plan entries must be objects");
    }
    validateEntry(root, entry);
    if (seen.has(entry.pluginPath)) {
      throw new Error(
        `release plan contains a duplicate plugin: ${entry.pluginPath}`,
      );
    }
    seen.add(entry.pluginPath);
    if (archives) {
      const archivePath = validateChecksum(root, entry);
      validateArchiveMembers(archivePath, entry);
    }
  }
  return value.length;
}

/** @param {string} value */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function main() {
  const options = parseArguments(
    process.argv.slice(2),
    path.resolve(__dirname, ".."),
  );
  const count = validateReleaseSet(
    options.root,
    readJson(path.resolve(options.root, options.plan)),
    options.archives,
  );
  console.log(
    `Validated ${count} plugin release entr${count === 1 ? "y" : "ies"}.`,
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
  isSensitiveMember,
  parseArguments,
  validateArchiveMembers,
  validateChecksum,
  validateReleaseSet,
};
