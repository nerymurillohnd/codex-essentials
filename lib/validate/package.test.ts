import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const validator = require("./package.cjs") as {
  findSkillRoots(
    directory: string,
    pluginRoot: string,
    errors: string[],
  ): string[];
  iconPaths(payload: unknown): string[];
  isDirectory(target: string): boolean;
  isFile(target: string): boolean;
  manifestResourcePaths(manifest: unknown): string[];
  missingReadmeSections(content: string): string[];
  relative(root: string, target: string): string;
  resolvesInside(root: string, target: string): boolean;
  validateAuthoredDocuments(pluginRoot: string, errors: string[]): void;
  validatePackage(
    root: string,
    pluginName: string,
    declaredSkillIds?: string[],
  ): string[];
};
const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);
const fixtures: string[] = [];

afterEach(() => {
  for (const fixture of fixtures.splice(0)) {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});

function createFixture(): { root: string; pluginRoot: string } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "codex-package-test-"));
  fixtures.push(root);
  fs.cpSync(
    path.join(repositoryRoot, "lib", "schemas"),
    path.join(root, "lib", "schemas"),
    {
      recursive: true,
    },
  );
  const pluginRoot = path.join(root, "plugins", "contained");
  fs.mkdirSync(path.join(pluginRoot, ".codex-plugin"), { recursive: true });
  fs.mkdirSync(path.join(pluginRoot, "skills", "contained-skill", "agents"), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(pluginRoot, ".codex-plugin", "plugin.json"),
    JSON.stringify({
      name: "contained",
      version: "1.2.3",
      description: "A contained plugin.",
      author: { name: "Test" },
      interface: {
        displayName: "Contained",
        shortDescription: "Contained plugin",
        longDescription: "A fully contained plugin fixture.",
        developerName: "Test",
        category: "Productivity",
        capabilities: ["Skills"],
        defaultPrompt: "Use Contained",
      },
      skills: "./skills/",
    }),
    "utf8",
  );
  fs.writeFileSync(
    path.join(pluginRoot, "skills", "contained-skill", "SKILL.md"),
    "# Contained skill\n",
    "utf8",
  );
  fs.writeFileSync(
    path.join(pluginRoot, "skills", "contained-skill", "agents", "openai.yaml"),
    "interface:\n  display_name: Contained\n  short_description: Contained\n",
    "utf8",
  );
  fs.writeFileSync(
    path.join(pluginRoot, "README.md"),
    [
      "# Contained",
      "",
      "## Purpose",
      "## Included Components",
      "## Supported Environments",
      "## Inputs and Outputs",
      "## Required Tools and Credentials",
      "## Permissions",
      "## Side Effects",
      "## Human Approval Boundaries",
      "## Installation Behavior",
      "## Uninstall and Rollback Behavior",
      "## Verification",
      "## Known Limitations",
      "## Failure and Recovery",
      "",
    ].join("\n"),
    "utf8",
  );
  fs.writeFileSync(
    path.join(pluginRoot, "CHANGELOG.md"),
    "# Changelog\n\n## [Unreleased]\n",
    "utf8",
  );
  return { root, pluginRoot };
}

describe("package containment", () => {
  it("accepts a skill tree fully contained by its plugin", () => {
    const { root } = createFixture();

    expect(validator.validatePackage(root, "contained")).toEqual([]);
  });

  it("rejects a skills directory resolving outside the distributable package", () => {
    const { root, pluginRoot } = createFixture();
    const externalSkills = path.join(root, "external-skills");
    fs.renameSync(path.join(pluginRoot, "skills"), externalSkills);
    fs.symlinkSync(externalSkills, path.join(pluginRoot, "skills"));

    expect(validator.validatePackage(root, "contained")).toContain(
      "skills resolves outside the owning plugin package",
    );
  });

  it("rejects an agent manifest resolving outside its owning skill", () => {
    const { root, pluginRoot } = createFixture();
    const agentPath = path.join(
      pluginRoot,
      "skills",
      "contained-skill",
      "agents",
      "openai.yaml",
    );
    const externalAgent = path.join(root, "external-agent.yaml");
    fs.renameSync(agentPath, externalAgent);
    fs.symlinkSync(externalAgent, agentPath);

    expect(validator.validatePackage(root, "contained")).toContain(
      "skills/contained-skill/agents/openai.yaml resolves outside the owning skill",
    );
  });

  it("reports missing and malformed package roots without following them", () => {
    const { root, pluginRoot } = createFixture();
    expect(validator.validatePackage(root, "missing")).toEqual([
      "plugins/missing is missing",
    ]);

    const external = path.join(root, "external-plugin");
    fs.renameSync(pluginRoot, external);
    fs.symlinkSync(external, pluginRoot);
    expect(validator.validatePackage(root, "contained")).toEqual([
      "plugins/contained resolves outside the plugins directory",
    ]);
  });

  it("reports non-directory skills and missing agent manifests", () => {
    const { root, pluginRoot } = createFixture();
    fs.rmSync(path.join(pluginRoot, "skills"), {
      recursive: true,
      force: true,
    });
    fs.writeFileSync(
      path.join(pluginRoot, "skills"),
      "not a directory",
      "utf8",
    );
    expect(validator.validatePackage(root, "contained")).toEqual([
      "skills is not a directory",
    ]);

    fs.rmSync(path.join(pluginRoot, "skills"));
    fs.mkdirSync(path.join(pluginRoot, "skills", "contained-skill"), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(pluginRoot, "skills", "contained-skill", "SKILL.md"),
      "# Skill\n",
      "utf8",
    );
    expect(validator.validatePackage(root, "contained")).toContain(
      "skills/contained-skill/agents/openai.yaml is missing",
    );
  });

  it("rejects malformed derived metadata and incomplete author documents", () => {
    const { root, pluginRoot } = createFixture();
    fs.writeFileSync(
      path.join(pluginRoot, ".codex-plugin", "plugin.json"),
      "{}\n",
      "utf8",
    );
    fs.writeFileSync(
      path.join(
        pluginRoot,
        "skills",
        "contained-skill",
        "agents",
        "openai.yaml",
      ),
      "interface:\n  display_name: Missing description\n",
      "utf8",
    );
    fs.writeFileSync(path.join(pluginRoot, "README.md"), "\n", "utf8");
    fs.writeFileSync(
      path.join(pluginRoot, "CHANGELOG.md"),
      "# Changelog\n",
      "utf8",
    );

    const errors = validator.validatePackage(root, "contained").join("\n");
    expect(errors).toContain("plugin.json is invalid");
    expect(errors).toContain("openai.yaml is invalid");
    expect(errors).toContain("README.md must not be empty");
    expect(errors).toContain("CHANGELOG.md must include ## [Unreleased]");
  });

  it("covers helper failure paths, hidden files, and agent icon containment", () => {
    const { root, pluginRoot } = createFixture();
    const skillRoot = path.join(pluginRoot, "skills", "contained-skill");
    fs.writeFileSync(path.join(skillRoot, ".ignored"), "ignored", "utf8");
    fs.writeFileSync(
      path.join(skillRoot, "agents", "openai.yaml"),
      [
        "interface:",
        "  display_name: Contained",
        "  short_description: Contained",
        "  icon_small: ./assets/missing.svg",
        "",
      ].join("\n"),
      "utf8",
    );
    const errors = validator.validatePackage(root, "contained").join("\n");
    expect(errors).toContain(
      "assets/missing.svg resolves outside the owning skill",
    );
    expect(validator.iconPaths(null)).toEqual([]);
    expect(validator.iconPaths({})).toEqual([]);
    expect(validator.iconPaths({ interface: "invalid" })).toEqual([]);
    expect(
      validator.iconPaths({ interface: { icon_small: "a", icon_large: 4 } }),
    ).toEqual(["a"]);
    expect(validator.isDirectory(path.join(root, "missing"))).toBe(false);
    expect(validator.isFile(path.join(root, "missing"))).toBe(false);
    expect(
      validator.resolvesInside(pluginRoot, path.join(root, "missing")),
    ).toBe(false);
    expect(validator.relative(pluginRoot, pluginRoot)).toBe(".");
    const helperErrors: string[] = [];
    expect(
      validator.findSkillRoots(skillRoot, pluginRoot, helperErrors),
    ).toEqual([skillRoot]);
    fs.rmSync(path.join(pluginRoot, "README.md"));
    const documentErrors: string[] = [];
    validator.validateAuthoredDocuments(pluginRoot, documentErrors);
    expect(documentErrors).toContain(
      "README.md is missing or resolves outside the owning plugin package",
    );
  });

  it("reports missing skill trees, empty skill roots, and nested external links", () => {
    const { root, pluginRoot } = createFixture();
    fs.rmSync(path.join(pluginRoot, "skills"), {
      recursive: true,
      force: true,
    });
    expect(validator.validatePackage(root, "contained")).toContain(
      "skills is missing",
    );
    fs.mkdirSync(path.join(pluginRoot, "skills"));
    expect(validator.validatePackage(root, "contained")).toContain(
      "skills does not contain a SKILL.md file",
    );
    const external = path.join(root, "external-skill-dir");
    fs.mkdirSync(external);
    fs.symlinkSync(external, path.join(pluginRoot, "skills", "external"));
    const errors: string[] = [];
    validator.findSkillRoots(
      path.join(pluginRoot, "skills"),
      pluginRoot,
      errors,
    );
    expect(errors.join("\n")).toContain(
      "resolves outside the owning plugin package",
    );
  });

  it("handles invalid YAML and contained directory cycles", () => {
    const { root, pluginRoot } = createFixture();
    const skillRoot = path.join(pluginRoot, "skills", "contained-skill");
    fs.writeFileSync(
      path.join(skillRoot, "agents", "openai.yaml"),
      "interface: [\n",
      "utf8",
    );
    expect(validator.validatePackage(root, "contained").join("\n")).toContain(
      "Flow sequence",
    );
    fs.writeFileSync(
      path.join(skillRoot, "agents", "openai.yaml"),
      "interface:\n  display_name: Contained\n  short_description: Contained\n",
      "utf8",
    );
    fs.symlinkSync("..", path.join(skillRoot, "cycle"));
    expect(validator.validatePackage(root, "contained")).toContain(
      "skills/contained-skill/cycle must not be a symbolic link",
    );
  });

  it("requires every manifest resource, README section, and declared skill", () => {
    const { root, pluginRoot } = createFixture();
    const manifestPath = path.join(pluginRoot, ".codex-plugin", "plugin.json");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    manifest.apps = "./.app.json";
    manifest.mcpServers = "./.mcp.json";
    manifest.interface.logo = "./assets/logo.png";
    fs.writeFileSync(manifestPath, JSON.stringify(manifest), "utf8");

    const errors = validator
      .validatePackage(root, "contained", ["contained-skill", "missing-skill"])
      .join("\n");
    expect(errors).toContain("plugin manifest resource ./.app.json is missing");
    expect(errors).toContain("plugin manifest resource ./.mcp.json is missing");
    expect(errors).toContain(
      "plugin manifest resource ./assets/logo.png is missing",
    );
    expect(errors).toContain("skills/missing-skill/SKILL.md is missing");

    fs.writeFileSync(
      path.join(pluginRoot, "README.md"),
      "# Contained\n",
      "utf8",
    );
    expect(validator.validatePackage(root, "contained").join("\n")).toContain(
      "README.md is missing required section: Purpose",
    );
    expect(validator.missingReadmeSections("## Purpose")).toContain(
      "Verification",
    );
    expect(
      validator.manifestResourcePaths({
        apps: "./.app.json",
        mcpServers: "./.mcp.json",
        interface: {
          logo: "./assets/logo.png",
          screenshots: ["./assets/one.png"],
        },
      }),
    ).toEqual([
      "./.app.json",
      "./.mcp.json",
      "./assets/logo.png",
      "./assets/one.png",
    ]);
  });

  it("accepts present manifest resources and ignores unsupported value types", () => {
    const { root, pluginRoot } = createFixture();
    const manifestPath = path.join(pluginRoot, ".codex-plugin", "plugin.json");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    manifest.apps = "./.app.json";
    manifest.mcpServers = "./.mcp.json";
    manifest.interface.composerIcon = "./assets/composer.png";
    manifest.interface.logo = "./assets/logo.png";
    manifest.interface.logoDark = "./assets/logo-dark.png";
    manifest.interface.screenshots = ["./assets/screenshot.png"];
    fs.writeFileSync(manifestPath, JSON.stringify(manifest), "utf8");
    fs.mkdirSync(path.join(pluginRoot, "assets"));
    for (const resource of [
      ".app.json",
      ".mcp.json",
      "assets/composer.png",
      "assets/logo.png",
      "assets/logo-dark.png",
      "assets/screenshot.png",
    ]) {
      fs.writeFileSync(path.join(pluginRoot, resource), "{}\n", "utf8");
    }

    expect(
      validator.validatePackage(root, "contained", ["contained-skill"]),
    ).toEqual([]);
    expect(validator.manifestResourcePaths(null)).toEqual([]);
    expect(validator.manifestResourcePaths(3)).toEqual([]);
    expect(validator.manifestResourcePaths([])).toEqual([]);
    expect(validator.manifestResourcePaths({ apps: 3 })).toEqual([]);
    expect(validator.manifestResourcePaths({ interface: "invalid" })).toEqual(
      [],
    );
    expect(
      validator.manifestResourcePaths({
        interface: { screenshots: [3] },
      }),
    ).toEqual([]);
  });
});
