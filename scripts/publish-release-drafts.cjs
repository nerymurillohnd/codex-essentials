#!/usr/bin/env node
// @ts-check

const childProcess = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { resolveContainedPath } = require("./path-utils.cjs");

/** @typedef {{tag: string}} ReleaseArtifact */

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

/** @param {string} repository @param {string} tag */
function readRelease(repository, tag) {
  return JSON.parse(
    runGh(["release", "view", tag, "--repo", repository, "--json", "isDraft"]),
  );
}

/** @param {string} repository @param {string} tag */
function publishRelease(repository, tag) {
  runGh([
    "release",
    "edit",
    tag,
    "--draft=false",
    "--latest=false",
    "--repo",
    repository,
  ]);
}

/** @param {unknown} value @returns {value is ReleaseArtifact} */
function isReleaseArtifact(value) {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "tag" in value &&
    typeof value.tag === "string"
  );
}

/**
 * @param {string} repository
 * @param {ReleaseArtifact[]} artifacts
 * @param {(repository: string, tag: string) => {isDraft: boolean}} releaseReader
 * @param {(repository: string, tag: string) => void} releasePublisher
 */
function publishReleaseDrafts(
  repository,
  artifacts,
  releaseReader = readRelease,
  releasePublisher = publishRelease,
) {
  const published = [];
  const skipped = [];
  for (const artifact of artifacts) {
    const release = releaseReader(repository, artifact.tag);
    if (release.isDraft) {
      releasePublisher(repository, artifact.tag);
      published.push(artifact.tag);
    } else {
      skipped.push(artifact.tag);
    }
  }
  return { published, skipped };
}

function main() {
  const options = parseArguments(
    process.argv.slice(2),
    path.resolve(__dirname, ".."),
  );
  const artifacts = JSON.parse(
    fs.readFileSync(
      resolveContainedPath(options.root, options.artifacts),
      "utf8",
    ),
  );
  if (!Array.isArray(artifacts) || !artifacts.every(isReleaseArtifact)) {
    throw new Error("release artifacts JSON must contain release tags");
  }
  const result = publishReleaseDrafts(options.repository, artifacts);
  console.log(
    `Published ${result.published.length} draft release${result.published.length === 1 ? "" : "s"}; skipped ${result.skipped.length} already published.`,
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
  publishRelease,
  publishReleaseDrafts,
  readRelease,
};
