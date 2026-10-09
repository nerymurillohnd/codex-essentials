import assert from "node:assert/strict";
import { mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { createValidator } from "../../../plugins/lsp-intelligence/src/validation.ts";

const runtime = resolve(process.env.LSP_TEST_RUNTIME ?? ".lsp-test-runtime/managed");
const bundle = resolve(
  process.env.LSP_TEST_BUNDLE ?? "plugins/lsp-intelligence/scripts/server.mjs",
);
async function connect(root) {
  const client = new Client(
    { name: "codex-acceptance", version: "0.162.0" },
    { jsonSchemaValidator: createValidator() },
  );
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [bundle, "--runtime-root", runtime, "--data-root", join(root, "data")],
    cwd: root,
    stderr: "pipe",
  });
  let stderr = "";
  transport.stderr.on("data", (d) => {
    stderr += d.toString();
  });
  await client.connect(transport);
  assert.equal((await client.listTools()).tools.length, 32);
  return {
    client,
    close: async () => {
      await client.close();
      assert.doesNotMatch(stderr, /unknown format|Unhandled|uncaught/i);
      const files = await readdir(join(root, "data"), { recursive: true });
      assert.ok(
        !files.some((file) => file.endsWith("mcpls.toml")),
        "Closed backends must remove their project-path configuration",
      );
    },
  };
}
function data(response) {
  if (response.structuredContent !== undefined) return response.structuredContent;
  const block = response.content.find((b) => b.type === "text");
  return JSON.parse(block.text);
}
async function until(client, name, args, accept) {
  const deadline = Date.now() + 45_000;
  let response;
  do {
    response = await client.callTool({ name, arguments: args }, { timeout: 160_000 });
    if (!response.isError && accept(data(response))) return data(response);
    await new Promise((r) => setTimeout(r, 250));
  } while (Date.now() < deadline);
  throw new Error(`No reliable result: ${JSON.stringify(response)}`);
}
test("real TypeScript stdio, aliases, UTF-16, import actions, edits and two workspaces", {
  timeout: 120_000,
}, async () => {
  const base = await mkdtemp(join(tmpdir(), "lsp-real-ts-"));
  const root = join(base, "project with spaces");
  await mkdir(root);
  const main = join(root, "main.ts");
  await writeFile(join(root, "package.json"), '{"private":true}');
  await writeFile(
    join(root, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: { strict: true, target: "ES2022", module: "CommonJS", allowJs: true },
      include: ["*.ts", "*.js"],
    }),
  );
  await writeFile(
    join(root, "math.ts"),
    "export function add(a:number,b:number):number {return a+b;}\nexport const unused=42;\n",
  );
  const initial =
    'import { unused, add } from "./math";\nconst marker="😀"; export const total=add(1,2);\nexport const broken:number="wrong";\nconsole.log(total,marker,unused);\n';
  await writeFile(main, initial);
  const { client, close } = await connect(base);
  try {
    const args = { workspace_root: root, file_path: main };
    const diagnostics = await until(
      client,
      "lsp_get_diagnostics",
      args,
      (d) => d.availability === "published" && d.diagnostics.some((x) => x.code === "2322"),
    );
    assert.ok(diagnostics.diagnostics.length);
    const character = initial.split("\n")[1].indexOf("add(") + 1;
    const position = { ...args, line: 2, character };
    const definition = await until(client, "lsp_get_definition", position, (d) =>
      d.locations.some((l) => l.uri.endsWith("/math.ts")),
    );
    assert.equal(definition.locations[0].range.start.character, 17);
    const hover = await until(client, "lsp_get_hover", position, (d) =>
      d.contents.includes("number"),
    );
    assert.match(hover.contents, /add/);
    const refs = await until(
      client,
      "lsp_get_references",
      {
        workspace_root: root,
        file_path: join(root, "math.ts"),
        line: 1,
        character: 17,
        include_declaration: true,
      },
      (d) => d.locations.length === 3,
    );
    assert.equal(refs.locations.length, 3);
    const symbols = await until(client, "lsp_get_document_symbols", args, (d) =>
      d.symbols.some((x) => x.name === "total"),
    );
    assert.ok(symbols.symbols.length);
    const workspace = await until(
      client,
      "lsp_workspace_symbol_search",
      { workspace_root: root, profile: "typescript", query: "add" },
      (d) => d.symbols.some((x) => x.name === "add"),
    );
    assert.ok(workspace.symbols.length);
    const actions = await until(
      client,
      "lsp_get_code_actions",
      {
        ...args,
        start_line: 1,
        start_character: 1,
        end_line: 1,
        end_character: 1,
        kind_filter: "source.organizeimports",
      },
      (d) => d.actions.some((a) => a.kind?.startsWith("source.organizeImports")),
    );
    assert.match(actions.actions[0].edit.changes[0].edits[0].new_text, /add, unused/);
    await writeFile(main, initial.replace('="wrong"', "=3"));
    await until(
      client,
      "lsp_get_diagnostics",
      args,
      (d) => d.availability === "published" && d.diagnostics.length === 0,
    );
    const bad = await client.callTool({
      name: "lsp_get_definition",
      arguments: { ...position, line: 999 },
    });
    assert.equal(bad.isError, true);
    const other = join(base, "other");
    await mkdir(other);
    await writeFile(join(other, "package.json"), '{"private":true}');
    await writeFile(join(other, "x.ts"), "export const other=1;");
    const otherSymbols = await until(
      client,
      "lsp_get_document_symbols",
      { workspace_root: other, file_path: join(other, "x.ts") },
      (d) => d.symbols.some((x) => x.name === "other"),
    );
    assert.ok(otherSymbols.symbols.every((x) => x.name !== "total"));
  } finally {
    await close();
    await rm(base, { recursive: true, force: true });
  }
});
for (const [profile, filename, content] of [
  [
    "svelte",
    "Example.svelte",
    '<script lang="ts">\n let value:string=123;\n</script>\n<p>{value}</p>\n',
  ],
  ["astro", "Example.astro", "---\nconst value:string=123;\n---\n<p>{value}</p>\n"],
  ["python", "main.py", "import os\nimport json\nvalue: str = 123\nprint(value)\n"],
  ["bash", "main.sh", "#!/usr/bin/env bash\nmessage=hello\necho $message\n"],
]) {
  test(`real ${profile} server diagnostics and symbols`, { timeout: 120_000 }, async () => {
    const root = await mkdtemp(join(tmpdir(), `lsp-real-${profile}-`));
    const file = join(root, filename);
    await writeFile(file, content);
    await writeFile(join(root, "package.json"), '{"private":true,"type":"module"}');
    if (profile === "python")
      await writeFile(join(root, "pyrightconfig.json"), '{"typeCheckingMode":"basic"}');
    const { client, close } = await connect(root);
    try {
      const args = { workspace_root: root, file_path: file };
      const status = data(
        await client.callTool({ name: "lsp_status", arguments: { workspace_root: root, profile } }),
      );
      assert.equal(status.profiles[profile].ready, true);
      const diagnostics = await until(
        client,
        "lsp_get_diagnostics",
        args,
        (d) => d.availability === "published" && d.diagnostics.length > 0,
      );
      assert.ok(diagnostics.diagnostics.length);
      const symbols = await until(client, "lsp_get_document_symbols", args, (d) =>
        Array.isArray(d.symbols),
      );
      assert.ok(Array.isArray(symbols.symbols));
      if (profile !== "bash") {
        const actions = await until(
          client,
          "lsp_get_code_actions",
          {
            ...args,
            start_line: 1,
            start_character: 1,
            end_line: 1,
            end_character: 1,
            kind_filter: "source.organizeimports",
          },
          (d) => Array.isArray(d.actions),
        );
        assert.ok(Array.isArray(actions.actions));
      }
    } finally {
      await close();
      await rm(root, { recursive: true, force: true });
    }
  });
}

test("real JavaScript diagnostics and definition use the JavaScript server", {
  timeout: 120_000,
}, async () => {
  const root = await mkdtemp(join(tmpdir(), "lsp-real-js-"));
  const file = join(root, "main.js");
  await writeFile(join(root, "package.json"), '{"private":true}');
  await writeFile(
    join(root, "jsconfig.json"),
    '{"compilerOptions":{"checkJs":true,"allowJs":true},"include":["*.js"]}',
  );
  await writeFile(
    join(root, "math.js"),
    "/** @param {number} a */\nexport function twice(a) { return a * 2; }\n",
  );
  await writeFile(file, 'import { twice } from "./math.js";\nexport const total=twice("wrong");\n');
  const { client, close } = await connect(root);
  try {
    await until(
      client,
      "lsp_get_diagnostics",
      { workspace_root: root, file_path: file },
      (d) => d.availability === "published" && d.diagnostics.some((x) => x.code === "2345"),
    );
    await until(
      client,
      "lsp_get_definition",
      { workspace_root: root, file_path: file, line: 2, character: 20 },
      (d) => d.locations.some((l) => l.uri.endsWith("/math.js")),
    );
  } finally {
    await close();
    await rm(root, { recursive: true, force: true });
  }
});
