import childProcess from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { mkdtempSync, rmSync } from "node:fs";
import { describe, expect, it } from "vitest";

interface SpawnResult {
  status: number | null;
  stderr: string;
  stdout: string;
}

function createFixture(): string {
  const fixture = mkdtempSync(path.join(os.tmpdir(), "codex-prettier-hook-"));
  fs.mkdirSync(path.join(fixture, "project"), { recursive: true });
  fs.mkdirSync(path.join(fixture, ".bin"), { recursive: true });
  return fixture;
}

function createFixtureFile(
  root: string,
  relativePath: string,
  content: string,
): string {
  const fullPath = path.join(root, relativePath);
  const directory = path.dirname(fullPath);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(fullPath, content, "utf8");
  return fullPath;
}

function createExecutable(filePath: string, content: string): void {
  fs.writeFileSync(filePath, `${content}\n`, { mode: 0o755 });
}

function createJqStub(fixture: string): string {
  let systemJq = "";
  try {
    systemJq = childProcess
      .execSync("command -v jq", {
        encoding: "utf8",
        shell: "/bin/bash",
      })
      .trim();
  } catch {
    systemJq = "/usr/bin/jq";
  }
  if (!systemJq) {
    systemJq = "/usr/bin/jq";
  }
  const stub = path.join(fixture, ".bin", "jq");
  createExecutable(
    stub,
    `#!/usr/bin/env bash
exec "${systemJq}" "$@"`,
  );
  return stub;
}

function runHook(
  hookPath: string,
  input: Record<string, unknown>,
  cwd: string,
  pathOverride: string,
): SpawnResult {
  const result = childProcess.spawnSync("/bin/bash", [hookPath], {
    cwd,
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: pathOverride,
    },
    input: `${JSON.stringify(input)}\n`,
  });

  return {
    status: result.status,
    stderr: result.stderr ? String(result.stderr) : "",
    stdout: result.stdout ? String(result.stdout) : "",
  };
}

function runHookRawInput(
  hookPath: string,
  rawInput: string,
  cwd: string,
  pathOverride: string,
): SpawnResult {
  const result = childProcess.spawnSync("/bin/bash", [hookPath], {
    cwd,
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: pathOverride,
    },
    input: `${rawInput}\n`,
  });

  return {
    status: result.status,
    stderr: result.stderr ? String(result.stderr) : "",
    stdout: result.stdout ? String(result.stdout) : "",
  };
}

function prettierArgsText(fixture: string): string {
  return path.join(fixture, "prettier-args.txt");
}

function usedPrettierText(fixture: string): string {
  return path.join(fixture, "used-prettier.txt");
}

describe("prettier-after-edit hook", () => {
  it("formats with the closest local prettier binary", () => {
    const fixture = createFixture();
    const workspace = path.join(fixture, "project");
    const jqStubPath = createJqStub(fixture);
    createFixtureFile(
      workspace,
      "src/index.js",
      "function demo( ) {return 1}\n",
    );

    const localPrettier = path.join(
      workspace,
      "node_modules",
      ".bin",
      "prettier",
    );
    fs.mkdirSync(path.dirname(localPrettier), { recursive: true });
    createExecutable(
      localPrettier,
      `#!/usr/bin/env bash
echo local > '${usedPrettierText(fixture)}'
echo "$@" > '${prettierArgsText(fixture)}'`,
    );

    const globalPrettier = path.join(fixture, ".bin", "prettier");
    createExecutable(
      globalPrettier,
      `#!/usr/bin/env bash
echo global > '${usedPrettierText(fixture)}'
echo "$@" > '${prettierArgsText(fixture)}'`,
    );

    const hookPath = path.join(
      path.resolve("."),
      "plugins/prettier-after-edit/hooks/prettier-format.sh",
    );
    const result = runHook(
      hookPath,
      {
        cwd: workspace,
        tool_input: {
          file_path: "src/index.js",
        },
      },
      fixture,
      `${path.join(fixture, ".bin")}:${path.dirname(jqStubPath)}:/bin`,
    );

    try {
      expect(result.status).toBe(0);
      expect(fs.readFileSync(usedPrettierText(fixture), "utf8")).toBe(
        "local\n",
      );
      expect(result.stdout).toContain(
        "prettier-after-edit: formatted src/index.js.",
      );
      expect(fs.readFileSync(prettierArgsText(fixture), "utf8")).toContain(
        "--write --ignore-unknown -- ",
      );
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  });

  it("falls back to global prettier when local prettier does not exist", () => {
    const fixture = createFixture();
    const workspace = path.join(fixture, "project");
    const jqStubPath = createJqStub(fixture);
    createFixtureFile(
      workspace,
      "src/index.js",
      "function demo( ) {return 1}\n",
    );

    const globalPrettier = path.join(fixture, ".bin", "prettier");
    createExecutable(
      globalPrettier,
      `#!/usr/bin/env bash
echo global > '${usedPrettierText(fixture)}'
echo "$@" > '${prettierArgsText(fixture)}'`,
    );

    const hookPath = path.join(
      path.resolve("."),
      "plugins/prettier-after-edit/hooks/prettier-format.sh",
    );
    const result = runHook(
      hookPath,
      {
        cwd: workspace,
        tool_input: {
          file: "src/index.js",
        },
      },
      fixture,
      `${path.join(fixture, ".bin")}:${path.dirname(jqStubPath)}:/bin`,
    );

    try {
      expect(result.status).toBe(0);
      expect(fs.readFileSync(usedPrettierText(fixture), "utf8")).toBe(
        "global\n",
      );
      expect(result.stdout).toContain(
        "prettier-after-edit: formatted src/index.js.",
      );
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  });

  it("skips when no prettier binary is available", () => {
    const fixture = createFixture();
    const workspace = path.join(fixture, "project");
    const jqStubPath = createJqStub(fixture);
    createFixtureFile(
      workspace,
      "src/index.js",
      "function demo( ) {return 1}\n",
    );

    const hookPath = path.join(
      path.resolve("."),
      "plugins/prettier-after-edit/hooks/prettier-format.sh",
    );
    const result = runHook(
      hookPath,
      {
        cwd: workspace,
        tool_input: {
          file_path: "src/index.js",
        },
      },
      fixture,
      `${path.join(fixture, ".bin")}:${path.dirname(jqStubPath)}:/bin`,
    );

    try {
      expect(result.status).toBe(0);
      expect(result.stdout).toContain(
        "prettier-after-edit: skipped; prettier not found.",
      );
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  });

  it("skips when jq is not available", () => {
    const fixture = createFixture();
    const workspace = path.join(fixture, "project");
    const noJqBin = path.join(fixture, "no-jq-bin");
    fs.mkdirSync(noJqBin, { recursive: true });
    const hostCat = childProcess
      .execSync("command -v cat", {
        encoding: "utf8",
        shell: "/bin/bash",
      })
      .trim();
    fs.symlinkSync(hostCat, path.join(noJqBin, "cat"));
    createFixtureFile(
      workspace,
      "src/index.js",
      "function demo( ) {return 1}\n",
    );

    const hookPath = path.join(
      path.resolve("."),
      "plugins/prettier-after-edit/hooks/prettier-format.sh",
    );
    const result = runHook(
      hookPath,
      {
        cwd: workspace,
        tool_input: {
          file_path: "src/index.js",
        },
      },
      fixture,
      noJqBin,
    );

    try {
      expect(result.status).toBe(0);
      expect(result.stdout).toContain(
        "prettier-after-edit: skipped; jq not found.",
      );
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  });

  it("skips when no target file can be resolved from payload", () => {
    const fixture = createFixture();
    const workspace = path.join(fixture, "project");
    const jqStubPath = createJqStub(fixture);
    const hookPath = path.join(
      path.resolve("."),
      "plugins/prettier-after-edit/hooks/prettier-format.sh",
    );
    const result = runHook(
      hookPath,
      {
        cwd: workspace,
        tool_input: {
          command: "echo 'patch without file directives'",
        },
      },
      fixture,
      `${path.join(fixture, ".bin")}:${path.dirname(jqStubPath)}:/bin`,
    );

    try {
      expect(result.status).toBe(0);
      expect(result.stdout).toContain(
        "prettier-after-edit: skipped; no target file in hook payload.",
      );
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  });

  it("skips with parse error when payload is not valid JSON", () => {
    const fixture = createFixture();
    const workspace = path.join(fixture, "project");
    const jqStubPath = createJqStub(fixture);
    const hookPath = path.join(
      path.resolve("."),
      "plugins/prettier-after-edit/hooks/prettier-format.sh",
    );
    const result = runHookRawInput(
      hookPath,
      "{ invalid json",
      workspace,
      `${path.join(fixture, ".bin")}:${path.dirname(jqStubPath)}:/bin`,
    );

    try {
      expect(result.status).toBe(0);
      expect(result.stdout).toContain(
        "prettier-after-edit: skipped; unable to parse hook payload.",
      );
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  });

  it("extracts the first Add/Update entry from apply_patch payload", () => {
    const fixture = createFixture();
    const workspace = path.join(fixture, "project");
    const jqStubPath = createJqStub(fixture);
    createFixtureFile(workspace, "first.js", "function demo( ) {return 1}\n");
    createFixtureFile(workspace, "second.js", "function demo( ) {return 1}\n");
    const localPrettier = path.join(
      workspace,
      "node_modules",
      ".bin",
      "prettier",
    );
    fs.mkdirSync(path.dirname(localPrettier), { recursive: true });
    createExecutable(
      localPrettier,
      `#!/usr/bin/env bash
echo first > '${usedPrettierText(fixture)}'`,
    );

    const patchPayload = [
      "*** Begin Patch",
      "*** Add File: second.js",
      "+++",
      "*** Update File: first.js",
      "---",
    ].join("\n");

    const hookPath = path.join(
      path.resolve("."),
      "plugins/prettier-after-edit/hooks/prettier-format.sh",
    );
    const result = runHook(
      hookPath,
      {
        cwd: workspace,
        tool_input: {
          command: patchPayload,
        },
      },
      fixture,
      `${path.join(fixture, ".bin")}:${path.dirname(jqStubPath)}:/bin`,
    );

    try {
      expect(result.status).toBe(0);
      expect(fs.readFileSync(usedPrettierText(fixture), "utf8")).toBe(
        "first\n",
      );
      expect(result.stdout).toContain(
        "prettier-after-edit: formatted second.js.",
      );
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  });
});
