#!/usr/bin/env node
// @ts-check

const fs = require("node:fs");
const path = require("node:path");
const YAML = require("yaml");

const { loadJson, validateSchema } = require("../core/source.cjs");
const { validateReleaseTree } = require("./release.cjs");

const SKILL_FILE = "SKILL.md";
const AGENT_MANIFEST = path.join("agents", "openai.yaml");
const PLUGIN_MANIFEST = path.join(".codex-plugin", "plugin.json");
const README_FILE = "README.md";
const CHANGELOG_FILE = "CHANGELOG.md";
const PLUGIN_SCHEMA = path.join("lib", "schemas", "plugin.schema.json");
const AGENT_SCHEMA = path.join("lib", "schemas", "agent.schema.json");

/** @param {string} root @param {string} pluginName */
function validatePackage(root, pluginName) {
  const errors = [];
  const pluginsRoot = path.join(root, "plugins");
  const pluginRoot = path.join(pluginsRoot, pluginName);
  if (!fs.existsSync(pluginRoot)) {
    return [`plugins/${pluginName} is missing`];
  }
  if (!resolvesInside(pluginsRoot, pluginRoot)) {
    return [`plugins/${pluginName} resolves outside the plugins directory`];
  }

  errors.push(...validateReleaseTree(root, pluginName));
  validateJsonArtifact(
    root,
    PLUGIN_SCHEMA,
    path.join(pluginRoot, PLUGIN_MANIFEST),
    "plugin manifest",
    errors,
  );
  validateAuthoredDocuments(pluginRoot, errors);

  const skillsRoot = path.join(pluginRoot, "skills");
  if (!fs.existsSync(skillsRoot)) {
    errors.push("skills is missing");
    return errors;
  }
  if (!isDirectory(skillsRoot)) {
    return ["skills is not a directory"];
  }
  if (!resolvesInside(pluginRoot, skillsRoot)) {
    return ["skills resolves outside the owning plugin package"];
  }

  for (const skillRoot of findSkillRoots(skillsRoot, pluginRoot, errors)) {
    const agentPath = path.join(skillRoot, AGENT_MANIFEST);
    if (!fs.existsSync(agentPath)) {
      errors.push(`${relative(pluginRoot, agentPath)} is missing`);
      continue;
    }
    if (!isFile(agentPath) || !resolvesInside(skillRoot, agentPath)) {
      errors.push(
        `${relative(pluginRoot, agentPath)} resolves outside the owning skill`,
      );
      continue;
    }
    validateYamlArtifact(root, agentPath, skillRoot, errors);
  }
  if (findSkillRoots(skillsRoot, pluginRoot, []).length === 0) {
    errors.push("skills does not contain a SKILL.md file");
  }
  return errors;
}

/** @param {string} root @param {string} schemaRelativePath @param {string} artifactPath @param {string} label @param {string[]} errors */
function validateJsonArtifact(
  root,
  schemaRelativePath,
  artifactPath,
  label,
  errors,
) {
  try {
    validateSchema(
      loadJson(path.join(root, schemaRelativePath), `${label} schema`),
      loadJson(artifactPath, label),
      artifactPath,
    );
  } catch (error) {
    errors.push(/** @type {Error} */ (error).message);
  }
}

/** @param {string} root @param {string} agentPath @param {string} skillRoot @param {string[]} errors */
function validateYamlArtifact(root, agentPath, skillRoot, errors) {
  try {
    const payload = YAML.parse(fs.readFileSync(agentPath, "utf8"));
    validateSchema(
      loadJson(path.join(root, AGENT_SCHEMA), "agent schema"),
      payload,
      agentPath,
    );
    for (const iconPath of iconPaths(payload)) {
      const icon = path.join(skillRoot, iconPath);
      if (!isFile(icon) || !resolvesInside(skillRoot, icon)) {
        errors.push(
          `${relative(skillRoot, icon)} resolves outside the owning skill`,
        );
      }
    }
  } catch (error) {
    errors.push(/** @type {Error} */ (error).message);
  }
}

/** @param {unknown} payload */
function iconPaths(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return [];
  }
  const interfaceValue =
    /** @type {{interface?: {icon_small?: unknown, icon_large?: unknown}}} */ (
      payload
    ).interface;
  if (!interfaceValue || typeof interfaceValue !== "object") {
    return [];
  }
  return [interfaceValue.icon_small, interfaceValue.icon_large].filter(
    (value) => typeof value === "string",
  );
}

/** @param {string} pluginRoot @param {string[]} errors */
function validateAuthoredDocuments(pluginRoot, errors) {
  const required = [README_FILE, CHANGELOG_FILE];
  for (const fileName of required) {
    const target = path.join(pluginRoot, fileName);
    if (!isFile(target) || !resolvesInside(pluginRoot, target)) {
      errors.push(
        `${fileName} is missing or resolves outside the owning plugin package`,
      );
      continue;
    }
    if (!fs.readFileSync(target, "utf8").trim()) {
      errors.push(`${fileName} must not be empty`);
    }
  }
  const changelog = path.join(pluginRoot, CHANGELOG_FILE);
  if (
    isFile(changelog) &&
    !fs.readFileSync(changelog, "utf8").includes("## [Unreleased]")
  ) {
    errors.push("CHANGELOG.md must include ## [Unreleased]");
  }
}

/** @param {string} directory @param {string} pluginRoot @param {string[]} errors */
function findSkillRoots(directory, pluginRoot, errors) {
  const roots = [];
  const visited = new Set();
  /** @param {string} current */
  function visit(current) {
    if (!resolvesInside(pluginRoot, current)) {
      errors.push(
        `${relative(pluginRoot, current)} resolves outside the owning plugin package`,
      );
      return;
    }
    const resolved = fs.realpathSync(current);
    if (visited.has(resolved)) {
      return;
    }
    visited.add(resolved);
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) {
        continue;
      }
      const entryPath = path.join(current, entry.name);
      if (isDirectory(entryPath)) {
        visit(entryPath);
      } else if (entry.name === SKILL_FILE && isFile(entryPath)) {
        roots.push(path.dirname(entryPath));
      }
    }
  }
  visit(directory);
  return roots.sort();
}

/** @param {string} target */
function isDirectory(target) {
  try {
    return fs.statSync(target).isDirectory();
  } catch {
    return false;
  }
}

/** @param {string} target */
function isFile(target) {
  try {
    return fs.statSync(target).isFile();
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

module.exports = {
  findSkillRoots,
  iconPaths,
  isDirectory,
  isFile,
  relative,
  resolvesInside,
  validateAuthoredDocuments,
  validateJsonArtifact,
  validatePackage,
  validateYamlArtifact,
};
