#!/usr/bin/env node
// @ts-check

const fs = require("node:fs");
const path = require("node:path");

const Ajv2020 = require("ajv/dist/2020").default;
const YAML = require("yaml");

const MARKETPLACE_RELATIVE_PATH = ".agents/plugins/marketplace.json";
const PLUGINS_RELATIVE_PATH = "plugins";
const MARKETPLACE_SCHEMA_RELATIVE_PATH = "templates/marketplace.schema.json";
const PLUGIN_SCHEMA_RELATIVE_PATH = "templates/plugin.schema.json";
const AGENT_SCHEMA_RELATIVE_PATH = "templates/agent.schema.json";
const SCOPE_MARKETPLACE = "marketplace";
const SCOPE_PLUGINS = "plugins";
const SCOPE_ALL = "all";
const LOCAL_SOURCE = "local";
const SKILLS_RELATIVE_PATH = "skills";
const SKILL_FILE = "SKILL.md";
const AGENTS_DIRECTORY = "agents";
const AGENT_MANIFEST_FILE = "openai.yaml";
const APP_MANIFEST = ".app.json";
const MCP_MANIFEST = ".mcp.json";
const PLUGIN_MANIFEST_RELATIVE_PATH = ".codex-plugin/plugin.json";
const README_FILE = "README.md";
const CHANGELOG_FILE = "CHANGELOG.md";
const UNRELEASED_HEADING = "## [Unreleased]";
const REQUIRED_README_HEADINGS = [
  "## Purpose",
  "## Included Components",
  "## Supported Environments",
  "## Inputs and Outputs",
  "## Required Tools and Credentials",
  "## Permissions",
  "## Side Effects",
  "## Human Approval Boundaries",
  "## Installation Behavior",
  "## Uninstall and Rollback Behavior",
  "## Verification",
  "## Known Limitations",
  "## Failure and Recovery",
];
const ASSETS_DIRECTORY = "assets";
const ASSET_FIELDS = ["composerIcon", "logo", "logoDark"];
const AGENT_ASSET_FIELDS = ["icon_small", "icon_large"];

/** @param {unknown} error */
function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function parseArgs(argv) {
  const [scope, ...rest] = argv;
  let root = path.resolve(__dirname, "..");

  for (let index = 0; index < rest.length; index += 1) {
    if (rest[index] === "--root") {
      const candidate = rest[index + 1];
      if (!candidate) {
        throw new Error("--root requires a path");
      }
      root = path.resolve(candidate);
      index += 1;
    } else {
      throw new Error(`unknown argument: ${rest[index]}`);
    }
  }

  if (![SCOPE_MARKETPLACE, SCOPE_PLUGINS, SCOPE_ALL].includes(scope)) {
    throw new Error(
      "usage: validate_manifests.cjs <marketplace|plugins|all> [--root PATH]",
    );
  }

  return { root, scope };
}

function main() {
  try {
    const { root, scope } = parseArgs(process.argv.slice(2));
    const result = validateScope(root, scope);

    if (result.errors.length > 0) {
      console.error(`Validation failed (${result.errors.length} error(s)):`);
      for (const error of result.errors) {
        console.error(`- ${error}`);
      }
      process.exitCode = 1;
      return;
    }

    console.log(`Validation passed: ${scope} (${root})`);
  } catch (error) {
    console.error(`Validation command failed: ${errorMessage(error)}`);
    process.exitCode = 2;
  }
}

function validateScope(root, scope) {
  if (scope === SCOPE_MARKETPLACE) {
    return validateMarketplace(root);
  }
  if (scope === SCOPE_PLUGINS) {
    return validatePlugins(root, { requireDirectory: false });
  }
  return validateAll(root);
}

function validateAll(root) {
  const errors = [];
  const schemas = loadSchemas(root, errors);
  const marketplace = validateMarketplace(root, schemas.marketplaceSchema);
  const plugins = validatePlugins(root, {
    agentSchema: schemas.agentSchema,
    pluginSchema: schemas.pluginSchema,
    requireDirectory: true,
  });

  errors.push(...marketplace.errors, ...plugins.errors);
  if (schemas.marketplaceSchema === undefined) {
    errors.push(`${MARKETPLACE_SCHEMA_RELATIVE_PATH} could not be loaded`);
  }
  if (schemas.pluginSchema === undefined) {
    errors.push(`${PLUGIN_SCHEMA_RELATIVE_PATH} could not be loaded`);
  }
  if (schemas.agentSchema === undefined) {
    errors.push(`${AGENT_SCHEMA_RELATIVE_PATH} could not be loaded`);
  }

  const marketplaceNames = new Set(
    [...marketplace.entries.entries()]
      .filter(([, sourceType]) => sourceType === LOCAL_SOURCE)
      .map(([name]) => name),
  );
  for (const pluginName of [...plugins.names].sort()) {
    if (!marketplaceNames.has(pluginName)) {
      errors.push(
        `plugin '${pluginName}' is not registered in ${MARKETPLACE_RELATIVE_PATH}`,
      );
    }
  }
  for (const marketplaceName of [...marketplaceNames].sort()) {
    if (!plugins.names.has(marketplaceName)) {
      errors.push(
        `local marketplace entry '${marketplaceName}' has no plugin directory`,
      );
    }
  }

  return { errors, entries: marketplace.entries };
}

function loadSchemas(root, errors) {
  return {
    marketplaceSchema: loadJson(
      path.join(root, MARKETPLACE_SCHEMA_RELATIVE_PATH),
      errors,
      "marketplace schema",
    ),
    pluginSchema: loadJson(
      path.join(root, PLUGIN_SCHEMA_RELATIVE_PATH),
      errors,
      "plugin schema",
    ),
    agentSchema: loadJson(
      path.join(root, AGENT_SCHEMA_RELATIVE_PATH),
      errors,
      "agent schema",
    ),
  };
}

function validateMarketplace(root, suppliedSchema) {
  const errors = [];
  const schema =
    suppliedSchema ??
    loadJson(
      path.join(root, MARKETPLACE_SCHEMA_RELATIVE_PATH),
      errors,
      "marketplace schema",
    );
  const marketplacePath = path.join(root, MARKETPLACE_RELATIVE_PATH);
  const payload = loadJson(marketplacePath, errors, "marketplace manifest");
  const entries = new Map();

  if (
    schema !== undefined &&
    payload !== undefined &&
    payload !== null &&
    typeof payload === "object"
  ) {
    validateAgainstSchema(schema, payload, marketplacePath, errors);
    validateMarketplaceFilesystem(
      root,
      payload,
      marketplacePath,
      entries,
      errors,
    );
  }

  return { errors, entries };
}

function validateMarketplaceFilesystem(
  root,
  payload,
  marketplacePath,
  entries,
  errors,
) {
  if (!Array.isArray(payload.plugins)) {
    return;
  }

  for (const [index, entry] of payload.plugins.entries()) {
    if (!entry || typeof entry !== "object" || typeof entry.name !== "string") {
      continue;
    }
    const sourceType = entry.source && entry.source.source;
    entries.set(entry.name, sourceType);
    if (sourceType !== LOCAL_SOURCE || typeof entry.source.path !== "string") {
      continue;
    }

    const target = resolveInside(root, entry.source.path);
    const location = `${relativePath(root, marketplacePath)} plugins[${index}].source.path`;
    if (target === undefined) {
      errors.push(`${location} must stay inside the repository`);
    } else if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
      errors.push(`${location} does not point to an existing plugin directory`);
    }
  }
}

function validatePlugins(root, options = {}) {
  const errors = [];
  const names = new Set();
  const pluginsRoot = path.join(root, PLUGINS_RELATIVE_PATH);
  const pluginSchema =
    options.pluginSchema ??
    loadJson(
      path.join(root, PLUGIN_SCHEMA_RELATIVE_PATH),
      errors,
      "plugin schema",
    );
  const agentSchema =
    options.agentSchema ??
    loadJson(
      path.join(root, AGENT_SCHEMA_RELATIVE_PATH),
      errors,
      "agent schema",
    );

  if (!fs.existsSync(pluginsRoot)) {
    if (options.requireDirectory) {
      errors.push(`${PLUGINS_RELATIVE_PATH}/ directory is missing`);
    }
    return { errors, names };
  }
  if (!fs.statSync(pluginsRoot).isDirectory()) {
    errors.push(`${PLUGINS_RELATIVE_PATH}/ must be a directory`);
    return { errors, names };
  }

  const pluginDirectories = fs
    .readdirSync(pluginsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort();

  for (const pluginName of pluginDirectories) {
    names.add(pluginName);
    const pluginRoot = path.join(pluginsRoot, pluginName);
    validatePluginDocumentation(root, pluginRoot, errors);
    const manifestPath = path.join(pluginRoot, PLUGIN_MANIFEST_RELATIVE_PATH);
    if (!fs.existsSync(manifestPath)) {
      errors.push(
        `${relativePath(root, pluginRoot)} is missing .codex-plugin/plugin.json`,
      );
      continue;
    }

    const payload = loadJson(manifestPath, errors, "plugin manifest");
    if (
      pluginSchema !== undefined &&
      payload !== undefined &&
      payload !== null &&
      typeof payload === "object"
    ) {
      validateAgainstSchema(pluginSchema, payload, manifestPath, errors);
      validatePluginFilesystem(root, pluginRoot, payload, manifestPath, errors);
    }
    if (agentSchema !== undefined) {
      validatePluginSkillAgents(pluginRoot, agentSchema, errors);
    }
  }

  return { errors, names };
}

function validatePluginSkillAgents(pluginRoot, agentSchema, errors) {
  const skillsDirectory = path.join(pluginRoot, SKILLS_RELATIVE_PATH);
  if (
    !fs.existsSync(skillsDirectory) ||
    !fs.statSync(skillsDirectory).isDirectory()
  ) {
    return;
  }

  for (const skillPath of findSkillPaths(skillsDirectory)) {
    const skillRoot = path.dirname(skillPath);
    const agentPath = path.join(
      skillRoot,
      AGENTS_DIRECTORY,
      AGENT_MANIFEST_FILE,
    );
    if (!fs.existsSync(agentPath) || !fs.statSync(agentPath).isFile()) {
      errors.push(
        `${relativePath(pluginRoot, agentPath)} is missing for ${relativePath(pluginRoot, skillPath)}`,
      );
      continue;
    }

    const payload = loadYaml(agentPath, errors, "agent manifest");
    if (payload === undefined) {
      continue;
    }
    validateAgainstSchema(agentSchema, payload, agentPath, errors);
    const interfacePayload = payload.interface;
    if (!interfacePayload || typeof interfacePayload !== "object") {
      continue;
    }
    for (const field of AGENT_ASSET_FIELDS) {
      if (typeof interfacePayload[field] === "string") {
        checkAsset(
          skillRoot,
          interfacePayload[field],
          `${relativePath(pluginRoot, agentPath)}.interface.${field}`,
          errors,
        );
      }
    }
  }
}

function findSkillPaths(directory) {
  const skillPaths = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) {
      continue;
    }
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      skillPaths.push(...findSkillPaths(entryPath));
    } else if (entry.isFile() && entry.name === SKILL_FILE) {
      skillPaths.push(entryPath);
    }
  }
  return skillPaths.sort();
}

function validatePluginDocumentation(root, pluginRoot, errors) {
  const pluginPath = relativePath(root, pluginRoot);
  const readmePath = path.join(pluginRoot, README_FILE);
  const changelogPath = path.join(pluginRoot, CHANGELOG_FILE);
  let readme;
  let changelog;

  try {
    readme = fs.readFileSync(readmePath, "utf8");
  } catch (error) {
    errors.push(
      `${path.join(pluginPath, README_FILE)} is missing or unreadable: ${errorMessage(error)}`,
    );
  }
  try {
    changelog = fs.readFileSync(changelogPath, "utf8");
  } catch (error) {
    errors.push(
      `${path.join(pluginPath, CHANGELOG_FILE)} is missing or unreadable: ${errorMessage(error)}`,
    );
  }

  if (readme !== undefined) {
    const headings = readme
      .split("\n")
      .map(normalizeReadmeHeading)
      .filter((heading) => heading !== undefined);
    for (const heading of REQUIRED_README_HEADINGS) {
      if (!headings.includes(heading)) {
        errors.push(
          `${path.join(pluginPath, README_FILE)} is missing required heading '${heading}'`,
        );
      }
    }
  }
  if (
    changelog !== undefined &&
    !changelog.split("\n").includes(UNRELEASED_HEADING)
  ) {
    errors.push(
      `${path.join(pluginPath, CHANGELOG_FILE)} must include ${UNRELEASED_HEADING}`,
    );
  }
}

/** @param {string} line */
function normalizeReadmeHeading(line) {
  const match = /^##\s+(.+?)\s*$/.exec(line);
  if (!match || !match[1]) {
    return undefined;
  }
  const title = match[1].replace(/^[^\p{L}\p{N}`]+/u, "").trim();
  return title ? `## ${title}` : undefined;
}

function validatePluginFilesystem(
  root,
  pluginRoot,
  payload,
  manifestPath,
  errors,
) {
  const location = relativePath(root, manifestPath);
  if (
    typeof payload.name === "string" &&
    payload.name !== path.basename(pluginRoot)
  ) {
    errors.push(
      `${location} field 'name' must match directory '${path.basename(pluginRoot)}'`,
    );
  }

  if (payload.skills !== undefined) {
    const skillsDirectory = path.join(pluginRoot, SKILLS_RELATIVE_PATH);
    if (
      !fs.existsSync(skillsDirectory) ||
      !fs.statSync(skillsDirectory).isDirectory()
    ) {
      errors.push(
        `${location} field 'skills' points to a missing skills/ directory`,
      );
    }
  }
  if (
    payload.apps !== undefined &&
    !fs.existsSync(path.join(pluginRoot, APP_MANIFEST))
  ) {
    errors.push(`${location} field 'apps' points to a missing .app.json`);
  }
  if (
    typeof payload.mcpServers === "string" &&
    !fs.existsSync(path.join(pluginRoot, MCP_MANIFEST))
  ) {
    errors.push(`${location} field 'mcpServers' points to a missing .mcp.json`);
  }

  const interfacePayload = payload.interface;
  if (!interfacePayload || typeof interfacePayload !== "object") {
    return;
  }
  for (const field of ASSET_FIELDS) {
    if (typeof interfacePayload[field] === "string") {
      checkAsset(
        pluginRoot,
        interfacePayload[field],
        `${location}.interface.${field}`,
        errors,
      );
    }
  }
  if (Array.isArray(interfacePayload.screenshots)) {
    for (const [index, screenshot] of interfacePayload.screenshots.entries()) {
      if (typeof screenshot === "string") {
        checkAsset(
          pluginRoot,
          screenshot,
          `${location}.interface.screenshots[${index}]`,
          errors,
        );
      }
    }
  }
}

function checkAsset(pluginRoot, rawPath, location, errors) {
  const assetPath = resolveInside(pluginRoot, rawPath);
  const relativeAssetPath =
    assetPath === undefined ? undefined : path.relative(pluginRoot, assetPath);
  if (
    assetPath === undefined ||
    relativeAssetPath === undefined ||
    relativeAssetPath === "" ||
    relativeAssetPath === ASSETS_DIRECTORY ||
    (!relativeAssetPath.startsWith(`${ASSETS_DIRECTORY}${path.sep}`) &&
      !relativeAssetPath.startsWith(`${ASSETS_DIRECTORY}/`))
  ) {
    errors.push(`${location} must stay under ./${ASSETS_DIRECTORY}/`);
    return;
  }
  if (!fs.existsSync(assetPath) || !fs.statSync(assetPath).isFile()) {
    errors.push(`${location} points to a missing file`);
  }
}

function validateAgainstSchema(schema, payload, manifestPath, errors) {
  let validator;
  try {
    const ajv = new Ajv2020({ allErrors: true, strict: true });
    validator = ajv.compile(schema);
  } catch (error) {
    errors.push(
      `schema compilation failed for ${manifestPath}: ${errorMessage(error)}`,
    );
    return;
  }

  if (validator(payload)) {
    return;
  }
  for (const error of validator.errors ?? []) {
    const location = error.instancePath || "$";
    errors.push(`${manifestPath} ${location} ${error.message}`);
  }
}

function loadJson(filePath, errors, kind) {
  let text;
  try {
    text = fs.readFileSync(filePath, "utf8");
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      errors.push(`${filePath} is missing (${kind})`);
    } else {
      errors.push(`unable to read ${filePath}: ${errorMessage(error)}`);
    }
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    errors.push(`${filePath} is invalid JSON: ${errorMessage(error)}`);
    return undefined;
  }
}

function loadYaml(filePath, errors, _kind) {
  let text;
  try {
    text = fs.readFileSync(filePath, "utf8");
  } catch (error) {
    errors.push(`unable to read ${filePath}: ${errorMessage(error)}`);
    return undefined;
  }

  try {
    const document = YAML.parseDocument(text, { prettyErrors: false });
    if (document.errors.length > 0) {
      throw document.errors[0];
    }
    return document.toJS();
  } catch (error) {
    errors.push(`${filePath} is invalid YAML: ${errorMessage(error)}`);
    return undefined;
  }
}

function resolveInside(root, rawPath) {
  if (typeof rawPath !== "string") {
    return undefined;
  }
  const candidate = rawPath.replaceAll("\\", "/");
  if (!candidate.startsWith("./")) {
    return undefined;
  }
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(resolvedRoot, candidate);
  if (
    resolved !== resolvedRoot &&
    !resolved.startsWith(`${resolvedRoot}${path.sep}`)
  ) {
    return undefined;
  }
  return resolved;
}

function relativePath(root, target) {
  return path.relative(root, target) || ".";
}

// The module guard is exercised by the CLI tests; Vitest imports this module for unit coverage.
/* c8 ignore next */
if (require.main === module) {
  main();
}

module.exports = {
  checkAsset,
  errorMessage,
  loadJson,
  loadYaml,
  main,
  parseArgs,
  relativePath,
  resolveInside,
  validateAgainstSchema,
  validateMarketplace,
  validatePlugins,
  validatePluginDocumentation,
  validatePluginFilesystem,
  validatePluginSkillAgents,
  validateScope,
};
