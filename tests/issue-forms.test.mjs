import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { parseDocument } from "yaml";
import { validatePackages } from "../scripts/validate-packages.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const formsRoot = join(root, ".github", "ISSUE_TEMPLATE");

function readYaml(path) {
  const document = parseDocument(readFileSync(path, "utf8"), {
    uniqueKeys: true,
  });
  assert.deepEqual(document.errors, [], `${path} has invalid YAML`);
  return document.toJS();
}

test("issue forms reference existing labels and current plugin choices", () => {
  const labelContract = JSON.parse(
    readFileSync(join(root, ".github/label-contract.json"), "utf8"),
  );
  const labelNames = new Set(labelContract.labels.map(({ name }) => name));
  const expectedOptions = [
    "Marketplace / new plugin",
    ...validatePackages(root).map(({ name }) => name),
  ];

  for (const name of ["bug", "feature", "plugin-request"]) {
    const form = readYaml(join(formsRoot, `${name}.yml`));
    assert.equal(typeof form.name, "string");
    assert.equal(typeof form.description, "string");
    assert.ok(Array.isArray(form.body) && form.body.length > 0);
    assert.ok(
      form.labels.every((label) => labelNames.has(label)),
      `${name} uses an unknown label`,
    );
    if (name !== "plugin-request") {
      const pluginField = form.body.find(({ id }) => id === "plugin");
      assert.equal(pluginField.type, "dropdown");
      assert.deepEqual(pluginField.attributes.options, expectedOptions);
      assert.equal(pluginField.validations.required, true);
    }
  }
});

test("security reports are routed away from public issue forms", () => {
  const config = readYaml(join(formsRoot, "config.yml"));
  assert.equal(config.blank_issues_enabled, false);
  assert.ok(
    config.contact_links.some(({ url }) =>
      url.includes("/security/advisories/new"),
    ),
  );
});
