#!/usr/bin/env node
// @ts-check

const childProcess = require("node:child_process");

const PLUGIN_PATH_PATTERN = /^plugins\/([^/]+)\/(.+)$/u;
const README_FILE = "README.md";
const CHANGELOG_FILE = "CHANGELOG.md";
const BASE_OPTION = "--base";
const HEAD_OPTION = "--head";
const DEFAULT_BASE = "HEAD~1";
const EMPTY_TREE = "4b825dc642cb6eb9a060e54bf8d69288fbee4904";
const CREDENTIAL_PATTERN =
  /\b(?:api[_-]?key|access[_-]?token|secret|password|token)\b\s*[:=]\s*(?!\$\{[A-Z][A-Z0-9_]*\})(?!["'`])\S+/iu;

/** @param {unknown} error */
function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

/**
 * @param {readonly string[]} changedPaths
 * @param {string} [diffText]
 */
function evaluateChanges(changedPaths, diffText = "") {
  const pluginFiles = new Map();
  for (const changedPath of changedPaths) {
    const match = PLUGIN_PATH_PATTERN.exec(changedPath);
    if (!match) {
      continue;
    }
    const pluginName = match[1];
    const relativeFile = match[2];
    const files = pluginFiles.get(pluginName) ?? new Set();
    files.add(relativeFile);
    pluginFiles.set(pluginName, files);
  }

  const errors = [];
  for (const [pluginName, files] of [...pluginFiles.entries()].sort()) {
    const hasProductChange = [...files].some(
      (file) => file !== README_FILE && file !== CHANGELOG_FILE,
    );
    if (!hasProductChange) {
      continue;
    }
    if (!files.has(README_FILE)) {
      errors.push(`plugins/${pluginName} product changes require README.md`);
    }
    if (!files.has(CHANGELOG_FILE)) {
      errors.push(`plugins/${pluginName} product changes require CHANGELOG.md`);
    }
  }
  if (containsUnmaskedCredential(diffText)) {
    errors.push("diff contains an unmasked credential; use ${VAR}");
  }

  return { errors, plugins: [...pluginFiles.keys()].sort() };
}

/** @param {string} text */
function containsUnmaskedCredential(text) {
  return CREDENTIAL_PATTERN.test(text);
}

/**
 * @param {string} base
 * @param {(args: string[]) => string} [runner]
 */
function resolveBase(
  base,
  runner = (args) =>
    childProcess.execFileSync("git", args, { encoding: "utf8" }),
) {
  try {
    runner(["rev-parse", "--verify", `${base}^{commit}`]);
    return base;
  } catch (error) {
    if (base === DEFAULT_BASE) {
      return EMPTY_TREE;
    }
    throw error;
  }
}

/** @param {string[]} argv */
function parseArgs(argv) {
  let base = DEFAULT_BASE;
  let head = "HEAD";
  for (let index = 0; index < argv.length; index += 1) {
    const option = argv[index];
    if (option === BASE_OPTION || option === HEAD_OPTION) {
      const value = argv[index + 1];
      if (!value) {
        throw new Error(`${option} requires a revision`);
      }
      if (option === BASE_OPTION) {
        base = value;
      } else {
        head = value;
      }
      index += 1;
      continue;
    }
    throw new Error(`unknown argument: ${option}`);
  }
  return { base, head };
}

/* c8 ignore start */
function main() {
  try {
    const { base, head } = parseArgs(process.argv.slice(2));
    const resolvedBase = resolveBase(base);
    const changedPaths = childProcess
      .execFileSync("git", ["diff", "--name-only", resolvedBase, head], {
        encoding: "utf8",
      })
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean);
    const diffText = childProcess.execFileSync(
      "git",
      ["diff", resolvedBase, head],
      {
        encoding: "utf8",
      },
    );
    const result = evaluateChanges(changedPaths, diffText);
    if (result.errors.length > 0) {
      console.error(
        `Documentation gate failed (${result.errors.length} error(s)):`,
      );
      for (const error of result.errors) {
        console.error(`- ${error}`);
      }
      process.exitCode = 1;
      return;
    }
    console.log(
      `Documentation gate passed (${result.plugins.length} plugin(s) changed)`,
    );
  } catch (error) {
    console.error(`Documentation gate command failed: ${errorMessage(error)}`);
    process.exitCode = 2;
  }
}
/* c8 ignore stop */

/* c8 ignore next */
if (require.main === module) {
  main();
}

module.exports = {
  containsUnmaskedCredential,
  errorMessage,
  evaluateChanges,
  main,
  parseArgs,
  resolveBase,
};
