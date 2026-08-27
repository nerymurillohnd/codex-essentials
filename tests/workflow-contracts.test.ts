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
  return asRecord(workflow.jobs, "workflow jobs");
}

function jobSteps(
  job: Record<string, unknown>,
  jobName: string,
): Record<string, unknown>[] {
  return asArray(job.steps, `${jobName} steps`).map((step, index) =>
    asRecord(step, `${jobName} step ${index}`),
  );
}

function stepUses(steps: readonly Record<string, unknown>[]): string[] {
  return steps
    .map((step) => step.uses)
    .filter((value): value is string => typeof value === "string");
}

function stepRuns(steps: readonly Record<string, unknown>[]): string[] {
  return steps
    .map((step) => step.run)
    .filter((value): value is string => typeof value === "string");
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
      (step) => step.uses === `actions/setup-node@${setupNodeActionSha}`,
    ),
    "setup-node step",
  );
  const setupNodeWith = asRecord(setupNodeStep.with, "setup-node with");

  expect(uses).toContain(`actions/checkout@${checkoutActionSha}`);
  expect(uses).toContain(`actions/setup-node@${setupNodeActionSha}`);
  expect(setupNodeWith["node-version"]).toBe("24");
  expect(setupNodeWith.cache).toBe("npm");
}

describe("quality workflow contract", () => {
  it("runs only safe push and pull request events with read-only permissions", () => {
    const workflow = parseWorkflow("quality.yml");
    const triggers = asRecord(workflow.on, "quality triggers");
    const permissions = asRecord(workflow.permissions, "quality permissions");

    expect(Object.keys(triggers)).toEqual(
      expect.arrayContaining(["push", "pull_request"]),
    );
    expect(triggers).not.toHaveProperty("pull_request_target");
    expect(permissions.contents).toBe("read");
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

    expect(asRecord(workflow.env, "quality env").HUSKY).toBe("0");
  });

  it("exposes a stable required aggregator that fails on red gates", () => {
    const workflow = parseWorkflow("quality.yml");
    const requiredJob = asRecord(
      workflowJobs(workflow).required,
      "required job",
    );

    expect(requiredJob.if).toBe("${{ always() }}");
    expect(requiredJob.needs).toEqual([
      "format",
      "lint",
      "typecheck-native",
      "typecheck-scripts",
      "typecheck-compatibility",
      "test",
      "validate-manifests",
    ]);
    const requiredRun = jobSteps(requiredJob, "required")
      .map((step) => step.run)
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
    const triggers = asRecord(workflow.on, "documentation triggers");
    const pullRequest = asRecord(
      triggers.pull_request,
      "documentation pull_request trigger",
    );
    const permissions = asRecord(
      workflow.permissions,
      "documentation permissions",
    );

    expect(pullRequest.types).toEqual(["opened", "synchronize", "reopened"]);
    expect(triggers).not.toHaveProperty("pull_request_target");
    expect(permissions).toEqual({ contents: "read" });
  });

  it("pins documentation workflow actions and disables Husky in CI", () => {
    const workflow = parseWorkflow("documentation-gate.yml");
    const documentationJob = asRecord(
      workflowJobs(workflow).documentation,
      "documentation job",
    );
    const steps = jobSteps(documentationJob, "documentation");
    const checkoutStep = asRecord(
      steps.find(
        (step) => step.uses === `actions/checkout@${checkoutActionSha}`,
      ),
      "documentation checkout step",
    );
    const checkoutWith = asRecord(
      checkoutStep.with,
      "documentation checkout with",
    );
    const runs = stepRuns(steps);

    expectFullShaPins(readWorkflow("documentation-gate.yml"));
    expect(asRecord(workflow.env, "documentation env").HUSKY).toBe("0");
    expectNodeSetup(steps);
    expect(checkoutWith["fetch-depth"]).toBe(0);
    expect(runs).toContain("npm ci");
    expect(runs).toContain("npm run validate:all");
    expect(runs).toContain(
      'npm run documentation:gate -- --base "$BASE_SHA" --head "$HEAD_SHA"',
    );
    const jobEnv = asRecord(documentationJob.env, "documentation job env");
    expect(jobEnv.BASE_SHA).toBe("${{ github.event.pull_request.base.sha }}");
    expect(jobEnv.HEAD_SHA).toBe("${{ github.event.pull_request.head.sha }}");
  });
});
