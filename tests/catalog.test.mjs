import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import prettier from "prettier";
import { parseDocument } from "yaml";
import { buildCatalog } from "../scripts/build-catalog.mjs";

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function packageAt(root, name) {
  const packageRoot = join(root, "plugins", name);
  const skillRoot = join(packageRoot, "skills", name);
  mkdirSync(skillRoot, { recursive: true });
  writeJson(join(packageRoot, "plugin.json"), {
    $schema: "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
    name,
    version: "0.1.0",
    description: `The ${name} workflow.`,
    author: { name: "Example Maintainer" },
    license: "MIT",
    extensions: {
      "com.openai": {
        interface: {
          displayName: name.toUpperCase(),
          shortDescription: `Use ${name} for a focused task.`,
          category: "Developer Tools",
        },
      },
    },
  });
  writeFileSync(join(packageRoot, "README.md"), `# ${name}\n`);
  writeFileSync(
    join(packageRoot, "CHANGELOG.md"),
    "## [0.1.0] - 2026-09-24\n\nInitial.\n",
  );
  writeFileSync(join(packageRoot, "LICENSE.md"), "MIT License\n");
  writeFileSync(
    join(skillRoot, "SKILL.md"),
    `---\nname: ${name}\ndescription: Use ${name} for a focused task.\n---\n\nDo the focused task.\n`,
  );
}

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "codex-catalog-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "plugins"), { recursive: true });
  mkdirSync(join(root, ".github", "ISSUE_TEMPLATE"), { recursive: true });
  packageAt(root, "beta");
  packageAt(root, "alpha");
  writeFileSync(
    join(root, "README.md"),
    "# Marketplace\n\n<!-- generated:plugins:start -->\n<!-- generated:plugins:end -->\n",
  );
  writeFileSync(
    join(root, ".github", "ISSUE_TEMPLATE", "bug.yml"),
    [
      "name: Bug",
      "description: Report a plugin bug.",
      "body:",
      "  - type: dropdown",
      "    id: plugin",
      "    attributes:",
      "      label: Plugin",
      "      options:",
      "        # generated:plugins:start",
      "        # generated:plugins:end",
      "",
    ].join("\n"),
  );
  return root;
}

test("generates one sorted Codex catalog and matching README and issue options", (t) => {
  const root = fixture(t);
  buildCatalog(root);
  const catalog = JSON.parse(
    readFileSync(join(root, ".agents/plugins/marketplace.json"), "utf8"),
  );
  assert.equal(catalog.name, "codex-essentials");
  assert.deepEqual(
    catalog.plugins.map(({ name, source, policy }) => [
      name,
      source.path,
      policy.installation,
    ]),
    [
      ["alpha", "./plugins/alpha", "AVAILABLE"],
      ["beta", "./plugins/beta", "AVAILABLE"],
    ],
  );
  const readme = readFileSync(join(root, "README.md"), "utf8");
  assert.match(
    readme,
    /\| \[ALPHA\]\(plugins\/alpha\/README\.md\) \| 0\.1\.0\s+\|/,
  );
  assert.match(
    readme,
    /\| \[BETA\]\(plugins\/beta\/README\.md\)\s+\| 0\.1\.0\s+\|/,
  );
  const form = parseDocument(
    readFileSync(join(root, ".github/ISSUE_TEMPLATE/bug.yml"), "utf8"),
  );
  assert.equal(form.errors.length, 0);
  assert.deepEqual(form.toJS().body[0].attributes.options, [
    "Marketplace / new plugin",
    "alpha",
    "beta",
  ]);
  assert.doesNotThrow(() => buildCatalog(root, { check: true }));
});

test("read-only check catches stale output and build repairs it", (t) => {
  const root = fixture(t);
  buildCatalog(root);
  const path = join(root, ".agents/plugins/marketplace.json");
  writeFileSync(path, "{}\n");
  assert.throws(
    () => buildCatalog(root, { check: true }),
    /stale.*marketplace\.json/i,
  );
  assert.equal(readFileSync(path, "utf8"), "{}\n");
  buildCatalog(root);
  assert.doesNotThrow(() => buildCatalog(root, { check: true }));
});

test("invalid package prevents every generated write", (t) => {
  const root = fixture(t);
  const manifestPath = join(root, "plugins", "alpha", "plugin.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  manifest.name = "wrong-id";
  writeJson(manifestPath, manifest);
  const before = readFileSync(join(root, "README.md"), "utf8");
  assert.throws(() => buildCatalog(root), /name.*directory/i);
  assert.equal(readFileSync(join(root, "README.md"), "utf8"), before);
});

test("generated README inventory is already Prettier formatted", async (t) => {
  const root = fixture(t);
  buildCatalog(root);
  const content = readFileSync(join(root, "README.md"), "utf8");
  const formatted = await prettier.format(content, {
    parser: "markdown",
    proseWrap: "always",
  });
  assert.equal(content, formatted);
});
