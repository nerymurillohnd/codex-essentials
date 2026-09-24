import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const hook = new URL(
  "../plugins/block-no-verify/hooks/block-no-verify.py",
  import.meta.url,
);

function decision(command) {
  const result = spawnSync("python3", [hook.pathname], {
    input: JSON.stringify({ tool_input: { command } }),
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout === ""
    ? null
    : JSON.parse(result.stdout).hookSpecificOutput?.permissionDecision;
}

test("denies direct Git verification bypasses", () => {
  assert.equal(decision("git commit --no-verify -m test"), "deny");
  assert.equal(decision("git commit -n -m test"), "deny");
  assert.equal(decision("git -c user.name=Example commit -an -m test"), "deny");
  assert.equal(decision("git commit -nm test"), "deny");
  assert.equal(decision("/usr/bin/git commit --no-gpg-sign -m test"), "deny");
  assert.equal(decision("git -c commit.gpgsign=false commit -m test"), "deny");
  assert.equal(decision("git status; git commit --no-verify -m test"), "deny");
});

test("does not attribute later non-Git arguments to an earlier Git command", () => {
  assert.equal(decision("git status; printf '%s' --no-verify"), null);
  assert.equal(decision("git status && echo --no-gpg-sign"), null);
  assert.equal(decision("git status\necho --no-verify"), null);
  assert.equal(decision("git merge -n feature"), null);
  assert.equal(decision("git commit -m '-n'"), null);
});
