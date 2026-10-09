import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { readBundledLicense } from "../../scripts/bundled_licenses.mjs";

test("discovers actual mixed-case license filenames and refuses packages without a license", async () => {
  const root = await mkdtemp(join(tmpdir(), "lsp-license-"));
  try {
    await writeFile(join(root, "license"), "MIT license fixture\n");
    assert.equal(await readBundledLicense(root, "fixture"), "MIT license fixture\n");
    await rm(join(root, "license"));
    await writeFile(join(root, "License.MD"), "Apache license fixture\n");
    assert.equal(await readBundledLicense(root, "fixture"), "Apache license fixture\n");
    await rm(join(root, "License.MD"));
    await writeFile(join(root, "NOTLICENSE"), "Not a license\n");
    await assert.rejects(readBundledLicense(root, "fixture"), /no license file: fixture/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
