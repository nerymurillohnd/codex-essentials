#!/usr/bin/env node
// @ts-check

const fs = require("node:fs");
const path = require("node:path");

const { loadSource } = require("../core/source.cjs");
const { syncAll } = require("./sync.cjs");

const IDENTIFIER = /^[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*$/u;
const DEFAULT_AUTHOR = "Nery Samuel Murillo";
const DEFAULT_AUTHOR_URL = "https://github.com/nerymurillohnd";
const DEFAULT_REPOSITORY = "https://github.com/nerymurillohnd/codex-essentials";

/** @param {string} root @param {string} pluginName */
function scaffoldPlugin(root, pluginName) {
  if (!IDENTIFIER.test(pluginName)) {
    throw new Error(`invalid plugin identifier: ${pluginName}`);
  }
  const source = loadSource(root);
  if (source.plugins.some((plugin) => plugin.name === pluginName)) {
    throw new Error(`${pluginName} already exists in lib/source.json`);
  }
  const displayName = titleCase(pluginName);
  const plugin = defaultPlugin(pluginName, displayName);
  source.plugins.push(plugin);
  fs.writeFileSync(
    path.join(root, "lib", "source.json"),
    `${JSON.stringify(source, null, 2)}\n`,
    "utf8",
  );

  const pluginRoot = path.join(root, "plugins", pluginName);
  writeTemplate(root, path.join(pluginRoot, "README.md"), "README.md", {
    PLUGIN_NAME: pluginName,
    PLUGIN_DISPLAY_NAME: displayName,
  });
  writeTemplate(root, path.join(pluginRoot, "CHANGELOG.md"), "CHANGELOG.md", {
    PLUGIN_NAME: pluginName,
    PLUGIN_DISPLAY_NAME: displayName,
  });
  writeTemplate(
    root,
    path.join(pluginRoot, "skills", pluginName, "SKILL.md"),
    "SKILL.md",
    { SKILL_DISPLAY_NAME: displayName },
  );
  syncAll(root, { write: true });
}

/** @param {string} name @param {string} displayName */
function defaultPlugin(name, displayName) {
  return {
    name,
    version: "0.1.0",
    description: `${displayName} for Codex.`,
    author: { name: DEFAULT_AUTHOR, url: DEFAULT_AUTHOR_URL },
    repository: DEFAULT_REPOSITORY,
    license: "MIT",
    interface: {
      displayName,
      shortDescription: `${displayName} for Codex`,
      longDescription: `${displayName} for Codex.`,
      developerName: DEFAULT_AUTHOR,
      category: "Productivity",
      capabilities: ["Skills"],
      defaultPrompt: `Use ${displayName}`,
    },
    marketplace: {
      category: "Productivity",
      installation: "AVAILABLE",
      authentication: "ON_INSTALL",
    },
    skills: [
      {
        id: name,
        displayName,
        shortDescription: `Use ${displayName} in Codex`,
        defaultPrompt: `Use ${displayName}`,
      },
    ],
  };
}

/** @param {string} root @param {string} target @param {string} templateName @param {Record<string, string>} values */
function writeTemplate(root, target, templateName, values) {
  if (fs.existsSync(target)) {
    return;
  }
  let content = fs.readFileSync(
    path.join(root, "lib", "templates", templateName),
    "utf8",
  );
  for (const [key, value] of Object.entries(values)) {
    content = content.replaceAll(`{{${key}}}`, value);
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, "utf8");
}

/** @param {string} value */
function titleCase(value) {
  return value
    .split(/[._-]+/u)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function main() {
  const [pluginName, ...options] = process.argv.slice(2);
  const rootIndex = options.indexOf("--root");
  const root =
    rootIndex === -1
      ? path.resolve(__dirname, "..", "..")
      : path.resolve(options[rootIndex + 1]);
  if (!pluginName) {
    throw new Error("plugin identifier is required");
  }
  scaffoldPlugin(root, pluginName);
}

/* c8 ignore next */
if (require.main === module) {
  main();
}

module.exports = {
  defaultPlugin,
  main,
  scaffoldPlugin,
  titleCase,
  writeTemplate,
};
