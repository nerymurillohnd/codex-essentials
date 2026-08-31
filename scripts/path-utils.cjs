#!/usr/bin/env node
// @ts-check

const fs = require("node:fs");
const path = require("node:path");

/** @param {string} root @param {string} candidate @param {string} label */
function assertContained(root, candidate, label) {
  const relative = path.relative(root, candidate);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`${label} must remain inside repository root`);
  }
}

/** @param {string} filePath */
function pathExists(filePath) {
  try {
    fs.lstatSync(filePath);
    return true;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return false;
    }
    throw error;
  }
}

/** @param {string} root @param {string} relativePath */
function resolveContainedPath(root, relativePath) {
  const repositoryRoot = fs.realpathSync(path.resolve(root));
  const filePath = path.resolve(repositoryRoot, relativePath);
  assertContained(repositoryRoot, filePath, `path ${relativePath}`);

  let existingPath = filePath;
  while (!pathExists(existingPath)) {
    const parent = path.dirname(existingPath);
    existingPath = parent;
  }

  let canonicalPath;
  try {
    if (existingPath === filePath) {
      canonicalPath = fs.realpathSync(filePath);
    } else {
      canonicalPath = path.resolve(
        fs.realpathSync(existingPath),
        path.relative(existingPath, filePath),
      );
    }
  } catch {
    throw new Error(
      `path ${relativePath} contains an unresolved symbolic link`,
    );
  }
  assertContained(repositoryRoot, canonicalPath, `path ${relativePath}`);
  return filePath;
}

module.exports = { resolveContainedPath };
