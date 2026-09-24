import { existsSync, lstatSync, readdirSync, readFileSync } from "node:fs";
import { basename, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import semver from "semver";
import { parseDocument } from "yaml";

const scriptRoot = fileURLToPath(new URL("..", import.meta.url));
const portableSchemaUrl =
  "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json";
const mcpSchemaUrl = "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json";
const pluginIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const skillIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const hookEvents = new Set([
  "PreToolUse",
  "PermissionRequest",
  "PostToolUse",
  "PreCompact",
  "PostCompact",
  "UserPromptSubmit",
  "SubagentStart",
  "SubagentStop",
  "Stop",
  "Interrupt",
  "SessionStart",
  "SessionEnd",
]);

const ajv = new Ajv2020({ allErrors: true, strict: true });
const pluginSchema = JSON.parse(
  readFileSync(
    join(scriptRoot, "vendor/agent-plugins/1.0.0/plugin.schema.json"),
    "utf8",
  ),
);
const mcpSchema = JSON.parse(
  readFileSync(
    join(scriptRoot, "vendor/agent-plugins/1.0.0/mcp.schema.json"),
    "utf8",
  ),
);
const validatePortablePlugin = ajv.compile(pluginSchema);
const validatePortableMcp = ajv.compile(mcpSchema);

function fail(path, message) {
  throw new Error(`${path}: ${message}`);
}

function readText(path) {
  try {
    return readFileSync(path, "utf8");
  } catch (error) {
    fail(path, `cannot read file: ${error.message}`);
  }
}

function readJson(path) {
  try {
    return JSON.parse(readText(path));
  } catch (error) {
    if (error instanceof SyntaxError)
      fail(path, `invalid JSON: ${error.message}`);
    throw error;
  }
}

function requireFile(path) {
  let stat;
  try {
    stat = lstatSync(path);
  } catch {
    fail(path, "required file is missing");
  }
  if (!stat.isFile()) fail(path, "must be a regular file");
  return path;
}

function requireNonEmptyString(value, path) {
  if (typeof value !== "string" || value.trim() === "") {
    fail(path, "must be a non-empty string");
  }
  return value;
}

function parseYaml(path, source) {
  const document = parseDocument(source, { uniqueKeys: true });
  if (document.errors.length > 0) {
    fail(path, `invalid YAML: ${document.errors[0].message}`);
  }
  const value = document.toJS();
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    fail(path, "must be a YAML mapping");
  }
  return value;
}

function checkNoSymlinks(root) {
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    const stat = lstatSync(path);
    if (stat.isSymbolicLink())
      fail(path, "symbolic link is not allowed in a package");
    if (stat.isDirectory()) checkNoSymlinks(path);
  }
}

function checkPackagePath(packageRoot, value, path) {
  if (typeof value !== "string" || !value.startsWith("./")) {
    fail(path, "must be a ./-prefixed package path");
  }
  const target = resolve(packageRoot, value);
  const inside = relative(packageRoot, target);
  if (inside === "" || inside === ".." || inside.startsWith(`..${sep}`)) {
    fail(path, "resolves outside the package");
  }
  requireFile(target);
  return target;
}

function validateHooks(config, path) {
  if (config === null || typeof config !== "object" || Array.isArray(config)) {
    fail(path, "hooks configuration must be an object");
  }
  if (
    config.hooks === null ||
    typeof config.hooks !== "object" ||
    Array.isArray(config.hooks)
  ) {
    fail(path, "hooks configuration must contain an event mapping");
  }
  if (Object.keys(config.hooks).length === 0)
    fail(path, "hooks event mapping is empty");
  for (const [event, groups] of Object.entries(config.hooks)) {
    if (!hookEvents.has(event)) fail(path, `unsupported hook event ${event}`);
    if (!Array.isArray(groups) || groups.length === 0) {
      fail(path, `${event} must contain matcher groups`);
    }
    for (const group of groups) {
      if (group === null || typeof group !== "object" || Array.isArray(group)) {
        fail(path, `${event} matcher group must be an object`);
      }
      if (group.matcher !== undefined && typeof group.matcher !== "string") {
        fail(path, `${event} matcher must be a string`);
      }
      if (!Array.isArray(group.hooks) || group.hooks.length === 0) {
        fail(path, `${event} matcher group must have handlers`);
      }
      for (const handler of group.hooks) {
        if (
          handler === null ||
          typeof handler !== "object" ||
          Array.isArray(handler)
        ) {
          fail(path, `${event} handler must be an object`);
        }
        if (handler.type === "command") {
          requireNonEmptyString(handler.command, `${path} ${event} command`);
        } else if (handler.type === "mcp_tool") {
          requireNonEmptyString(handler.server, `${path} ${event} server`);
          requireNonEmptyString(handler.tool, `${path} ${event} tool`);
          if (
            handler.input !== undefined &&
            (handler.input === null ||
              typeof handler.input !== "object" ||
              Array.isArray(handler.input))
          ) {
            fail(path, `${event} MCP tool input must be an object`);
          }
        } else {
          fail(
            path,
            `${event} handler type ${handler.type} is not executable by Codex`,
          );
        }
      }
    }
  }
}

function validateSkill(skillRoot) {
  const id = basename(skillRoot);
  if (!skillIdPattern.test(id)) fail(skillRoot, "invalid skill directory name");
  const path = requireFile(join(skillRoot, "SKILL.md"));
  const content = readText(path);
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(content);
  if (frontmatter === null)
    fail(path, "SKILL.md must begin with YAML frontmatter");
  const metadata = parseYaml(path, frontmatter[1]);
  if (metadata.name !== id) fail(path, `skill name must match directory ${id}`);
  requireNonEmptyString(metadata.description, `${path} description`);
  if (content.slice(frontmatter[0].length).trim() === "") {
    fail(path, "skill instructions must not be empty");
  }
  const agentPath = join(skillRoot, "agents", "openai.yaml");
  try {
    const agentStat = lstatSync(agentPath);
    if (!agentStat.isFile()) fail(agentPath, "must be a regular file");
    const agent = parseYaml(agentPath, readText(agentPath));
    if (agent.interface !== undefined) {
      requireNonEmptyString(
        agent.interface?.display_name,
        `${agentPath} display_name`,
      );
      requireNonEmptyString(
        agent.interface?.short_description,
        `${agentPath} short_description`,
      );
    }
    if (
      agent.policy?.allow_implicit_invocation !== undefined &&
      typeof agent.policy.allow_implicit_invocation !== "boolean"
    ) {
      fail(agentPath, "allow_implicit_invocation must be a boolean");
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  return id;
}

function validateOnePackage(packageRoot) {
  const id = basename(packageRoot);
  if (!pluginIdPattern.test(id))
    fail(packageRoot, "invalid plugin directory name");
  checkNoSymlinks(packageRoot);
  const manifestPath = requireFile(join(packageRoot, "plugin.json"));
  const manifest = readJson(manifestPath);
  if (!validatePortablePlugin(manifest)) {
    fail(
      manifestPath,
      `portable schema violation: ${ajv.errorsText(validatePortablePlugin.errors)}`,
    );
  }
  if (manifest.$schema !== portableSchemaUrl) {
    fail(manifestPath, `must target ${portableSchemaUrl}`);
  }
  if (manifest.name !== id)
    fail(manifestPath, `name must match package directory ${id}`);
  if (!pluginIdPattern.test(id)) fail(manifestPath, "invalid plugin ID");
  if (typeof manifest.version !== "string" || !semver.valid(manifest.version)) {
    fail(manifestPath, "version must be valid SemVer");
  }
  requireNonEmptyString(manifest.description, `${manifestPath} description`);
  requireNonEmptyString(manifest.license, `${manifestPath} license`);
  requireNonEmptyString(manifest.author?.name, `${manifestPath} author.name`);

  const interfaceData = manifest.extensions?.["com.openai"]?.interface;
  if (
    interfaceData === null ||
    typeof interfaceData !== "object" ||
    Array.isArray(interfaceData)
  ) {
    fail(manifestPath, "extensions.com.openai.interface is required");
  }
  requireNonEmptyString(
    interfaceData.displayName,
    `${manifestPath} displayName`,
  );
  requireNonEmptyString(
    interfaceData.shortDescription,
    `${manifestPath} shortDescription`,
  );
  const category = requireNonEmptyString(
    interfaceData.category,
    `${manifestPath} category`,
  );
  for (const key of ["composerIcon", "logo"]) {
    if (interfaceData[key] !== undefined) {
      checkPackagePath(
        packageRoot,
        interfaceData[key],
        `${manifestPath} ${key}`,
      );
    }
  }
  if (interfaceData.screenshots !== undefined) {
    if (!Array.isArray(interfaceData.screenshots))
      fail(manifestPath, "screenshots must be an array");
    for (const path of interfaceData.screenshots) {
      checkPackagePath(packageRoot, path, `${manifestPath} screenshots`);
    }
  }
  const hookSetting = manifest.extensions?.["com.openai"]?.hooks;
  let hasHooks = false;
  if (typeof hookSetting === "string") {
    const path = checkPackagePath(
      packageRoot,
      hookSetting,
      `${manifestPath} hooks`,
    );
    validateHooks(readJson(path), path);
    hasHooks = true;
  } else if (Array.isArray(hookSetting)) {
    if (hookSetting.length === 0)
      fail(manifestPath, "hooks array must not be empty");
    for (const entry of hookSetting) {
      if (typeof entry === "string") {
        const path = checkPackagePath(
          packageRoot,
          entry,
          `${manifestPath} hooks`,
        );
        validateHooks(readJson(path), path);
      } else {
        validateHooks(entry, manifestPath);
      }
    }
    hasHooks = true;
  } else if (hookSetting !== undefined) {
    validateHooks(hookSetting, manifestPath);
    hasHooks = true;
  } else {
    const defaultHooksPath = join(packageRoot, "hooks", "hooks.json");
    if (existsSync(defaultHooksPath)) {
      requireFile(defaultHooksPath);
      validateHooks(readJson(defaultHooksPath), defaultHooksPath);
      hasHooks = true;
    }
  }

  for (const name of ["README.md", "CHANGELOG.md", "LICENSE.md"]) {
    const path = requireFile(join(packageRoot, name));
    if (readText(path).trim() === "") fail(path, "must not be empty");
  }
  const changelog = readText(join(packageRoot, "CHANGELOG.md"));
  if (!changelog.includes(`## [${manifest.version}]`)) {
    fail(
      join(packageRoot, "CHANGELOG.md"),
      `missing version ${manifest.version}`,
    );
  }

  let skills = [];
  const skillsRoot = join(packageRoot, "skills");
  try {
    if (!lstatSync(skillsRoot).isDirectory())
      fail(skillsRoot, "must be a directory");
    skills = readdirSync(skillsRoot, { withFileTypes: true })
      .filter((entry) => !entry.name.startsWith("."))
      .map((entry) => {
        if (!entry.isDirectory())
          fail(join(skillsRoot, entry.name), "must be a skill directory");
        return validateSkill(join(skillsRoot, entry.name));
      })
      .sort();
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  let hasMcp = false;
  const mcpPath = join(packageRoot, "mcp.json");
  if (existsSync(mcpPath)) {
    requireFile(mcpPath);
    const mcp = readJson(mcpPath);
    if (!validatePortableMcp(mcp)) {
      fail(
        mcpPath,
        `portable schema violation: ${ajv.errorsText(validatePortableMcp.errors)}`,
      );
    }
    if (mcp.$schema !== mcpSchemaUrl)
      fail(mcpPath, `must target ${mcpSchemaUrl}`);
    hasMcp = true;
  }

  if (skills.length === 0 && !hasMcp && !hasHooks) {
    fail(packageRoot, "package has no supported component");
  }
  return {
    name: id,
    version: manifest.version,
    category,
    skills,
    hasMcp,
    hasHooks,
    root: packageRoot,
    manifest,
  };
}

export function validatePackages(root) {
  const packageDirectory = join(resolve(root), "plugins");
  let entries;
  try {
    entries = readdirSync(packageDirectory, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT")
      fail(packageDirectory, "plugins directory is missing");
    throw error;
  }
  const result = [];
  for (const entry of entries.sort((left, right) =>
    left.name.localeCompare(right.name),
  )) {
    if (entry.name === "AGENTS.md" || entry.name.startsWith(".")) continue;
    if (!entry.isDirectory())
      fail(join(packageDirectory, entry.name), "must be a plugin directory");
    result.push(validateOnePackage(join(packageDirectory, entry.name)));
  }
  return result;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const root = process.argv[2] ? resolve(process.argv[2]) : scriptRoot;
  const packages = validatePackages(root);
  process.stdout.write(
    `Validated ${packages.length} portable Codex packages.\n`,
  );
}
