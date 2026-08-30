#!/usr/bin/env node
// @ts-check

const childProcess = require("node:child_process");
const path = require("node:path");
const {
  classifyDirectPushPaths,
} = require("../lib/quality/direct-push-policy.cjs");

/** @param {string[]} args @param {string} defaultRoot */
function parseArguments(args, defaultRoot) {
  let root = defaultRoot;
  let remote;
  let local;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    const value = args[index + 1];
    if (
      argument === "--root" ||
      argument === "--remote" ||
      argument === "--local"
    ) {
      if (!value || value.startsWith("--")) {
        throw new Error(usage());
      }
      if (argument === "--root") {
        root = path.resolve(value);
      }
      if (argument === "--remote") {
        remote = value;
      }
      if (argument === "--local") {
        local = value;
      }
      index += 1;
    } else {
      throw new Error(usage());
    }
  }
  if (!remote || !local) {
    throw new Error(usage());
  }
  return { root, remote, local };
}

function usage() {
  return "usage: [--root <repository-root>] --remote <remote-sha> --local <local-sha>";
}

/** @param {string} root @param {string} local */
function assertCleanLocalHead(root, local) {
  const head = childProcess
    .execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: root,
      encoding: "utf8",
    })
    .trim();
  if (head !== local) {
    throw new Error(
      `pushed local SHA ${local} must match checked-out HEAD ${head}`,
    );
  }
  const status = childProcess.execFileSync(
    "git",
    ["status", "--porcelain=v1", "--untracked-files=all"],
    { cwd: root, encoding: "utf8" },
  );
  if (status.trim()) {
    throw new Error("worktree must be clean before a direct push");
  }
}

/** @param {string} root @param {string} remote @param {string} local */
function assertDescendant(root, remote, local) {
  try {
    childProcess.execFileSync(
      "git",
      ["merge-base", "--is-ancestor", remote, local],
      { cwd: root, stdio: "ignore" },
    );
  } catch {
    throw new Error(
      `local SHA ${local} is not a descendant of remote SHA ${remote}`,
    );
  }
}

/** @param {string} root @param {string} commit */
function readCommitPaths(root, commit) {
  const output = childProcess.execFileSync(
    "git",
    [
      "diff-tree",
      "--root",
      "--no-commit-id",
      "--name-only",
      "--diff-filter=ACDMRTUXB",
      "-r",
      "-m",
      commit,
    ],
    { cwd: root, encoding: "utf8" },
  );
  return output.split(/\r?\n/u).filter(Boolean);
}

/** @param {string} root @param {string} remote @param {string} local */
function readChangedPaths(root, remote, local) {
  if (/^0{40}$/u.test(remote)) {
    throw new Error(
      "cannot classify a direct push without an existing remote base",
    );
  }
  if (/^0{40}$/u.test(local)) {
    throw new Error("cannot classify a direct push without a local commit");
  }
  assertDescendant(root, remote, local);
  const commits = childProcess
    .execFileSync("git", ["rev-list", "--reverse", `${remote}..${local}`], {
      cwd: root,
      encoding: "utf8",
    })
    .split(/\r?\n/u)
    .filter(Boolean);
  const paths = new Set();
  for (const commit of commits) {
    for (const filePath of readCommitPaths(root, commit)) {
      paths.add(filePath);
    }
  }
  return [...paths];
}

/** @param {string} root @param {string} remote @param {string} local */
function validateDirectPush(root, remote, local) {
  const paths = readChangedPaths(root, remote, local);
  return { paths, ...classifyDirectPushPaths(paths) };
}

function main() {
  const options = parseArguments(
    process.argv.slice(2),
    path.resolve(__dirname, ".."),
  );
  // npm run check below must validate the exact clean tree represented by local.
  assertCleanLocalHead(options.root, options.local);
  const result = validateDirectPush(
    options.root,
    options.remote,
    options.local,
  );
  if (!result.allowed) {
    throw new Error(
      [
        "Direct pushes to main are limited to documentation and agent guidance.",
        "Use a pull request for:",
        ...result.disallowedPaths.map((filePath) => `- ${filePath}`),
      ].join("\n"),
    );
  }
  console.log(
    `Direct push scope accepted for ${result.paths.length} changed path${result.paths.length === 1 ? "" : "s"}.`,
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
  main,
  parseArguments,
  assertCleanLocalHead,
  readChangedPaths,
  validateDirectPush,
};
