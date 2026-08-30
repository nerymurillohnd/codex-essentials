import {
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

const repositoryRoot = resolve(import.meta.dirname, "..");
const require = createRequire(import.meta.url);
const validator = require("./validate-direct-push.cjs") as {
  main(): void;
  parseArguments(
    args: string[],
    defaultRoot: string,
  ): {
    root: string;
    remote: string;
    local: string;
  };
  readChangedPaths(root: string, remote: string, local: string): string[];
  validateDirectPush(
    root: string,
    remote: string,
    local: string,
  ): {
    paths: string[];
    allowed: boolean;
    disallowedPaths: string[];
  };
};

const fixtures: string[] = [];

function git(root: string, args: string[]): string {
  const result = spawnSync("git", ["-C", root, ...args], {
    encoding: "utf8",
  });
  expect(result.status, result.stderr).toBe(0);
  return result.stdout.trim();
}

function createFixture(): string {
  const root = realpathSync(
    mkdtempSync(join(tmpdir(), "codex-essentials-direct-push-")),
  );
  fixtures.push(root);
  git(root, ["init"]);
  git(root, ["config", "user.email", "test@example.com"]);
  git(root, ["config", "user.name", "Direct Push Test"]);
  mkdirSync(join(root, "docs"));
  mkdirSync(join(root, "plugins"));
  writeFileSync(join(root, "README.md"), "fixture\n");
  git(root, ["add", "README.md"]);
  git(root, ["commit", "-m", "fixture"]);
  return root;
}

function invokeMain(root: string, remote: string, local: string): void {
  const originalArgv = process.argv;
  process.argv = [
    process.execPath,
    join(repositoryRoot, "scripts", "validate-direct-push.cjs"),
    "--root",
    root,
    "--remote",
    remote,
    "--local",
    local,
  ];
  try {
    validator.main();
  } finally {
    process.argv = originalArgv;
  }
}

afterEach(() => {
  for (const root of fixtures.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("validate-direct-push script", () => {
  it("rejects a pushed SHA that is not the checked-out HEAD", () => {
    const root = createFixture();
    const base = git(root, ["rev-parse", "HEAD"]);
    writeFileSync(join(root, "docs", "guide.md"), "guide\n");
    git(root, ["add", "docs/guide.md"]);
    git(root, ["commit", "-m", "docs: add guide"]);
    const pushedSha = git(root, ["rev-parse", "HEAD"]);
    git(root, ["checkout", "--detach", base]);

    expect(() => invokeMain(root, base, pushedSha)).toThrow(
      /must match checked-out HEAD/u,
    );
  });

  it("rejects a pushed SHA when the checkout has uncommitted changes", () => {
    const root = createFixture();
    const head = git(root, ["rev-parse", "HEAD"]);
    writeFileSync(join(root, "README.md"), "uncommitted\n");

    expect(() => invokeMain(root, head, head)).toThrow(
      /worktree must be clean/u,
    );
  });

  it("rejects a direct push when a forbidden intermediate commit was reverted", () => {
    const root = createFixture();
    const base = git(root, ["rev-parse", "HEAD"]);
    writeFileSync(join(root, "plugins", "forbidden.txt"), "forbidden\n");
    git(root, ["add", "plugins/forbidden.txt"]);
    git(root, ["commit", "-m", "feat: add forbidden product file"]);
    rmSync(join(root, "plugins", "forbidden.txt"));
    git(root, ["add", "-A"]);
    git(root, ["commit", "-m", "revert: remove forbidden product file"]);
    const head = git(root, ["rev-parse", "HEAD"]);

    const result = validator.validateDirectPush(root, base, head);

    expect(result.allowed).toBe(false);
    expect(result.disallowedPaths).toContain("plugins/forbidden.txt");
  });

  it("rejects a non-descendant local update before classifying paths", () => {
    const root = createFixture();
    const base = git(root, ["rev-parse", "HEAD"]);
    writeFileSync(join(root, "docs", "remote.md"), "remote\n");
    git(root, ["add", "docs/remote.md"]);
    git(root, ["commit", "-m", "docs: remote line"]);
    const remote = git(root, ["rev-parse", "HEAD"]);
    git(root, ["checkout", "--detach", base]);
    mkdirSync(join(root, "docs"));
    writeFileSync(join(root, "docs", "local.md"), "local\n");
    git(root, ["add", "docs/local.md"]);
    git(root, ["commit", "-m", "docs: local line"]);
    const local = git(root, ["rev-parse", "HEAD"]);

    expect(() => validator.validateDirectPush(root, remote, local)).toThrow(
      /not a descendant/u,
    );
  });

  it("enumerates paths from every commit in an allowed linear update", () => {
    const root = createFixture();
    const base = git(root, ["rev-parse", "HEAD"]);
    writeFileSync(join(root, "docs", "guide.md"), "guide\n");
    git(root, ["add", "docs/guide.md"]);
    git(root, ["commit", "-m", "docs: add guide"]);
    const head = git(root, ["rev-parse", "HEAD"]);

    expect(validator.validateDirectPush(root, base, head)).toEqual({
      paths: ["docs/guide.md"],
      allowed: true,
      disallowedPaths: [],
    });
  });

  it("returns no paths for an unchanged descendant update", () => {
    const root = createFixture();
    const head = git(root, ["rev-parse", "HEAD"]);

    expect(validator.readChangedPaths(root, head, head)).toEqual([]);
  });

  it("rejects a missing remote base", () => {
    const root = createFixture();
    const head = git(root, ["rev-parse", "HEAD"]);

    expect(() =>
      validator.readChangedPaths(root, "0".repeat(40), head),
    ).toThrow(/without an existing remote base/u);
  });

  it("parses valid arguments and rejects malformed arguments", () => {
    expect(
      validator.parseArguments(
        ["--remote", "remote", "--local", "local"],
        "/tmp",
      ),
    ).toEqual({ root: "/tmp", remote: "remote", local: "local" });
    expect(() => validator.parseArguments(["--remote"], "/tmp")).toThrow(
      /usage:/u,
    );
    expect(() =>
      validator.parseArguments(["--unknown", "value"], "/tmp"),
    ).toThrow(/usage:/u);
  });
});
