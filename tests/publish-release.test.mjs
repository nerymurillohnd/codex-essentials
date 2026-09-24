import assert from "node:assert/strict";
import test from "node:test";
import {
  assertInitialReleases,
  releasePackage,
} from "../scripts/publish-release.mjs";

const headSha = "1111111111111111111111111111111111111111";
const oldSha = "2222222222222222222222222222222222222222";
const tag = "codex-essentials/probe/v0.1.0";
const packageInfo = {
  name: "probe",
  version: "0.1.0",
  changelog:
    "# Changelog\n\n## [0.1.0] - 2026-09-24\n\nInitial Codex package.\n",
};

function apiState({ tagSha = null, release = null } = {}) {
  const calls = [];
  return {
    calls,
    async readTag(value) {
      calls.push(["readTag", value]);
      return tagSha;
    },
    async readRelease(value) {
      calls.push(["readRelease", value]);
      return release;
    },
    async verifyTag(value, sha, name, version) {
      calls.push(["verifyTag", value, sha, name, version]);
    },
    async createTag(value, sha) {
      calls.push(["createTag", value, sha]);
    },
    async createRelease(value, sha, notes) {
      calls.push(["createRelease", value, sha, notes]);
    },
  };
}

test("dry run reports first release without writing a tag or release", async () => {
  const api = apiState();
  const result = await releasePackage({
    packageInfo,
    headSha,
    bootstrap: true,
    apply: false,
    api,
  });
  assert.equal(result.tag, tag);
  assert.equal(result.createTag, true);
  assert.equal(result.createRelease, true);
  assert.deepEqual(api.calls, [
    ["readTag", tag],
    ["readRelease", tag],
  ]);
});

test("bootstrap apply creates tag before release with changelog notes", async () => {
  const api = apiState();
  await releasePackage({
    packageInfo,
    headSha,
    bootstrap: true,
    apply: true,
    api,
  });
  assert.deepEqual(api.calls.slice(-2), [
    ["createTag", tag, headSha],
    ["createRelease", tag, headSha, "Initial Codex package."],
  ]);
});

test("retry creates only the missing release for an existing tag", async () => {
  const api = apiState({ tagSha: oldSha });
  await releasePackage({
    packageInfo,
    headSha,
    bootstrap: false,
    apply: true,
    api,
  });
  assert.deepEqual(api.calls.slice(-2), [
    ["verifyTag", tag, oldSha, "probe", "0.1.0"],
    ["createRelease", tag, oldSha, "Initial Codex package."],
  ]);
});

test("a conflicting bootstrap tag aborts before any write", async () => {
  const api = apiState({ tagSha: oldSha });
  await assert.rejects(
    releasePackage({ packageInfo, headSha, bootstrap: true, apply: true, api }),
    /wrong SHA|conflict/i,
  );
  assert.equal(
    api.calls.some(([method]) => method.startsWith("create")),
    false,
  );
});

test("ordinary publication requires a complete initial tag and release", async () => {
  const complete = apiState({
    tagSha: oldSha,
    release: { tagName: tag, targetSha: oldSha },
  });
  await assert.doesNotReject(assertInitialReleases(complete, ["probe"]));

  const missingRelease = apiState({ tagSha: oldSha });
  await assert.rejects(
    assertInitialReleases(missingRelease, ["probe"]),
    /bootstrap.*incomplete/i,
  );
  assert.equal(
    missingRelease.calls.some(([method]) => method.startsWith("create")),
    false,
  );

  const conflictingRelease = apiState({
    tagSha: oldSha,
    release: { tagName: tag, targetSha: headSha },
  });
  await assert.rejects(
    assertInitialReleases(conflictingRelease, ["probe"]),
    /bootstrap.*incomplete/i,
  );
});
