#!/usr/bin/env node
// @ts-check

const fs = require("node:fs");
const path = require("node:path");
const YAML = require("yaml");

const PLUGINS_DIRECTORY = "plugins";
const SKILLS_DIRECTORY = "skills";

/**
 * @typedef {{id: string, displayName: string, shortDescription: string, defaultPrompt: string}} SkillSource
 * @typedef {{name: string, version: string, description: string, author: object, repository: string, license: string, interface: object, marketplace: {category: string, installation: string, authentication: string}, skills: SkillSource[], apps?: string, mcpServers?: unknown, assets?: string[]}} PluginSource
 * @typedef {{marketplace: {name: string, displayName: string}, plugins: PluginSource[]}} SourceDocument
 */

/** @param {PluginSource} plugin */
function renderPlugin(plugin) {
  const manifest = Object.fromEntries(
    Object.entries(plugin).filter(
      ([key]) => key !== "marketplace" && key !== "skills" && key !== "assets",
    ),
  );
  return `${JSON.stringify({ ...manifest, skills: "./skills/" }, null, 2)}\n`;
}

/** @param {SkillSource} skill */
function renderAgent(skill) {
  return YAML.stringify({
    interface: {
      display_name: skill.displayName,
      short_description: skill.shortDescription,
      default_prompt: skill.defaultPrompt,
    },
  });
}

/** @param {SourceDocument} source */
function renderMarketplace(source) {
  return `${JSON.stringify(
    {
      name: source.marketplace.name,
      interface: { displayName: source.marketplace.displayName },
      plugins: source.plugins.map((plugin) => ({
        name: plugin.name,
        source: { source: "local", path: `./plugins/${plugin.name}` },
        policy: {
          installation: plugin.marketplace.installation,
          authentication: plugin.marketplace.authentication,
        },
        category: plugin.marketplace.category,
      })),
    },
    null,
    2,
  )}\n`;
}

/** @param {string} root @param {PluginSource} plugin */
function syncPlugin(root, plugin) {
  const pluginRoot = ensurePluginRoot(root, plugin.name);
  writeContained(
    pluginRoot,
    path.join(".codex-plugin", "plugin.json"),
    renderPlugin(plugin),
  );
  for (const skill of plugin.skills) {
    const skillRoot = path.join(pluginRoot, SKILLS_DIRECTORY, skill.id);
    ensureContainedDirectory(pluginRoot, skillRoot);
    writeContained(
      skillRoot,
      path.join("agents", "openai.yaml"),
      renderAgent(skill),
    );
  }
}

/** @param {string} root @param {string} pluginName */
function ensurePluginRoot(root, pluginName) {
  const pluginsRoot = path.join(root, PLUGINS_DIRECTORY);
  fs.mkdirSync(pluginsRoot, { recursive: true });
  const pluginRoot = path.join(pluginsRoot, pluginName);
  assertPathInside(pluginsRoot, pluginRoot, { allowMissing: true });
  fs.mkdirSync(pluginRoot, { recursive: true });
  assertPathInside(pluginsRoot, pluginRoot);
  return pluginRoot;
}

/** @param {string} root @param {string} directory */
function ensureContainedDirectory(root, directory) {
  assertPathInside(root, directory, { allowMissing: true });
  fs.mkdirSync(directory, { recursive: true });
  assertPathInside(root, directory);
}

/** @param {string} root @param {string} relativePath @param {string} content */
function writeContained(root, relativePath, content) {
  const target = path.join(root, relativePath);
  ensureContainedDirectory(root, path.dirname(target));
  if (isSymbolicLink(target)) {
    throw new Error(`${target} must not be a symbolic link`);
  }
  assertPathInside(root, target, { allowMissing: true });
  fs.writeFileSync(target, content, "utf8");
  assertPathInside(root, target);
}

/** @param {string} target */
function isSymbolicLink(target) {
  try {
    return fs.lstatSync(target).isSymbolicLink();
  } catch {
    return false;
  }
}

/**
 * @param {string} root
 * @param {string} target
 * @param {{allowMissing?: boolean}} [options]
 */
function assertPathInside(root, target, options = {}) {
  const resolvedRoot = fs.realpathSync(root);
  let candidate = target;
  while (!fs.existsSync(candidate)) {
    const parent = path.dirname(candidate);
    candidate = parent;
  }
  const resolvedCandidate = fs.realpathSync(candidate);
  const isContained =
    resolvedCandidate === resolvedRoot ||
    resolvedCandidate.startsWith(`${resolvedRoot}${path.sep}`);
  if (!isContained) {
    throw new Error(`${target} resolves outside ${root}`);
  }
  if (!options.allowMissing && !fs.existsSync(target)) {
    throw new Error(`${target} is missing`);
  }
}

module.exports = {
  assertPathInside,
  ensureContainedDirectory,
  ensurePluginRoot,
  isSymbolicLink,
  renderAgent,
  renderMarketplace,
  renderPlugin,
  syncPlugin,
  writeContained,
};
