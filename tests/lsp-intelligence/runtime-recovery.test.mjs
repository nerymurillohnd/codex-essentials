import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { activateBridge, rollbackBridge } from "../../plugins/lsp-intelligence/src/runtime.ts";

test("metadata failure restores the old binary and managed state", async () => {
  const root = await mkdtemp(join(tmpdir(), "runtime-fault-"));
  try {
    await activateBridge(root, Buffer.from("old"), "0.6.0", false);
    const state = await readFile(join(root, "bridge-state.json"), "utf8");
    await assert.rejects(
      activateBridge(root, Buffer.from("new"), "0.7.0", true, {
        beforeStateCommit: async () => {
          throw new Error("disk failure");
        },
      }),
      /disk failure/,
    );
    assert.equal(await readFile(join(root, "bin", "mcpls"), "utf8"), "old");
    assert.equal(await readFile(join(root, "bridge-state.json"), "utf8"), state);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test("rollback refuses externally changed active and backup executables", async () => {
  for (const name of ["mcpls", "mcpls.previous"]) {
    const root = await mkdtemp(join(tmpdir(), "runtime-owner-"));
    try {
      await activateBridge(root, Buffer.from("old"), "0.6.0", false);
      await activateBridge(root, Buffer.from("new"), "0.7.0", true);
      await writeFile(join(root, "bin", name), "foreign");
      await assert.rejects(rollbackBridge(root), /identity|modified/);
      assert.equal(await readFile(join(root, "bin", name), "utf8"), "foreign");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }
});
test("concurrent first installs never replace each other", async () => {
  const root = await mkdtemp(join(tmpdir(), "runtime-concurrent-"));
  try {
    const results = await Promise.allSettled([
      activateBridge(root, Buffer.from("first"), "0.7.0", false),
      activateBridge(root, Buffer.from("second"), "0.7.0", false),
    ]);
    assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
    const state = JSON.parse(await readFile(join(root, "bridge-state.json"), "utf8"));
    assert.equal(
      state.sha256,
      createHash("sha256")
        .update(await readFile(join(root, "bin", "mcpls")))
        .digest("hex"),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
