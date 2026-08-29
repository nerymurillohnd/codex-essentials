#!/usr/bin/env node
// @ts-check

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const childProcess = require("node:child_process");
const { loadPluginManifests } = require("./marketplace-contract.cjs");
const {
  parseReleaseTag,
  resolveTagSha,
} = require("./prepare-release-plan.cjs");
const { validateArchiveMembers } = require("./validate-release-set.cjs");
const { resolveContainedPath } = require("./path-utils.cjs");

/** @typedef {Record<string, unknown>} JsonObject */
/** @typedef {{tag: string, pluginPath: string, name: string, version: string, sha: string}} ReleaseEntry */
/** @typedef {{pluginPath: string, name: string, version: string, sha: string}} PackageEntry */

/** @param {unknown} value @returns {value is JsonObject} */
function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** @param {string[]} args @param {string} defaultRoot */
function parseArguments(args, defaultRoot) {
  let root = defaultRoot;
  let plan;
  let outputDir;
  let output;
  let preflight = false;
  let ref;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    const value = args[index + 1];
    if (
      argument === "--root" ||
      argument === "--plan" ||
      argument === "--output-dir" ||
      argument === "--output" ||
      argument === "--ref"
    ) {
      if (!value || value.startsWith("--")) {
        throw new Error(usage());
      }
      if (argument === "--root") {
        root = path.resolve(value);
      }
      if (argument === "--plan") {
        plan = value;
      }
      if (argument === "--output-dir") {
        outputDir = value;
      }
      if (argument === "--output") {
        output = value;
      }
      if (argument === "--ref") {
        ref = value;
      }
      index += 1;
    } else if (argument === "--preflight") {
      preflight = true;
    } else {
      throw new Error(usage());
    }
  }
  if (!outputDir || !output || (preflight ? !ref || plan : !plan || ref)) {
    throw new Error(usage());
  }
  return { root, plan, outputDir, output, preflight, ref };
}

function usage() {
  return "usage: [--root <repository-root>] --plan <json> --output-dir <directory> --output <json> | [--preflight --ref <git-ref>] --output-dir <directory> --output <json>";
}

/** @param {string} filePath */
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

/** @param {string} root @param {JsonObject} entry @returns {asserts entry is ReleaseEntry} */
function validatePlanEntry(root, entry) {
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
    throw new Error(`release plan tag does not match entry: ${entry.tag}`);
  }
  if (entry.pluginPath !== `plugins/${entry.name}`) {
    throw new Error(
      `release plan path does not match entry: ${entry.pluginPath}`,
    );
  }
  if (resolveTagSha(root, entry.tag) !== entry.sha) {
    throw new Error(
      `release tag ${entry.tag} does not resolve to planned SHA ${entry.sha}`,
    );
  }
  let manifest;
  try {
    manifest = JSON.parse(
      childProcess.execFileSync(
        "git",
        ["show", `${entry.tag}:${entry.pluginPath}/.codex-plugin/plugin.json`],
        { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
      ),
    );
  } catch {
    throw new Error(`release tag ${entry.tag} is missing its plugin manifest`);
  }
  if (
    !isObject(manifest) ||
    manifest.name !== entry.name ||
    manifest.version !== entry.version
  ) {
    throw new Error(
      `release tag ${entry.tag} contains a mismatched plugin manifest`,
    );
  }
}

/** @param {string} root @param {string} ref */
function resolveRefSha(root, ref) {
  try {
    return childProcess
      .execFileSync("git", ["rev-parse", `${ref}^{commit}`], {
        cwd: root,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      })
      .trim();
  } catch {
    throw new Error(`git ref does not resolve to a commit: ${ref}`);
  }
}

/** @param {string} root @param {PackageEntry} entry @param {string} outputDir @param {string} sourceRef */
function createArchive(root, entry, outputDir, sourceRef) {
  const archiveName = `${entry.name}-${entry.version}.tar.gz`;
  const archivePath = path.join(outputDir, archiveName);
  const prefix = `${entry.name}-${entry.version}/`;
  const tarContent = childProcess.execFileSync(
    "git",
    [
      "archive",
      "--format=tar",
      `--prefix=${prefix}`,
      sourceRef,
      entry.pluginPath,
    ],
    { cwd: root, encoding: null, stdio: ["ignore", "pipe", "ignore"] },
  );
  if (!tarContent.length) {
    throw new Error(`git archive returned no content for ${sourceRef}`);
  }
  const gzip = childProcess.spawnSync("gzip", ["-n"], {
    input: tarContent,
    encoding: null,
  });
  if (gzip.status !== 0 || !gzip.stdout?.length) {
    throw new Error(`gzip -n failed for ${sourceRef}`);
  }
  const archiveContent = gzip.stdout;
  fs.writeFileSync(archivePath, archiveContent);
  const hash = crypto.createHash("sha256").update(archiveContent).digest("hex");
  const checksumName = `${archiveName}.sha256`;
  const checksumPath = path.join(outputDir, checksumName);
  fs.writeFileSync(checksumPath, `${hash}  ${archiveName}\n`, "utf8");
  return {
    ...entry,
    sourceRef,
    archive: path.relative(root, archivePath).split(path.sep).join("/"),
    checksum: path.relative(root, checksumPath).split(path.sep).join("/"),
    archiveName,
    checksumName,
    sha256: hash,
  };
}

/** @param {string} root @param {unknown} value @param {string} outputDir */
function packageReleasePlan(root, value, outputDir) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("release plan must be a non-empty array");
  }
  const absoluteOutputDir = resolveContainedPath(root, outputDir);
  fs.mkdirSync(absoluteOutputDir, { recursive: true });
  return value.map((entry) => {
    if (!isObject(entry)) {
      throw new Error("release plan entries must be objects");
    }
    validatePlanEntry(root, entry);
    return createArchive(root, entry, absoluteOutputDir, entry.tag);
  });
}

/** @param {string} root @param {string} ref @param {string} outputDir */
function packagePreflight(root, ref, outputDir) {
  const sourceSha = resolveRefSha(root, ref);
  const plugins = loadPluginManifests(root);
  const absoluteOutputDir = resolveContainedPath(root, outputDir);
  fs.mkdirSync(absoluteOutputDir, { recursive: true });
  return plugins.map(({ name, pluginRoot, manifest }) => {
    /** @type {PackageEntry} */
    const entry = {
      pluginPath: path.relative(root, pluginRoot).split(path.sep).join("/"),
      name,
      version: String(manifest.version),
      sha: sourceSha,
    };
    const artifact = createArchive(root, entry, absoluteOutputDir, ref);
    validateArchiveMembers(path.resolve(root, artifact.archive), entry);
    return artifact;
  });
}

function main() {
  const options = parseArguments(
    process.argv.slice(2),
    path.resolve(__dirname, ".."),
  );
  const artifacts = options.preflight
    ? packagePreflight(options.root, options.ref, options.outputDir)
    : packageReleasePlan(
        options.root,
        readJson(resolveContainedPath(options.root, options.plan)),
        options.outputDir,
      );
  const outputPath = resolveContainedPath(options.root, options.output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    outputPath,
    `${JSON.stringify(artifacts, null, 2)}\n`,
    "utf8",
  );
  console.log(
    `Packaged ${artifacts.length} plugin entr${artifacts.length === 1 ? "y" : "ies"}.`,
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
  createArchive,
  packagePreflight,
  packageReleasePlan,
  parseArguments,
  resolveRefSha,
  validatePlanEntry,
};
