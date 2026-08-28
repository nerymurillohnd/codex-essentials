import {
  cpSync,
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
