#!/usr/bin/env node
// @ts-check

const fs = require("node:fs");
const path = require("node:path");

const { loadSource } = require("../core/source.cjs");
const {
  renderAgent,
  renderMarketplace,
  renderPlugin,
  syncPlugin,
  writeContained,
} = require("../sync/render.cjs");

/**
 * @typedef {{id: string, displayName: string, shortDescription: string, defaultPrompt: string}} SkillSource
 * @typedef {{name: string, version: string, description: string, author: object, repository: string, license: string, interface: object, marketplace: {category: string, installation: string, authentication: string}, skills: SkillSource[], apps?: string, mcpServers?: unknown, assets?: string[]}} PluginSource
 * @typedef {{marketplace: {name: string, displayName: string}, plugins: PluginSource[]}} SourceDocument
 */

/** @param {string} root @param {{write?: boolean}} [options] */
function syncAll(root, options = {}) {
  const source = loadSource(root);
  const artifacts = expectedArtifacts(root, source);
  if (!options.write) {
    return artifacts
      .filter(({ target, content }) => !sameContent(target, content))
      .map(
        ({ target }) =>
          `${relative(root, target)} has drifted from lib/source.json`,
      );
  }

  for (const plugin of source.plugins) {
    syncPlugin(root, plugin);
  }
  const marketplace = artifacts[0];
  writeContained(
    root,
    path.join(".agents", "plugins", "marketplace.json"),
    marketplace.content,
  );
  return [];
}

/** @param {string} root @param {SourceDocument} source */
function expectedArtifacts(root, source) {
  const artifacts = [
    {
      target: marketplacePath(root),
      content: renderMarketplace(source),
    },
  ];
  for (const plugin of source.plugins) {
    const pluginRoot = path.join(root, "plugins", plugin.name);
    artifacts.push({
      target: path.join(pluginRoot, ".codex-plugin", "plugin.json"),
      content: renderPlugin(plugin),
    });
    for (const skill of plugin.skills) {
      artifacts.push({
        target: path.join(
          pluginRoot,
          "skills",
          skill.id,
          "agents",
          "openai.yaml",
        ),
        content: renderAgent(skill),
      });
    }
  }
  return artifacts;
}

/** @param {string} root */
function marketplacePath(root) {
  return path.join(root, ".agents", "plugins", "marketplace.json");
}

/** @param {string} target @param {string} content */
function sameContent(target, content) {
  try {
    return fs.readFileSync(target, "utf8") === content;
  } catch {
    return false;
  }
}

/** @param {string} root @param {string} target */
function relative(root, target) {
  return path.relative(root, target).replaceAll(path.sep, "/");
}

function main() {
  const args = process.argv.slice(2);
  const write = args.includes("--write");
  const rootIndex = args.indexOf("--root");
  const rootArgument = rootIndex === -1 ? undefined : args[rootIndex + 1];
  if (rootIndex !== -1 && !rootArgument) {
    throw new Error("--root requires a path");
  }
  const knownArguments = new Set(["--write", "--root", rootArgument]);
  for (const argument of args) {
    if (!knownArguments.has(argument)) {
      throw new Error(`unknown argument: ${argument}`);
    }
  }
  const root = rootArgument
    ? path.resolve(rootArgument)
    : path.resolve(__dirname, "..", "..");
  const errors = syncAll(root, { write });
  if (errors.length > 0) {
    for (const error of errors) {
      console.error(error);
    }
    process.exitCode = 1;
  }
}

/* c8 ignore next */
if (require.main === module) {
  main();
}

module.exports = {
  expectedArtifacts,
  main,
  marketplacePath,
  sameContent,
  syncAll,
};
