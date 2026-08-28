import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

const repositoryRoot = resolve(import.meta.dirname);
const temporaryRoots: string[] = [];

function createFixture(): string {
  const root = realpathSync(
    mkdtempSync(join(tmpdir(), "codex-essentials-marketplace-")),
  );
  temporaryRoots.push(root);
  for (const name of ["plugins", "schemas", "templates", "scripts"] as const) {
    cpSync(join(repositoryRoot, name), join(root, name), { recursive: true });
  }
  cpSync(
    join(repositoryRoot, "lib", "schemas", "agent.schema.json"),
    join(root, "lib", "schemas", "agent.schema.json"),
  );
  cpSync(join(repositoryRoot, "package.json"), join(root, "package.json"));
  return root;
}

function run(root: string, script: string) {
  return spawnSync(
    process.execPath,
    [join(repositoryRoot, "scripts", script), "--root", root],
    {
      encoding: "utf8",
    },
  );
}

function runGuard(root: string, event: unknown) {
  return spawnSync(
    process.execPath,
    [join(repositoryRoot, "scripts", "plugin-manifest-guard.cjs")],
    {
      cwd: root,
      encoding: "utf8",
      input: JSON.stringify(event),
      env: {
        ...process.env,
        CODEX_ESSENTIALS_REPOSITORY_ROOT: root,
        NODE_PATH: join(repositoryRoot, "node_modules"),
      },
    },
  );
}

function runDocumentationGate(root: string, base: string, head: string) {
  return spawnSync(
    process.execPath,
    [
      join(repositoryRoot, "scripts", "documentation-gate.cjs"),
      "--root",
      root,
      "--base",
      base,
      "--head",
      head,
    ],
    { encoding: "utf8" },
  );
}

function runReleaseValidation(root: string, tag: string) {
  return spawnSync(
    process.execPath,
    [
      join(repositoryRoot, "scripts", "validate-release.cjs"),
      "--root",
      root,
      tag,
    ],
    { encoding: "utf8" },
  );
}

function git(root: string, args: string[]): string {
  const result = spawnSync("git", ["-C", root, ...args], {
    encoding: "utf8",
  });
  expect(result.status).toBe(0);
  return result.stdout.trim();
}

function readJson(root: string, relativePath: string): unknown {
  return JSON.parse(readFileSync(join(root, relativePath), "utf8")) as unknown;
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("strict plugin-to-marketplace pipeline", () => {
  it("validates all complete manifests, generates the catalog, and reverse-validates it", () => {
    const root = createFixture();

    expect(run(root, "validate-plugins.cjs").status).toBe(0);
    expect(run(root, "generate-marketplace.cjs").status).toBe(0);
    expect(run(root, "validate-marketplace.cjs").status).toBe(0);
    expect(readJson(root, ".agents/plugins/marketplace.json")).toMatchObject({
      name: "codex-essentials",
      plugins: [
        { name: "astro-cli-commands" },
        { name: "doc-keeper" },
        { name: "prettier-after-edit" },
      ],
    });
  });

  it("rejects a manifest that violates fixed template metadata before writing the catalog", () => {
    const root = createFixture();
    const manifestPath = join(
      root,
      "plugins",
      "doc-keeper",
      ".codex-plugin",
      "plugin.json",
    );
    const manifest = readJson(
      root,
      "plugins/doc-keeper/.codex-plugin/plugin.json",
    ) as {
      author: { email: string };
    };
    manifest.author.email = "wrong@example.com";
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

    const sentinel = '{"catalog":"unchanged"}\n';
    const catalogPath = join(root, ".agents", "plugins", "marketplace.json");
    cpSync(join(repositoryRoot, ".agents"), join(root, ".agents"), {
      recursive: true,
    });
    writeFileSync(catalogPath, sentinel);

    const validation = run(root, "validate-plugins.cjs");
    const generation = run(root, "generate-marketplace.cjs");

    expect(validation.status).not.toBe(0);
    expect(validation.stderr).toContain("author.email");
    expect(generation.status).not.toBe(0);
    expect(readFileSync(catalogPath, "utf8")).toBe(sentinel);
  });

  it("rejects an undeclared or missing bundled component", () => {
    const root = createFixture();
    const manifestPath = join(
      root,
      "plugins",
      "astro-cli-commands",
      ".codex-plugin",
      "plugin.json",
    );
    const manifest = readJson(
      root,
      "plugins/astro-cli-commands/.codex-plugin/plugin.json",
    ) as Record<string, unknown>;
    manifest["mcpServers"] = "./.mcp.json";
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

    const validation = run(root, "validate-plugins.cjs");

    expect(validation.status).not.toBe(0);
    expect(validation.stderr).toContain(".mcp.json is missing");
  });

  it("accepts a documented inline MCP server map", () => {
    const root = createFixture();
    const manifestPath = join(
      root,
      "plugins",
      "doc-keeper",
      ".codex-plugin",
      "plugin.json",
    );
    const manifest = readJson(
      root,
      "plugins/doc-keeper/.codex-plugin/plugin.json",
    ) as Record<string, unknown>;
    manifest["mcpServers"] = {
      docs: { command: "docs-mcp", args: ["--stdio"] },
    };
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

    const validation = run(root, "validate-plugins.cjs");

    expect(validation.status).toBe(0);
  });

  it("rejects malformed referenced hook configuration", () => {
    const root = createFixture();
    const hookPath = join(
      root,
      "plugins",
      "prettier-after-edit",
      "hooks",
      "hooks.json",
    );
    writeFileSync(hookPath, "{\n");

    const validation = run(root, "validate-plugins.cjs");

    expect(validation.status).not.toBe(0);
    expect(validation.stderr).toContain("hooks.json");
  });

  it("rejects structurally invalid referenced hook configuration", () => {
    const root = createFixture();
    const hookPath = join(
      root,
      "plugins",
      "prettier-after-edit",
      "hooks",
      "hooks.json",
    );
    writeFileSync(
      hookPath,
      `${JSON.stringify(
        {
          hooks: {
            PostToolUse: [
              {
                hooks: [{ type: "not-a-command", command: "true" }],
              },
            ],
          },
        },
        null,
        2,
      )}\n`,
    );

    const validation = run(root, "validate-plugins.cjs");

    expect(validation.status).not.toBe(0);
    expect(validation.stderr).toContain("hooks.json");
  });

  it("rejects a plugin manifest without a functional component", () => {
    const root = createFixture();
    const pluginRoot = join(root, "plugins", "doc-keeper");
    rmSync(join(pluginRoot, "skills"), { recursive: true });
    const manifestPath = join(pluginRoot, ".codex-plugin", "plugin.json");
    const manifest = readJson(
      root,
      "plugins/doc-keeper/.codex-plugin/plugin.json",
    ) as Record<string, unknown>;
    delete manifest["skills"];
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

    const validation = run(root, "validate-plugins.cjs");

    expect(validation.status).not.toBe(0);
    expect(validation.stderr).toContain("functional component");
  });

  it("requires README and changelog changes for product plugin changes", () => {
    const root = createFixture();
    git(root, ["init"]);
    git(root, ["config", "user.email", "test@example.com"]);
    git(root, ["config", "user.name", "Test"]);
    git(root, ["add", "."]);
    git(root, ["commit", "-m", "fixture"]);
    const base = git(root, ["rev-parse", "HEAD"]);
    const manifestPath = join(
      root,
      "plugins",
      "doc-keeper",
      ".codex-plugin",
      "plugin.json",
    );
    writeFileSync(
      manifestPath,
      `${readFileSync(manifestPath, "utf8").replace("0.1.0", "0.1.1")}\n`,
    );
    git(root, ["add", manifestPath]);
    git(root, ["commit", "-m", "manifest change"]);
    const headWithoutDocs = git(root, ["rev-parse", "HEAD"]);

    const failure = runDocumentationGate(root, base, headWithoutDocs);

    expect(failure.status).not.toBe(0);
    expect(failure.stderr).toContain("README.md");
    expect(failure.stderr).toContain("CHANGELOG.md");

    for (const file of [
      "plugins/doc-keeper/README.md",
      "plugins/doc-keeper/CHANGELOG.md",
    ]) {
      const target = join(root, file);
      writeFileSync(
        target,
        `${readFileSync(target, "utf8")}\nDocumentation update.\n`,
      );
    }
    git(root, ["add", "."]);
    git(root, ["commit", "-m", "document manifest change"]);
    const headWithDocs = git(root, ["rev-parse", "HEAD"]);

    expect(runDocumentationGate(root, base, headWithDocs).status).toBe(0);

    const emptyReadme = join(root, "plugins", "doc-keeper", "README.md");
    writeFileSync(emptyReadme, "");
    git(root, ["add", emptyReadme]);
    git(root, ["commit", "-m", "empty readme"]);
    const headWithEmptyReadme = git(root, ["rev-parse", "HEAD"]);

    const emptyGate = runDocumentationGate(
      root,
      headWithDocs,
      headWithEmptyReadme,
    );

    expect(emptyGate.status).not.toBe(0);
    expect(emptyGate.stderr).toContain("README.md must not be empty");
    expect(run(root, "validate-plugins.cjs").status).not.toBe(0);

    const deletedRoot = createFixture();
    git(deletedRoot, ["init"]);
    git(deletedRoot, ["config", "user.email", "test@example.com"]);
    git(deletedRoot, ["config", "user.name", "Test"]);
    git(deletedRoot, ["add", "."]);
    git(deletedRoot, ["commit", "-m", "fixture"]);
    const deletedBase = git(deletedRoot, ["rev-parse", "HEAD"]);
    const deletedReadme = join(
      deletedRoot,
      "plugins",
      "doc-keeper",
      "README.md",
    );
    rmSync(deletedReadme);
    git(deletedRoot, ["add", "-A"]);
    git(deletedRoot, ["commit", "-m", "delete readme"]);
    const deletedHead = git(deletedRoot, ["rev-parse", "HEAD"]);

    const deletedGate = runDocumentationGate(
      deletedRoot,
      deletedBase,
      deletedHead,
    );

    expect(deletedGate.status).not.toBe(0);
    expect(deletedGate.stderr).toContain("README.md must exist");
  });

  it("rejects plugin diffs that add an unmasked credential", () => {
    const root = createFixture();
    git(root, ["init"]);
    git(root, ["config", "user.email", "test@example.com"]);
    git(root, ["config", "user.name", "Test"]);
    git(root, ["add", "."]);
    git(root, ["commit", "-m", "fixture"]);
    const base = git(root, ["rev-parse", "HEAD"]);
    const readme = join(root, "plugins", "doc-keeper", "README.md");
    const unmasked = `${["api", "key"].join("_")}=${["live", "value"].join("-")}`;
    writeFileSync(readme, `${readFileSync(readme, "utf8")}\n${unmasked}\n`);
    git(root, ["add", readme]);
    git(root, ["commit", "-m", "add credential"]);
    const headWithCredential = git(root, ["rev-parse", "HEAD"]);

    const failure = runDocumentationGate(root, base, headWithCredential);

    expect(failure.status).not.toBe(0);
    expect(failure.stderr).toContain("unmasked credential");

    writeFileSync(readme, `${readFileSync(readme, "utf8")}\ntoken=\${TOKEN}\n`);
    git(root, ["add", readme]);
    git(root, ["commit", "-m", "mask credential"]);
    const headMasked = git(root, ["rev-parse", "HEAD"]);

    expect(
      runDocumentationGate(root, headWithCredential, headMasked).status,
    ).toBe(0);
  });

  it("rejects a plugin README that omits a required operational section", () => {
    const root = createFixture();
    const readme = join(root, "plugins", "doc-keeper", "README.md");
    writeFileSync(
      readme,
      readFileSync(readme, "utf8").replace("## Permissions", "## Access Model"),
    );

    const validation = run(root, "validate-plugins.cjs");

    expect(validation.status).not.toBe(0);
    expect(validation.stderr).toContain(
      "README.md is missing required section: Permissions",
    );
  });

  it("rejects a non-PNG screenshot path and accepts a PNG screenshot", () => {
    const root = createFixture();
    const pluginRoot = join(root, "plugins", "doc-keeper");
    const manifestPath = join(pluginRoot, ".codex-plugin", "plugin.json");
    const manifest = readJson(
      root,
      "plugins/doc-keeper/.codex-plugin/plugin.json",
    ) as { interface: Record<string, unknown> };
    const assets = join(pluginRoot, "assets");
    mkdirSync(assets, { recursive: true });
    writeFileSync(join(assets, "screenshot.jpg"), "jpeg");
    manifest.interface["screenshots"] = ["./assets/screenshot.jpg"];
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

    const jpegValidation = run(root, "validate-plugins.cjs");

    expect(jpegValidation.status).not.toBe(0);
    expect(jpegValidation.stderr).toContain("screenshots");

    const png = Buffer.from(
      "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2db00000000049454e44ae426082",
      "hex",
    );
    writeFileSync(join(assets, "screenshot.png"), png);
    manifest.interface["screenshots"] = ["./assets/screenshot.png"];
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

    expect(run(root, "validate-plugins.cjs").status).toBe(0);
  });

  it("requires a release tag version and matching changelog section", () => {
    const root = createFixture();

    expect(runReleaseValidation(root, "plugin/doc-keeper/v0.1.0").status).toBe(
      0,
    );

    const mismatch = runReleaseValidation(root, "plugin/doc-keeper/v9.0.0");

    expect(mismatch.status).not.toBe(0);
    expect(mismatch.stderr).toContain("does not match manifest version");

    const changelogPath = join(root, "plugins", "doc-keeper", "CHANGELOG.md");
    writeFileSync(
      changelogPath,
      readFileSync(changelogPath, "utf8").replace(
        "## [0.1.0] - 2026-08-28",
        "## [0.0.9] - 2026-08-28",
      ),
    );

    const missingSection = runReleaseValidation(
      root,
      "plugin/doc-keeper/v0.1.0",
    );

    expect(missingSection.status).not.toBe(0);
    expect(missingSection.stderr).toContain("release section");
  });

  it("rejects missing skill agent metadata and symlinks anywhere in a plugin package", () => {
    const root = createFixture();
    rmSync(
      join(
        root,
        "plugins",
        "astro-cli-commands",
        "skills",
        "astro-commands",
        "agents",
        "openai.yaml",
      ),
    );
    expect(run(root, "validate-plugins.cjs").status).not.toBe(0);

    const secondRoot = createFixture();
    symlinkSync(
      "/tmp",
      join(secondRoot, "plugins", "astro-cli-commands", "unexpected-link"),
    );
    expect(run(secondRoot, "validate-plugins.cjs").status).not.toBe(0);
  });

  it("rejects a catalog whose entries no longer exactly derive from the manifests", () => {
    const root = createFixture();
    expect(run(root, "generate-marketplace.cjs").status).toBe(0);

    const catalogPath = join(root, ".agents", "plugins", "marketplace.json");
    const catalog = readJson(root, ".agents/plugins/marketplace.json") as {
      plugins: Array<{ category: string }>;
    };
    catalog.plugins[0]!.category = "Security";
    writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

    const validation = run(root, "validate-marketplace.cjs");

    expect(validation.status).not.toBe(0);
    expect(validation.stderr).toContain("does not exactly match");
  });

  it("stops the Codex turn and preserves the catalog when a manifest edit breaks the pipeline", () => {
    const root = createFixture();
    const manifestPath = join(
      root,
      "plugins",
      "doc-keeper",
      ".codex-plugin",
      "plugin.json",
    );
    const manifest = readJson(
      root,
      "plugins/doc-keeper/.codex-plugin/plugin.json",
    ) as {
      interface: { category: string };
    };
    manifest.interface.category = "Invalid category";
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

    const sentinel = '{"catalog":"unchanged"}\n';
    cpSync(join(repositoryRoot, ".agents"), join(root, ".agents"), {
      recursive: true,
    });
    const catalogPath = join(root, ".agents", "plugins", "marketplace.json");
    writeFileSync(catalogPath, sentinel);

    const guard = runGuard(root, {
      tool_input: {
        patch: `*** Begin Patch\n*** Update File: plugins/doc-keeper/.codex-plugin/plugin.json\n*** End Patch`,
      },
      hook_event_name: "PostToolUse",
    });

    expect(guard.status).toBe(0);
    expect(JSON.parse(guard.stdout) as { continue: boolean }).toMatchObject({
      continue: false,
    });
    expect(readFileSync(catalogPath, "utf8")).toBe(sentinel);
  });

  it("stops the Codex turn when the post-generation reverse validation fails", () => {
    const root = createFixture();
    const packagePath = join(root, "package.json");
    const packageJson = readJson(root, "package.json") as {
      scripts: Record<string, string>;
    };
    packageJson.scripts["validate:marketplace"] =
      'node -e "process.exitCode = 1"';
    writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

    const guard = runGuard(root, {
      tool_input: {
        patch: "*** Update File: plugins/doc-keeper/.codex-plugin/plugin.json",
      },
      hook_event_name: "PostToolUse",
    });

    expect(guard.status).toBe(0);
    expect(JSON.parse(guard.stdout) as { continue: boolean }).toMatchObject({
      continue: false,
    });
  });
});
