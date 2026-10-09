import { CallToolResultSchema } from "@modelcontextprotocol/core";
import { fromJsonSchema, Server } from "@modelcontextprotocol/server";
import { z } from "zod";
import { runtimeStatus } from "./backend.ts";
import { statusTool, tools } from "./catalog.ts";
import type { BackendPool } from "./pool.ts";
import { canonicalRoot, ProfileSchema, VERSION, validateRequest } from "./profiles.ts";
import { createValidator } from "./validation.ts";

const statusInput = z
  .object({ workspace_root: z.string().optional(), profile: ProfileSchema.optional() })
  .strict();
export function createServer(options: { pool: BackendPool; runtimeRoot: string }): Server {
  const server = new Server(
    { name: "codex-essentials-lsp-intelligence", version: VERSION },
    {
      capabilities: { tools: {} },
      jsonSchemaValidator: createValidator(),
      instructions:
        "Use workspace_root from the current authorized task, never the plugin directory. File tools select their language profile. For tools without file_path, pass profile. Pending or evicted diagnostics and indexing in progress are inconclusive. Push-cache diagnostics may be stale after edits: recheck and run the project's own gates. All edits are proposals, not applied.",
    },
  );
  const definitions = [...tools, statusTool];
  const validators = new Map(
    tools.map((tool) => [tool.name, fromJsonSchema(tool.inputSchema, createValidator())]),
  );
  server.setRequestHandler("tools/list", async () => ({ tools: definitions }));
  server.setRequestHandler("tools/call", async (request, context) => {
    const name = request.params.name,
      args = request.params.arguments ?? {};
    const tool = definitions.find((definition) => definition.name === name);
    if (!tool)
      return CallToolResultSchema.parse({
        isError: true,
        content: [{ type: "text", text: "Unknown LSP tool" }],
      });
    try {
      if (name === "lsp_status") {
        const input = statusInput.parse(args);
        const root = input.workspace_root ? await canonicalRoot(input.workspace_root) : undefined;
        const status = await runtimeStatus(options.runtimeRoot);
        return server.projectCallToolResult(
          CallToolResultSchema.parse({
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  ...status,
                  ...(root ? { workspaceRoot: root } : {}),
                  activeBackends: options.pool.size,
                }),
              },
            ],
            structuredContent: {
              ...status,
              ...(root ? { workspaceRoot: root } : {}),
              activeBackends: options.pool.size,
            },
          }),
          tool.outputSchema,
        );
      }
      const validator = validators.get(name);
      if (!validator) throw new Error("Tool validator is unavailable");
      const checked = await validator["~standard"].validate(args);
      if (checked.issues) throw new Error(`Invalid arguments for ${name}`);
      const { root, profile, nativeArgs } = await validateRequest(args);
      const response = await options.pool.query(
        root,
        profile,
        name.slice(4),
        nativeArgs,
        context.mcpReq.signal,
      );
      return server.projectCallToolResult(response, tool.outputSchema);
    } catch (error) {
      const message = error instanceof Error ? error.message : "LSP operation failed";
      return CallToolResultSchema.parse({
        isError: true,
        content: [{ type: "text", text: message }],
      });
    }
  });
  return server;
}
