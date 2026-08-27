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
const README_REQUIRED_SECTIONS = [
  "Purpose",
  "Included Components",
  "Supported Environments",
  "Inputs and Outputs",
  "Required Tools and Credentials",
  "Permissions",
  "Side Effects",
  "Human Approval Boundaries",
  "Installation Behavior",
  "Uninstall and Rollback Behavior",
  "Verification",
  "Known Limitations",
  "Failure and Recovery",
];
const INTERFACE_ASSET_FIELDS = ["composerIcon", "logo", "logoDark"];

/** @param {string} root @param {string} pluginName @param {string[]} [declaredSkillIds] */
function validatePackage(root, pluginName, declaredSkillIds) {
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
  const manifest = validateJsonArtifact(
    root,
    PLUGIN_SCHEMA,
    path.join(pluginRoot, PLUGIN_MANIFEST),
    "plugin manifest",
    errors,
  );
  if (manifest) {
    validateManifestResources(pluginRoot, manifest, errors);
  }
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

  const skillRoots = findSkillRoots(skillsRoot, pluginRoot, errors);
  for (const skillRoot of skillRoots) {
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
  if (skillRoots.length === 0) {
    errors.push("skills does not contain a SKILL.md file");
  }
  if (declaredSkillIds) {
    validateDeclaredSkills(skillsRoot, skillRoots, declaredSkillIds, errors);
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
    const payload = loadJson(artifactPath, label);
    validateSchema(
      loadJson(path.join(root, schemaRelativePath), `${label} schema`),
      payload,
      artifactPath,
    );
    return payload;
  } catch (error) {
    errors.push(/** @type {Error} */ (error).message);
    return undefined;
  }
}

/** @param {string} pluginRoot @param {unknown} manifest @param {string[]} errors */
function validateManifestResources(pluginRoot, manifest, errors) {
  for (const resourcePath of manifestResourcePaths(manifest)) {
    const target = path.join(pluginRoot, resourcePath);
    if (!isFile(target) || !resolvesInside(pluginRoot, target)) {
      errors.push(
        `plugin manifest resource ${resourcePath} is missing or resolves outside the owning plugin package`,
      );
    }
  }
}

/** @param {unknown} manifest */
function manifestResourcePaths(manifest) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    return [];
  }
  const record =
    /** @type {{apps?: unknown, mcpServers?: unknown, interface?: unknown}} */ (
      manifest
    );
  const paths = [record.apps, record.mcpServers].filter(
    (value) => typeof value === "string",
  );
  if (!record.interface || typeof record.interface !== "object") {
    return paths;
  }
  const interfaceValue = /** @type {Record<string, unknown>} */ (
    record.interface
  );
  for (const field of INTERFACE_ASSET_FIELDS) {
    const value = interfaceValue[field];
    if (typeof value === "string") {
      paths.push(value);
    }
  }
  if (Array.isArray(interfaceValue.screenshots)) {
    for (const screenshot of interfaceValue.screenshots) {
      if (typeof screenshot === "string") {
        paths.push(screenshot);
      }
    }
  }
  return paths;
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
    const content = fs.readFileSync(target, "utf8");
    if (!content.trim()) {
      errors.push(`${fileName} must not be empty`);
    }
    if (fileName === README_FILE) {
      for (const section of missingReadmeSections(content)) {
        errors.push(`README.md is missing required section: ${section}`);
      }
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

/** @param {string} content */
function missingReadmeSections(content) {
  const headings = content.split("\n").filter((line) => line.startsWith("## "));
  return README_REQUIRED_SECTIONS.filter(
    (section) => !headings.some((heading) => heading.includes(section)),
  );
}

/** @param {string} skillsRoot @param {string[]} skillRoots @param {string[]} declaredSkillIds @param {string[]} errors */
function validateDeclaredSkills(
  skillsRoot,
  skillRoots,
  declaredSkillIds,
  errors,
) {
  const actualSkillIds = new Set(
    skillRoots.map((skillRoot) => relative(skillsRoot, skillRoot)),
  );
  for (const skillId of declaredSkillIds) {
    if (!actualSkillIds.has(skillId)) {
      errors.push(`skills/${skillId}/SKILL.md is missing`);
    }
  }
  for (const skillId of actualSkillIds) {
    if (!declaredSkillIds.includes(skillId)) {
      errors.push(`skills/${skillId} is not declared in lib/source.json`);
    }
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
  manifestResourcePaths,
  missingReadmeSections,
  relative,
  resolvesInside,
  validateAuthoredDocuments,
  validateDeclaredSkills,
  validateJsonArtifact,
  validateManifestResources,
  validatePackage,
  validateYamlArtifact,
};
