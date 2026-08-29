#!/usr/bin/env node
// @ts-check

const childProcess = require("node:child_process");
const path = require("node:path");
const { validateSubject } = require("./validate-pr-title.cjs");

/** @typedef {{ sha: string, subject: string }} CommitSubject */

/** @param {string[]} args @param {string} defaultRoot */
function parseArguments(args, defaultRoot) {
  let root = defaultRoot;
  let base;
  let head;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    const value = args[index + 1];
    if (
      argument === "--root" ||
      argument === "--base" ||
      argument === "--head"
    ) {
      if (!value || value.startsWith("--")) {
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
      index += 1;
    } else {
      throw new Error(usage());
    }
  }
  if (!base || !head) {
    throw new Error(usage());
  }
  return { root, base, head };
}

function usage() {
  return "usage: [--root <repository-root>] --base <ref> --head <ref>";
}

/** @param {string} root @param {string} base @param {string} head */
function readCommitSubjects(root, base, head) {
  const output = childProcess.execFileSync(
    "git",
    ["log", "--no-merges", "--format=%H%x00%s", `${base}...${head}`],
    { cwd: root, encoding: "utf8" },
  );
  if (!output.trim()) {
    return [];
  }
  return output
    .trimEnd()
    .split(/\r?\n/u)
    .map((line) => {
      const separator = line.indexOf("\0");
      if (separator <= 0) {
        throw new Error(`unable to parse git commit record: ${line}`);
      }
      return {
        sha: line.slice(0, separator),
        subject: line.slice(separator + 1),
      };
    });
}

/** @param {CommitSubject[]} commits */
function validateCommitSubjects(commits) {
  const errors = [];
  for (const commit of commits) {
    try {
      validateSubject(commit.subject, `commit ${commit.sha}`);
    } catch (error) {
      errors.push(/** @type {Error} */ (error).message);
    }
  }
  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }
}

function main() {
  const options = parseArguments(
    process.argv.slice(2),
    path.resolve(__dirname, ".."),
  );
  const commits = readCommitSubjects(options.root, options.base, options.head);
  if (commits.length === 0) {
    throw new Error("pull request range contains no non-merge commits");
  }
  validateCommitSubjects(commits);
  console.log(
    `Accepted ${commits.length} non-merge commit subject${commits.length === 1 ? "" : "s"}.`,
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
  parseArguments,
  readCommitSubjects,
  validateCommitSubjects,
};
