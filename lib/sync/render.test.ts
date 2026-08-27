import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import YAML from "yaml";

const require = createRequire(import.meta.url);
const source = require("../core/source.cjs") as {
  loadSource(root: string): SourceDocument;
};
const render = require("./render.cjs") as {
  assertPathInside(
    root: string,
    target: string,
    options?: { allowMissing?: boolean },
  ): void;
  ensureContainedDirectory(root: string, directory: string): void;
  ensurePluginRoot(root: string, pluginName: string): string;
  renderAgent(skill: SkillDefinition): string;
  renderMarketplace(source: SourceDocument): string;
  renderPlugin(plugin: PluginDefinition): string;
  syncPlugin(root: string, plugin: PluginDefinition): void;
};
const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);
const fixtures: string[] = [];

interface SkillDefinition {
  id: string;
  displayName: string;
  shortDescription: string;
  defaultPrompt: string;
}

interface PluginDefinition {
  name: string;
  version: string;
  description: string;
  author: { name: string; url?: string };
  repository: string;
  license: string;
  interface: Record<string, unknown>;
  marketplace: {
    category: string;
    installation: string;
    authentication: string;
  };
  skills: SkillDefinition[];
}

interface SourceDocument {
  marketplace: { name: string; displayName: string };
  plugins: PluginDefinition[];
}

afterEach(() => {
  for (const fixture of fixtures.splice(0)) {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});

describe("derived plugin artifact rendering", () => {
  it("renders package, agent, and marketplace metadata from the declarative source", () => {
    const payload = source.loadSource(repositoryRoot);
    const plugin = payload.plugins[0];
    const skill = plugin?.skills[0];

    expect(plugin).toBeDefined();
    expect(skill).toBeDefined();
    expect(JSON.parse(render.renderPlugin(plugin!))).toMatchObject({
      name: "astro-cli-commands",
      version: "0.1.1",
      skills: "./skills/",
      interface: { displayName: "Astro Commands" },
    });
    expect(YAML.parse(render.renderAgent(skill!))).toEqual({
      interface: {
        display_name: "Astro Commands",
        short_description: "Use Astro's current CLI capabilities first.",
        default_prompt: "Use Astro Commands before planning this Astro task.",
      },
    });
    expect(JSON.parse(render.renderMarketplace(payload)).plugins).toEqual([
      expect.objectContaining({ name: "astro-cli-commands" }),
      expect.objectContaining({ name: "prettier-after-edit" }),
    ]);
  });

  it("writes only generated metadata and preserves the authored skill document", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "codex-sync-test-"));
    fixtures.push(root);
    const plugin = source.loadSource(repositoryRoot).plugins[0]!;
    const skillPath = path.join(
      root,
      "plugins",
      plugin.name,
      "skills",
      plugin.skills[0]!.id,
      "SKILL.md",
    );
    fs.mkdirSync(path.dirname(skillPath), { recursive: true });
    fs.writeFileSync(skillPath, "# Authored skill\n", "utf8");

    render.syncPlugin(root, plugin);

    expect(fs.readFileSync(skillPath, "utf8")).toBe("# Authored skill\n");
    expect(
      JSON.parse(
        fs.readFileSync(
          path.join(
            root,
            "plugins",
            plugin.name,
            ".codex-plugin",
            "plugin.json",
          ),
          "utf8",
        ),
      ),
    ).toMatchObject({ name: plugin.name, skills: "./skills/" });
    expect(
      YAML.parse(
        fs.readFileSync(
          path.join(
            root,
            "plugins",
            plugin.name,
            "skills",
            plugin.skills[0]!.id,
            "agents",
            "openai.yaml",
          ),
          "utf8",
        ),
      ),
    ).toEqual(YAML.parse(render.renderAgent(plugin.skills[0]!)));
  });

  it("refuses absent and externally resolved write targets", () => {
    const root = fs.mkdtempSync(
      path.join(os.tmpdir(), "codex-render-boundary-test-"),
    );
    fixtures.push(root);
    const external = fs.mkdtempSync(
      path.join(os.tmpdir(), "codex-render-external-test-"),
    );
    fixtures.push(external);
    expect(() =>
      render.assertPathInside(root, path.join(root, "missing")),
    ).toThrow("is missing");
    expect(() => render.assertPathInside(root, external)).toThrow(
      "resolves outside",
    );
    const pluginRoot = render.ensurePluginRoot(root, "contained");
    render.ensureContainedDirectory(
      pluginRoot,
      path.join(pluginRoot, "nested"),
    );
    fs.symlinkSync(external, path.join(pluginRoot, "external"));
    expect(() =>
      render.ensureContainedDirectory(
        pluginRoot,
        path.join(pluginRoot, "external", "nested"),
      ),
    ).toThrow("resolves outside");
    expect(() => render.assertPathInside(pluginRoot, pluginRoot)).not.toThrow();
  });
});
