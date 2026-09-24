import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { planPackageRelease, releaseNotes, tagFor } from "./release-plan.mjs";
import { validatePackages } from "./validate-packages.mjs";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));

export async function releasePackage({
  packageInfo,
  headSha,
  previousVersion = null,
  bootstrap = false,
  apply = false,
  api,
}) {
  const tag = tagFor(packageInfo.name, packageInfo.version);
  const tagSha = await api.readTag(tag);
  const release = await api.readRelease(tag);
  const plan = planPackageRelease({
    name: packageInfo.name,
    version: packageInfo.version,
    headSha,
    previousVersion,
    bootstrap,
    tagSha,
    release,
  });
  const notes = releaseNotes(packageInfo.changelog, packageInfo.version);
  if (tagSha !== null) {
    await api.verifyTag(tag, tagSha, packageInfo.name, packageInfo.version);
  }
  if (apply) {
    if (plan.createTag) await api.createTag(tag, plan.targetSha);
    if (plan.createRelease) await api.createRelease(tag, plan.targetSha, notes);
  }
  return plan;
}

function run(command, args, { cwd = repositoryRoot, allow404 = false } = {}) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024,
    env: process.env,
  });
  if (result.error) throw new Error(`${command}: ${result.error.message}`);
  if (result.status !== 0) {
    if (allow404 && /HTTP 404/.test(result.stderr)) return null;
    throw new Error(
      `${command} ${args[0]} failed: ${result.stderr.trim() || result.stdout.trim()}`,
    );
  }
  return result.stdout.trim();
}

function git(args) {
  return run("git", args);
}

function ghJson(args, options) {
  const output = run("gh", args, options);
  return output === null ? null : JSON.parse(output);
}

function githubApi(repository) {
  return {
    async readTag(tag) {
      const ref = ghJson(["api", `repos/${repository}/git/ref/tags/${tag}`], {
        allow404: true,
      });
      if (ref === null) return null;
      if (ref.object?.type !== "commit" || typeof ref.object.sha !== "string") {
        throw new Error(
          `${tag}: expected a lightweight tag pointing to a commit`,
        );
      }
      return ref.object.sha;
    },
    async readRelease(tag) {
      const release = ghJson(
        ["api", `repos/${repository}/releases/tags/${encodeURIComponent(tag)}`],
        { allow404: true },
      );
      if (release === null) return null;
      return { tagName: release.tag_name, targetSha: release.target_commitish };
    },
    async verifyTag(tag, sha, name, version) {
      const ancestor = spawnSync(
        "git",
        ["merge-base", "--is-ancestor", sha, "HEAD"],
        {
          cwd: repositoryRoot,
          encoding: "utf8",
        },
      );
      if (ancestor.status !== 0) {
        throw new Error(
          `${tag}: tag target is not an ancestor of the new main`,
        );
      }
      const historicalManifest = JSON.parse(
        git(["show", `${sha}:plugins/${name}/plugin.json`]),
      );
      if (
        historicalManifest.name !== name ||
        historicalManifest.version !== version
      ) {
        throw new Error(
          `${tag}: tag target does not contain the expected package version`,
        );
      }
    },
    async createTag(tag, sha) {
      ghJson([
        "api",
        "-X",
        "POST",
        `repos/${repository}/git/refs`,
        "-f",
        `ref=refs/tags/${tag}`,
        "-f",
        `sha=${sha}`,
      ]);
    },
    async createRelease(tag, sha, notes) {
      ghJson([
        "api",
        "-X",
        "POST",
        `repos/${repository}/releases`,
        "-f",
        `tag_name=${tag}`,
        "-f",
        `target_commitish=${sha}`,
        "-f",
        `name=${tag}`,
        "-f",
        `body=${notes}`,
        "-F",
        "draft=false",
        "-F",
        "prerelease=false",
        "-f",
        "make_latest=false",
      ]);
    },
  };
}

function previousVersion(name) {
  const previous = spawnSync(
    "git",
    ["show", `HEAD^:plugins/${name}/plugin.json`],
    {
      cwd: repositoryRoot,
      encoding: "utf8",
    },
  );
  if (previous.status !== 0) return null;
  return JSON.parse(previous.stdout).version;
}

function ensureApplyPreconditions(repository, headSha) {
  if (
    process.env.GITHUB_ACTIONS !== "true" ||
    process.env.GITHUB_REF !== "refs/heads/main"
  ) {
    throw new Error(
      "release writes require the GitHub Actions main-branch workflow",
    );
  }
  if (process.env.GITHUB_SHA !== headSha || !process.env.GH_TOKEN) {
    throw new Error("release workflow SHA or GitHub credential is unavailable");
  }
  if (git(["status", "--porcelain"]) !== "") {
    throw new Error("release workflow checkout must be clean");
  }
  const remote = ghJson(["api", `repos/${repository}/branches/main`]);
  if (remote.commit?.sha !== headSha) {
    throw new Error("remote main moved after this release workflow started");
  }
}

async function main() {
  const args = new Set(process.argv.slice(2));
  for (const argument of args) {
    if (!["--bootstrap", "--apply"].includes(argument)) {
      throw new Error(`unsupported argument: ${argument}`);
    }
  }
  const bootstrap = args.has("--bootstrap");
  const apply = args.has("--apply");
  const repository =
    process.env.GITHUB_REPOSITORY || "nerymurillohnd/codex-essentials";
  const headSha = git(["rev-parse", "HEAD"]);
  const packages = validatePackages(repositoryRoot);
  if (packages.length === 0)
    throw new Error("cannot release an empty marketplace");
  if (apply) ensureApplyPreconditions(repository, headSha);
  const api = githubApi(repository);
  const entries = packages.map((packageInfo) => ({
    packageInfo: {
      name: packageInfo.name,
      version: packageInfo.version,
      changelog: readFileSync(join(packageInfo.root, "CHANGELOG.md"), "utf8"),
    },
    headSha,
    previousVersion: bootstrap ? null : previousVersion(packageInfo.name),
    bootstrap,
    api,
  }));

  // Validate the complete release set before the first remote write.
  const plans = [];
  for (const entry of entries) {
    plans.push(await releasePackage({ ...entry, apply: false }));
  }
  process.stdout.write(
    `${JSON.stringify({ repository, headSha, bootstrap, plans }, null, 2)}\n`,
  );
  if (apply) {
    for (const entry of entries) {
      await releasePackage({ ...entry, apply: true });
    }
  }
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
