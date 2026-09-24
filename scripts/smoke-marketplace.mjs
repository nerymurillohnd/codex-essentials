import { spawnSync } from "node:child_process";
import {
  lstatSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validatePackages } from "./validate-packages.mjs";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const expectedIds = new Set([
  "agents-md-master",
  "astro-cli-commands",
  "automatic-pr-lifecycle",
  "block-no-verify",
  "configure-prettier",
  "doc-keeper",
  "hook-creator",
  "live-research",
  "optimize-memories",
  "prettier-after-edit",
  "prompt-architect",
  "repo-hygiene",
  "repo-maintenance",
  "ruff-after-edit",
  "shellcheck-after-edit",
  "skill-design-standards",
  "svelte-development",
  "system-ops-audit",
  "typescript-pro",
  "verify-completion",
]);

function run(command, args, env, cwd = repositoryRoot) {
  const result = spawnSync(command, args, {
    cwd,
    env,
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.slice(0, 2).join(" ")} failed (${result.status}): ${result.stderr.trim() || result.stdout.trim()}`,
    );
  }
  return result.stdout.trim();
}

function filesWithin(root, base = root) {
  const result = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const absolute = join(root, entry.name);
    const stat = lstatSync(absolute);
    if (stat.isSymbolicLink())
      throw new Error(
        `symlink in installed package: ${relative(base, absolute)}`,
      );
    if (stat.isDirectory()) result.push(...filesWithin(absolute, base));
    else if (stat.isFile()) result.push(relative(base, absolute));
    else throw new Error(`unsupported installed entry: ${absolute}`);
  }
  return result.sort();
}

function assertPackageCopy(sourceRoot, installedRoot, name) {
  const expected = filesWithin(sourceRoot);
  const actual = filesWithin(installedRoot);
  const missing = expected.filter((path) => !actual.includes(path));
  if (missing.length > 0)
    throw new Error(
      `${name}: installed package is missing ${missing.join(", ")}`,
    );
  for (const path of expected) {
    if (
      !readFileSync(join(sourceRoot, path)).equals(
        readFileSync(join(installedRoot, path)),
      )
    ) {
      throw new Error(`${name}: installed bytes differ for ${path}`);
    }
  }
  return expected.length;
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || value === undefined)
      throw new Error(`expected --option value, received ${key ?? "<none>"}`);
    if (!["--source", "--ref", "--sha"].includes(key) || options[key])
      throw new Error(`unsupported or duplicate option: ${key}`);
    options[key] = value;
  }
  if (!options["--source"]) throw new Error("--source is required");
  if (options["--sha"] && !/^[0-9a-f]{40}$/.test(options["--sha"]))
    throw new Error("--sha must be a full lowercase Git commit ID");
  if (options["--ref"] && !options["--sha"])
    throw new Error(
      "a remote --ref requires --sha for exact-source verification",
    );
  return {
    source: options["--source"],
    ref: options["--ref"],
    sha: options["--sha"],
  };
}

export function assertExpectedPackages(packages) {
  const observed = new Set(packages.map((item) => item.name));
  const missing = [...expectedIds].filter((id) => !observed.has(id));
  const extra = [...observed].filter((id) => !expectedIds.has(id));
  if (missing.length || extra.length || packages.length !== expectedIds.size) {
    throw new Error(
      `expected exactly 20 products; missing=${missing.join(",") || "none"}; extra=${extra.join(",") || "none"}`,
    );
  }
  for (const item of packages) {
    if (item.version !== "0.1.0")
      throw new Error(`${item.name}: expected first version 0.1.0`);
  }
}

export function smokeMarketplace({ source, ref, sha }, execute = run) {
  const packages = validatePackages(repositoryRoot);
  assertExpectedPackages(packages);
  const isolatedHome = mkdtempSync(join(tmpdir(), "codex-marketplace-smoke-"));
  const env = { ...process.env, CODEX_HOME: isolatedHome };
  try {
    const addArgs = ["plugin", "marketplace", "add", source];
    if (ref) addArgs.push("--ref", ref);
    addArgs.push("--json");
    const added = JSON.parse(execute("codex", addArgs, env));
    if (typeof added.marketplaceName !== "string")
      throw new Error("Codex did not report a marketplace name");
    const marketplace = JSON.parse(
      execute("codex", ["plugin", "marketplace", "list", "--json"], env),
    ).marketplaces.find((entry) => entry.name === added.marketplaceName);
    if (!marketplace)
      throw new Error("Codex did not retain the marketplace source");
    if (ref && marketplace.marketplaceSource?.sourceType !== "git")
      throw new Error("expected a Git-backed marketplace source");
    if (sha) {
      const installedSha = execute(
        "git",
        ["rev-parse", "HEAD"],
        env,
        marketplace.root,
      );
      if (installedSha !== sha)
        throw new Error(`marketplace SHA ${installedSha} differs from ${sha}`);
    }
    const inventory = [];
    for (const item of packages) {
      const installed = JSON.parse(
        execute(
          "codex",
          ["plugin", "add", `${item.name}@${added.marketplaceName}`, "--json"],
          env,
        ),
      );
      if (installed.name !== item.name || installed.version !== item.version)
        throw new Error(
          `${item.name}: Codex reported the wrong identity/version`,
        );
      const installedRoot = realpathSync(installed.installedPath);
      if (!installedRoot.startsWith(`${realpathSync(isolatedHome)}/`))
        throw new Error(`${item.name}: installed outside isolated Codex home`);
      inventory.push({
        name: item.name,
        version: installed.version,
        files: assertPackageCopy(item.root, installedRoot, item.name),
        skills: item.skills.length,
        hooks: item.hasHooks,
        mcp: item.hasMcp,
      });
    }
    const listed = JSON.parse(
      execute("codex", ["plugin", "list", "--json"], env),
    ).installed.filter(
      (entry) => entry.marketplaceName === added.marketplaceName,
    );
    if (
      listed.length !== packages.length ||
      listed.some((entry) => !entry.enabled)
    )
      throw new Error(
        "Codex installed-plugin inventory is incomplete or disabled",
      );
    return {
      marketplace: added.marketplaceName,
      sourceType: marketplace.marketplaceSource?.sourceType,
      sourceSha: sha ?? null,
      inventory,
    };
  } finally {
    // Only this freshly created, single-purpose home is removed.
    rmSync(isolatedHome, { recursive: true, force: true });
  }
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    process.stdout.write(
      `${JSON.stringify(smokeMarketplace(parseArgs(process.argv.slice(2))), null, 2)}\n`,
    );
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
