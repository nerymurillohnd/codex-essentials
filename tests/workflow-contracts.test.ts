import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import { describe, expect, it } from "vitest";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const workflowsRoot = path.join(repositoryRoot, ".github", "workflows");
const checkoutActionSha = "3d3c42e5aac5ba805825da76410c181273ba90b1";
const setupNodeActionSha = "820762786026740c76f36085b0efc47a31fe5020";
const dependencyReviewActionSha = "a1d282b36b6f3519aa1f3fc636f609c47dddb294";
const codeqlActionSha = "cdf488f595d80d6e07e03d4674febd5ab45fa938";
const actionlintActionSha = "914e7df21a07ef503a81201c76d2b11c789d3fca";
const fullShaActionReference = /uses:\s+[^@\s]+@[0-9a-f]{40}(?:\s|$)/u;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new TypeError(`${label} must contain an object`);
  }
  return value;
}

function asArray(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new TypeError(`${label} must contain an array`);
  }
  return value;
}

function readWorkflow(fileName: string): string {
  return fs.readFileSync(path.join(workflowsRoot, fileName), "utf8");
}

function parseWorkflow(fileName: string): Record<string, unknown> {
  return asRecord(YAML.parse(readWorkflow(fileName)) as unknown, fileName);
}

function workflowJobs(
  workflow: Record<string, unknown>,
): Record<string, unknown> {
  return asRecord(workflow["jobs"], "workflow jobs");
}

function jobSteps(
  job: Record<string, unknown>,
  jobName: string,
): Record<string, unknown>[] {
  return asArray(job["steps"], `${jobName} steps`).map((step, index) =>
    asRecord(step, `${jobName} step ${index}`),
  );
}

function stepUses(steps: readonly Record<string, unknown>[]): string[] {
  return steps
    .map((step) => step["uses"])
    .filter((value): value is string => typeof value === "string");
}

function stepRuns(steps: readonly Record<string, unknown>[]): string[] {
  return steps
    .map((step) => step["run"])
    .filter((value): value is string => typeof value === "string");
}

function stepIndexByName(
  steps: readonly Record<string, unknown>[],
  stepName: string,
): number {
  const index = steps.findIndex((step) => step["name"] === stepName);
  expect(index).toBeGreaterThanOrEqual(0);
  return index;
}

function expectFullShaPins(workflowText: string): void {
  for (const line of workflowText.split(/\r?\n/u)) {
    if (line.trim().startsWith("uses:")) {
      expect(line).toMatch(fullShaActionReference);
    }
  }
}

function expectNodeSetup(steps: readonly Record<string, unknown>[]): void {
  const uses = stepUses(steps);
  const setupNodeStep = asRecord(
    steps.find(
      (step) => step["uses"] === `actions/setup-node@${setupNodeActionSha}`,
    ),
    "setup-node step",
  );
  const setupNodeWith = asRecord(setupNodeStep["with"], "setup-node with");

  expect(uses).toContain(`actions/checkout@${checkoutActionSha}`);
  expect(uses).toContain(`actions/setup-node@${setupNodeActionSha}`);
  expect(setupNodeWith["node-version"]).toBe("24");
  expect(setupNodeWith["cache"]).toBe("npm");
}

describe("quality workflow contract", () => {
  it("runs only safe push and pull request events with read-only permissions", () => {
    const workflow = parseWorkflow("quality.yml");
    const triggers = asRecord(workflow["on"], "quality triggers");
    const permissions = asRecord(
      workflow["permissions"],
      "quality permissions",
    );

    expect(Object.keys(triggers)).toEqual(
      expect.arrayContaining(["push", "pull_request"]),
    );
    expect(triggers).not.toHaveProperty("pull_request_target");
    expect(permissions["contents"]).toBe("read");
  });

  it("pins every action reference to a full commit SHA", () => {
    expectFullShaPins(readWorkflow("quality.yml"));
  });

  it("defines independent executable quality gates on Node.js 24", () => {
    const workflow = parseWorkflow("quality.yml");
    const jobs = workflowJobs(workflow);
    const executableJobs = [
      ["format", "npm run format:check"],
      ["lint", "npm run lint -- --max-warnings=0"],
      ["typecheck-native", "npm run typecheck"],
      ["typecheck-scripts", "npm run typecheck:scripts"],
      ["typecheck-compatibility", "npx tsc6 --noEmit"],
      ["test", "npm test"],
      ["validate-manifests", "npm run validate:all"],
    ] as const;

    for (const [jobName, expectedCommand] of executableJobs) {
      const job = asRecord(jobs[jobName], `${jobName} job`);
      const steps = jobSteps(job, jobName);
      const runs = stepRuns(steps);

      expectNodeSetup(steps);
      expect(runs).toContain("npm ci");
      expect(runs).toContain(expectedCommand);
    }

    expect(asRecord(workflow["env"], "quality env")["HUSKY"]).toBe("0");
  });

  it("exposes a stable required aggregator that fails on red gates", () => {
    const workflow = parseWorkflow("quality.yml");
    const requiredJob = asRecord(
      workflowJobs(workflow)["required"],
      "required job",
    );

    expect(requiredJob["if"]).toBe("${{ always() }}");
    expect(requiredJob["needs"]).toEqual([
      "format",
      "lint",
      "typecheck-native",
      "typecheck-scripts",
      "typecheck-compatibility",
      "test",
      "validate-manifests",
    ]);
    const requiredRun = jobSteps(requiredJob, "required")
      .map((step) => step["run"])
      .find((run): run is string => typeof run === "string");
    expect(requiredRun).toContain("needs.format.result");
    expect(requiredRun).toContain("needs.lint.result");
    expect(requiredRun).toContain("needs.typecheck-native.result");
    expect(requiredRun).toContain("needs.typecheck-scripts.result");
    expect(requiredRun).toContain("needs.typecheck-compatibility.result");
    expect(requiredRun).toContain("needs.test.result");
    expect(requiredRun).toContain("needs.validate-manifests.result");
    expect(requiredRun).toContain("exit 1");
  });
});

describe("documentation workflow contract", () => {
  it("runs only on pull request document changes with minimal permissions", () => {
    const workflow = parseWorkflow("documentation-gate.yml");
    const triggers = asRecord(workflow["on"], "documentation triggers");
    const pullRequest = asRecord(
      triggers["pull_request"],
      "documentation pull_request trigger",
    );
    const permissions = asRecord(
      workflow["permissions"],
      "documentation permissions",
    );

    expect(pullRequest["types"]).toEqual(["opened", "synchronize", "reopened"]);
    expect(triggers).not.toHaveProperty("pull_request_target");
    expect(permissions).toEqual({ contents: "read" });
  });

  it("pins documentation workflow actions and disables Husky in CI", () => {
    const workflow = parseWorkflow("documentation-gate.yml");
    const documentationJob = asRecord(
      workflowJobs(workflow)["documentation"],
      "documentation job",
    );
    const steps = jobSteps(documentationJob, "documentation");
    const checkoutStep = asRecord(
      steps.find(
        (step) => step["uses"] === `actions/checkout@${checkoutActionSha}`,
      ),
      "documentation checkout step",
    );
    const checkoutWith = asRecord(
      checkoutStep["with"],
      "documentation checkout with",
    );
    const runs = stepRuns(steps);

    expectFullShaPins(readWorkflow("documentation-gate.yml"));
    expect(asRecord(workflow["env"], "documentation env")["HUSKY"]).toBe("0");
    expectNodeSetup(steps);
    expect(checkoutWith["fetch-depth"]).toBe(0);
    expect(runs).toContain("npm ci");
    expect(runs).toContain("npm run validate:all");
    expect(runs).toContain(
      'npm run documentation:gate -- --base "$BASE_SHA" --head "$HEAD_SHA"',
    );
    const jobEnv = asRecord(documentationJob["env"], "documentation job env");
    expect(jobEnv["BASE_SHA"]).toBe(
      "${{ github.event.pull_request.base.sha }}",
    );
    expect(jobEnv["HEAD_SHA"]).toBe(
      "${{ github.event.pull_request.head.sha }}",
    );
  });
});

describe("security workflow contract", () => {
  it("runs safe events with read-only default permissions", () => {
    const workflow = parseWorkflow("security.yml");
    const triggers = asRecord(workflow["on"], "security triggers");
    const permissions = asRecord(
      workflow["permissions"],
      "security permissions",
    );

    expect(Object.keys(triggers)).toEqual(
      expect.arrayContaining(["push", "pull_request"]),
    );
    expect(triggers).not.toHaveProperty("pull_request_target");
    expect(permissions).toEqual({ contents: "read" });
  });

  it("pins every security workflow action to a full commit SHA", () => {
    expectFullShaPins(readWorkflow("security.yml"));
  });

  it("scopes dependency review to pull requests without secrets", () => {
    const workflow = parseWorkflow("security.yml");
    const dependencyReviewJob = asRecord(
      workflowJobs(workflow)["dependency-review"],
      "dependency-review job",
    );
    const permissions = asRecord(
      dependencyReviewJob["permissions"],
      "dependency-review permissions",
    );
    const uses = stepUses(jobSteps(dependencyReviewJob, "dependency-review"));

    expect(dependencyReviewJob["if"]).toBe(
      "${{ github.event_name == 'pull_request' }}",
    );
    expect(permissions).toEqual({
      contents: "read",
      "pull-requests": "read",
    });
    expect(uses).toContain(`actions/checkout@${checkoutActionSha}`);
    expect(uses).toContain(
      `actions/dependency-review-action@${dependencyReviewActionSha}`,
    );
    expect(readWorkflow("security.yml")).not.toContain("secrets.");
  });

  it("runs CodeQL with only the security-events write permission", () => {
    const workflow = parseWorkflow("security.yml");
    const codeqlJob = asRecord(workflowJobs(workflow)["codeql"], "codeql job");
    const permissions = asRecord(
      codeqlJob["permissions"],
      "codeql permissions",
    );
    const uses = stepUses(jobSteps(codeqlJob, "codeql"));

    expect(permissions).toEqual({
      contents: "read",
      "security-events": "write",
    });
    expect(uses).toContain(`actions/checkout@${checkoutActionSha}`);
    expect(uses).toContain(`github/codeql-action/init@${codeqlActionSha}`);
    expect(uses).toContain(`github/codeql-action/analyze@${codeqlActionSha}`);
  });

  it("lints GitHub Actions workflows with actionlint", () => {
    const workflow = parseWorkflow("security.yml");
    const workflowLintJob = asRecord(
      workflowJobs(workflow)["workflow-lint"],
      "workflow-lint job",
    );
    const uses = stepUses(jobSteps(workflowLintJob, "workflow-lint"));

    expect(uses).toContain(`actions/checkout@${checkoutActionSha}`);
    expect(uses).toContain(`rhysd/actionlint@${actionlintActionSha}`);
  });
});

describe("plugin release workflow contract", () => {
  it("accepts manual and plugin tag triggers only", () => {
    const workflow = parseWorkflow("plugin-release.yml");
    const triggers = asRecord(workflow["on"], "release triggers");
    const workflowDispatch = asRecord(
      triggers["workflow_dispatch"],
      "release workflow_dispatch trigger",
    );
    const push = asRecord(triggers["push"], "release push trigger");
    const inputs = asRecord(workflowDispatch["inputs"], "release inputs");
    const tagInput = asRecord(inputs["tag"], "release tag input");

    expect(push["tags"]).toEqual(["plugin/**/v*"]);
    expect(tagInput["required"]).toBe(true);
    expect(tagInput["type"]).toBe("string");
    expect(triggers).not.toHaveProperty("pull_request");
    expect(triggers).not.toHaveProperty("pull_request_target");
  });

  it("pins every release workflow action to a full commit SHA", () => {
    expectFullShaPins(readWorkflow("plugin-release.yml"));
  });

  it("validates releases with read-only permissions before any write", () => {
    const workflow = parseWorkflow("plugin-release.yml");
    const jobs = workflowJobs(workflow);
    const validateJob = asRecord(jobs["validate"], "release validate job");
    const steps = jobSteps(validateJob, "release validate");
    const checkoutStep = asRecord(
      steps.find(
        (step) => step["uses"] === `actions/checkout@${checkoutActionSha}`,
      ),
      "release validate checkout step",
    );
    const permissions = asRecord(
      validateJob["permissions"],
      "release validate permissions",
    );
    const runs = stepRuns(steps);

    expect(asRecord(workflow["permissions"], "release permissions")).toEqual({
      contents: "read",
    });
    expect(asRecord(workflow["env"], "release env")["HUSKY"]).toBe("0");
    expect(permissions).toEqual({ contents: "read" });
    expect(
      asRecord(checkoutStep["with"], "release validate checkout with")[
        "fetch-depth"
      ],
    ).toBe(0);
    expect(
      asRecord(checkoutStep["with"], "release validate checkout with")["ref"],
    ).toBe("refs/tags/${{ env.RELEASE_TAG }}");
    expectNodeSetup(steps);
    expect(runs).toEqual(
      expect.arrayContaining([
        "npm ci",
        "npm run validate:all",
        'npm run validate:release -- "$RELEASE_TAG"',
        "npm pack --dry-run",
      ]),
    );
    expect(runs.join("\n")).toContain(
      'git rev-parse "refs/tags/$RELEASE_TAG^{commit}"',
    );
    expect(runs.join("\n")).toContain("previous_release_tag=");
  });

  it("creates only a verified draft release with explicit repository context", () => {
    const workflow = parseWorkflow("plugin-release.yml");
    const draftJob = asRecord(
      workflowJobs(workflow)["draft"],
      "release draft job",
    );
    const permissions = asRecord(
      draftJob["permissions"],
      "release draft permissions",
    );
    const steps = jobSteps(draftJob, "release draft");
    const uses = stepUses(steps);
    const runs = stepRuns(steps).join("\n");
    const env = asRecord(draftJob["env"], "release draft env");

    expect(draftJob["needs"]).toBe("validate");
    expect(draftJob["if"]).toBe("${{ success() }}");
    expect(permissions).toEqual({ contents: "write" });
    expect(env["GH_REPO"]).toBe("${{ github.repository }}");
    expect(env["GH_TOKEN"]).toBe("${{ github.token }}");
    expect(uses).toContain(`actions/checkout@${checkoutActionSha}`);
    expect(runs).toContain('gh release view "$RELEASE_TAG" --repo "$GH_REPO"');
    expect(runs).toContain('git rev-parse "refs/tags/$RELEASE_TAG^{commit}"');
    expect(runs).toContain('"$tag_commit" != "$SOURCE_COMMIT"');
    expect(runs).toContain(
      'gh release create "$RELEASE_TAG" "$PLUGIN_ARCHIVE" --draft --verify-tag',
    );
    expect(runs).toContain('--repo "$GH_REPO"');
    expect(runs).toContain("tar --sort=name");
    expect(runs).toContain('shasum -a 256 "$PLUGIN_ARCHIVE"');
    expect(runs).toContain("Plugin version:");
    expect(runs).toContain("Changelog source: plugins/");
    expect(runs).toContain("Artifact checksum:");
    expect(runs).toContain("Source commit:");
    expect(runs).toContain("Plugin tree:");
    expect(runs).toContain("Rollback:");
  });

  it("does not interpolate generated release content directly into shell", () => {
    const workflow = parseWorkflow("plugin-release.yml");
    const jobs = workflowJobs(workflow);
    const draftSteps = jobSteps(
      asRecord(jobs["draft"], "release draft job"),
      "release draft",
    );
    const draftRuns = stepRuns(draftSteps);

    expect(draftRuns.join("\n")).not.toContain(
      "${{ steps.changelog.outputs.changelog }}",
    );
    expect(draftRuns.join("\n")).not.toMatch(
      /\$\{\{\s*(?:github\.event|steps\.).*?\}\}/u,
    );
  });

  it("checks out the release tag before file-backed draft metadata is created", () => {
    const workflow = parseWorkflow("plugin-release.yml");
    const draftJob = asRecord(
      workflowJobs(workflow)["draft"],
      "release draft job",
    );
    const steps = jobSteps(draftJob, "release draft");
    const checkoutIndex = stepIndexByName(steps, "Check out release tag");
    const archiveIndex = stepIndexByName(steps, "Build release archive");
    const notesIndex = stepIndexByName(steps, "Write release metadata");
    const checkoutStep = asRecord(steps[checkoutIndex], "draft checkout step");
    const checkoutWith = asRecord(checkoutStep["with"], "draft checkout with");

    expect(checkoutIndex).toBeLessThan(archiveIndex);
    expect(checkoutIndex).toBeLessThan(notesIndex);
    expect(checkoutWith["ref"]).toBe("refs/tags/${{ env.RELEASE_TAG }}");
    expect(checkoutWith["fetch-depth"]).toBe(0);
    expect(checkoutWith["persist-credentials"]).toBe(false);
  });

  it("publishes only through the protected release environment", () => {
    const workflow = parseWorkflow("plugin-release.yml");
    const publishJob = asRecord(
      workflowJobs(workflow)["publish"],
      "release publish job",
    );
    const permissions = asRecord(
      publishJob["permissions"],
      "release publish permissions",
    );
    const runs = stepRuns(jobSteps(publishJob, "release publish")).join("\n");

    expect(publishJob["needs"]).toEqual(["validate", "draft"]);
    expect(publishJob["if"]).toBe("${{ success() }}");
    expect(publishJob["environment"]).toBe("release");
    expect(permissions).toEqual({ contents: "write" });
    const env = asRecord(publishJob["env"], "release publish env");
    expect(env["GH_REPO"]).toBe("${{ github.repository }}");
    expect(env["SOURCE_COMMIT"]).toBe(
      "${{ needs.validate.outputs.source_commit }}",
    );
    expect(runs).toContain('git rev-parse "refs/tags/$RELEASE_TAG^{commit}"');
    expect(runs).toContain('"$tag_commit" != "$SOURCE_COMMIT"');
    expect(runs).toContain(
      'gh release edit "$RELEASE_TAG" --draft=false --latest=false --repo "$GH_REPO"',
    );
  });
});
