import assert from "node:assert/strict";
import test from "node:test";
import { fromJsonSchema } from "@modelcontextprotocol/server";
import { createValidator } from "../../plugins/lsp-intelligence/src/validation.ts";

test("validates Rust unsigned formats instead of dropping them", async () => {
  const validator = createValidator();
  const uint32 = fromJsonSchema({ type: "integer", format: "uint32" }, validator);
  for (const value of [0, 4294967295])
    assert.equal((await uint32["~standard"].validate(value)).issues, undefined);
  for (const value of [-1, 1.5, 4294967296])
    assert.ok((await uint32["~standard"].validate(value)).issues);
  const uint64 = fromJsonSchema({ type: "integer", format: "uint64" }, validator);
  assert.ok((await uint64["~standard"].validate(9007199254740992)).issues);
});
