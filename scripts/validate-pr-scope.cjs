#!/usr/bin/env node
// @ts-check

const childProcess = require("node:child_process");
const path = require("node:path");
const {
  isTrustedReleaseMigration,
  isTrustedReleasePleasePullRequest,
} = require("./release-pr-auth.cjs");

/** @param {string[]} args @param {string} defaultRoot */
function parseArguments(args, defaultRoot) {
  let root = defaultRoot;
  let base;
  let head;
  let title;
  let labels = "";
  let authorType = "";
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    const value = args[index + 1];
    if (
      argument === "--root" ||
      argument === "--base" ||
      argument === "--head" ||
      argument === "--title" ||
      argument === "--labels" ||
      argument === "--author-type"
    ) {
      if (argument !== "--labels" && (!value || value.startsWith("--"))) {
        throw new Error(usage());
      }
      if (argument === "--root") {
        root = path.resolve(value);
      }
      if (argument === "--base") {
        base = value;
      }
      if (argument === "--head") {
        head = value;
      }
      if (argument === "--title") {
        title = value;
      }
      if (argument === "--labels") {
        labels = value ?? "";
      }
      if (argument === "--author-type") {
        authorType = value ?? "";
      }
      index += 1;
    } else {
      throw new Error(usage());
    }
  }
  if (!base || !head || !title) {
    throw new Error(usage());
  }
  return { root, base, head, title, labels, authorType };
}

function usage() {
  return "usage: [--root <repository-root>] --base <ref> --head <ref> --title <title> [--labels <comma-separated-labels>]";
}

/** @param {string} title @param {string[]} labels @param {string} authorType */
function isReleasePleasePullRequest(title, labels, authorType) {
  return isTrustedReleasePleasePullRequest(title, authorType, labels);
}

/** @param {string} root @param {string} base @param {string} head */
function changedPaths(root, base, head) {
  const output = childProcess.execFileSync(
    "git",
    ["diff", "--name-only", `${base}...${head}`],
    { cwd: root, encoding: "utf8" },
  );
  return output.split(/\r?\n/u).filter(Boolean);
}

/** @param {string[]} paths */
function releasablePluginPaths(paths) {
  return [
    ...new Set(
      paths.flatMap((filePath) => {
        const match = /^plugins\/([^/]+)(?:\/|$)/u.exec(filePath);
        return match ? [`plugins/${match[1]}`] : [];
      }),
    ),
  ].sort();
}

/** @param {string} root @param {string} base @param {string} head @param {string} title @param {string} labelsValue @param {string} authorType */
function validatePullRequestScope(
  root,
  base,
  head,
  title,
  labelsValue,
  authorType,
) {
  const labels = labelsValue
    .split(",")
    .map((label) => label.trim())
    .filter(Boolean);
  if (
    isReleasePleasePullRequest(title, labels, authorType) ||
    isTrustedReleaseMigration(labels)
  ) {
    return { skipped: true, plugins: [] };
  }
  const plugins = releasablePluginPaths(changedPaths(root, base, head));
  if (plugins.length > 1) {
    throw new Error(
      `Product PRs may update only one releasable plugin; found ${plugins.join(", ")}`,
    );
  }
  return { skipped: false, plugins };
}

function main() {
  const options = parseArguments(
    process.argv.slice(2),
    path.resolve(__dirname, ".."),
  );
  const result = validatePullRequestScope(
    options.root,
    options.base,
    options.head,
    options.title,
    options.labels,
    options.authorType,
  );
  if (result.skipped) {
    console.log("Release Please PR scope check skipped.");
  } else {
    console.log(
      `Validated product PR scope${result.plugins.length ? ` for ${result.plugins[0]}` : ""}.`,
    );
  }
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
  changedPaths,
  isReleasePleasePullRequest,
  parseArguments,
  releasablePluginPaths,
  validatePullRequestScope,
};
