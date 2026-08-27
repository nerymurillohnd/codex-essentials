#!/usr/bin/env node
// @ts-check

const childProcess = require("node:child_process");

const ORGANIZATION_OPTION = "--org";
const TITLE_OPTION = "--title";
const DRY_RUN_OPTION = "--dry-run";
const ORGANIZATION_ENV = "GITHUB_ORG";
const TITLE_ENV = "PROJECT_TITLE";
const DEFAULT_PROJECT_TITLE = "Codex Essentials Community";
const PROJECT_LIST_COMMAND = ["project", "list"];
const PROJECT_CREATE_COMMAND = ["project", "create"];

const PROJECT_FIELDS = [
  "Status",
  "Plugin",
  "Priority",
  "Review",
  "Documentation",
  "Security",
  "Release target",
];
const PROJECT_VIEWS = ["Backlog", "Release readiness", "Security"];
const PROJECT_WORKFLOWS = ["auto-add", "closed-to-done", "auto-archive"];

/** @typedef {{title: string, number?: number, id?: string}} ProjectSummary */

/** @param {string} title */
function buildProjectSpec(title) {
  return {
    title,
    fields: [...PROJECT_FIELDS],
    views: [...PROJECT_VIEWS],
    workflows: [...PROJECT_WORKFLOWS],
  };
}

/**
 * @param {string[]} argv
 * @param {Record<string, string | undefined>} [environment]
 */
function parseArgs(argv, environment = process.env) {
  let organization = environment[ORGANIZATION_ENV] ?? "";
  let title = environment[TITLE_ENV] ?? DEFAULT_PROJECT_TITLE;
  let dryRun = false;
  for (let index = 0; index < argv.length; index += 1) {
    const option = argv[index];
    if (option === ORGANIZATION_OPTION || option === TITLE_OPTION) {
      const value = argv[index + 1];
      if (!value) {
        throw new Error(`${option} requires a value`);
      }
      if (option === ORGANIZATION_OPTION) {
        organization = value;
      } else {
        title = value;
      }
      index += 1;
    } else if (option === DRY_RUN_OPTION) {
      dryRun = true;
    } else {
      throw new Error(`unknown argument: ${option}`);
    }
  }
  if (!organization) {
    throw new Error(`${ORGANIZATION_ENV} is required`);
  }
  if (!title) {
    throw new Error(`${TITLE_ENV} cannot be empty`);
  }
  return { organization, title, dryRun };
}

/** @param {string} organization */
function listCommand(organization) {
  return [...PROJECT_LIST_COMMAND, "--owner", organization, "--format", "json"];
}

/** @param {string} organization @param {string} title */
function createCommand(organization, title) {
  return [
    ...PROJECT_CREATE_COMMAND,
    "--owner",
    organization,
    "--title",
    title,
    "--format",
    "json",
  ];
}

/** @param {{organization: string, title: string, dryRun: boolean}} options @param {(command: string, args: string[]) => string} [runner] */
function bootstrapProject(options, runner = execute) {
  const listArgs = listCommand(options.organization);
  if (options.dryRun) {
    return {
      created: false,
      command: createCommand(options.organization, options.title),
      spec: buildProjectSpec(options.title),
    };
  }
  const listed = runner("gh", listArgs);
  const projects = parseProjectList(listed);
  const existing = projects.find((item) => item.title === options.title);
  if (existing) {
    return {
      created: false,
      project: existing,
      spec: buildProjectSpec(options.title),
    };
  }
  const created = parseProjectObject(
    runner("gh", createCommand(options.organization, options.title)),
  );
  return {
    created: true,
    project: created,
    spec: buildProjectSpec(options.title),
  };
}

/** @param {string} output */
function parseProjectList(output) {
  const payload = JSON.parse(output);
  if (!Array.isArray(payload)) {
    throw new Error("gh project list returned a non-array payload");
  }
  return payload.filter(isProject);
}

/** @param {string} output */
function parseProjectObject(output) {
  const payload = JSON.parse(output);
  if (!isProject(payload)) {
    throw new Error("gh project create returned an invalid project");
  }
  return payload;
}

/** @param {unknown} value @returns {value is ProjectSummary} */
function isProject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const record = /** @type {Record<string, unknown>} */ (value);
  return (
    typeof record.title === "string" &&
    (typeof record.number === "number" || typeof record.id === "string")
  );
}

/** @param {string} command @param {string[]} args */
/* c8 ignore next */
function execute(command, args) {
  return childProcess.execFileSync(command, args, { encoding: "utf8" });
}

/* c8 ignore start */
function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = bootstrapProject(options);
    const command = "command" in result ? result.command : undefined;
    const project = "project" in result ? result.project : undefined;
    if (options.dryRun && command) {
      console.log(`Dry run: gh ${command.join(" ")}`);
    } else if (project) {
      console.log(
        `${result.created ? "Created" : "Reused"} project: ${project.title}`,
      );
    }
    console.log(`Fields: ${result.spec.fields.join(", ")}`);
  } catch (error) {
    console.error(`Project bootstrap failed: ${errorMessage(error)}`);
    process.exitCode = 1;
  }
}
/* c8 ignore stop */

/** @param {unknown} error */
function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

/* c8 ignore next 2 */
if (require.main === module) {
  main();
}

module.exports = {
  bootstrapProject,
  buildProjectSpec,
  createCommand,
  errorMessage,
  execute,
  listCommand,
  main,
  parseArgs,
  parseProjectObject,
  parseProjectList,
};
