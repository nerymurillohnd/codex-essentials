#!/usr/bin/env node
// @ts-check

const crypto = require("node:crypto");
const childProcess = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { resolveContainedPath } = require("./path-utils.cjs");

/** @typedef {Record<string, unknown>} JsonObject */
/** @typedef {{tag: string, sha: string, archiveName: string, checksumName: string, sha256: string}} ReleaseArtifact */

/** @param {unknown} value @returns {value is JsonObject} */
function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** @param {string[]} args @param {string} defaultRoot */
function parseArguments(args, defaultRoot) {
  let root = defaultRoot;
  let artifacts;
  let repository;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    const value = args[index + 1];
    if (
      argument === "--root" ||
      argument === "--artifacts" ||
      argument === "--repository"
    ) {
      if (!value || value.startsWith("--")) {
        throw new Error(usage());
      }
      if (argument === "--root") {
        root = path.resolve(value);
      }
      if (argument === "--artifacts") {
        artifacts = value;
      }
      if (argument === "--repository") {
        repository = value;
      }
      index += 1;
    } else {
      throw new Error(usage());
    }
  }
  if (!artifacts || !repository) {
    throw new Error(usage());
  }
  return { root, artifacts, repository };
}

function usage() {
  return "usage: [--root <repository-root>] --artifacts <json> --repository <owner/repository>";
}

/** @param {string[]} args */
function runGh(args) {
  return childProcess.execFileSync("gh", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

/** @param {string[]} args */
function ghJson(args) {
  const value = JSON.parse(runGh(args));
  if (!isObject(value)) {
    throw new Error(
      `gh returned a non-object JSON response: ${args.join(" ")}`,
    );
  }
  return value;
}

/** @param {string} repository @param {string} tag */
function remoteTagSha(repository, tag) {
  const reference = ghJson(["api", `repos/${repository}/git/ref/tags/${tag}`]);
  if (!isObject(reference.object)) {
    throw new Error(`GitHub returned no tag object for ${tag}`);
  }
  const object = reference.object;
  if (object.type === "commit" && typeof object.sha === "string") {
    return object.sha;
  }
  if (object.type === "tag" && typeof object.sha === "string") {
    const annotated = ghJson([
      "api",
      `repos/${repository}/git/tags/${object.sha}`,
    ]);
    if (
      isObject(annotated.object) &&
      annotated.object.type === "commit" &&
      typeof annotated.object.sha === "string"
    ) {
      return annotated.object.sha;
    }
  }
  throw new Error(`GitHub tag ${tag} does not resolve directly to a commit`);
}

/** @param {ReleaseArtifact} entry @param {JsonObject} release @param {string} tagSha */
function validateRemoteRelease(entry, release, tagSha) {
  if (
    release.tagName !== entry.tag ||
    (release.isDraft !== true && release.isDraft !== false)
  ) {
    throw new Error(`remote release is not the expected entry: ${entry.tag}`);
  }
  if (tagSha !== entry.sha) {
    throw new Error(
      `remote tag ${entry.tag} resolves to ${tagSha}, expected ${entry.sha}`,
    );
  }
  if (!Array.isArray(release.assets)) {
    throw new Error(`remote release has no asset list: ${entry.tag}`);
  }
  const assetNames = new Set(
    release.assets.flatMap((asset) =>
      isObject(asset) && typeof asset.name === "string" ? [asset.name] : [],
    ),
  );
  for (const required of [entry.archiveName, entry.checksumName]) {
    if (!assetNames.has(required)) {
      throw new Error(`remote release is missing required asset ${required}`);
    }
  }
}

/** @param {ReleaseArtifact} entry @param {Buffer} archive @param {string} checksum */
function validateDownloadedAssets(entry, archive, checksum) {
  const actual = crypto.createHash("sha256").update(archive).digest("hex");
  if (actual !== entry.sha256) {
    throw new Error(
      `downloaded archive checksum ${actual} does not match ${entry.sha256}`,
    );
  }
  const expected = `${entry.sha256}  ${entry.archiveName}\n`;
  if (checksum.replace(/\r\n/gu, "\n") !== expected) {
    throw new Error(`downloaded checksum does not match archive checksum`);
  }
}

/** @param {JsonObject} value @returns {value is ReleaseArtifact} */
function isReleaseArtifact(value) {
  return (
    typeof value.tag === "string" &&
    typeof value.sha === "string" &&
    typeof value.archiveName === "string" &&
    typeof value.checksumName === "string" &&
    typeof value.sha256 === "string"
  );
}

/** @param {string} root @param {string} repository @param {ReleaseArtifact[]} artifacts */
function verifyReleaseArtifacts(root, repository, artifacts) {
  if (!/^[^/]+\/[^/]+$/u.test(repository)) {
    throw new Error(`repository must use owner/name format: ${repository}`);
  }
  if (artifacts.length === 0) {
    throw new Error("release artifacts must not be empty");
  }
  for (const entry of artifacts) {
    const release = ghJson([
      "release",
      "view",
      entry.tag,
      "--repo",
      repository,
      "--json",
      "tagName,isDraft,assets",
    ]);
    validateRemoteRelease(entry, release, remoteTagSha(repository, entry.tag));
    const temporaryDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), "codex-release-verify-"),
    );
    try {
      for (const assetName of [entry.archiveName, entry.checksumName]) {
        runGh([
          "release",
          "download",
          entry.tag,
          "--repo",
          repository,
          "--pattern",
          assetName,
          "--dir",
          temporaryDirectory,
          "--clobber",
        ]);
      }
      validateDownloadedAssets(
        entry,
        fs.readFileSync(path.join(temporaryDirectory, entry.archiveName)),
        fs.readFileSync(
          path.join(temporaryDirectory, entry.checksumName),
          "utf8",
        ),
      );
    } finally {
      fs.rmSync(temporaryDirectory, { recursive: true, force: true });
    }
  }
}

function main() {
  const options = parseArguments(
    process.argv.slice(2),
    path.resolve(__dirname, ".."),
  );
  const value = JSON.parse(
    fs.readFileSync(
      resolveContainedPath(options.root, options.artifacts),
      "utf8",
    ),
  );
  if (!Array.isArray(value) || !value.every(isReleaseArtifact)) {
    throw new Error(
      "release artifacts JSON must contain complete artifact entries",
    );
  }
  verifyReleaseArtifacts(options.root, options.repository, value);
  console.log(
    `Verified ${value.length} remote draft release entr${value.length === 1 ? "y" : "ies"}.`,
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
  isReleaseArtifact,
  parseArguments,
  remoteTagSha,
  validateDownloadedAssets,
  validateRemoteRelease,
  verifyReleaseArtifacts,
};
