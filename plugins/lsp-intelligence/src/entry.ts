import { homedir } from "node:os";
import { join } from "node:path";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { createBackendFactory, defaultRuntimeRoot } from "./backend.ts";
import { BackendPool } from "./pool.ts";
import { createServer } from "./server.ts";

export function optionsFromArgs(args: string[]): { dataRoot: string; runtimeRoot: string } {
  let dataRoot =
      process.env.PLUGIN_DATA ?? join(homedir(), ".local", "share", "codex-essentials", "lsp-data"),
    runtimeRoot = defaultRuntimeRoot();
  for (let i = 0; i < args.length; i++) {
    const option = args[i],
      value = args[i + 1];
    if (!value || value.startsWith("--")) throw new Error(`Expected a path after ${option}`);
    if (option === "--data-root") dataRoot = value;
    else if (option === "--runtime-root") runtimeRoot = value;
    else throw new Error("Unknown server option");
    i++;
  }
  return { dataRoot, runtimeRoot };
}
async function main(): Promise<void> {
  const options = optionsFromArgs(process.argv.slice(2));
  const pool = new BackendPool({ factory: createBackendFactory(options) });
  const server = createServer({ pool, runtimeRoot: options.runtimeRoot });
  let stopping: Promise<void> | undefined;
  const stop = () => {
    stopping ??= (async () => {
      await server.close();
      await pool.close();
    })();
    return stopping;
  };
  const stopWithError = () => {
    stop().catch(() => {
      process.stderr.write("LSP teardown failed\n");
      process.exitCode = 1;
    });
  };
  process.once("SIGINT", stopWithError);
  process.once("SIGTERM", stopWithError);
  process.stdin.once("end", stopWithError);
  await server.connect(new StdioServerTransport());
}
main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : "LSP startup failed"}\n`);
  process.exitCode = 1;
});
