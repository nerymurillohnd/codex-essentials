import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const names = ["license", "license.md", "license.txt", "license-mit"];

export async function readBundledLicense(directory, packageName) {
  const files = (await readdir(directory)).sort();
  for (const name of names) {
    const actual = files.find((file) => file.toLowerCase() === name);
    if (!actual) continue;
    const text = await readFile(join(directory, actual), "utf8");
    if (text.trim()) return text;
  }
  throw new Error(`Bundled dependency has no license file: ${packageName}`);
}
