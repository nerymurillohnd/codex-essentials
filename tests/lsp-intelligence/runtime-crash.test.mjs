import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { activateBridge, rollbackBridge } from "../../plugins/lsp-intelligence/src/runtime.ts";

test("recovers an interrupted transaction before the next mutation", async () => {
  const root = await mkdtemp(join(tmpdir(), "runtime-interrupted-"));
  try {
    await activateBridge(root, Buffer.from("old"), "0.6.0", false);
    const module = new URL("../../plugins/lsp-intelligence/src/runtime.ts", import.meta.url).href;
    const code =
      "import {activateBridge} from " +
      JSON.stringify(module) +
      "; await activateBridge(" +
      JSON.stringify(root) +
      ',Buffer.from("new"),"0.7.0",true,{beforeStateCommit:async()=>{process.exit(17)}});';
    const child = spawnSync(process.execPath, ["--input-type=module", "-e", code]);
    assert.equal(child.status, 17);
    assert.equal(await readFile(join(root, "bin", "mcpls"), "utf8"), "new");
    await activateBridge(root, Buffer.from("old"), "0.6.0", false);
    assert.equal(await readFile(join(root, "bin", "mcpls"), "utf8"), "old");
    assert.equal(
      JSON.parse(await readFile(join(root, "bridge-state.json"), "utf8")).version,
      "0.6.0",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test("restores the actual preceding version and never overwrites an unowned binary", async () => {
  const root = await mkdtemp(join(tmpdir(), "runtime-version-"));
  try {
    await mkdir(join(root, "bin"));
    await writeFile(join(root, "bin", "mcpls"), "foreign");
    await assert.rejects(activateBridge(root, Buffer.from("new"), "0.7.0", true), /unowned/);
    assert.equal(await readFile(join(root, "bin", "mcpls"), "utf8"), "foreign");
    await rm(join(root, "bin", "mcpls"));
    await activateBridge(root, Buffer.from("old"), "0.6.0", false);
    await activateBridge(root, Buffer.from("new"), "0.7.0", true);
    await rollbackBridge(root);
    assert.equal(
      JSON.parse(await readFile(join(root, "bridge-state.json"), "utf8")).version,
      "0.6.0",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
