// @ts-check

import { createHash } from "node:crypto";
import {
  existsSync,
  promises as fs,
  readFileSync,
  realpathSync,
  statSync,
} from "node:fs";
import { createRequire } from "node:module";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

/** @typedef {{ cwd?: string, tool_input?: unknown, tool_response?: unknown }} HookPayload */
/** @typedef {{ root: string, target: string, relativePath: string }} ContainedFile */
/** @typedef {{ state: "formatted" | "unchanged" | "skipped" | "failed", diagnostic?: string }} FormatResult */

/** @param {string} value @returns {string} */
function cleanDiagnostic(value) {
  return value.replaceAll(/\s+/gu, " ").trim().slice(0, 500);
}

/** @param {string} rawInput @returns {HookPayload | null} */
export function parsePayload(rawInput) {
  if (!rawInput.trim()) return null;
  const value = JSON.parse(rawInput);
  return value && typeof value === "object" && !Array.isArray(value)
    ? /** @type {HookPayload} */ (value)
    : null;
}

/** @param {unknown} value @returns {Record<string, unknown> | null} */
function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? /** @type {Record<string, unknown>} */ (value)
    : null;
}

/** @param {HookPayload} payload @returns {string[]} */
export function collectCandidates(payload) {
  /** @type {string[]} */
  const candidates = [];
  const seen = new Set();
  /** @param {unknown} value */
  const add = (value) => {
    if (typeof value !== "string" || value.trim() === "") return;
    if (seen.has(value)) return;
    seen.add(value);
    candidates.push(value);
  };

  const input = asRecord(payload.tool_input);
  const response = asRecord(payload.tool_response);
  for (const source of [input, response]) {
    add(source?.file_path);
    add(source?.filePath);
    add(source?.path);
    add(source?.file);
  }

  const patch =
    typeof payload.tool_input === "string"
      ? payload.tool_input
      : typeof input?.command === "string"
        ? input.command
        : "";
  for (const line of patch.split(/\r?\n/u)) {
    add(line.match(/^\*\*\* (?:Add|Update) File: (.+)$/u)?.[1]);
  }
  return candidates;
}

/** @param {string} cwd @param {string} candidate @returns {ContainedFile | null} */
export function resolveContainedFile(cwd, candidate) {
  let root;
  try {
    root = realpathSync(cwd);
  } catch {
    return null;
  }
  const unresolved = isAbsolute(candidate)
    ? candidate
    : resolve(root, candidate);
  if (!existsSync(unresolved) || !statSync(unresolved).isFile()) return null;
  const target = realpathSync(unresolved);
  const relativePath = relative(root, target);
  if (
    relativePath === ".." ||
    relativePath.startsWith(`..${sep}`) ||
    isAbsolute(relativePath)
  ) {
    return null;
  }
  return { root, target, relativePath: relativePath || "." };
}

/** @param {string} path @returns {string} */
export function fileDigest(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

/** @param {string} startDir @param {string} rootDir @returns {Promise<unknown | null>} */
export async function importLocalPrettier(startDir, rootDir) {
  const root = realpathSync(rootDir);
  let current = realpathSync(startDir);
  while (true) {
    const packageJson = join(
      current,
      "node_modules",
      "prettier",
      "package.json",
    );
    if (existsSync(packageJson)) {
      const resolver = createRequire(
        join(current, "prettier-hook-resolver.cjs"),
      );
      const entry = resolver.resolve("prettier");
      const realEntry = realpathSync(entry);
      const fromRoot = relative(root, realEntry);
      if (
        fromRoot === ".." ||
        fromRoot.startsWith(`..${sep}`) ||
        isAbsolute(fromRoot)
      ) {
        return null;
      }
      return import(pathToFileURL(realEntry).href);
    }
    if (current === root) return null;
    const parent = dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

/** @param {string} root @returns {string[]} */
function ignorePaths(root) {
  return [".gitignore", ".prettierignore"]
    .map((name) => join(root, name))
    .filter((path) => existsSync(path));
}

/** @param {unknown} prettier @param {ContainedFile} file @returns {Promise<FormatResult>} */
export async function formatFile(prettier, file) {
  const module = /** @type {{ default?: unknown }} */ (prettier);
  const api =
    /** @type {{ getFileInfo?: Function, resolveConfig?: Function, format?: Function }} */ (
      module.default ?? prettier
    );
  if (
    typeof api.getFileInfo !== "function" ||
    typeof api.resolveConfig !== "function" ||
    typeof api.format !== "function"
  ) {
    return { state: "failed", diagnostic: "local prettier API is unavailable" };
  }

  try {
    const config =
      (await api.resolveConfig(file.target, {
        editorconfig: true,
        useCache: false,
      })) ?? {};
    const info = await api.getFileInfo(file.target, {
      ignorePath: ignorePaths(file.root),
      plugins: Array.isArray(config.plugins) ? config.plugins : undefined,
      resolveConfig: true,
    });
    if (info.ignored) return { state: "skipped", diagnostic: "ignored" };
    if (!info.inferredParser)
      return { state: "skipped", diagnostic: "unsupported file type" };

    const before = fileDigest(file.target);
    const source = await fs.readFile(file.target, "utf8");
    const formatted = await api.format(source, {
      ...config,
      filepath: file.target,
    });
    if (formatted !== source)
      await fs.writeFile(file.target, formatted, "utf8");
    return {
      state: before === fileDigest(file.target) ? "unchanged" : "formatted",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { state: "failed", diagnostic: cleanDiagnostic(message) };
  }
}

/** @param {string} relativePath @param {FormatResult} result @returns {string} */
export function resultLine(relativePath, result) {
  return `prettier-after-edit: ${relativePath}; prettier=${result.state}${
    result.diagnostic ? ` (${result.diagnostic})` : ""
  }`;
}

/** @param {string[]} lines */
function emit(lines) {
  process.stdout.write(
    `${JSON.stringify({ systemMessage: lines.join("\n") })}\n`,
  );
}

/** @param {string} [rawInput] @returns {Promise<number>} */
export async function main(rawInput = readFileSync(0, "utf8")) {
  /** @type {HookPayload | null} */
  let payload;
  try {
    payload = parsePayload(rawInput);
  } catch {
    emit(["prettier-after-edit: skipped; unable to parse hook payload."]);
    return 0;
  }
  if (!payload) {
    emit(["prettier-after-edit: skipped; empty hook payload."]);
    return 0;
  }

  const cwd = typeof payload.cwd === "string" ? payload.cwd : process.cwd();
  const candidates = collectCandidates(payload);
  if (candidates.length === 0) {
    emit(["prettier-after-edit: skipped; no target file in hook payload."]);
    return 0;
  }

  /** @type {string[]} */
  const lines = [];
  /** @type {Map<string, unknown | null>} */
  const prettierByRoot = new Map();
  for (const candidate of candidates) {
    const file = resolveContainedFile(cwd, candidate);
    if (!file) {
      lines.push(
        `prettier-after-edit: ${candidate}; prettier=skipped (missing, not a file, or outside cwd)`,
      );
      continue;
    }
    if (!prettierByRoot.has(file.root)) {
      prettierByRoot.set(
        file.root,
        await importLocalPrettier(dirname(file.target), file.root),
      );
    }
    const prettier = prettierByRoot.get(file.root);
    const result = prettier
      ? await formatFile(prettier, file)
      : { state: "skipped", diagnostic: "local prettier not found" };
    lines.push(
      resultLine(file.relativePath, /** @type {FormatResult} */ (result)),
    );
  }

  emit(lines);
  return 0;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  process.exitCode = await main();
}
