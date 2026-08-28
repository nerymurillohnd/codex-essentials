#!/usr/bin/env node
// @ts-check

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const repositoryRoot = process.env.CODEX_ESSENTIALS_REPOSITORY_ROOT
  ? path.resolve(process.env.CODEX_ESSENTIALS_REPOSITORY_ROOT)
  : path.resolve(__dirname, "..");
const manifestPathPattern =
  /(?:^|[\s\\/])plugins[\\/][a-z0-9]+(?:-[a-z0-9]+)*[\\/]\.codex-plugin[\\/]plugin\.json(?=$|[\s"'])/u;

function main() {
  const event = readEvent();
  if (!eventTouchesPluginManifest(event)) {
    return;
  }
  const result = spawnSync("npm", ["run", "marketplace:build"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  if (result.status === 0) {
    return;
  }
  const details = [result.stdout, result.stderr]
    .filter(Boolean)
    .join("\n")
    .trim();
  process.stdout.write(
    `${JSON.stringify({
      continue: false,
      stopReason: "Plugin manifest pipeline failed.",
      systemMessage: details || "Plugin manifest pipeline failed.",
    })}\n`,
  );
}

/** @returns {unknown} */
function readEvent() {
  const input = fs.readFileSync(0, "utf8").trim();
  if (input.length === 0) {
    return {};
  }
  try {
    return JSON.parse(input);
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

try {
  main();
} catch (error) {
  process.stdout.write(
    `${JSON.stringify({
      continue: false,
      stopReason: "Plugin manifest guard failed.",
      systemMessage: /** @type {Error} */ (error).message,
    })}\n`,
  );
}
