import assert from "node:assert/strict";
import test from "node:test";
import {
  planPackageRelease,
  releaseNotes,
  tagFor,
} from "../scripts/release-plan.mjs";

const headSha = "1111111111111111111111111111111111111111";
const oldSha = "2222222222222222222222222222222222222222";

test("new release tags live in a namespace distinct from historical tags", () => {
  assert.equal(
    tagFor("agents-md-master", "0.1.0"),
    "codex-essentials/agents-md-master/v0.1.0",
  );
});

test("extracts only the current version section for release notes", () => {
  const changelog = [
    "# Changelog",
    "",
    "## [Unreleased]",
    "",
    "## [0.1.0] - 2026-09-24",
    "",
    "### Added",
    "",
    "- New Codex workflow.",
    "",
    "## [0.0.1] - 2026-09-01",
    "",
    "Historical line.",
    "",
  ].join("\n");
  assert.equal(
    releaseNotes(changelog, "0.1.0"),
    "### Added\n\n- New Codex workflow.",
  );
  assert.throws(() => releaseNotes(changelog, "0.2.0"), /0\.2\.0/);
});

test("bootstraps an absent first release at the qualified main SHA", () => {
  assert.deepEqual(
    planPackageRelease({
      name: "agents-md-master",
      version: "0.1.0",
      headSha,
      bootstrap: true,
      tagSha: null,
      release: null,
    }),
    {
      tag: "codex-essentials/agents-md-master/v0.1.0",
      targetSha: headSha,
      createTag: true,
      createRelease: true,
    },
  );
});

test("rejects a bootstrap tag that points at another commit", () => {
  assert.throws(
    () =>
      planPackageRelease({
        name: "agents-md-master",
        version: "0.1.0",
        headSha,
        bootstrap: true,
        tagSha: oldSha,
        release: null,
      }),
    /wrong SHA|conflict/i,
  );
});

test("retries a release missing after its immutable tag was created", () => {
  assert.deepEqual(
    planPackageRelease({
      name: "agents-md-master",
      version: "0.1.0",
      headSha,
      bootstrap: false,
      tagSha: oldSha,
      release: null,
    }),
    {
      tag: "codex-essentials/agents-md-master/v0.1.0",
      targetSha: oldSha,
      createTag: false,
      createRelease: true,
    },
  );
});

test("does not re-create a complete existing release", () => {
  assert.deepEqual(
    planPackageRelease({
      name: "agents-md-master",
      version: "0.1.0",
      headSha,
      bootstrap: false,
      tagSha: oldSha,
      release: {
        tagName: "codex-essentials/agents-md-master/v0.1.0",
        targetSha: oldSha,
      },
    }),
    {
      tag: "codex-essentials/agents-md-master/v0.1.0",
      targetSha: oldSha,
      createTag: false,
      createRelease: false,
    },
  );
});

test("normal release requires a version change at the current main commit", () => {
  assert.throws(
    () =>
      planPackageRelease({
        name: "agents-md-master",
        version: "0.2.0",
        previousVersion: "0.2.0",
        headSha,
        bootstrap: false,
        tagSha: null,
        release: null,
      }),
    /version.*unchanged|current commit/i,
  );
});
