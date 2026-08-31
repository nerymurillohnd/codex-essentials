#!/usr/bin/env node
// @ts-check

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { formatError } = require("./error-utils.cjs");

const manifestPathPattern =
  /(?:^|[\s\\/])plugins[\\/][a-z0-9]+(?:-[a-z0-9]+)*[\\/]\.codex-plugin[\\/]plugin\.json(?=$|[\s"'])/u;

/** @param {Record<string, string | undefined>} environment */
function resolveRepositoryRoot(environment = process.env) {
  const configuredRoot = environment["CODEX_ESSENTIALS_REPOSITORY_ROOT"];
  return configuredRoot
    ? path.resolve(configuredRoot)
    : path.resolve(__dirname, "..");
}

const repositoryRoot = resolveRepositoryRoot();

/** @param {unknown} event @param {string} root @param {(root: string) => import("node:child_process").SpawnSyncReturns<string>} executePipeline */
function main(
  event,
  root = repositoryRoot,
  executePipeline = runMarketplacePipeline,
) {
  if (!eventTouchesPluginManifest(event)) {
    return undefined;
  }
  const result = executePipeline(root);
  if (result.status === 0) {
    return undefined;
  }
  const details = [result.stdout || "", result.stderr || ""]
    .filter(Boolean)
    .join("\n")
    .trim();
  return {
    continue: false,
    stopReason: "Plugin manifest pipeline failed.",
    systemMessage: details || "Plugin manifest pipeline failed.",
  };
}

/** @param {string} root @param {typeof spawnSync} execute */
function runMarketplacePipeline(root, execute = spawnSync) {
  return execute("npm", ["run", "marketplace:build"], {
    cwd: root,
    encoding: "utf8",
  });
}

/** @param {string} input @returns {unknown} */
function readEvent(input = fs.readFileSync(0, "utf8")) {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return {};
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    return {};
  }
}

/** @param {unknown} value */
function eventTouchesPluginManifest(value) {
  if (typeof value === "string") {
    return value
      .split(/\r?\n/u)
      .some((line) => manifestPathPattern.test(line.trim()));
  }
  if (Array.isArray(value)) {
    return value.some(eventTouchesPluginManifest);
  }
  if (value && typeof value === "object") {
    return Object.values(value).some(eventTouchesPluginManifest);
  }
  return false;
}

/** @param {unknown} event @param {string} root @param {{write(message: string): void}} output @param {(root: string) => import("node:child_process").SpawnSyncReturns<string>} executePipeline */
function run(
  event = undefined,
  root = repositoryRoot,
  output = process.stdout,
  executePipeline = runMarketplacePipeline,
) {
  try {
    const response = main(
      event === undefined ? readEvent() : event,
      root,
      executePipeline,
    );
    if (response) {
      output.write(`${JSON.stringify(response)}\n`);
    }
    return 0;
  } catch (error) {
    output.write(
      `${JSON.stringify({
        continue: false,
        stopReason: "Plugin manifest guard failed.",
        systemMessage: formatError(error),
      })}\n`,
    );
    return 1;
  }
}

/* c8 ignore next 3 -- exercised through child-process integration tests. */
if (require.main === module) {
  process.exitCode = run();
}

module.exports = {
  eventTouchesPluginManifest,
  main,
  readEvent,
  resolveRepositoryRoot,
  run,
  runMarketplacePipeline,
};
