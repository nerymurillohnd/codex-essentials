import { spawnSync } from "node:child_process";
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const repositoryRoot = resolve(import.meta.dirname, "..");
const pluginRoot = resolve(repositoryRoot, "plugins", "prettier-after-edit");
const temporaryRoots: string[] = [];

function writeFakePrettier(prettier: string): void {
  mkdirSync(resolve(prettier, ".."), { recursive: true });
  writeFileSync(
    prettier,
    `#!/usr/bin/env node
const { writeFileSync } = require("node:fs");
const args = process.argv.slice(2);
if (args[0] === "--file-info") {
  process.stdout.write(JSON.stringify({ ignored: false, inferredParser: "babel" }));
  process.exit(0);
}
const separator = args.lastIndexOf("--");
const target = args[separator + 1];
if (args.includes("--write") && target) {
  writeFileSync(target, "formatted\\n");
  process.exit(0);
}
process.exit(2);
`,
  );
  chmodSync(prettier, 0o755);
}

function createProject(): string {
  const root = mkdtempSync(join(tmpdir(), "prettier-after-edit-"));
  temporaryRoots.push(root);
  mkdirSync(join(root, "src"), { recursive: true });
  writeFakePrettier(join(root, "node_modules", ".bin", "prettier"));
  return root;
}

function useRepositoryPrettier(root: string): void {
  const prettier = join(root, "node_modules", ".bin", "prettier");
  rmSync(prettier);
  symlinkSync(
    realpathSync(join(repositoryRoot, "node_modules", ".bin", "prettier")),
    prettier,
  );
}

function runHook(
  root: string,
  payload: unknown,
  executionCwd = root,
  env: NodeJS.ProcessEnv = process.env,
) {
  return spawnSync(
    process.execPath,
    [resolve(pluginRoot, "hooks", "format.mjs")],
    {
      cwd: executionCwd,
      encoding: "utf8",
      env,
      input: JSON.stringify(payload),
    },
  );
}

function runNodeHook(root: string, payload: unknown) {
  return spawnSync(
    process.execPath,
    [resolve(pluginRoot, "hooks", "format.mjs")],
    {
      cwd: root,
      encoding: "utf8",
      env: process.env,
      input: JSON.stringify(payload),
    },
  );
}

function configuredHookCommand(): string {
  const config = JSON.parse(
    readFileSync(resolve(pluginRoot, "hooks", "hooks.json"), "utf8"),
  ) as {
    hooks: {
      PostToolUse: Array<{
        hooks: Array<{ command: string }>;
      }>;
    };
  };
  const command = config.hooks.PostToolUse[0]?.hooks[0]?.command;
  expect(command).toBeTypeOf("string");
  return command ?? "";
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("prettier-after-edit hook", () => {
  it("formats non-Markdown files without a markdownlint phase", () => {
    const root = createProject();
    const target = join(root, "src", "script.js");
    writeFileSync(target, "const value={answer:42}\n");

    const result = runNodeHook(root, {
      cwd: root,
      tool_input: { file_path: "src/script.js" },
    });

    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("prettier=formatted");
    expect(result.stdout).not.toContain("markdownlint=");
  });

  it("formats Markdown without requiring markdownlint configuration", () => {
    const root = createProject();
    useRepositoryPrettier(root);
    const target = join(root, "README.md");
    writeFileSync(
      target,
      "# Fixture\n\n|Column A|Column B|\n|-|-|\n|value one|value two|\n",
    );

    const result = runNodeHook(root, {
      cwd: root,
      tool_input: { file_path: "README.md" },
    });

    expect(result.status, result.stderr).toBe(0);
    expect(readFileSync(target, "utf8")).toContain("| Column A  | Column B  |");
    expect(result.stdout).toContain("prettier=formatted");
    expect(result.stdout).not.toContain("markdownlint=");
  });

  it("reports formatted only when Prettier changes file bytes", () => {
    const root = createProject();
    useRepositoryPrettier(root);
    const target = join(root, "README.md");
    writeFileSync(
      target,
      "# Fixture\n\n|Column A|Column B|\n|-|-|\n|value one|value two|\n",
    );

    const first = runNodeHook(root, {
      cwd: root,
      tool_input: { file_path: "README.md" },
    });

    expect(first.status, first.stderr).toBe(0);
    expect(readFileSync(target, "utf8")).toContain("| Column A  | Column B  |");
    expect(first.stdout).toContain("prettier=formatted");
    expect(first.stdout).not.toContain("markdownlint=");
    const afterFirstRun = readFileSync(target, "utf8");

    const second = runNodeHook(root, {
      cwd: root,
      tool_input: { file_path: "README.md" },
    });

    expect(second.status, second.stderr).toBe(0);
    expect(second.stdout).toContain("prettier=unchanged");
    expect(second.stdout).not.toContain("markdownlint=");
    expect(readFileSync(target, "utf8")).toBe(afterFirstRun);
  });

  it("deduplicates targets and rejects files outside cwd", () => {
    const root = createProject();
    const inside = join(root, "src", "inside.js");
    writeFileSync(inside, "original\n");
    const outsideRoot = mkdtempSync(join(tmpdir(), "prettier-outside-"));
    temporaryRoots.push(outsideRoot);
    const outside = join(outsideRoot, "outside.js");
    writeFileSync(outside, "outside\n");

    const result = runNodeHook(root, {
      cwd: root,
      tool_input: `*** Begin Patch
*** Update File: src/inside.js
*** Update File: src/inside.js
*** Update File: ${outside}
*** End Patch`,
    });

    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout.match(/src\/inside\.js/gu)).toHaveLength(1);
    expect(result.stdout).toContain(
      `${outside}; skipped; target missing, not a file, or outside cwd.`,
    );
  });

  it("launches from PLUGIN_ROOT without requiring Bash", () => {
    const result = spawnSync("/bin/sh", ["-c", configuredHookCommand()], {
      cwd: repositoryRoot,
      encoding: "utf8",
      env: {
        PATH: dirname(process.execPath),
        PLUGIN_ROOT: pluginRoot,
      },
      input: "",
    });

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
  });

  it("formats every apply_patch target without touching other files", () => {
    const root = createProject();
    const first = join(root, "src", "first.js");
    const second = join(root, "src", "second file.js");
    const untouched = join(root, "src", "untouched.js");
    for (const file of [first, second, untouched]) {
      writeFileSync(file, "original\n");
    }

    const result = runHook(root, {
      cwd: root,
      tool_input: `*** Begin Patch
*** Update File: src/first.js
*** Update File: src/second file.js
*** End Patch`,
    });

    expect(result.status, result.stderr).toBe(0);
    expect(readFileSync(first, "utf8")).toBe("formatted\n");
    expect(readFileSync(second, "utf8")).toBe("formatted\n");
    expect(readFileSync(untouched, "utf8")).toBe("original\n");
  });

  it("formats the file reported by an Edit or Write response", () => {
    const root = createProject();
    const target = join(root, "src", "response.js");
    writeFileSync(target, "original\n");

    const result = runHook(root, {
      cwd: root,
      tool_input: {},
      tool_response: { filePath: "src/response.js" },
    });

    expect(result.status, result.stderr).toBe(0);
    expect(readFileSync(target, "utf8")).toBe("formatted\n");
  });

  it("respects the target project's Prettier ignore policy", () => {
    const root = createProject();
    useRepositoryPrettier(root);
    const target = join(root, "src", "ignored.js");
    const unformatted = "const value={answer:42}\n";
    writeFileSync(join(root, ".prettierignore"), "src/ignored.js\n");
    writeFileSync(target, unformatted);

    const result = runHook(
      root,
      {
        cwd: root,
        tool_input: { file_path: "src/ignored.js" },
      },
      repositoryRoot,
    );

    expect(result.status, result.stderr).toBe(0);
    expect(readFileSync(target, "utf8")).toBe(unformatted);
  });

  it("falls back to a PATH-visible global Prettier", () => {
    const root = createProject();
    rmSync(join(root, "node_modules"), { recursive: true });
    const globalBin = join(root, "global-bin");
    writeFakePrettier(join(globalBin, "prettier"));
    const target = join(root, "src", "global.js");
    writeFileSync(target, "original\n");

    const result = runHook(
      root,
      {
        cwd: root,
        tool_input: { file_path: "src/global.js" },
      },
      root,
      { PATH: `${globalBin}:${dirname(process.execPath)}:/usr/bin:/bin` },
    );

    expect(result.status, result.stderr).toBe(0);
    expect(readFileSync(target, "utf8")).toBe("formatted\n");
  });
});
