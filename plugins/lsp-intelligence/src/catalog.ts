import { ToolSchema } from "@modelcontextprotocol/core";
import rawCatalog from "../assets/mcpls-tools.json" with { type: "json" };
export const nativeTools = ToolSchema.array().parse(rawCatalog);
export function canonical(value: unknown): string {
  const sort = (item: unknown): unknown => {
    if (Array.isArray(item)) return item.map(sort);
    if (item && typeof item === "object")
      return Object.fromEntries(
        Object.entries(item)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, v]) => [key, sort(v)]),
      );
    return item;
  };
  return JSON.stringify(sort(value));
}
export const tools = nativeTools.map((tool) => ({
  ...tool,
  name: `lsp_${tool.name}`,
  description: `Use workspace_root from the current task context. ${tool.description ?? tool.name}`,
  inputSchema: {
    ...tool.inputSchema,
    properties: {
      ...tool.inputSchema.properties,
      workspace_root: {
        type: "string",
        description: "Absolute root of the project authorized by the current task.",
      },
      profile: {
        type: "string",
        enum: ["typescript", "svelte", "astro", "python", "bash"],
        description:
          "Required when file_path is absent; never infer this from the plugin directory.",
      },
    },
    required: [...(tool.inputSchema.required ?? []), "workspace_root"],
  },
}));
export const statusTool = ToolSchema.parse({
  name: "lsp_status",
  description:
    "Inspect installed executables, pinned bridge version, and backend pool. Does not install or update software.",
  inputSchema: {
    type: "object",
    properties: {
      workspace_root: { type: "string" },
      profile: { type: "string", enum: ["typescript", "svelte", "astro", "python", "bash"] },
    },
    additionalProperties: false,
  },
});
