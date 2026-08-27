#!/usr/bin/env node
// @ts-check

const fs = require("node:fs");
const path = require("node:path");

/** @param {string} root @param {string} pluginName */
function validateReleaseTree(root, pluginName) {
  const pluginRoot = path.join(root, "plugins", pluginName);
  if (!fs.existsSync(pluginRoot)) {
    return [`plugins/${pluginName} is missing`];
  }
  const errors = [];
  const visited = new Set();
  /** @param {string} current */
  function visit(current) {
    const resolved = fs.realpathSync(current);
    if (visited.has(resolved)) {
      return;
    }
    visited.add(resolved);
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      const relativePath = relative(pluginRoot, entryPath);
      const stats = fs.lstatSync(entryPath);
      if (stats.isSymbolicLink() && !resolvesInside(pluginRoot, entryPath)) {
        errors.push(`${relativePath} resolves outside the release package`);
        continue;
      }
      if (isDirectory(entryPath)) {
        visit(entryPath);
      }
    }
  }
  if (!resolvesInside(path.join(root, "plugins"), pluginRoot)) {
    return [`plugins/${pluginName} resolves outside the plugins directory`];
  }
  visit(pluginRoot);
  return errors;
}

/** @param {string} target */
function isDirectory(target) {
  try {
    return fs.statSync(target).isDirectory();
  } catch {
    return false;
  }
}

/** @param {string} root @param {string} target */
function resolvesInside(root, target) {
  try {
    const resolvedRoot = fs.realpathSync(root);
    const resolvedTarget = fs.realpathSync(target);
    return resolvedTarget.startsWith(`${resolvedRoot}${path.sep}`);
  } catch {
    return false;
  }
}

/** @param {string} root @param {string} target */
function relative(root, target) {
  return path.relative(root, target).replaceAll(path.sep, "/") || ".";
}

module.exports = { isDirectory, relative, resolvesInside, validateReleaseTree };
