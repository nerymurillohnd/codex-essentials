#!/usr/bin/env node
// @ts-check

const fs = require("node:fs");
const path = require("node:path");
const { parse } = require("yaml");

const CONTRACT_PATH = path.join(".github", "label-contract.json");
const RELEASE_PATH = path.join(".github", "release.yml");
const ISSUE_TEMPLATE_DIRECTORY = path.join(".github", "ISSUE_TEMPLATE");
const YAML_EXTENSIONS = new Set([".yml", ".yaml"]);

/** @typedef {{name: string, color: string, description: string}} LabelDefinition */

/** @param {unknown} value */
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** @param {string} filePath */
function readYaml(filePath) {
  return parse(fs.readFileSync(filePath, "utf8"));
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
    return {
      name: label.name,
      color: typeof label.color === "string" ? label.color : "",
      description:
        typeof label.description === "string" ? label.description : "",
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

/** @param {Map<string, string[]>} references @param {unknown} value @param {string} source */
function addLabelReferences(references, value, source) {
  if (!Array.isArray(value)) {
    return;
  }
  for (const label of value) {
    if (typeof label !== "string" || label === "*") {
      continue;
    }
    const sources = references.get(label) ?? [];
    sources.push(source);
    references.set(label, sources);
  }
}

/** @param {string} root */
function collectLabelReferences(root) {
  const references = new Map();
  const templateRoot = path.join(root, ISSUE_TEMPLATE_DIRECTORY);
  const templateFiles = fs
    .readdirSync(templateRoot, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() && YAML_EXTENSIONS.has(path.extname(entry.name)),
    )
    .map((entry) => entry.name)
    .sort();
  for (const file of templateFiles) {
    const document = readYaml(path.join(templateRoot, file));
    if (isRecord(document)) {
      addLabelReferences(
        references,
        document.labels,
        path.join(ISSUE_TEMPLATE_DIRECTORY, file),
      );
    }
  }

  const release = readYaml(path.join(root, RELEASE_PATH));
  if (isRecord(release) && isRecord(release.changelog)) {
    const changelog = release.changelog;
    if (Array.isArray(changelog.categories)) {
      for (const category of changelog.categories) {
        if (isRecord(category)) {
          addLabelReferences(references, category.labels, RELEASE_PATH);
        }
      }
    }
    if (isRecord(changelog.exclude)) {
      addLabelReferences(references, changelog.exclude.labels, RELEASE_PATH);
    }
  }
  return references;
}

/** @param {string} root */
function validateLabelContract(root) {
  const labels = loadLabelContract(root);
  const names = new Set(labels.map((label) => label.name));
  const references = collectLabelReferences(root);
  const missing = [...references.keys()]
    .filter((name) => !names.has(name))
    .sort();
  if (missing.length > 0) {
    const details = missing.map((name) => {
      const sources = references.get(name) ?? [];
      return `${name} (${sources.join(", ")})`;
    });
    throw new Error(`undefined GitHub labels: ${details.join("; ")}`);
  }
  return { labels, references: [...references.keys()].sort() };
}

module.exports = {
  collectLabelReferences,
  loadLabelContract,
  validateLabelContract,
};
