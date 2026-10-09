import { execFile } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { constants } from "node:fs";
import { access, mkdir, realpath, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { delimiter, dirname, join } from "node:path";
import { promisify } from "node:util";
import { Client } from "@modelcontextprotocol/client";
import { getDefaultEnvironment, StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { canonical, nativeTools } from "./catalog.ts";
import type { BackendFactory } from "./pool.ts";
import {
  COMMANDS,
  MCPLS_VERSION,
  PROFILES,
  type Profile,
  renderConfig,
  VERSION,
} from "./profiles.ts";
import { createValidator } from "./validation.ts";

const exec = promisify(execFile);
export function defaultRuntimeRoot(): string {
  return join(homedir(), ".local", "share", "codex-essentials", "lsp-runtime");
}
export function runtimePath(root: string): string {
  return [
    join(root, "node", "node_modules", ".bin"),
    join(root, "python-bin"),
    join(root, "bin"),
    process.env.PATH ?? "",
  ].join(delimiter);
}
export async function findExecutable(name: string, pathValue: string): Promise<string> {
  for (const directory of pathValue.split(delimiter)) {
    if (!directory || directory === ".") continue;
    const file = join(directory, name);
    try {
      await access(file, constants.X_OK);
      return await realpath(file);
    } catch {}
  }
  throw new Error(`Missing executable: ${name}`);
}
export async function bridgeVersion(binary: string): Promise<string> {
  const { stdout } = await exec(binary, ["--version"], {
    timeout: 5000,
    maxBuffer: 4096,
    env: getDefaultEnvironment(),
  });
  const version = /^mcpls (\S+)\s*$/.exec(stdout)?.[1];
  if (!version) throw new Error("Executable did not identify as mcpls");
  return version;
}
async function findTypeScriptSdk(runtimeRoot: string, pathValue: string): Promise<string> {
  const candidates = [join(runtimeRoot, "node", "node_modules", "typescript", "lib")];
  try {
    candidates.push(join(dirname(dirname(await findExecutable("tsc", pathValue))), "lib"));
  } catch {}
  for (const candidate of candidates)
    try {
      await access(join(candidate, "typescript.js"));
      return await realpath(candidate);
    } catch {}
  throw new Error("Missing JavaScript TypeScript SDK for Astro");
}
export async function runtimeStatus(runtimeRoot: string) {
  const pathValue = runtimePath(runtimeRoot);
  let bridge: { path?: string; version?: string; ready: boolean; error?: string } = {
    ready: false,
  };
  try {
    const path = await findExecutable("mcpls", pathValue);
    const version = await bridgeVersion(path);
    bridge = { path, version, ready: version === MCPLS_VERSION };
  } catch (error) {
    bridge = { ready: false, error: error instanceof Error ? error.message : "Bridge unavailable" };
  }
  const profiles: Record<
    string,
    { ready: boolean; executables: Record<string, string>; missing: string[] }
  > = {};
  for (const profile of PROFILES) {
    const executables: Record<string, string> = {},
      missing: string[] = [];
    for (const name of COMMANDS[profile])
      try {
        executables[name] = await findExecutable(name, pathValue);
      } catch {
        missing.push(name);
      }
    if (profile === "astro")
      try {
        executables["typescript-sdk"] = await findTypeScriptSdk(runtimeRoot, pathValue);
      } catch {
        missing.push("typescript-sdk");
      }
    profiles[profile] = { ready: missing.length === 0, executables, missing };
  }
  return {
    node: process.versions.node,
    nodeExecutable: process.execPath,
    requiredBridge: MCPLS_VERSION,
    bridge,
    profiles,
    runtimeRoot,
  };
}
export function createBackendFactory(options: {
  dataRoot: string;
  runtimeRoot: string;
  binary?: string;
}): BackendFactory {
  return async (root: string, profile: Profile) => {
    const pathValue = runtimePath(options.runtimeRoot);
    const binary = options.binary ?? (await findExecutable("mcpls", pathValue));
    if ((await bridgeVersion(binary)) !== MCPLS_VERSION)
      throw new Error(`mcpls version must be ${MCPLS_VERSION}`);
    const commands: Record<string, string> = {};
    for (const name of COMMANDS[profile]) commands[name] = await findExecutable(name, pathValue);
    if (profile === "astro")
      commands["typescript-sdk"] = await findTypeScriptSdk(options.runtimeRoot, pathValue);
    const key = createHash("sha256")
      .update(JSON.stringify([root, profile]))
      .digest("hex");
    const directory = join(
      options.dataRoot,
      "sessions",
      String(process.pid),
      `${key}-${randomUUID()}`,
    );
    await mkdir(directory, { recursive: true, mode: 0o700 });
    const config = join(directory, "mcpls.toml");
    await writeFile(config, renderConfig(root, profile, commands), { mode: 0o600 });
    const client = new Client(
      { name: "codex-essentials-lsp-intelligence", version: VERSION },
      { jsonSchemaValidator: createValidator() },
    );
    const transport = new StdioClientTransport({
      command: binary,
      args: ["--config", config, "--log-level", "error"],
      cwd: root,
      env: { ...getDefaultEnvironment(), PATH: pathValue },
      stderr: "pipe",
    });
    // Raw language-server logs may contain project text; they are not copied to host logs.
    transport.stderr?.on("data", () => {});
    let alive = true;
    transport.onclose = () => {
      alive = false;
    };
    try {
      await client.connect(transport);
      if (client.getServerVersion()?.version !== MCPLS_VERSION)
        throw new Error("Unexpected MCP bridge version");
      const actual = (await client.listTools()).tools;
      if (canonical(actual) !== canonical(nativeTools))
        throw new Error("mcpls tool catalog differs from the pinned contract");
    } catch (error) {
      await client.close();
      await rm(directory, { recursive: true, force: true });
      throw error;
    }
    return {
      query: async (name, args, signal) =>
        client.callTool(
          { name, arguments: args },
          { timeout: 150_000, ...(signal ? { signal } : {}) },
        ),
      close: async () => {
        alive = false;
        await client.close();
        await rm(directory, { recursive: true, force: true });
      },
      isAlive: () => alive,
    };
  };
}
