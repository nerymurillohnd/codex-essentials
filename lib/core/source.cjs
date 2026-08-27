#!/usr/bin/env node
// @ts-check

const fs = require("node:fs");
const path = require("node:path");
const Ajv2020 = require("ajv/dist/2020").default;

/** @typedef {import("ajv").AnySchema} AnySchema */

const SOURCE_PATH = path.join("lib", "source.json");
const SOURCE_SCHEMA_PATH = path.join("lib", "schemas", "source.schema.json");

/** @param {string} root */
function loadSource(root) {
  const sourcePath = path.join(root, SOURCE_PATH);
  const schemaPath = path.join(root, SOURCE_SCHEMA_PATH);
  const payload = loadJson(sourcePath, "source");
  const schema = loadJson(schemaPath, "source schema");
  validateSchema(schema, payload, sourcePath);
  validateSemanticConstraints(payload);
  return payload;
}

/** @param {string} filePath @param {string} kind */
function loadJson(filePath, kind) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(
      `unable to load ${kind} at ${filePath}: ${errorMessage(error)}`,
    );
  }
}

/** @param {unknown} schema @param {unknown} payload @param {string} sourcePath */
function validateSchema(schema, payload, sourcePath) {
  const validator = new Ajv2020({ allErrors: true, strict: true }).compile(
    /** @type {AnySchema} */ (schema),
  );
  if (validator(payload)) {
    return;
  }
  const messages = /** @type {import("ajv").ErrorObject[]} */ (
    validator.errors
  ).map((error) => {
    const location = error.instancePath || "$";
    return `${location} ${error.message}`;
  });
  throw new Error(`${sourcePath} is invalid: ${messages.join("; ")}`);
}

/** @param {unknown} payload */
function validateSemanticConstraints(payload) {
  const source =
    /** @type {{plugins: Array<{name: string, skills: Array<{id: string}>}>}} */ (
      payload
    );
  const pluginNames = new Set();
  for (const plugin of source.plugins) {
    if (pluginNames.has(plugin.name)) {
      throw new Error(`duplicate plugin name: ${plugin.name}`);
    }
    pluginNames.add(plugin.name);
    const skillIds = new Set();
    for (const skill of plugin.skills) {
      if (skillIds.has(skill.id)) {
        throw new Error(`duplicate skill id in ${plugin.name}: ${skill.id}`);
      }
      skillIds.add(skill.id);
    }
    assertNoTraversal(plugin, `${plugin.name}`);
  }
}

/** @param {unknown} value @param {string} location */
function assertNoTraversal(value, location) {
  if (typeof value === "string") {
    if (value.split(/[\\/]+/u).includes("..")) {
      throw new Error(`${location} must not contain '..'`);
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) {
      assertNoTraversal(item, `${location}[${index}]`);
    }
    return;
  }
  if (typeof value !== "object") {
    return;
  }
  if (value === null) {
    return;
  }
  for (const [key, item] of Object.entries(value)) {
    assertNoTraversal(item, `${location}.${key}`);
  }
}

/** @param {unknown} error */
function errorMessage(error) {
  return /** @type {Error} */ (error).message;
}

module.exports = {
  assertNoTraversal,
  loadJson,
  loadSource,
  validateSchema,
  validateSemanticConstraints,
};
