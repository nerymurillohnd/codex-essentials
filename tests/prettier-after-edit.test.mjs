import assert from "node:assert/strict";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  collectCandidates,
  formatFile,
  parsePayload,
  resolveContainedFile,
} from "../plugins/prettier-after-edit/hooks/format.mjs";

test("collects only explicit edited-file candidates once", () => {
  const payload = parsePayload(
    JSON.stringify({
      tool_input: {
        file_path: "src/app.ts",
        command:
          "*** Begin Patch\n*** Update File: src/app.ts\n*** Add File: src/new.ts\n*** End Patch",
      },
    }),
  );
  assert.ok(payload);
  assert.deepEqual(collectCandidates(payload), ["src/app.ts", "src/new.ts"]);
});

test("rejects an edited path that escapes the declared cwd", () => {
  const root = mkdtempSync(join(tmpdir(), "prettier-hook-test-"));
  const other = mkdtempSync(join(tmpdir(), "prettier-hook-outside-"));
  try {
    writeFileSync(join(other, "outside.ts"), "const x=1\n");
    symlinkSync(join(other, "outside.ts"), join(root, "linked.ts"));
    assert.equal(resolveContainedFile(root, join(other, "outside.ts")), null);
    assert.equal(resolveContainedFile(root, "linked.ts"), null);
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(other, { recursive: true, force: true });
  }
});

test("formats a contained file with the project API and skips ignored files", async () => {
  const root = mkdtempSync(join(tmpdir(), "prettier-hook-test-"));
  const target = join(root, "sample.ts");
  try {
    writeFileSync(target, "const x=1\n");
    const file = resolveContainedFile(root, "sample.ts");
    assert.ok(file);
    const prettier = {
      resolveConfig: async () => ({}),
      getFileInfo: async () => ({
        ignored: false,
        inferredParser: "typescript",
      }),
      format: async () => "const x = 1;\n",
    };
    assert.deepEqual(await formatFile(prettier, file), { state: "formatted" });
    assert.equal(readFileSync(target, "utf8"), "const x = 1;\n");
    const ignored = {
      ...prettier,
      getFileInfo: async () => ({
        ignored: true,
        inferredParser: "typescript",
      }),
    };
    assert.deepEqual(await formatFile(ignored, file), {
      state: "skipped",
      diagnostic: "ignored",
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
