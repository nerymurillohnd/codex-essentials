import {
  cpSync,
  existsSync,
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
const fixtures: string[] = [];

function createFixture(): string {
  const root = realpathSync(
    mkdtempSync(join(tmpdir(), "codex-essentials-release-")),
  );
  cpSync(join(repositoryRoot, "plugins"), join(root, "plugins"), {
    recursive: true,
  });
  cpSync(join(repositoryRoot, "schemas"), join(root, "schemas"), {
    recursive: true,
  });
  cpSync(join(repositoryRoot, "templates"), join(root, "templates"), {
    recursive: true,
  });
  mkdirSync(join(root, "lib", "schemas"), { recursive: true });
  cpSync(
    join(repositoryRoot, "lib", "schemas", "agent.schema.json"),
    join(root, "lib", "schemas", "agent.schema.json"),
  );
  cpSync(
    join(repositoryRoot, "release-please-config.json"),
    join(root, "release-please-config.json"),
  );
  fixtures.push(root);
  git(root, ["init"]);
  git(root, ["config", "user.email", "test@example.com"]);
  git(root, ["config", "user.name", "Release Test"]);
  git(root, ["add", "plugins"]);
  git(root, ["commit", "-m", "fixture"]);
  return root;
}

function git(root: string, args: string[]): string {
  const result = spawnSync("git", ["-C", root, ...args], {
    encoding: "utf8",
  });
  expect(result.status).toBe(0);
  return result.stdout.trim();
}

function runScript(
  root: string,
  script: string,
  args: string[],
  environment: Record<string, string> = {},
) {
  return spawnSync(
    process.execPath,
    [join(repositoryRoot, "scripts", script), "--root", root, ...args],
    {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, ...environment },
    },
  );
}

function runStandaloneScript(script: string, args: string[]) {
  return spawnSync(
    process.execPath,
    [join(repositoryRoot, "scripts", script), ...args],
    {
      encoding: "utf8",
    },
  );
}

function writeOutputs(root: string, outputs: Record<string, unknown>): string {
  const path = join(root, "release-please-outputs.json");
  writeFileSync(path, `${JSON.stringify(outputs, null, 2)}\n`);
  return path;
}

afterEach(() => {
  for (const root of fixtures.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("Release Please integration boundary", () => {
  it("accepts Conventional Commit PR titles and rejects ordinary titles", () => {
    const accepted = runStandaloneScript("validate-pr-title.cjs", [
      "--title",
      "feat(doc-keeper)!: change the hook contract",
    ]);
    const rejected = runStandaloneScript("validate-pr-title.cjs", [
      "--title",
      "Update things",
    ]);

    expect(accepted.status, accepted.stderr).toBe(0);
    expect(rejected.status).not.toBe(0);
    expect(rejected.stderr).toContain("Conventional Commit");
  });

  it("captures one explicit field per Release Please output", () => {
    const root = createFixture();
    const currentSha = git(root, ["rev-parse", "HEAD"]);
    const capture = runScript(
      root,
      "capture-release-please-outputs.cjs",
      ["--output", "release-please-outputs.json"],
      {
        RELEASES_CREATED: "true",
        PATHS_RELEASED: '["plugins/doc-keeper"]',
        PRS_CREATED: "false",
        RELEASE_OUTPUT__PLUGINS_DOC_KEEPER__RELEASE_CREATED: "true",
        RELEASE_OUTPUT__PLUGINS_DOC_KEEPER__TAG_NAME:
          "plugin/doc-keeper/v0.1.0",
        RELEASE_OUTPUT__PLUGINS_DOC_KEEPER__VERSION: "0.1.0",
        RELEASE_OUTPUT__PLUGINS_DOC_KEEPER__SHA: currentSha,
      },
    );

    expect(capture.status).toBe(0);
    expect(
      JSON.parse(
        readFileSync(join(root, "release-please-outputs.json"), "utf8"),
      ),
    ).toMatchObject({
      releases_created: "true",
      paths_released: '["plugins/doc-keeper"]',
      "plugins/doc-keeper--tag_name": "plugin/doc-keeper/v0.1.0",
    });
  });

  it("normalizes exact per-component tag and SHA outputs", () => {
    const root = createFixture();
    const currentSha = git(root, ["rev-parse", "HEAD"]);
    git(root, ["tag", "plugin/doc-keeper/v0.1.0"]);
    const outputsPath = writeOutputs(root, {
      releases_created: "true",
      paths_released: '["plugins/doc-keeper"]',
      "plugins/doc-keeper--release_created": "true",
      "plugins/doc-keeper--tag_name": "plugin/doc-keeper/v0.1.0",
      "plugins/doc-keeper--version": "0.1.0",
      "plugins/doc-keeper--sha": currentSha,
    });

    const result = runScript(root, "prepare-release-plan.cjs", [
      "--outputs",
      outputsPath,
      "--expected-sha",
      currentSha,
      "--output",
      "release-plan.json",
    ]);

    expect(result.status).toBe(0);
    expect(
      JSON.parse(readFileSync(join(root, "release-plan.json"), "utf8")),
    ).toEqual([
      {
        tag: "plugin/doc-keeper/v0.1.0",
        pluginPath: "plugins/doc-keeper",
        name: "doc-keeper",
        version: "0.1.0",
        sha: currentSha,
      },
    ]);
  });

  it("rejects a Release Please output whose tag SHA is stale", () => {
    const root = createFixture();
    const staleSha = git(root, ["rev-parse", "HEAD"]);
    git(root, ["tag", "plugin/doc-keeper/v0.1.0"]);
    writeFileSync(
      join(root, "plugins", "doc-keeper", "README.md"),
      `${readFileSync(join(root, "plugins", "doc-keeper", "README.md"), "utf8")}\nCurrent release change.\n`,
    );
    git(root, ["add", "."]);
    git(root, ["commit", "-m", "feat: release current plugin"]);
    const currentSha = git(root, ["rev-parse", "HEAD"]);
    const outputsPath = writeOutputs(root, {
      releases_created: "true",
      paths_released: '["plugins/doc-keeper"]',
      "plugins/doc-keeper--release_created": "true",
      "plugins/doc-keeper--tag_name": "plugin/doc-keeper/v0.1.0",
      "plugins/doc-keeper--version": "0.1.0",
      "plugins/doc-keeper--sha": staleSha,
    });

    const result = runScript(root, "prepare-release-plan.cjs", [
      "--outputs",
      outputsPath,
      "--expected-sha",
      currentSha,
      "--output",
      "release-plan.json",
    ]);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("does not match");
  });

  it("rejects a current-SHA draft whose tag maps to a missing plugin", () => {
    const root = createFixture();
    const currentSha = git(root, ["rev-parse", "HEAD"]);
    const config = JSON.parse(
      readFileSync(join(root, "release-please-config.json"), "utf8"),
    ) as { packages: Record<string, unknown> };
    config.packages["plugins/missing-plugin"] = {};
    writeFileSync(
      join(root, "release-please-config.json"),
      `${JSON.stringify(config, null, 2)}\n`,
    );
    const outputsPath = writeOutputs(root, {
      releases_created: "true",
      paths_released: '["plugins/missing-plugin"]',
      "plugins/missing-plugin--release_created": "true",
      "plugins/missing-plugin--tag_name": "plugin/missing-plugin/v0.1.0",
      "plugins/missing-plugin--version": "0.1.0",
      "plugins/missing-plugin--sha": currentSha,
    });
    git(root, ["tag", "plugin/missing-plugin/v0.1.0"]);

    const result = runScript(root, "prepare-release-plan.cjs", [
      "--outputs",
      outputsPath,
      "--expected-sha",
      currentSha,
      "--output",
      "release-plan.json",
    ]);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("missing plugin manifest");
  });

  it("creates a tag-based archive and verifies its checksum and members", () => {
    const root = createFixture();
    const currentSha = git(root, ["rev-parse", "HEAD"]);
    git(root, ["tag", "plugin/doc-keeper/v0.1.0"]);
    const planPath = join(root, "release-plan.json");
    writeFileSync(
      planPath,
      `${JSON.stringify(
        [
          {
            releaseId: 5,
            tag: "plugin/doc-keeper/v0.1.0",
            pluginPath: "plugins/doc-keeper",
            name: "doc-keeper",
            version: "0.1.0",
            sha: currentSha,
          },
        ],
        null,
        2,
      )}\n`,
    );

    const packaging = runScript(root, "package-plugin.cjs", [
      "--plan",
      planPath,
      "--output-dir",
      "dist/artifacts",
      "--output",
      "dist/release-artifacts.json",
    ]);

    expect(packaging.status, packaging.stderr).toBe(0);
    expect(
      existsSync(join(root, "dist/artifacts/doc-keeper-0.1.0.tar.gz")),
    ).toBe(true);
    expect(
      existsSync(join(root, "dist/artifacts/doc-keeper-0.1.0.tar.gz.sha256")),
    ).toBe(true);

    const validation = runScript(root, "validate-release-set.cjs", [
      "--plan",
      "dist/release-artifacts.json",
      "--archives",
    ]);

    expect(validation.status).toBe(0);
    const archiveListing = spawnSync(
      "tar",
      ["-tzf", join(root, "dist/artifacts/doc-keeper-0.1.0.tar.gz")],
      { encoding: "utf8" },
    );
    expect(archiveListing.status).toBe(0);
    expect(archiveListing.stdout).toContain(
      "doc-keeper-0.1.0/plugins/doc-keeper/.codex-plugin/plugin.json",
    );
    expect(archiveListing.stdout).not.toContain(".git/");
  });

  it("accepts the changelog heading generated by Release Please", () => {
    const root = createFixture();
    const manifestPath = join(
      root,
      "plugins",
      "doc-keeper",
      ".codex-plugin",
      "plugin.json",
    );
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
      version: string;
    };
    manifest.version = "0.1.1";
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    const changelogPath = join(root, "plugins", "doc-keeper", "CHANGELOG.md");
    writeFileSync(
      changelogPath,
      readFileSync(changelogPath, "utf8").replace(
        "## [0.1.0] - 2026-08-28",
        "## 0.1.1 (2026-08-28)",
      ),
    );
    git(root, ["add", "plugins/doc-keeper"]);
    git(root, ["commit", "-m", "release doc-keeper"]);
    const sha = git(root, ["rev-parse", "HEAD"]);
    git(root, ["tag", "plugin/doc-keeper/v0.1.1"]);
    const planPath = join(root, "release-plan.json");
    writeFileSync(
      planPath,
      `${JSON.stringify(
        [
          {
            tag: "plugin/doc-keeper/v0.1.1",
            pluginPath: "plugins/doc-keeper",
            name: "doc-keeper",
            version: "0.1.1",
            sha,
          },
        ],
        null,
        2,
      )}\n`,
    );

    const validation = runScript(root, "validate-release-set.cjs", [
      "--plan",
      planPath,
    ]);

    expect(validation.status, validation.stderr).toBe(0);
  });

  it("preflights every plugin from the commit and excludes untracked files", () => {
    const root = createFixture();
    const secretPath = join(root, "plugins", "doc-keeper", ".env.local");
    writeFileSync(secretPath, "SHOULD NEVER BE ARCHIVED\n");

    const first = runScript(root, "package-plugin.cjs", [
      "--preflight",
      "--ref",
      "HEAD",
      "--output-dir",
      "dist/preflight-one",
      "--output",
      "dist/preflight-one.json",
    ]);
    const second = runScript(root, "package-plugin.cjs", [
      "--preflight",
      "--ref",
      "HEAD",
      "--output-dir",
      "dist/preflight-two",
      "--output",
      "dist/preflight-two.json",
    ]);

    expect(first.status, first.stderr).toBe(0);
    expect(second.status, second.stderr).toBe(0);
    const firstArtifacts = JSON.parse(
      readFileSync(join(root, "dist", "preflight-one.json"), "utf8"),
    ) as Array<{ name: string; sha256: string }>;
    const secondArtifacts = JSON.parse(
      readFileSync(join(root, "dist", "preflight-two.json"), "utf8"),
    ) as Array<{ name: string; sha256: string }>;
    expect(firstArtifacts).toHaveLength(3);
    expect(firstArtifacts.map(({ sha256 }) => sha256)).toEqual(
      secondArtifacts.map(({ sha256 }) => sha256),
    );

    const archiveListing = spawnSync(
      "tar",
      ["-tzf", join(root, "dist", "preflight-one", "doc-keeper-0.1.0.tar.gz")],
      { encoding: "utf8" },
    );
    expect(archiveListing.status).toBe(0);
    expect(archiveListing.stdout).not.toContain(".env.local");
  });

  it("rejects archive checksums and symlink members that do not satisfy the contract", () => {
    const root = createFixture();
    const currentSha = git(root, ["rev-parse", "HEAD"]);
    git(root, ["tag", "plugin/doc-keeper/v0.1.0"]);
    const planPath = join(root, "release-plan.json");
    writeFileSync(
      planPath,
      `${JSON.stringify(
        [
          {
            releaseId: 6,
            tag: "plugin/doc-keeper/v0.1.0",
            pluginPath: "plugins/doc-keeper",
            name: "doc-keeper",
            version: "0.1.0",
            sha: currentSha,
          },
        ],
        null,
        2,
      )}\n`,
    );
    expect(
      runScript(root, "package-plugin.cjs", [
        "--plan",
        planPath,
        "--output-dir",
        "dist/artifacts",
        "--output",
        "dist/release-artifacts.json",
      ]).status,
    ).toBe(0);

    const checksumPath = join(
      root,
      "dist/artifacts/doc-keeper-0.1.0.tar.gz.sha256",
    );
    writeFileSync(checksumPath, "00000000000000000000000000000000  broken\n");
    const checksumFailure = runScript(root, "validate-release-set.cjs", [
      "--plan",
      "dist/release-artifacts.json",
      "--archives",
    ]);
    expect(checksumFailure.status).not.toBe(0);
    expect(checksumFailure.stderr).toContain("checksum");

    const linkPath = join(root, "plugins", "doc-keeper", "symlinked-secret");
    const manifestPath = join(
      root,
      "plugins",
      "doc-keeper",
      ".codex-plugin",
      "plugin.json",
    );
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
      version: string;
    };
    manifest.version = "0.1.1";
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    const changelogPath = join(root, "plugins", "doc-keeper", "CHANGELOG.md");
    writeFileSync(
      changelogPath,
      readFileSync(changelogPath, "utf8").replace(
        "## [Unreleased]",
        "## [Unreleased]\n\n## [0.1.1] - 2026-08-28",
      ),
    );
    symlinkSync(".codex-plugin/plugin.json", linkPath);
    git(root, ["add", "plugins/doc-keeper"]);
    git(root, ["commit", "-m", "add symlink"]);
    git(root, ["tag", "plugin/doc-keeper/v0.1.1"]);
    const symlinkPlanPath = join(root, "symlink-plan.json");
    writeFileSync(
      symlinkPlanPath,
      `${JSON.stringify(
        [
          {
            releaseId: 7,
            tag: "plugin/doc-keeper/v0.1.1",
            pluginPath: "plugins/doc-keeper",
            name: "doc-keeper",
            version: "0.1.1",
            sha: git(root, ["rev-parse", "HEAD"]),
          },
        ],
        null,
        2,
      )}\n`,
    );
    const symlinkPackaging = runScript(root, "package-plugin.cjs", [
      "--plan",
      symlinkPlanPath,
      "--output-dir",
      "dist/symlink-artifacts",
      "--output",
      "dist/symlink-release-artifacts.json",
    ]);
    expect(symlinkPackaging.status, symlinkPackaging.stderr).toBe(0);
    const symlinkValidation = runScript(root, "validate-release-set.cjs", [
      "--plan",
      "dist/symlink-release-artifacts.json",
      "--archives",
    ]);
    expect(symlinkValidation.status).not.toBe(0);
    expect(symlinkValidation.stderr).toContain("symbolic link");
  });
});
