import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
import { getDefaultEnvironment } from "@modelcontextprotocol/client/stdio";
import { bridgeVersion, runtimePath } from "./backend.ts";
import { activateBridge, activateBridgeUnlocked, withRuntimeLock } from "./bridge-storage.ts";
import { MCPLS_VERSION, type Profile, ProfileSchema } from "./profiles.ts";

const exec = promisify(execFile);
export const ARTIFACTS = {
  "darwin-arm64": {
    name: "mcpls-aarch64-apple-darwin.tar.gz",
    sha256: "16761c74b4148c0e2f7fcfabb8d53576d7aea7e4b9dd4ae5443df4408e5d304b",
  },
  "linux-x64": {
    name: "mcpls-x86_64-unknown-linux-gnu.tar.gz",
    sha256: "dacc1324d6c010eb631180715e09b984f14bcc7faea079a4d35e4116d749515a",
  },
};
export const NODE_PACKAGES: Record<Profile, string[]> = {
  typescript: ["typescript-language-server@6.0.2", "typescript@6.0.3"],
  svelte: ["svelte-language-server@0.18.4", "typescript@6.0.3"],
  astro: ["@astrojs/language-server@2.17.2", "typescript@6.0.3"],
  python: [],
  bash: ["bash-language-server@5.8.1"],
};
export { activateBridge, rollbackBridge } from "./bridge-storage.ts";
export function verifyArtifact(data: Buffer, sha256: string): void {
  if (data.length > 50 * 1024 * 1024 || data.length === 0)
    throw new Error("Artifact size is invalid");
  if (createHash("sha256").update(data).digest("hex") !== sha256)
    throw new Error("Artifact checksum does not match the official release");
}
async function downloadBridge(): Promise<Buffer> {
  const platform = `${process.platform}-${process.arch}`;
  const artifact =
    platform === "darwin-arm64"
      ? ARTIFACTS["darwin-arm64"]
      : platform === "linux-x64"
        ? ARTIFACTS["linux-x64"]
        : undefined;
  if (!artifact) throw new Error("Supported platforms are macOS ARM64 and Linux x64");
  const temp = await mkdtemp(join(tmpdir(), "lsp-download-"));
  try {
    const archive = join(temp, "release.tar.gz");
    const url = `https://github.com/bug-ops/mcpls/releases/download/v${MCPLS_VERSION}/${artifact.name}`;
    await exec("curl", ["-fsSL", "--max-time", "120", url, "-o", archive], {
      timeout: 130_000,
      env: getDefaultEnvironment(),
    });
    const data = await readFile(archive);
    verifyArtifact(data, artifact.sha256);
    const { stdout } = await exec("tar", ["-tzf", archive], { env: getDefaultEnvironment() });
    if (stdout.trim() !== "mcpls")
      throw new Error("Unexpected files in the verified bridge archive");
    await exec("tar", ["-xzf", archive, "-C", temp, "mcpls"], { env: getDefaultEnvironment() });
    if ((await bridgeVersion(join(temp, "mcpls"))) !== MCPLS_VERSION)
      throw new Error("Downloaded bridge has unexpected version");
    return await readFile(join(temp, "mcpls"));
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}
export async function installProfiles(root: string, profiles: Profile[]): Promise<void> {
  if (!process.execPath.includes("/versions/node/"))
    throw new Error("Run the runtime manager with Node managed by nvm");
  await mkdir(root, { recursive: true, mode: 0o700 });
  const user = join(root, "public-user.npmrc"),
    global = join(root, "public-global.npmrc");
  await writeFile(user, "# Public dependencies only\n", { mode: 0o600 });
  await writeFile(global, "# Public dependencies only\n", { mode: 0o600 });
  const env = { ...getDefaultEnvironment(), PATH: runtimePath(root) };
  const packages = [...new Set(profiles.flatMap((profile) => NODE_PACKAGES[profile]))];
  if (packages.length) {
    const npm = join(
      dirname(dirname(process.execPath)),
      "lib",
      "node_modules",
      "npm",
      "bin",
      "npm-cli.js",
    );
    await exec(
      process.execPath,
      [
        npm,
        "--userconfig",
        user,
        "--globalconfig",
        global,
        "--registry",
        "https://registry.npmjs.org",
        "install",
        "--prefix",
        join(root, "node"),
        "--ignore-scripts",
        "--no-audit",
        "--no-fund",
        "--save-exact",
        ...packages,
      ],
      { timeout: 180_000, maxBuffer: 1024 * 1024, env },
    );
  }
  if (profiles.includes("python")) {
    for (const pkg of ["basedpyright==1.40.2", "ruff==0.16.10"]) {
      await exec("uv", ["tool", "install", "--default-index", "https://pypi.org/simple", pkg], {
        timeout: 180_000,
        maxBuffer: 1024 * 1024,
        env: {
          ...env,
          UV_TOOL_DIR: join(root, "python-tools"),
          UV_TOOL_BIN_DIR: join(root, "python-bin"),
        },
      });
    }
  }
  if (profiles.includes("bash")) {
    await exec("shellcheck", ["--version"], { timeout: 5000, env });
  }
  await writeFile(
    join(root, "profiles.json"),
    `${JSON.stringify(
      {
        profiles: profiles.map((profile) => ProfileSchema.parse(profile)),
        node: process.versions.node,
        packages,
      },
      null,
      2,
    )}\n`,
    { mode: 0o600 },
  );
}

export async function installBridge(root: string, update: boolean): Promise<void> {
  const data = await downloadBridge();
  await activateBridge(root, data, MCPLS_VERSION, update);
}
export async function installRuntime(
  root: string,
  profiles: Profile[],
  update: boolean,
): Promise<void> {
  const data = await downloadBridge();
  await withRuntimeLock(root, async () => {
    await activateBridgeUnlocked(root, data, MCPLS_VERSION, update);
    await installProfiles(root, profiles);
  });
}
