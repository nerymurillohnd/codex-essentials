import { createRequire } from "node:module";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { describe, expect, it, vi } from "vitest";

const require = createRequire(import.meta.url);
const repositoryRoot = resolve(import.meta.dirname, "..");
const scriptsRoot = resolve(import.meta.dirname, "..", "scripts");

describe("repository script entrypoints", () => {
  it("exposes callable wrappers without executing them during import", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const error = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    try {
      for (const script of [
        "documentation-gate.cjs",
        "plugin-manifest-guard.cjs",
        "validate-github-labels.cjs",
      ]) {
        const entrypoint = require(resolve(scriptsRoot, script));
        expect(entrypoint.main).toBeTypeOf("function");
        expect(entrypoint.run).toBeTypeOf("function");
      }
    } finally {
      log.mockRestore();
      error.mockRestore();
    }
  });

  it("parses guard events and reports pipeline failures through its injected boundary", () => {
    const guard = require(resolve(scriptsRoot, "plugin-manifest-guard.cjs"));
    const writes: string[] = [];

    expect(guard.readEvent('{"tool_input":{"patch":"manifest"}}')).toEqual({
      tool_input: { patch: "manifest" },
    });
    expect(guard.readEvent("")).toEqual({});
    expect(guard.readEvent("{")).toEqual({});
    expect(
      guard.eventTouchesPluginManifest({ tool_input: { patch: "README" } }),
    ).toBe(false);
    expect(
      guard.eventTouchesPluginManifest({
        tool_input: {
          patch:
            "*** Update File: plugins/doc-keeper/.codex-plugin/plugin.json",
        },
      }),
    ).toBe(true);
    expect(
      guard.eventTouchesPluginManifest([
        "README",
        "plugins/doc-keeper/.codex-plugin/plugin.json",
      ]),
    ).toBe(true);
    expect(guard.eventTouchesPluginManifest(null)).toBe(false);

    expect(
      guard.run(
        {
          tool_input: { patch: "plugins/doc-keeper/.codex-plugin/plugin.json" },
        },
        repositoryRoot,
        { write: (message: string) => writes.push(message) },
        () => ({ status: 1, stdout: "validation failed", stderr: "" }),
      ),
    ).toBe(0);
    expect(JSON.parse(writes.join(""))).toMatchObject({
      continue: false,
      systemMessage: "validation failed",
    });
    expect(
      guard.main(
        {
          tool_input: { patch: "plugins/doc-keeper/.codex-plugin/plugin.json" },
        },
        repositoryRoot,
        () => ({ status: 1, stdout: "", stderr: "" }),
      ),
    ).toMatchObject({ systemMessage: "Plugin manifest pipeline failed." });
    expect(
      guard.main(
        {
          tool_input: { patch: "plugins/doc-keeper/.codex-plugin/plugin.json" },
        },
        repositoryRoot,
        () => ({ status: 0, stdout: "", stderr: "" }),
      ),
    ).toBeUndefined();
    expect(
      guard.run({ tool_input: { patch: "README" } }, repositoryRoot, {
        write: (message: string) => writes.push(message),
      }),
    ).toBe(0);
  });

  it("delegates the real guard pipeline invocation to its process boundary", () => {
    const guard = require(resolve(scriptsRoot, "plugin-manifest-guard.cjs"));
    const result = { status: 0, stderr: "", stdout: "" };
    const execute = vi.fn(() => result);

    expect(guard.runMarketplacePipeline(repositoryRoot, execute)).toBe(result);
    expect(execute).toHaveBeenCalledWith("npm", ["run", "marketplace:build"], {
      cwd: repositoryRoot,
      encoding: "utf8",
    });
  });

  it("serializes non-Error failures without losing their diagnostic", () => {
    const guard = require(resolve(scriptsRoot, "plugin-manifest-guard.cjs"));
    const writes: string[] = [];

    expect(
      guard.run(
        {
          tool_input: { patch: "plugins/doc-keeper/.codex-plugin/plugin.json" },
        },
        repositoryRoot,
        { write: (message: string) => writes.push(message) },
        () => {
          throw "pipeline unavailable";
        },
      ),
    ).toBe(1);
    expect(JSON.parse(writes.join(""))).toMatchObject({
      continue: false,
      systemMessage: "pipeline unavailable",
    });
  });

  it("reports wrapper success and failure without changing process state", () => {
    const documentationGate = require(
      resolve(scriptsRoot, "documentation-gate.cjs"),
    );
    const githubLabels = require(
      resolve(scriptsRoot, "validate-github-labels.cjs"),
    );
    const logs: string[] = [];
    const errors: string[] = [];
    const io = {
      error: (message: string) => errors.push(message),
      log: (message: string) => logs.push(message),
    };

    expect(documentationGate.run([], io)).toBe(1);
    expect(errors).toEqual(["usage: --base <base> --head <head>"]);
    expect(githubLabels.run(repositoryRoot, io)).toBe(0);
    expect(logs.at(-1)).toMatch(/^GitHub label contract passed:/u);
  });

  it("executes every wrapper through node", () => {
    const executions: ReadonlyArray<readonly [string, ...string[]]> = [
      ["plugin-manifest-guard.cjs"],
      ["validate-github-labels.cjs"],
      [
        "documentation-gate.cjs",
        "--root",
        repositoryRoot,
        "--base",
        "HEAD",
        "--head",
        "HEAD",
      ],
    ];

    for (const [script, ...args] of executions) {
      const result = spawnSync(
        process.execPath,
        [resolve(scriptsRoot, script), ...args],
        {
          encoding: "utf8",
          input: "",
        },
      );
      expect(result.status).toBe(0);
    }
  });

  it("preserves the documentation-gate binary failure protocol", () => {
    const result = spawnSync(
      process.execPath,
      [resolve(scriptsRoot, "documentation-gate.cjs")],
      { encoding: "utf8" },
    );

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("usage: --base <base> --head <head>");
  });

  it("reads the default guard event and honors its configured repository root", () => {
    const guardPath = resolve(scriptsRoot, "plugin-manifest-guard.cjs");
    const writes: string[] = [];
    const read = vi.spyOn(fs, "readFileSync").mockReturnValue("{}");
    const originalRoot = process.env["CODEX_ESSENTIALS_REPOSITORY_ROOT"];

    try {
      expect(
        require(guardPath).run(undefined, repositoryRoot, {
          write: (message: string) => writes.push(message),
        }),
      ).toBe(0);
      expect(writes).toEqual([]);

      expect(require(guardPath).resolveRepositoryRoot({})).toBe(
        resolve(scriptsRoot, ".."),
      );
      expect(
        require(guardPath).resolveRepositoryRoot({
          CODEX_ESSENTIALS_REPOSITORY_ROOT: repositoryRoot,
        }),
      ).toBe(repositoryRoot);
    } finally {
      read.mockRestore();
      process.env["CODEX_ESSENTIALS_REPOSITORY_ROOT"] = originalRoot;
    }
  });
});
