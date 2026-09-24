import assert from "node:assert/strict";
import { test } from "node:test";
import { assertExpectedPackages } from "../scripts/launch-contract.mjs";

const ids = [
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
];

const products = ids.map((name) => ({ name, version: "0.1.0" }));

test("accepts exactly the approved first-version product inventory", () => {
  assert.doesNotThrow(() => assertExpectedPackages(products));
});

test("rejects missing, extra, and old-version products", () => {
  assert.throws(
    () => assertExpectedPackages(products.slice(1)),
    /missing=agents-md-master/,
  );
  assert.throws(
    () =>
      assertExpectedPackages([
        ...products,
        { name: "unexpected", version: "0.1.0" },
      ]),
    /extra=unexpected/,
  );
  assert.throws(
    () =>
      assertExpectedPackages(
        products.map((item) =>
          item.name === "live-research" ? { ...item, version: "0.2.0" } : item,
        ),
      ),
    /live-research: expected first version 0.1.0/,
  );
});
