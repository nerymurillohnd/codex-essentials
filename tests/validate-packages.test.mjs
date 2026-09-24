import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { validatePackages } from "../scripts/validate-packages.mjs";

const pluginSchemaUrl =
  "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json";
const mcpSchemaUrl = "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json";

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function makeFixture(t) {
  const root = mkdtempSync(join(tmpdir(), "codex-package-contract-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const packageRoot = join(root, "plugins", "probe");
  const skillRoot = join(packageRoot, "skills", "probe");
  mkdirSync(skillRoot, { recursive: true });
  writeJson(join(packageRoot, "plugin.json"), {
    $schema: pluginSchemaUrl,
    name: "probe",
    version: "0.1.0",
    description: "Exercise the package contract.",
    author: { name: "Example Maintainer" },
    license: "MIT",
    extensions: {
      "com.openai": {
        interface: {
          displayName: "Probe",
          shortDescription: "Exercise a portable plugin contract.",
          category: "Developer Tools",
        },
      },
    },
  });
  writeFileSync(
    join(packageRoot, "README.md"),
    "# Probe\n\nPortable test plugin.\n",
  );
  writeFileSync(
    join(packageRoot, "CHANGELOG.md"),
    "# Changelog\n\n## [0.1.0] - 2026-09-24\n\nInitial release.\n",
  );
  writeFileSync(join(packageRoot, "LICENSE.md"), "MIT License\n");
  writeFileSync(
    join(skillRoot, "SKILL.md"),
    "---\nname: probe\ndescription: Use to exercise the package contract.\n---\n\nReport the probe result.\n",
  );
  return { root, packageRoot, skillRoot };
}

test("accepts a complete portable skill package", (t) => {
  const { root } = makeFixture(t);
  const result = validatePackages(root);
  assert.equal(result.length, 1);
  assert.equal(result[0].name, "probe");
  assert.equal(result[0].version, "0.1.0");
  assert.equal(result[0].category, "Developer Tools");
  assert.deepEqual(result[0].skills, ["probe"]);
});

test("rejects a manifest that lacks the official schema declaration", (t) => {
  const { root, packageRoot } = makeFixture(t);
  const path = join(packageRoot, "plugin.json");
  const manifest = JSON.parse(readFileSync(path, "utf8"));
  delete manifest.$schema;
  writeJson(path, manifest);
  assert.throws(() => validatePackages(root), /plugin\.json.*\$schema|schema/i);
});

test("rejects an MCP transport outside the portable schema", (t) => {
  const { root, packageRoot } = makeFixture(t);
  writeJson(join(packageRoot, "mcp.json"), {
    $schema: mcpSchemaUrl,
    mcpServers: { docs: { type: "http", url: "https://example.com/mcp" } },
  });
  assert.throws(() => validatePackages(root), /mcp\.json|transport|schema/i);
});

test("rejects a missing declared skill entrypoint", (t) => {
  const { root, skillRoot } = makeFixture(t);
  rmSync(join(skillRoot, "SKILL.md"));
  assert.throws(() => validatePackages(root), /SKILL\.md/);
});

test("rejects malformed skill frontmatter", (t) => {
  const { root, skillRoot } = makeFixture(t);
  writeFileSync(
    join(skillRoot, "SKILL.md"),
    "---\nname: [unclosed\n---\n\nInvalid.\n",
  );
  assert.throws(() => validatePackages(root), /SKILL\.md|YAML|frontmatter/i);
});

test("rejects package symlinks even when their target exists", (t) => {
  const { root, packageRoot } = makeFixture(t);
  symlinkSync(
    join(packageRoot, "README.md"),
    join(packageRoot, "readme-link.md"),
  );
  assert.throws(() => validatePackages(root), /symbolic link|symlink/i);
});

test("rejects a manifest identity that differs from its package directory", (t) => {
  const { root, packageRoot } = makeFixture(t);
  const path = join(packageRoot, "plugin.json");
  const manifest = JSON.parse(readFileSync(path, "utf8"));
  manifest.name = "another-name";
  writeJson(path, manifest);
  assert.throws(() => validatePackages(root), /name|identity|directory/i);
});

test("accepts a supported command hook packaged at its declared path", (t) => {
  const { root, packageRoot } = makeFixture(t);
  const hooksRoot = join(packageRoot, "hooks");
  mkdirSync(hooksRoot);
  writeJson(join(hooksRoot, "hooks.json"), {
    hooks: {
      PostToolUse: [
        {
          matcher: "Edit|Write",
          hooks: [
            {
              type: "command",
              command: `python3 \${PLUGIN_ROOT}/hooks/check.py`,
            },
          ],
        },
      ],
    },
  });
  writeFileSync(join(hooksRoot, "check.py"), "print('checked')\n");
  const path = join(packageRoot, "plugin.json");
  const manifest = JSON.parse(readFileSync(path, "utf8"));
  manifest.extensions["com.openai"].hooks = "./hooks/hooks.json";
  writeJson(path, manifest);
  assert.equal(validatePackages(root)[0].hasHooks, true);
});

test("rejects a command hook with a missing PLUGIN_ROOT handler", (t) => {
  const { root, packageRoot } = makeFixture(t);
  const hooksRoot = join(packageRoot, "hooks");
  mkdirSync(hooksRoot);
  writeJson(join(hooksRoot, "hooks.json"), {
    hooks: {
      PreToolUse: [
        {
          matcher: "^Bash$",
          hooks: [
            {
              type: "command",
              command: `python3 "\${PLUGIN_ROOT}/hooks/missing.py"`,
            },
          ],
        },
      ],
    },
  });
  const path = join(packageRoot, "plugin.json");
  const manifest = JSON.parse(readFileSync(path, "utf8"));
  manifest.extensions["com.openai"].hooks = "./hooks/hooks.json";
  writeJson(path, manifest);
  assert.throws(() => validatePackages(root), /missing\.py|handler|hooks/i);
});

test("rejects a hook handler that Codex parses but does not execute", (t) => {
  const { root, packageRoot } = makeFixture(t);
  const hooksRoot = join(packageRoot, "hooks");
  mkdirSync(hooksRoot);
  writeJson(join(hooksRoot, "hooks.json"), {
    hooks: {
      PostToolUse: [{ hooks: [{ type: "prompt", prompt: "Skip validation" }] }],
    },
  });
  assert.throws(() => validatePackages(root), /hooks\.json|handler|type/i);
});
