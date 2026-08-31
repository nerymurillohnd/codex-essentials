#!/usr/bin/env node
// @ts-check

const fs = require("node:fs");
const path = require("node:path");
const { parse } = require("yaml");
const { formatError } = require("./error-utils.cjs");

const CONTRACT_PATH = path.join(".github", "label-contract.json");
const ISSUE_TEMPLATE_DIRECTORY = path.join(".github", "ISSUE_TEMPLATE");
const YAML_EXTENSIONS = new Set([".yml", ".yaml"]);
const MARKDOWN_EXTENSIONS = new Set([".md"]);
const MARKDOWN_FRONT_MATTER_PATTERN =
  /^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/u;
const MARKDOWN_FRONT_MATTER_START_PATTERN = /^---[ \t]*(?:\r?\n|$)/u;

/** @typedef {{name: string, color: string, description: string}} LabelDefinition */
/** @typedef {{references: Map<string, string[]>, errors: string[]}} LabelReferenceCollection */

/** @param {unknown} value */
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** @param {string} filePath */
function readYaml(filePath) {
  return parse(fs.readFileSync(filePath, "utf8"));
}

/** @param {string} filePath */
function readMarkdownFrontMatter(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  if (!MARKDOWN_FRONT_MATTER_START_PATTERN.test(content)) {
    return undefined;
  }
  const match = MARKDOWN_FRONT_MATTER_PATTERN.exec(content);
  if (!match) {
    throw new Error("has malformed or unterminated front matter");
  }
  return parse(match[1]);
}

/** @param {string} root @returns {LabelDefinition[]} */
function loadLabelContract(root) {
  const filePath = path.join(root, CONTRACT_PATH);
  const payload = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!isRecord(payload) || !Array.isArray(payload.labels)) {
    throw new Error(`${CONTRACT_PATH} must contain a labels array`);
  }
  const labels = payload.labels.map((label, index) => {
    if (
      !isRecord(label) ||
      typeof label.name !== "string" ||
      label.name.trim() === ""
    ) {
      throw new Error(`${CONTRACT_PATH} label ${index + 1} must have a name`);
    }
    if (
      typeof label.color !== "string" ||
      !/^[0-9a-f]{6}$/iu.test(label.color)
    ) {
      throw new Error(
        `${CONTRACT_PATH} label ${index + 1} must have a six-character hex color`,
      );
    }
    if (
      typeof label.description !== "string" ||
      label.description.trim() === ""
    ) {
      throw new Error(
        `${CONTRACT_PATH} label ${index + 1} must have a description`,
      );
    }
    return {
      name: label.name,
      color: label.color,
      description: label.description,
    };
  });
  const names = new Set();
  for (const label of labels) {
    if (names.has(label.name)) {
      throw new Error(
        `${CONTRACT_PATH} contains duplicate label: ${label.name}`,
      );
    }
    names.add(label.name);
  }
  return labels;
}

/**
 * @param {LabelReferenceCollection} collection
 * @param {unknown} value
 * @param {string} source
 */
function addLabelReferences(collection, value, source) {
  if (value === undefined) {
    return;
  }
  if (!Array.isArray(value)) {
    collection.errors.push(`${source} labels must be an array`);
    return;
  }
  for (const label of value) {
    if (typeof label !== "string" || label.trim() === "") {
      collection.errors.push(`${source} contains an invalid label entry`);
      continue;
    }
    const normalized = label.trim();
    if (normalized === "*") {
      collection.errors.push(`${source} may not use the wildcard label`);
      continue;
    }
    const sources = collection.references.get(normalized) ?? [];
    sources.push(source);
    collection.references.set(normalized, sources);
  }
}

/** @param {unknown} value */
function markdownLabelValue(value) {
  if (typeof value !== "string") {
    return value;
  }
  return value
    .split(",")
    .map((label) => label.trim())
    .filter(Boolean);
}

/** @param {string} root @returns {LabelReferenceCollection} */
function collectLabelReferences(root) {
  /** @type {LabelReferenceCollection} */
  const collection = { references: new Map(), errors: [] };
  const templateRoot = path.join(root, ISSUE_TEMPLATE_DIRECTORY);
  const templateFiles = fs
    .readdirSync(templateRoot, { withFileTypes: true })
    .filter((entry) => {
      const extension = path.extname(entry.name);
      return (
        entry.isFile() &&
        (YAML_EXTENSIONS.has(extension) || MARKDOWN_EXTENSIONS.has(extension))
      );
    })
    .map((entry) => entry.name)
    .sort();
  for (const file of templateFiles) {
    const source = path.join(ISSUE_TEMPLATE_DIRECTORY, file);
    const filePath = path.join(templateRoot, file);
    const isMarkdown = MARKDOWN_EXTENSIONS.has(path.extname(file));
    let document;
    if (isMarkdown) {
      try {
        document = readMarkdownFrontMatter(filePath);
      } catch (error) {
        collection.errors.push(
          `${source} ${formatError(error).replace(/^Error:\s*/u, "")}`,
        );
        continue;
      }
    } else {
      document = readYaml(filePath);
    }
    if (document === undefined) {
      continue;
    }
    if (!isRecord(document)) {
      collection.errors.push(`${source} must contain a mapping`);
      continue;
    }
    addLabelReferences(
      collection,
      MARKDOWN_EXTENSIONS.has(path.extname(file))
        ? markdownLabelValue(document.labels)
        : document.labels,
      source,
    );
  }

  return collection;
}

/** @param {string} root */
function validateLabelContract(root) {
  const labels = loadLabelContract(root);
  const names = new Set(labels.map((label) => label.name));
  const { references, errors } = collectLabelReferences(root);
  const missing = [...references.keys()]
    .filter((name) => !names.has(name))
    .sort();
  if (errors.length > 0 || missing.length > 0) {
    const details = [...errors];
    if (missing.length > 0) {
      details.push(
        `undefined GitHub labels: ${missing
          .map((name) => {
            const sources = references.get(name) ?? [];
            return `${name} (${sources.join(", ")})`;
          })
          .join("; ")}`,
      );
    }
    throw new Error(details.join("\n"));
  }
  return { labels, references: [...references.keys()].sort() };
}

module.exports = {
  collectLabelReferences,
  loadLabelContract,
  markdownLabelValue,
  readMarkdownFrontMatter,
  validateLabelContract,
};
