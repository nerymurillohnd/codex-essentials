import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { readBundledLicense } from "./bundled_licenses.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");
const result = await build({
  absWorkingDir: root,
  entryPoints: {
    server: "plugins/lsp-intelligence/src/entry.ts",
    runtime: "plugins/lsp-intelligence/src/runtime-cli.ts",
  },
  outdir: "plugins/lsp-intelligence/scripts",
  bundle: true,
  // Lower templates without changing literal contents, including upstream code-generation strings.
  supported: { "template-literal": false },
  format: "esm",
  platform: "node",
  target: "node24",
  write: false,
  metafile: true,
  banner: {
    js: 'import { createRequire as __createRequire } from "node:module"; const require = __createRequire(import.meta.url);',
  },
  outExtension: { ".js": ".mjs" },
  legalComments: "inline",
});
for (const file of result.outputFiles) {
  if (check) {
    if ((await readFile(file.path, "utf8")) !== file.text)
      throw new Error(`Stale LSP bundle: ${file.path}`);
  } else {
    await mkdir(dirname(file.path), { recursive: true });
    await writeFile(file.path, file.contents);
  }
}
const packagePaths = new Set();
for (const input of Object.keys(result.metafile.inputs)) {
  const match = /^(node_modules\/(?:@[^/]+\/)?[^/]+)\//.exec(input);
  if (match?.[1]) packagePaths.add(match[1]);
}
let notices =
  "# Third-party notices\n\nGenerated from the dependencies actually included in the runtime bundles.\n\n";
for (const p of [...packagePaths].sort()) {
  const manifest = JSON.parse(await readFile(join(root, p, "package.json"), "utf8"));
  const license = await readBundledLicense(join(root, p), manifest.name);
  notices += `## ${manifest.name} ${manifest.version}\n\n${license.trim()}\n\n`;
}
const noticePath = join(root, "plugins/lsp-intelligence/THIRD_PARTY_NOTICES.md");
notices = `${notices.replace(/[\t ]+$/gm, "").trimEnd()}\n`;
if (check) {
  if ((await readFile(noticePath, "utf8")) !== notices)
    throw new Error("Stale third-party notices");
} else await writeFile(noticePath, notices);
console.log(
  check ? "LSP bundles and licenses are reproducible" : "Built self-contained LSP runtime bundles",
);
