import assert from "node:assert/strict";
import { mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  renderConfig,
  selectProfile,
  validateRequest,
} from "../../plugins/lsp-intelligence/src/profiles.ts";

test("selects the declared profiles and refuses zsh and unknown files", () => {
  for (const [file, profile] of [
    ["a.ts", "typescript"],
    ["a.jsx", "typescript"],
    ["a.svelte", "svelte"],
    ["a.astro", "astro"],
    ["a.py", "python"],
    ["a.sh", "bash"],
  ])
    assert.equal(selectProfile(file), profile);
  assert.throws(() => selectProfile("a.zsh"), /Unsupported/);
  assert.throws(() => selectProfile(".env"), /secret/i);
});
test("canonicalizes workspace paths and rejects missing and escaped source files", async () => {
  const root = await mkdtemp(join(tmpdir(), "lsp-scope-"));
  const outside = await mkdtemp(join(tmpdir(), "lsp-outside-"));
  try {
    await writeFile(join(root, "main.ts"), "export const x=1;\n");
    await writeFile(join(outside, "external.ts"), "");
    await symlink(join(outside, "external.ts"), join(root, "escaped.ts"));
    const valid = await validateRequest({
      workspace_root: root,
      file_path: join(root, "main.ts"),
      line: 1,
      character: 1,
    });
    assert.equal(valid.profile, "typescript");
    await assert.rejects(
      validateRequest({ workspace_root: root, file_path: join(root, "escaped.ts") }),
      /outside/,
    );
    await assert.rejects(
      validateRequest({ workspace_root: root, file_path: join(root, "missing.ts") }),
      /ENOENT/,
    );
    await assert.rejects(
      validateRequest({
        workspace_root: root,
        file_path: join(root, "main.ts"),
        line: 0,
        character: 1,
      }),
      /positive/,
    );
    await assert.rejects(
      validateRequest({
        workspace_root: root,
        file_path: join(root, "main.ts"),
        line: 99,
        character: 1,
      }),
      /outside/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(outside, { recursive: true, force: true });
  }
});
test("renders explicit roots and distinct Python routing without environment secrets", () => {
  const config = renderConfig("/workspace with spaces", "python", {
    "basedpyright-langserver": "/bin/basedpyright-langserver",
    ruff: "/bin/ruff",
  });
  assert.match(config, /roots = \["\/workspace with spaces"\]/);
  assert.match(config, /name = "python-ruff"/);
  assert.match(config, /handles = \["code_actions", "format_document", "format_range"\]/);
  assert.doesNotMatch(config, /TOKEN|PASSWORD|SECRET/);
});
test("Astro requires and receives an explicit JavaScript TypeScript SDK", () => {
  assert.throws(
    () => renderConfig("/workspace", "astro", { "astro-ls": "/bin/astro-ls" }),
    /TypeScript SDK/,
  );
  const config = renderConfig("/workspace", "astro", {
    "astro-ls": "/bin/astro-ls",
    "typescript-sdk": "/runtime/typescript/lib",
  });
  assert.match(config, /tsdk = "\/runtime\/typescript\/lib"/);
});

test("rejects surrogate splits, reversed ranges and nested secret or remote targets", async () => {
  const root = await mkdtemp(join(tmpdir(), "lsp-negative-"));
  const file = join(root, "x.ts");
  await writeFile(file, 'const marker="😀";\n');
  try {
    const args = { workspace_root: root, file_path: file };
    await assert.rejects(validateRequest({ ...args, line: 1, character: 16 }), /surrogate/);
    await assert.rejects(
      validateRequest({
        ...args,
        start_line: 1,
        start_character: 5,
        end_line: 1,
        end_character: 1,
      }),
      /precedes/,
    );
    await assert.rejects(
      validateRequest({
        workspace_root: root,
        profile: "typescript",
        item: { uri: `file://${root}/.env` },
      }),
      /Secret/,
    );
    await assert.rejects(
      validateRequest({
        workspace_root: root,
        profile: "typescript",
        item: { uri: "https://example.com/x.ts" },
      }),
      /local file/,
    );
    await assert.rejects(validateRequest({ ...args, profile: "python" }), /does not match/);
    await assert.rejects(
      validateRequest({ workspace_root: root, query: "x" }),
      /profile is required/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
