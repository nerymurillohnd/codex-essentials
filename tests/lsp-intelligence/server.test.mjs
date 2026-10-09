import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { Client } from "@modelcontextprotocol/client";
import { InMemoryTransport } from "@modelcontextprotocol/server";
import { BackendPool } from "../../plugins/lsp-intelligence/src/pool.ts";
import { createServer } from "../../plugins/lsp-intelligence/src/server.ts";
import { createValidator } from "../../plugins/lsp-intelligence/src/validation.ts";

test("advertises all upstream tools before runtime installation and validates unknown parameters", async () => {
  const pool = new BackendPool({
    factory: async () => {
      throw new Error("Missing executable: mcpls");
    },
  });
  const server = createServer({ pool, runtimeRoot: "/missing" });
  const client = new Client(
    { name: "codex", version: "0.162.0" },
    { jsonSchemaValidator: createValidator() },
  );
  const [a, b] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(a), client.connect(b)]);
  try {
    const list = await client.listTools();
    assert.equal(list.tools.length, 32);
    const status = await client.callTool({ name: "lsp_status", arguments: {} });
    assert.equal(status.isError ?? false, false);
    const failed = await client.callTool({
      name: "lsp_get_hover",
      arguments: { workspace_root: "/tmp", profile: "python", made_up: 1 },
    });
    assert.equal(failed.isError, true);
    const root = await mkdtemp(join(tmpdir(), "lsp-unavailable-"));
    try {
      await writeFile(join(root, "x.ts"), "export const x=1;\n");
      const unavailable = await client.callTool({
        name: "lsp_get_diagnostics",
        arguments: { workspace_root: root, file_path: join(root, "x.ts") },
      });
      assert.equal(unavailable.isError, true);
      assert.match(unavailable.content[0].text, /Missing executable: mcpls/);
      assert.equal(unavailable.structuredContent, undefined);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  } finally {
    await client.close();
    await server.close();
    await pool.close();
  }
});
test("preserves pending diagnostics and routes by explicit workspace instead of server cwd", async () => {
  const root = await mkdtemp(join(tmpdir(), "mcp-workspace-"));
  await writeFile(join(root, "x.ts"), "export const x=1;\n");
  const calls = [];
  const pool = new BackendPool({
    factory: async (r, p) => ({
      query: async (name, args) => {
        calls.push({ r, p, name, args });
        const data = {
          availability: "pending",
          diagnostics: [],
          origin: "push_cache",
          indexing_in_progress: false,
          push_notifications_degraded: false,
        };
        return { content: [{ type: "text", text: JSON.stringify(data) }], structuredContent: data };
      },
      close: async () => {},
    }),
  });
  const server = createServer({ pool, runtimeRoot: "/missing" });
  const client = new Client(
    { name: "codex", version: "0.162.0" },
    { jsonSchemaValidator: createValidator() },
  );
  const [a, b] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(a), client.connect(b)]);
  try {
    await client.listTools();
    const response = await client.callTool({
      name: "lsp_get_diagnostics",
      arguments: { workspace_root: root, file_path: join(root, "x.ts") },
    });
    assert.equal(response.structuredContent.availability, "pending");
    assert.equal(calls[0].p, "typescript");
    assert.equal(calls[0].name, "get_diagnostics");
    assert.equal(calls[0].args.workspace_root, undefined);
    assert.equal(calls[0].args.profile, undefined);
    const invalid = await client.callTool({
      name: "lsp_get_definition",
      arguments: { workspace_root: root, file_path: join(root, "x.ts"), line: 999, character: 1 },
    });
    assert.equal(invalid.isError, true);
    assert.equal(calls.length, 1);
  } finally {
    await client.close();
    await server.close();
    await pool.close();
    await rm(root, { recursive: true, force: true });
  }
});
