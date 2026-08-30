#!/usr/bin/env node
// @ts-check

const fs = require("node:fs");
const path = require("node:path");
const {
  OUTPUT_FIELDS,
  configuredPaths,
  environmentKey,
} = require("./capture-release-please-outputs.cjs");

const WORKFLOW_PATH = path.join(".github", "workflows", "release-please.yml");

/** @param {string} root */
function declaredReleaseOutputKeys(root) {
  const workflow = fs.readFileSync(path.join(root, WORKFLOW_PATH), "utf8");
  return new Set(
    [...workflow.matchAll(/^\s+(RELEASE_OUTPUT__[A-Z0-9_]+__[A-Z0-9_]+):/gmu)]
      .map((match) => match[1])
      .filter((key) => key !== undefined),
  );
}

/** @param {string} root */
function validateReleaseWorkflowOutputs(root) {
  const declared = declaredReleaseOutputKeys(root);
  const missing = [];
  for (const componentPath of configuredPaths(root)) {
    for (const field of OUTPUT_FIELDS) {
      const key = environmentKey(componentPath, field);
      if (!declared.has(key)) {
        missing.push(key);
      }
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `${WORKFLOW_PATH} is missing Release Please output bindings:\n${missing.join("\n")}`,
    );
  }
  return {
    components: configuredPaths(root),
    outputBindings: declared.size,
  };
}

function main() {
  const result = validateReleaseWorkflowOutputs(path.resolve(__dirname, ".."));
  console.log(
    `Release workflow output contract passed: ${result.components.length} components, ${result.outputBindings} output bindings.`,
  );
}

try {
  if (require.main === module) {
    main();
  }
} catch (error) {
  console.error(/** @type {Error} */ (error).message);
  process.exitCode = 1;
}

module.exports = {
  declaredReleaseOutputKeys,
  validateReleaseWorkflowOutputs,
};
