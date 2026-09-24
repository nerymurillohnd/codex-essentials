import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validatePackages } from "./validate-packages.mjs";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const marketplacePath = ".agents/plugins/marketplace.json";
const readmePath = "README.md";
const issueFormsPath = ".github/ISSUE_TEMPLATE";
const startMarker = "generated:plugins:start";
const endMarker = "generated:plugins:end";

function read(path) {
  try {
    return readFileSync(path, "utf8");
  } catch (error) {
    throw new Error(`${path}: cannot read required file: ${error.message}`);
  }
}

function replaceGeneratedBlock(source, content, path) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker);
  if (
    start < 0 ||
    end < 0 ||
    end < start ||
    source.indexOf(startMarker, start + startMarker.length) >= 0 ||
    source.indexOf(endMarker, end + endMarker.length) >= 0
  ) {
    throw new Error(
      `${path}: exactly one ordered generated plugin marker pair is required`,
    );
  }
  const startLineEnd = source.indexOf("\n", start);
  if (startLineEnd < 0)
    throw new Error(`${path}: start marker needs a newline`);
  const endLineStart = source.lastIndexOf("\n", end - 1) + 1;
  return `${source.slice(0, startLineEnd + 1)}${content}${source.slice(endLineStart)}`;
}

function markdownCell(value) {
  return value.replaceAll("|", "\\|").replaceAll(/\s+/g, " ").trim();
}

function renderReadme(source, packages, path) {
  const columns = ["Plugin", "Version", "Summary"];
  const entries = packages.map(({ name, version, manifest }) => {
    const displayName = markdownCell(
      manifest.extensions["com.openai"].interface.displayName,
    );
    const summary = markdownCell(
      manifest.extensions["com.openai"].interface.shortDescription,
    );
    return [`[${displayName}](plugins/${name}/README.md)`, version, summary];
  });
  const widths = columns.map((column, index) =>
    Math.max(column.length, ...entries.map((entry) => entry[index].length)),
  );
  const row = (cells) =>
    `| ${cells.map((cell, index) => cell.padEnd(widths[index])).join(" | ")} |`;
  const rows = [
    "",
    row(columns),
    row(widths.map((width) => "-".repeat(width))),
    ...entries.map(row),
    "",
  ];
  return replaceGeneratedBlock(source, `${rows.join("\n")}\n`, path);
}

function renderIssueForm(source, packages, path) {
  const options = [
    "Marketplace / new plugin",
    ...packages.map(({ name }) => name),
  ];
  const content = options
    .map((option) => `        - ${JSON.stringify(option)}`)
    .join("\n");
  return replaceGeneratedBlock(source, `${content}\n`, path);
}

function plannedOutputs(root, packages) {
  const marketplace = {
    name: "codex-essentials",
    interface: { displayName: "Codex Essentials" },
    plugins: packages.map(({ name, category }) => ({
      name,
      source: { source: "local", path: `./plugins/${name}` },
      policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
      category,
    })),
  };
  const outputs = new Map([
    [marketplacePath, `${JSON.stringify(marketplace, null, 2)}\n`],
    [
      readmePath,
      renderReadme(read(join(root, readmePath)), packages, readmePath),
    ],
  ]);
  const formsRoot = join(root, issueFormsPath);
  if (existsSync(formsRoot)) {
    for (const entry of readdirSync(formsRoot, { withFileTypes: true })) {
      if (!entry.isFile() || !/\.ya?ml$/.test(entry.name)) continue;
      const relativePath = join(issueFormsPath, entry.name);
      const source = read(join(root, relativePath));
      if (source.includes(startMarker) || source.includes(endMarker)) {
        outputs.set(
          relativePath,
          renderIssueForm(source, packages, relativePath),
        );
      }
    }
  }
  return outputs;
}

function writeAtomic(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  if (existsSync(path) && lstatSync(path).isSymbolicLink()) {
    throw new Error(`${path}: generated output must not be a symbolic link`);
  }
  const temporary = `${path}.tmp-${process.pid}`;
  if (existsSync(temporary))
    throw new Error(`${temporary}: temporary output already exists`);
  writeFileSync(temporary, content, { flag: "wx" });
  renameSync(temporary, path);
}

export function buildCatalog(root, { check = false } = {}) {
  const absoluteRoot = resolve(root);
  const packages = validatePackages(absoluteRoot);
  const outputs = plannedOutputs(absoluteRoot, packages);
  for (const [relativePath, expected] of outputs) {
    const path = join(absoluteRoot, relativePath);
    if (check) {
      if (!existsSync(path) || read(path) !== expected) {
        throw new Error(`stale generated output: ${relativePath}`);
      }
    } else if (!existsSync(path) || read(path) !== expected) {
      writeAtomic(path, expected);
    }
  }
  return { packages, outputs: [...outputs.keys()] };
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const check = process.argv.includes("--check");
  const root =
    process.argv.find((argument) => argument.startsWith("--root="))?.slice(7) ??
    repositoryRoot;
  const result = buildCatalog(root, { check });
  process.stdout.write(
    `${check ? "Validated" : "Generated"} ${result.outputs.length} output(s) from ${result.packages.length} package(s).\n`,
  );
}
