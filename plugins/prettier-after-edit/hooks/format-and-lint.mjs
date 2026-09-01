// @ts-check

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  accessSync,
  constants,
  existsSync,
  readFileSync,
  realpathSync,
  statSync,
} from "node:fs";
import {
  delimiter,
  dirname,
  extname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import { pathToFileURL } from "node:url";

/** @typedef {{ cwd?: string, tool_input?: unknown, tool_response?: Record<string, unknown> }} HookPayload */
/** @typedef {{ root: string, target: string, relativePath: string }} ContainedFile */
/** @typedef {{ status: number | null, stdout: string, stderr: string, error?: Error }} ProcessResult */
/** @typedef {{ state: string, diagnostic: string }} ToolResult */

/** @param {string} rawInput @returns {HookPayload | null} */
export function parsePayload(rawInput) {
  if (!rawInput.trim()) {
    return null;
  }
  const value = JSON.parse(rawInput);
  return value && typeof value === "object"
    ? /** @type {HookPayload} */ (value)
    : null;
}

/** @param {HookPayload} payload @returns {string[]} */
export function collectCandidates(payload) {
  /** @type {string[]} */
  const candidates = [];
  const seen = new Set();
  /** @param {unknown} value */
  const add = (value) => {
    if (typeof value === "string" && value && !seen.has(value)) {
      seen.add(value);
      candidates.push(value);
    }
  };
  const input = payload.tool_input;
  const response = payload.tool_response;
  const inputRecord =
    input && typeof input === "object"
      ? /** @type {Record<string, unknown>} */ (input)
      : null;
  if (response) {
    add(response.filePath);
  }
  if (inputRecord) {
    add(inputRecord.file_path);
    add(inputRecord.path);
    add(inputRecord.file);
  }
  const patch =
    typeof input === "string"
      ? input
      : inputRecord && typeof inputRecord.command === "string"
        ? inputRecord.command
        : "";
  for (const line of patch.split(/\r?\n/u)) {
    const match = line.match(/^\*\*\* (?:Add|Update) File: (.+)$/u);
    add(match?.[1]);
  }
  return candidates;
}

/** @param {string} cwd @param {string} candidate @returns {ContainedFile | null} */
export function resolveContainedFile(cwd, candidate) {
  const root = realpathSync(cwd);
  const unresolved = isAbsolute(candidate)
    ? candidate
    : resolve(root, candidate);
  if (!existsSync(unresolved) || !statSync(unresolved).isFile()) {
    return null;
  }
  const target = realpathSync(unresolved);
  const fromRoot = relative(root, target);
  if (
    fromRoot === ".." ||
    fromRoot.startsWith(`..${sep}`) ||
    isAbsolute(fromRoot)
  ) {
    return null;
  }
  return { root, target, relativePath: fromRoot || "." };
}

/** @param {string} path @returns {string} */
export function fileDigest(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

/** @param {string} command @param {string[]} args @param {string} cwd @returns {ProcessResult} */
export function runCommand(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    shell: false,
    timeout: 20_000,
  });
  return {
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    error: result.error,
  };
}

/** @param {string} name @param {NodeJS.ProcessEnv} env @returns {string[]} */
function executableNames(name, env) {
  if (process.platform !== "win32") {
    return [name];
  }
  const extensions = (env.PATHEXT ?? ".COM;.EXE;.BAT;.CMD")
    .split(";")
    .filter(Boolean);
  return [
    name,
    ...extensions.map((extension) => `${name}${extension.toLowerCase()}`),
  ];
}

/** @param {string} path @returns {boolean} */
function isExecutable(path) {
  if (!existsSync(path) || !statSync(path).isFile()) {
    return false;
  }
  if (process.platform === "win32") {
    return true;
  }
  try {
    accessSync(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

/** @param {string} startDir @param {string} rootDir @param {string} name @param {NodeJS.ProcessEnv} env @returns {string | null} */
export function findExecutable(startDir, rootDir, name, env = process.env) {
  const root = realpathSync(rootDir);
  let current = realpathSync(startDir);
  const names = executableNames(name, env);
  while (true) {
    for (const executableName of names) {
      const candidate = join(current, "node_modules", ".bin", executableName);
      if (isExecutable(candidate)) {
        return candidate;
      }
    }
    if (current === root) {
      break;
    }
    const parent = dirname(current);
    const fromRoot = relative(root, parent);
    if (
      parent === current ||
      fromRoot === ".." ||
      fromRoot.startsWith(`..${sep}`)
    ) {
      break;
    }
    current = parent;
  }
  for (const directory of (env.PATH ?? "").split(delimiter).filter(Boolean)) {
    for (const executableName of names) {
      const candidate = join(directory, executableName);
      if (isExecutable(candidate)) {
        return candidate;
      }
    }
  }
  return null;
}

/** @param {ProcessResult} result @returns {string} */
export function firstDiagnostic(result) {
  const stderrLines = result.stderr.split(/\r?\n/u).filter(Boolean);
  const stdoutLines = result.stdout.split(/\r?\n/u).filter(Boolean);
  const lines = stderrLines.length ? stderrLines : stdoutLines;
  const first = lines[0] ?? result.error?.message ?? "process failed";
  const suffix = lines.length > 1 ? ` (${lines.length} diagnostic lines)` : "";
  return `${first.slice(0, 500)}${suffix}`;
}

/** @param {string} executable @param {ContainedFile} file @returns {ToolResult} */
export function runPrettier(executable, file) {
  const info = runCommand(
    executable,
    ["--file-info", file.relativePath],
    file.root,
  );
  if (info.status !== 0) {
    return { state: "failed", diagnostic: firstDiagnostic(info) };
  }
  let metadata;
  try {
    metadata = JSON.parse(info.stdout);
  } catch {
    return { state: "failed", diagnostic: "invalid --file-info JSON" };
  }
  if (metadata.ignored) {
    return { state: "skipped", diagnostic: "ignored" };
  }
  if (!metadata.inferredParser) {
    return { state: "skipped", diagnostic: "unsupported file type" };
  }
  const before = fileDigest(file.target);
  const write = runCommand(
    executable,
    ["--write", "--ignore-unknown", "--", file.relativePath],
    file.root,
  );
  if (write.status !== 0) {
    return { state: "failed", diagnostic: firstDiagnostic(write) };
  }
  return {
    state: before === fileDigest(file.target) ? "unchanged" : "formatted",
    diagnostic: "",
  };
}

/** @param {string} name @param {ToolResult} result @returns {string} */
function phaseText(name, result) {
  return `${name}=${result.state}${
    result.diagnostic ? ` (${result.diagnostic})` : ""
  }`;
}

const markdownlintConfigNames = [
  ".markdownlint-cli2.jsonc",
  ".markdownlint-cli2.yaml",
  ".markdownlint-cli2.cjs",
  ".markdownlint-cli2.mjs",
  ".markdownlint.jsonc",
  ".markdownlint.json",
  ".markdownlint.yaml",
  ".markdownlint.yml",
  ".markdownlint.cjs",
  ".markdownlint.mjs",
];

/** @param {string} startDir @param {string} rootDir @returns {boolean} */
export function hasMarkdownlintConfig(startDir, rootDir) {
  const root = realpathSync(rootDir);
  let current = realpathSync(startDir);
  while (true) {
    for (const name of markdownlintConfigNames) {
      const candidate = join(current, name);
      if (existsSync(candidate) && statSync(candidate).isFile()) {
        return true;
      }
    }
    if (current === root) {
      return false;
    }
    const parent = dirname(current);
    const fromRoot = relative(root, parent);
    if (
      parent === current ||
      fromRoot === ".." ||
      fromRoot.startsWith(`..${sep}`)
    ) {
      return false;
    }
    current = parent;
  }
}

/** @param {string} executable @param {ContainedFile} file @returns {ToolResult} */
export function runMarkdownlint(executable, file) {
  const before = fileDigest(file.target);
  const result = runCommand(
    executable,
    ["--fix", "--no-globs", `:${file.relativePath}`],
    file.root,
  );
  const changed = before !== fileDigest(file.target);
  if (result.status === 0) {
    return { state: changed ? "fixed" : "clean", diagnostic: "" };
  }
  if (result.status === 1) {
    return {
      state: changed ? "fixed; issues remain" : "issues remain",
      diagnostic: firstDiagnostic(result),
    };
  }
  return { state: "failed", diagnostic: firstDiagnostic(result) };
}

/** @param {string} relativePath @param {ToolResult} prettierResult @param {ToolResult} markdownlintResult @returns {string} */
export function formatFileMessage(
  relativePath,
  prettierResult,
  markdownlintResult,
) {
  return [
    `prettier-after-edit: ${relativePath}`,
    phaseText("prettier", prettierResult),
    phaseText("markdownlint", markdownlintResult),
  ].join("; ");
}

/** @param {string} systemMessage */
export function emit(systemMessage) {
  process.stdout.write(`${JSON.stringify({ systemMessage })}\n`);
}

/** @param {string} rawInput @param {NodeJS.ProcessEnv} env @returns {number} */
export function main(rawInput = readFileSync(0, "utf8"), env = process.env) {
  let payload;
  try {
    payload = parsePayload(rawInput);
  } catch {
    emit("prettier-after-edit: skipped; unable to parse hook payload.");
    return 0;
  }
  if (!payload) {
    emit("prettier-after-edit: skipped; empty hook payload.");
    return 0;
  }
  const cwd = typeof payload.cwd === "string" ? payload.cwd : process.cwd();
  const candidates = collectCandidates(payload);
  if (!candidates.length) {
    emit("prettier-after-edit: skipped; no target file in hook payload.");
    return 0;
  }
  for (const candidate of candidates) {
    const file = resolveContainedFile(cwd, candidate);
    if (!file) {
      emit(
        `prettier-after-edit: ${candidate}; skipped; target missing, not a file, or outside cwd.`,
      );
      continue;
    }
    const prettier = findExecutable(
      dirname(file.target),
      file.root,
      "prettier",
      env,
    );
    const prettierResult = prettier
      ? runPrettier(prettier, file)
      : { state: "skipped", diagnostic: "prettier not found" };
    /** @type {ToolResult} */
    let markdownlintResult = {
      state: "skipped",
      diagnostic: "not Markdown",
    };
    if ([".md", ".markdown"].includes(extname(file.target).toLowerCase())) {
      if (!hasMarkdownlintConfig(dirname(file.target), file.root)) {
        markdownlintResult = {
          state: "skipped",
          diagnostic: "no project configuration",
        };
      } else {
        const markdownlint = findExecutable(
          dirname(file.target),
          file.root,
          "markdownlint-cli2",
          env,
        );
        markdownlintResult = markdownlint
          ? runMarkdownlint(markdownlint, file)
          : {
              state: "skipped",
              diagnostic: "markdownlint-cli2 not found",
            };
      }
    }
    emit(
      formatFileMessage(file.relativePath, prettierResult, markdownlintResult),
    );
  }
  return 0;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  process.exitCode = main();
}
