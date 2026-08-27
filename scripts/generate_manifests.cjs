#!/usr/bin/env node
// @ts-check

const fs = require("node:fs");
const path = require("node:path");

const { loadJson, validateAgainstSchema } = require("./validate_manifests.cjs");

const COMMAND_COMPLETE = "complete";
const COMMAND_MARKETPLACE = "marketplace";
const COMMAND_PLUGIN = "plugin";
const DEFAULT_AUTHOR = "Nery Samuel Murillo";
const DEFAULT_AUTHOR_URL = "https://github.com/nerymurillohnd";
const DEFAULT_REPOSITORY = "https://github.com/nerymurillohnd/codex-essentials";
const DEFAULT_LICENSE = "MIT";
const DEFAULT_CATEGORY = "Productivity";
const DEFAULT_VERSION = "0.1.0";
const DEFAULT_SKILLS_PATH = "./skills/";
const SKILLS_DIRECTORY = "skills";
const DEFAULT_INSTALLATION_POLICY = "AVAILABLE";
const DEFAULT_AUTHENTICATION_POLICY = "ON_INSTALL";
const LOCAL_SOURCE = "local";
const DEFAULT_MARKETPLACE_NAME = "codex-essentials";
const DEFAULT_MARKETPLACE_DISPLAY_NAME = "Codex Essentials";
const MARKETPLACE_RELATIVE_PATH = ".agents/plugins/marketplace.json";
const MARKETPLACE_SCHEMA_RELATIVE_PATH = "templates/marketplace.schema.json";
const PLUGIN_SCHEMA_RELATIVE_PATH = "templates/plugin.schema.json";
const PLUGINS_RELATIVE_PATH = "plugins";
const PLUGIN_MANIFEST_RELATIVE_PATH = ".codex-plugin/plugin.json";
const README_FILE = "README.md";
const CHANGELOG_FILE = "CHANGELOG.md";
const README_TEMPLATE_RELATIVE_PATH = "templates/README.md";
const CHANGELOG_TEMPLATE_RELATIVE_PATH = "templates/CHANGELOG.md";
const PLUGIN_NAME_TOKEN = "{{PLUGIN_NAME}}";
const PLUGIN_DISPLAY_NAME_TOKEN = "{{PLUGIN_DISPLAY_NAME}}";
const PLUGIN_IDENTIFIER_PATTERN = /^[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*$/;

/** @param {unknown} error */
function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result =
      options.command === COMMAND_MARKETPLACE
        ? generateMarketplace(options)
        : options.command === COMMAND_PLUGIN
          ? generatePlugin(options)
          : options.command === COMMAND_COMPLETE
            ? completeManifest(options)
            : (() => {
                throw new Error(`unsupported command: ${options.command}`);
              })();

    for (const message of result.messages) {
      console.log(message);
    }
  } catch (error) {
    console.error(`Generation failed: ${errorMessage(error)}`);
    process.exitCode = 1;
  }
}

function parseArgs(argv) {
  const command = argv[0];
  const type = command === COMMAND_COMPLETE ? argv[1] : command;
  const pluginName =
    type === COMMAND_PLUGIN
      ? argv[command === COMMAND_COMPLETE ? 2 : 1]
      : undefined;
  const optionStart =
    command === COMMAND_COMPLETE
      ? type === COMMAND_PLUGIN
        ? 3
        : 2
      : type === COMMAND_PLUGIN
        ? 2
        : 1;
  const options = {
    command,
    type,
    pluginName,
    root: path.resolve(__dirname, ".."),
    name: undefined,
    displayName: undefined,
    description: undefined,
    version: DEFAULT_VERSION,
    force: false,
    withoutMarketplace: false,
  };

  for (let index = optionStart; index < argv.length; index += 1) {
    const option = argv[index];
    if (
      option === "--root" ||
      option === "--name" ||
      option === "--display-name" ||
      option === "--description" ||
      option === "--version"
    ) {
      const value = argv[index + 1];
      if (!value) {
        throw new Error(`${option} requires a value`);
      }
      if (option === "--root") {
        options.root = path.resolve(value);
      }
      if (option === "--name") {
        options.name = value;
      }
      if (option === "--display-name") {
        options.displayName = value;
      }
      if (option === "--description") {
        options.description = value;
      }
      if (option === "--version") {
        options.version = value;
      }
      index += 1;
    } else if (option === "--force") {
      options.force = true;
    } else if (option === "--without-marketplace") {
      options.withoutMarketplace = true;
    } else {
      throw new Error(`unknown argument: ${option}`);
    }
  }

  if (
    options.command === COMMAND_COMPLETE &&
    ![COMMAND_MARKETPLACE, COMMAND_PLUGIN].includes(options.type)
  ) {
    throw new Error(
      "usage: generate_manifests.cjs complete <marketplace|plugin> [options]",
    );
  }
  if (
    [COMMAND_PLUGIN, COMMAND_COMPLETE].includes(options.command) &&
    options.type === COMMAND_PLUGIN
  ) {
    if (!options.pluginName) {
      throw new Error("plugin generation requires a plugin name");
    }
    if (!PLUGIN_IDENTIFIER_PATTERN.test(options.pluginName)) {
      throw new Error(`invalid plugin identifier: ${options.pluginName}`);
    }
  }

  return options;
}

function generateMarketplace(options) {
  const marketplaceName = options.name || DEFAULT_MARKETPLACE_NAME;
  const displayName = options.displayName || titleCase(marketplaceName);
  const payload = buildMarketplace(marketplaceName, displayName);
  const target = path.join(options.root, MARKETPLACE_RELATIVE_PATH);

  writeValidatedJson(
    target,
    payload,
    path.join(options.root, MARKETPLACE_SCHEMA_RELATIVE_PATH),
    options,
  );
  return { messages: [`Generated marketplace: ${target}`] };
}

function generatePlugin(options) {
  const displayName = options.displayName || titleCase(options.pluginName);
  const description = options.description || `${displayName} for Codex.`;
  const pluginRoot = path.join(
    options.root,
    PLUGINS_RELATIVE_PATH,
    options.pluginName,
  );
  const manifestPath = path.join(pluginRoot, PLUGIN_MANIFEST_RELATIVE_PATH);
  const payload = buildPlugin(
    options.pluginName,
    displayName,
    description,
    options.version,
  );

  fs.mkdirSync(path.join(pluginRoot, SKILLS_DIRECTORY), { recursive: true });
  writeValidatedJson(
    manifestPath,
    payload,
    path.join(options.root, PLUGIN_SCHEMA_RELATIVE_PATH),
    options,
  );
  writeDocumentationTemplates(options.root, pluginRoot, {
    pluginName: options.pluginName,
    displayName,
  });

  const messages = [`Generated plugin: ${manifestPath}`];
  if (!options.withoutMarketplace) {
    messages.push(updateMarketplace(options.root, payload.name, options));
  }
  return { messages };
}

function completeManifest(options) {
  if (options.type === COMMAND_MARKETPLACE) {
    const target = path.join(options.root, MARKETPLACE_RELATIVE_PATH);
    const existing = readObjectIfPresent(target);
    const payload = {
      ...buildMarketplace(
        existing?.name || options.name || DEFAULT_MARKETPLACE_NAME,
        existing?.interface?.displayName ||
          options.displayName ||
          titleCase(existing?.name || options.name || DEFAULT_MARKETPLACE_NAME),
      ),
      ...existing,
      interface: {
        displayName:
          existing?.interface?.displayName ||
          options.displayName ||
          titleCase(existing?.name || options.name || DEFAULT_MARKETPLACE_NAME),
        ...(existing?.interface || {}),
      },
      plugins: existing?.plugins || [],
    };
    writeValidatedJson(
      target,
      payload,
      path.join(options.root, MARKETPLACE_SCHEMA_RELATIVE_PATH),
      { ...options, force: true },
    );
    return { messages: [`Completed marketplace: ${target}`] };
  }

  const displayName = options.displayName || titleCase(options.pluginName);
  const pluginRoot = path.join(
    options.root,
    PLUGINS_RELATIVE_PATH,
    options.pluginName,
  );
  const manifestPath = path.join(pluginRoot, PLUGIN_MANIFEST_RELATIVE_PATH);
  const existing = readObjectIfPresent(manifestPath);
  const defaults = buildPlugin(
    options.pluginName,
    displayName,
    options.description || `${displayName} for Codex.`,
    options.version,
  );
  const payload = {
    ...defaults,
    ...existing,
    author: { ...defaults.author, ...(existing?.author || {}) },
    interface: { ...defaults.interface, ...(existing?.interface || {}) },
  };

  fs.mkdirSync(path.join(pluginRoot, SKILLS_DIRECTORY), { recursive: true });
  writeValidatedJson(
    manifestPath,
    payload,
    path.join(options.root, PLUGIN_SCHEMA_RELATIVE_PATH),
    { ...options, force: true },
  );
  writeDocumentationTemplates(options.root, pluginRoot, {
    pluginName: options.pluginName,
    displayName,
  });
  const messages = [`Completed plugin: ${manifestPath}`];
  if (!options.withoutMarketplace) {
    messages.push(updateMarketplace(options.root, payload.name, options));
  }
  return { messages };
}

function buildMarketplace(name, displayName) {
  return {
    name,
    interface: { displayName },
    plugins: [],
  };
}

function buildPlugin(name, displayName, description, version) {
  return {
    name,
    version,
    description,
    author: {
      name: DEFAULT_AUTHOR,
      url: DEFAULT_AUTHOR_URL,
    },
    repository: DEFAULT_REPOSITORY,
    license: DEFAULT_LICENSE,
    skills: DEFAULT_SKILLS_PATH,
    interface: {
      displayName,
      shortDescription: `${displayName} for Codex`,
      longDescription: description,
      developerName: DEFAULT_AUTHOR,
      category: DEFAULT_CATEGORY,
      capabilities: ["Skills"],
      defaultPrompt: `Use ${displayName}`,
    },
  };
}

function updateMarketplace(root, pluginName, options) {
  const target = path.join(root, MARKETPLACE_RELATIVE_PATH);
  const existing =
    readObjectIfPresent(target) ||
    buildMarketplace(
      DEFAULT_MARKETPLACE_NAME,
      DEFAULT_MARKETPLACE_DISPLAY_NAME,
    );
  const plugins = Array.isArray(existing.plugins) ? [...existing.plugins] : [];
  const entry = {
    name: pluginName,
    source: {
      source: LOCAL_SOURCE,
      path: `./${PLUGINS_RELATIVE_PATH}/${pluginName}`,
    },
    policy: {
      installation: DEFAULT_INSTALLATION_POLICY,
      authentication: DEFAULT_AUTHENTICATION_POLICY,
    },
    category: DEFAULT_CATEGORY,
  };
  const index = plugins.findIndex((item) => item && item.name === pluginName);
  if (index === -1) {
    plugins.push(entry);
  } else {
    plugins[index] = entry;
  }
  const payload = {
    ...buildMarketplace(
      existing.name || DEFAULT_MARKETPLACE_NAME,
      existing.interface?.displayName || DEFAULT_MARKETPLACE_DISPLAY_NAME,
    ),
    ...existing,
    interface: existing.interface || {
      displayName: DEFAULT_MARKETPLACE_DISPLAY_NAME,
    },
    plugins,
  };
  writeValidatedJson(
    target,
    payload,
    path.join(root, MARKETPLACE_SCHEMA_RELATIVE_PATH),
    { ...options, force: true },
  );
  return `Updated marketplace: ${target}`;
}

function writeValidatedJson(target, payload, schemaPath, options) {
  if (fs.existsSync(target) && !options.force) {
    throw new Error(`${target} already exists; pass --force or use complete`);
  }
  const errors = [];
  const schema = loadJson(schemaPath, errors, "schema");
  if (schema === undefined) {
    throw new Error(errors.join("; "));
  }
  validateAgainstSchema(schema, payload, target, errors);
  if (errors.length > 0) {
    throw new Error(errors.join("; "));
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

/**
 * @param {string} root
 * @param {string} pluginRoot
 * @param {{pluginName: string, displayName: string}} values
 */
function writeDocumentationTemplates(root, pluginRoot, values) {
  const templates = [
    {
      source: path.join(root, README_TEMPLATE_RELATIVE_PATH),
      target: path.join(pluginRoot, README_FILE),
    },
    {
      source: path.join(root, CHANGELOG_TEMPLATE_RELATIVE_PATH),
      target: path.join(pluginRoot, CHANGELOG_FILE),
    },
  ];
  for (const template of templates) {
    if (!fs.existsSync(template.source)) {
      throw new Error(`missing documentation template: ${template.source}`);
    }
    if (fs.existsSync(template.target)) {
      continue;
    }
    const content = fs
      .readFileSync(template.source, "utf8")
      .replaceAll(PLUGIN_NAME_TOKEN, values.pluginName)
      .replaceAll(PLUGIN_DISPLAY_NAME_TOKEN, values.displayName);
    fs.writeFileSync(template.target, content, "utf8");
  }
}

function readObjectIfPresent(target) {
  if (!fs.existsSync(target)) {
    return undefined;
  }
  const errors = [];
  const payload = loadJson(target, errors, "existing manifest");
  if (
    errors.length > 0 ||
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    throw new Error(
      errors.join("; ") || `${target} must contain a JSON object`,
    );
  }
  return payload;
}

function titleCase(value) {
  return value
    .split(/[._-]+/u)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

// The module guard is exercised by the CLI tests; Vitest imports this module for unit coverage.
/* c8 ignore next */
if (require.main === module) {
  main();
}

module.exports = {
  buildMarketplace,
  buildPlugin,
  completeManifest,
  generateMarketplace,
  generatePlugin,
  main,
  parseArgs,
  readObjectIfPresent,
  titleCase,
  updateMarketplace,
  writeValidatedJson,
  writeDocumentationTemplates,
};
