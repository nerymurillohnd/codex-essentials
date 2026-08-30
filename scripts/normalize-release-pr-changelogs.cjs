#!/usr/bin/env node
// @ts-check

const childProcess = require("node:child_process");
const path = require("node:path");
const { rollReleaseChangelogs } = require("./roll-release-changelogs.cjs");

/** @typedef {{number?: number, headRefName?: string, headBranchName?: string}} PullRequestOutput */

/** @param {string[]} args @param {string} defaultRoot */
function parseArguments(args, defaultRoot) {
  let root = defaultRoot;
  let base;
  let repository;
  let pr = "";
  let prs = "";
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    const value = args[index + 1];
    if (
      argument === "--root" ||
      argument === "--base" ||
      argument === "--repository" ||
      argument === "--pr" ||
      argument === "--prs"
    ) {
      if (
        value === undefined ||
        (argument !== "--pr" && argument !== "--prs" && !value)
      ) {
        throw new Error(usage());
      }
      if (argument === "--root") {
        root = path.resolve(value);
      }
      if (argument === "--base") {
        base = value;
      }
      if (argument === "--repository") {
        repository = value;
      }
      if (argument === "--pr") {
        pr = value;
      }
      if (argument === "--prs") {
        prs = value;
      }
      index += 1;
    } else {
      throw new Error(usage());
    }
  }
  if (!base || !repository) {
    throw new Error(usage());
  }
  return { root, base, repository, pr, prs };
}

function usage() {
  return "usage: [--root <repository-root>] --base <sha> --repository <owner/name> [--pr <json>] [--prs <json>]";
}

/** @param {string} value */
function parseJsonValue(value) {
  if (!value.trim()) {
    return undefined;
  }
  return JSON.parse(value);
}

/** @param {string} pr @param {string} prs */
function parsePullRequestOutputs(pr, prs) {
  const candidates = [];
  const single = parseJsonValue(pr);
  if (single !== undefined) {
    candidates.push(...(Array.isArray(single) ? single : [single]));
  }
  const many = parseJsonValue(prs);
  if (many !== undefined) {
    candidates.push(...(Array.isArray(many) ? many : [many]));
  }
  const deduplicated = new Map();
  for (const candidate of candidates) {
    if (
      typeof candidate !== "object" ||
      candidate === null ||
      Array.isArray(candidate)
    ) {
      continue;
    }
    const value = /** @type {PullRequestOutput} */ (candidate);
    const key = String(
      value.number ?? value.headRefName ?? value.headBranchName ?? "",
    );
    if (key) {
      deduplicated.set(key, value);
    }
  }
  return [...deduplicated.values()];
}

/** @param {string} root @param {string[]} args */
function run(root, args) {
  const command = args[0];
  if (!command) {
    throw new Error("missing command");
  }
  return childProcess.execFileSync(command, args.slice(1), {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

/** @param {string} root @param {string} repository @param {PullRequestOutput} candidate */
function resolvePullRequest(root, repository, candidate) {
  if (candidate.number && (candidate.headRefName || candidate.headBranchName)) {
    return {
      number: candidate.number,
      headRefName: candidate.headRefName ?? candidate.headBranchName ?? "",
    };
  }
  if (!candidate.number) {
    throw new Error("Release Please output is missing a pull request number");
  }
  const value = JSON.parse(
    run(root, [
      "gh",
      "pr",
      "view",
      String(candidate.number),
      "--repo",
      repository,
      "--json",
      "number,headRefName",
    ]),
  );
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    typeof value.number !== "number" ||
    typeof value.headRefName !== "string"
  ) {
    throw new Error(`Unable to resolve Release Please PR ${candidate.number}`);
  }
  return value;
}

/** @param {string} root @param {string} repository @param {string} base @param {PullRequestOutput[]} pullRequests */
function normalizeReleasePullRequests(root, repository, base, pullRequests) {
  const updated = [];
  for (const candidate of pullRequests) {
    const pullRequest = resolvePullRequest(root, repository, candidate);
    const remoteRef = `refs/remotes/origin/release-please-pr-${pullRequest.number}`;
    const localBranch = `release-please-normalize-${pullRequest.number}`;
    run(root, [
      "git",
      "fetch",
      "origin",
      `pull/${pullRequest.number}/head:${remoteRef}`,
    ]);
    run(root, ["git", "switch", "--force-create", localBranch, remoteRef]);
    const rolled = rollReleaseChangelogs(root, base, "HEAD", true);
    if (rolled.length === 0) {
      continue;
    }
    run(root, ["git", "config", "user.name", "codex-essentials-release[bot]"]);
    run(root, [
      "git",
      "config",
      "user.email",
      "codex-essentials-release[bot]@users.noreply.github.com",
    ]);
    run(root, ["git", "add", "--", ...rolled]);
    try {
      run(root, ["git", "diff", "--cached", "--quiet"]);
      continue;
    } catch {
      run(root, [
        "git",
        "commit",
        "-m",
        "chore: roll released changelog entries",
      ]);
      run(root, [
        "git",
        "push",
        "origin",
        `HEAD:refs/heads/${pullRequest.headRefName}`,
      ]);
      updated.push(pullRequest.number);
    }
  }
  return updated;
}

function main() {
  const options = parseArguments(
    process.argv.slice(2),
    path.resolve(__dirname, ".."),
  );
  const pullRequests = parsePullRequestOutputs(options.pr, options.prs);
  if (pullRequests.length === 0) {
    console.log("No Release Please pull request outputs to normalize.");
    return;
  }
  const updated = normalizeReleasePullRequests(
    options.root,
    options.repository,
    options.base,
    pullRequests,
  );
  console.log(
    `Normalized ${updated.length} Release Please pull request${updated.length === 1 ? "" : "s"}.`,
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
  normalizeReleasePullRequests,
  parseArguments,
  parsePullRequestOutputs,
  resolvePullRequest,
};
