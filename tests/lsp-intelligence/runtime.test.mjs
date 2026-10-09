import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  activateBridge,
  rollbackBridge,
  verifyArtifact,
} from "../../plugins/lsp-intelligence/src/runtime.ts";

test("rejects a corrupt or oversized artifact before extraction", () => {
  const data = Buffer.from("binary");
  const hash = createHash("sha256").update(data).digest("hex");
  assert.doesNotThrow(() => verifyArtifact(data, hash));
  assert.throws(() => verifyArtifact(data, "0".repeat(64)), /checksum/);
  assert.throws(() => verifyArtifact(Buffer.alloc(51 * 1024 * 1024), hash), /size/);
});
test("atomic update keeps rollback and refuses unowned executable replacement", async () => {
  const root = await mkdtemp(join(tmpdir(), "runtime-update-"));
  try {
    await activateBridge(root, Buffer.from("old"), "0.7.0", false);
    await assert.rejects(activateBridge(root, Buffer.from("new"), "0.7.0", false), /already/);
    await activateBridge(root, Buffer.from("new"), "0.7.0", true);
    assert.equal(await readFile(join(root, "bin", "mcpls"), "utf8"), "new");
    await rollbackBridge(root);
    assert.equal(await readFile(join(root, "bin", "mcpls"), "utf8"), "old");
    await assert.rejects(rollbackBridge(root), /rollback/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
