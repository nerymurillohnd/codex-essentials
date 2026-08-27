import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";

const require = createRequire(import.meta.url);
const sync = require("./sync.cjs") as {
  expectedArtifacts(root: string, source: unknown): Array<{ target: string }>;
  marketplacePath(root: string): string;
  sameContent(target: string, content: string): boolean;
  main(): void;
  syncAll(root: string, options?: { write?: boolean }): string[];
};
const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);
const fixtures: string[] = [];

afterEach(() => {
  process.exitCode = undefined;
  for (const fixture of fixtures.splice(0)) {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});

function createFixture(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "codex-sync-cli-test-"));
  fixtures.push(root);
  fs.mkdirSync(path.join(root, "lib", "schemas"), { recursive: true });
  fs.copyFileSync(
    path.join(repositoryRoot, "lib", "source.json"),
    path.join(root, "lib", "source.json"),
  );
  fs.copyFileSync(
    path.join(repositoryRoot, "lib", "schemas", "source.schema.json"),
    path.join(root, "lib", "schemas", "source.schema.json"),
  );
  return root;
}

describe("synchronization command", () => {
  it("writes all derived metadata and reports no drift afterward", () => {
    const root = createFixture();

    expect(sync.syncAll(root, { write: true })).toEqual([]);
    expect(
      fs.existsSync(
        path.join(
          root,
          "plugins",
          "astro-cli-commands",
          ".codex-plugin",
          "plugin.json",
        ),
      ),
    ).toBe(true);
    expect(
      fs.existsSync(path.join(root, ".agents", "plugins", "marketplace.json")),
    ).toBe(true);
    expect(sync.syncAll(root)).toEqual([]);
  });

  it("reports generated metadata drift without writing", () => {
    const root = createFixture();
    sync.syncAll(root, { write: true });
    const manifest = path.join(
      root,
      "plugins",
      "astro-cli-commands",
      ".codex-plugin",
      "plugin.json",
    );
    fs.writeFileSync(manifest, "{}\n", "utf8");

    expect(sync.syncAll(root)).toContain(
      "plugins/astro-cli-commands/.codex-plugin/plugin.json has drifted from lib/source.json",
    );
    expect(fs.readFileSync(manifest, "utf8")).toBe("{}\n");
  });

  it("runs write, drift, and argument-error CLI paths", () => {
    const root = createFixture();
    const argv = process.argv;
    const error = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    process.argv = [process.execPath, "sync.cjs", "--write", "--root", root];
    sync.main();
    expect(sync.syncAll(root)).toEqual([]);
    fs.writeFileSync(
      path.join(root, ".agents", "plugins", "marketplace.json"),
      "{}\n",
      "utf8",
    );
    process.argv = [process.execPath, "sync.cjs", "--root", root];
    sync.main();
    expect(process.exitCode).toBe(1);
    expect(error).toHaveBeenCalled();
    process.argv = [process.execPath, "sync.cjs", "--root"];
    expect(() => sync.main()).toThrow("--root requires a path");
    process.argv = [process.execPath, "sync.cjs", "unknown"];
    expect(() => sync.main()).toThrow("unknown argument: unknown");
    process.argv = argv;
  });

  it("exposes deterministic artifact helpers and absent-file comparisons", () => {
    const root = createFixture();
    expect(sync.sameContent(path.join(root, "missing"), "content")).toBe(false);
    expect(sync.marketplacePath(root)).toBe(
      path.join(root, ".agents", "plugins", "marketplace.json"),
    );
    expect(
      sync.expectedArtifacts(root, {
        marketplace: { name: "x", displayName: "X" },
        plugins: [],
      }),
    ).toHaveLength(1);
  });

  it("uses the repository default root when no CLI option is supplied", () => {
    const argv = process.argv;
    process.argv = [process.execPath, "sync.cjs"];
    sync.main();
    expect(process.exitCode).toBeUndefined();
    process.argv = argv;
  });
});
