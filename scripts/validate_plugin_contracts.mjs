import { readFileSync } from "node:fs";
import path from "node:path";

import Ajv2020 from "ajv/dist/2020.js";
import { parseDocument } from "yaml";

function main() {
  const request = readRequest();
  const root = path.resolve(requireString(request.root, "validation root"));
  const targets = requireArray(request.targets, "validation targets");
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validators = new Map();

  for (const rawTarget of targets) {
    const target = requireObject(rawTarget, "validation target");
    const schema = requireString(target.schema, "validation target schema");
    const label = requireString(target.label, "validation target label");
    const validate = loadValidator(ajv, validators, root, schema);
    const data = loadTargetData(target, root, label);

    if (!validate(data)) {
      const location = typeof target.path === "string" ? ` (${target.path})` : "";
      throw new Error(
        `${label} is invalid against ${schema}${location}: ${ajv.errorsText(validate.errors, {
          separator: "; ",
        })}`,
      );
    }
  }
}

function readRequest() {
  try {
    return requireObject(JSON.parse(readFileSync(0, "utf8")), "validation request");
  } catch (error) {
    throw new Error(`unable to read validation request: ${message(error)}`);
  }
}

function loadValidator(ajv, validators, root, schema) {
  if (validators.has(schema)) {
    return validators.get(schema);
  }
  const schemaPath = resolveContainedPath(root, schema, "schema");
  let schemaDocument;
  try {
    schemaDocument = JSON.parse(readFileSync(schemaPath, "utf8"));
  } catch (error) {
    throw new Error(`unable to load ${schema}: ${message(error)}`);
  }
  let validate;
  try {
    validate = ajv.compile(schemaDocument);
  } catch (error) {
    throw new Error(`${schema} is not a valid JSON Schema: ${message(error)}`);
  }
  validators.set(schema, validate);
  return validate;
}

function loadTargetData(target, root, label) {
  if (Object.hasOwn(target, "data")) {
    return target.data;
  }
  const relativePath = requireString(target.path, "validation target path");
  const format = requireString(target.format, "validation target format");
  const dataPath = resolveContainedPath(root, relativePath, "data");
  let content;
  try {
    content = readFileSync(dataPath, "utf8");
  } catch (error) {
    throw new Error(`unable to read ${relativePath}: ${message(error)}`);
  }
  if (format === "json") {
    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`${label} is invalid JSON (${relativePath}): ${message(error)}`);
    }
  }
  if (format === "yaml") {
    const document = parseDocument(content, { prettyErrors: true });
    if (document.errors.length > 0) {
      throw new Error(`${label} is invalid YAML (${relativePath}): ${document.errors[0].message}`);
    }
    return document.toJSON();
  }
  throw new Error(`validation target format must be json or yaml: ${format}`);
}

function resolveContainedPath(root, relativePath, label) {
  if (path.isAbsolute(relativePath)) {
    throw new Error(`${label} path must be relative to the repository root`);
  }
  const resolved = path.resolve(root, relativePath);
  const relative = path.relative(root, resolved);
  if (relative === "" || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`${label} path must remain inside the repository root`);
  }
  return resolved;
}

function requireObject(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value;
}

function requireArray(value, label) {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array`);
  }
  return value;
}

function requireString(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
  return value;
}

function message(error) {
  return error instanceof Error && error.message ? error.message : String(error);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${message(error)}\n`);
  process.exitCode = 1;
}
