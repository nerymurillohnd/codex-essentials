#!/usr/bin/env node
// @ts-check

const fs = require("node:fs");
const path = require("node:path");
const { parse } = require("yaml");

const CONTRACT_PATH = path.join(".github", "label-contract.json");
const RELEASE_PATH = path.join(".github", "release.yml");
const ISSUE_TEMPLATE_DIRECTORY = path.join(".github", "ISSUE_TEMPLATE");
const YAML_EXTENSIONS = new Set([".yml", ".yaml"]);
const MARKDOWN_EXTENSIONS = new Set([".md"]);
const MARKDOWN_FRONT_MATTER_PATTERN =
  /^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/u;

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
  const match = MARKDOWN_FRONT_MATTER_PATTERN.exec(content);
  return match ? parse(match[1]) : undefined;
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
 * @param {{allowWildcard?: boolean}} [options]
 */
function addLabelReferences(collection, value, source, options = {}) {
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
      if (options.allowWildcard) {
        continue;
      }
      collection.errors.push(
        `${source} may not use the wildcard label outside release categories`,
      );
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
    const document = MARKDOWN_EXTENSIONS.has(path.extname(file))
      ? readMarkdownFrontMatter(filePath)
      : readYaml(filePath);
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

  const release = readYaml(path.join(root, RELEASE_PATH));
  if (!isRecord(release)) {
    collection.errors.push(`${RELEASE_PATH} must contain a mapping`);
    return collection;
  }
  if (release.changelog === undefined) {
    return collection;
  }
  if (!isRecord(release.changelog)) {
    collection.errors.push(`${RELEASE_PATH} changelog must be a mapping`);
    return collection;
  }
  const changelog = release.changelog;
  if (changelog.categories !== undefined) {
    if (!Array.isArray(changelog.categories)) {
      collection.errors.push(`${RELEASE_PATH} categories must be an array`);
    } else {
      for (const category of changelog.categories) {
        if (!isRecord(category)) {
          collection.errors.push(`${RELEASE_PATH} category must be a mapping`);
          continue;
        }
        addLabelReferences(collection, category.labels, RELEASE_PATH, {
          allowWildcard: true,
        });
      }
    }
  }
  if (changelog.exclude !== undefined) {
    if (!isRecord(changelog.exclude)) {
      collection.errors.push(`${RELEASE_PATH} exclude must be a mapping`);
    } else {
      addLabelReferences(collection, changelog.exclude.labels, RELEASE_PATH);
    }
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
