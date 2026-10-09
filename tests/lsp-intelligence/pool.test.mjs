import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { BackendPool } from "../../plugins/lsp-intelligence/src/pool.ts";

test("reuses a backend by root/profile and separates simultaneous workspaces", async () => {
  const roots = await Promise.all([
    mkdtemp(join(tmpdir(), "pool-a-")),
    mkdtemp(join(tmpdir(), "pool-b-")),
  ]);
  const starts = [],
    closed = [];
  const pool = new BackendPool({
    factory: async (root, profile) => {
      starts.push([root, profile]);
      return {
        query: async () => ({
          content: [],
          structuredContent: { root, availability: "pending", diagnostics: [] },
        }),
        close: async () => closed.push(root),
      };
    },
  });
  try {
    const [a, b] = await Promise.all(
      roots.map((root) => pool.query(root, "typescript", "get_diagnostics", {})),
    );
    assert.notEqual(a.structuredContent.root, b.structuredContent.root);
    await Promise.all([
      pool.query(roots[0], "typescript", "get_hover", {}),
      pool.query(roots[0], "typescript", "get_hover", {}),
    ]);
    assert.equal(starts.length, 2);
    assert.equal(a.structuredContent.availability, "pending");
  } finally {
    await pool.close();
    for (const root of roots) await rm(root, { recursive: true, force: true });
  }
  assert.equal(closed.length, 2);
});
test("deduplicates concurrent starts and retries a failed initialization", async () => {
  let starts = 0;
  const pool = new BackendPool({
    factory: async () => {
      starts++;
      await new Promise((r) => setTimeout(r, 10));
      if (starts === 1) throw new Error("missing");
      return { query: async () => ({ content: [] }), close: async () => {} };
    },
  });
  await assert.rejects(pool.query("/one", "python", "get_hover", {}), /missing/);
  await Promise.all([
    pool.query("/one", "python", "get_hover", {}),
    pool.query("/one", "python", "get_hover", {}),
  ]);
  assert.equal(starts, 2);
  await pool.close();
});
test("does not evict active calls at its limit, and closes idle connections", async () => {
  let release;
  const pending = new Promise((r) => {
    release = r;
  });
  const closed = [];
  const pool = new BackendPool({
    max: 1,
    idleMs: 15,
    factory: async (root) => ({
      query: async () => {
        if (root === "/busy") await pending;
        return { content: [] };
      },
      close: async () => closed.push(root),
    }),
  });
  const busy = pool.query("/busy", "python", "get_hover", {});
  await new Promise((r) => setTimeout(r, 5));
  await assert.rejects(pool.query("/second", "python", "get_hover", {}), /busy/);
  release();
  await busy;
  await new Promise((r) => setTimeout(r, 40));
  assert.deepEqual(closed, ["/busy"]);
  await pool.close();
});
