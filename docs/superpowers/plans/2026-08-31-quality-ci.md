# Quality CI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold and verify the single authoritative GitHub Actions quality workflow defined by the approved Quality CI design.

**Architecture:** A semantic Vitest contract test parses `.github/workflows/quality.yml` with the repository's existing `yaml` dependency. The workflow contains one read-only job that delegates repository quality to `npm run check` and adds the PR-only documentation gate with event SHAs passed through quoted environment variables.

**Tech Stack:** GitHub Actions YAML, Node.js 24.20.0 from `.nvmrc`, npm 12.0.2, TypeScript 7/6, Vitest 4, `yaml` 2, Prettier 3, ESLint 10, and actionlint 1.7.12.

**Spec:** `docs/superpowers/specs/2026-08-31-quality-ci-design.md`

## Global Constraints

- Create exactly `.github/workflows/quality.yml` and `tests/quality-workflow.test.ts`; update only `coverage-profiles.ts` plus this execution plan unless verification exposes a real defect.
- Keep one job named `Required quality gates` on `ubuntu-latest` with `timeout-minutes: 15`.
- Trigger on every `pull_request` and on `push` only for `main`.
- Set workflow permissions exactly to `contents: read`; add no write permission or credential.
- Pin `actions/checkout` to `3d3c42e5aac5ba805825da76410c181273ba90b1` (`v7.0.1`) and `actions/setup-node` to `820762786026740c76f36085b0efc47a31fe5020` (`v7.0.0`).
- Read the Node version from `.nvmrc`, enable npm caching from `package-lock.json`, and install with `HUSKY=0 npm ci`.
- Run `npm run check` for both event families and the documentation gate only for pull requests.
- Do not restore release, title, label, scope, packaging, or policy automation.
- Do not change branch protection or any remote state. Do not commit, push, or open a pull request without separate explicit authorization.

---

### Task 1: Establish the semantic workflow contract in RED

**Files:**

- Create: `tests/quality-workflow.test.ts`
- Modify: `coverage-profiles.ts`

**Interfaces:**

- Consumes: `yaml.parse(source: string)` and the approved workflow contract.
- Produces: a focused Vitest suite whose single-test coverage profile is empty because it validates configuration rather than a CJS production module.

- [x] **Step 1: Add the empty coverage profile**

Add the following entry in lexical order to `coverageProfiles`:

```ts
"quality-workflow.test.ts": [],
```

- [x] **Step 2: Write the failing semantic contract test**

Create `tests/quality-workflow.test.ts` with this implementation:

```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";
import { describe, expect, it } from "vitest";

const repositoryRoot = resolve(import.meta.dirname, "..");
const workflowPath = resolve(repositoryRoot, ".github/workflows/quality.yml");
const checkoutAction =
  "actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1";
const setupNodeAction =
  "actions/setup-node@820762786026740c76f36085b0efc47a31fe5020";

interface WorkflowStep {
  name?: string;
  uses?: string;
  run?: string;
  if?: string;
  env?: Record<string, string>;
  with?: Record<string, unknown>;
  "continue-on-error"?: boolean;
}

interface WorkflowJob {
  name?: string;
  "runs-on"?: string;
  "timeout-minutes"?: number;
  steps?: WorkflowStep[];
}

interface Workflow {
  name?: string;
  on?: Record<string, unknown>;
  permissions?: Record<string, string>;
  concurrency?: {
    group?: string;
    "cancel-in-progress"?: boolean;
  };
  jobs?: Record<string, WorkflowJob>;
}

const workflow = parse(readFileSync(workflowPath, "utf8")) as Workflow;

function getOnlyJob(): WorkflowJob {
  const jobs = Object.values(workflow.jobs ?? {});
  expect(jobs).toHaveLength(1);
  return jobs[0]!;
}

function getStep(name: string): WorkflowStep {
  const step = getOnlyJob().steps?.find((candidate) => candidate.name === name);
  expect(step).toBeDefined();
  return step!;
}

describe("quality workflow", () => {
  it("runs for every pull request and pushes only to main", () => {
    expect(workflow.on).toEqual({
      pull_request: null,
      push: { branches: ["main"] },
    });
  });

  it("uses read-only permissions and cancels only superseded runs", () => {
    expect(workflow.permissions).toEqual({ contents: "read" });
    expect(workflow.concurrency).toEqual({
      group:
        "${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}",
      "cancel-in-progress": true,
    });
  });

  it("defines one stable bounded quality job", () => {
    expect(getOnlyJob()).toMatchObject({
      name: "Required quality gates",
      "runs-on": "ubuntu-latest",
      "timeout-minutes": 15,
    });
  });

  it("pins checkout and Node setup with deterministic inputs", () => {
    expect(getStep("Check out repository")).toMatchObject({
      uses: checkoutAction,
      with: { "fetch-depth": 0 },
    });
    expect(getStep("Set up Node.js")).toMatchObject({
      uses: setupNodeAction,
      with: {
        "node-version-file": ".nvmrc",
        cache: "npm",
        "cache-dependency-path": "package-lock.json",
      },
    });
  });

  it("installs locked dependencies and always runs the canonical gate", () => {
    expect(getStep("Install dependencies")).toMatchObject({
      run: "HUSKY=0 npm ci",
    });
    const qualityStep = getStep("Run quality checks");
    expect(qualityStep.run).toBe("npm run check");
    expect(qualityStep).not.toHaveProperty("if");
  });

  it("runs the documentation gate only with quoted pull request SHAs", () => {
    expect(getStep("Run plugin documentation gate")).toMatchObject({
      if: "github.event_name == 'pull_request'",
      env: {
        BASE_SHA: "${{ github.event.pull_request.base.sha }}",
        HEAD_SHA: "${{ github.event.pull_request.head.sha }}",
      },
      run: 'npm run documentation:gate -- --base "$BASE_SHA" --head "$HEAD_SHA"',
    });
  });

  it("allows no step to hide a failure", () => {
    for (const step of getOnlyJob().steps ?? []) {
      expect(step).not.toHaveProperty("continue-on-error");
    }
  });
});
```

The production change that makes this suite pass is the addition of the workflow with the approved semantics. Wrong triggers, permissions, SHAs, action pins, job topology, cache inputs, commands, conditions, or failure masking each break a consumer-visible CI contract.

- [x] **Step 3: Run the focused test and verify RED**

Run:

```bash
npx vitest run tests/quality-workflow.test.ts
```

Expected: FAIL before test collection with `ENOENT` for `.github/workflows/quality.yml`. This is the intended failure because the implementation artifact is absent, not because of a TypeScript or fixture error.

---

### Task 2: Implement the single quality workflow and reach GREEN

**Files:**

- Create: `.github/workflows/quality.yml`
- Test: `tests/quality-workflow.test.ts`

**Interfaces:**

- Consumes: GitHub `pull_request`/`push` event context, `.nvmrc`, `package-lock.json`, and npm scripts `check` plus `documentation:gate`.
- Produces: one check named `Required quality gates`; PR runs receive both gates while `main` pushes receive `npm run check` only.

- [x] **Step 1: Add the minimal workflow**

Create `.github/workflows/quality.yml` with:

```yaml
name: Quality

on:
  pull_request:
  push:
    branches:
      - main

permissions:
  contents: read

concurrency:
  group: ${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    name: Required quality gates
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - name: Check out repository
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          fetch-depth: 0

      - name: Set up Node.js
        uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version-file: .nvmrc
          cache: npm
          cache-dependency-path: package-lock.json

      - name: Install dependencies
        run: HUSKY=0 npm ci

      - name: Run quality checks
        run: npm run check

      - name: Run plugin documentation gate
        if: github.event_name == 'pull_request'
        env:
          BASE_SHA: ${{ github.event.pull_request.base.sha }}
          HEAD_SHA: ${{ github.event.pull_request.head.sha }}
        run: npm run documentation:gate -- --base "$BASE_SHA" --head "$HEAD_SHA"
```

- [x] **Step 2: Run the focused test and verify GREEN**

Run:

```bash
npx vitest run tests/quality-workflow.test.ts
```

Expected: 1 test file and 7 tests pass with exit code 0.

- [x] **Step 3: Validate GitHub Actions syntax and shell semantics**

Run:

```bash
actionlint .github/workflows/quality.yml
```

Expected: exit code 0 and no diagnostics. `actionlint` also invokes its available shell checker for `run` blocks.

---

### Task 3: Verify the complete change and acceptance criteria

**Files:**

- Verify: `.github/workflows/quality.yml`
- Verify: `tests/quality-workflow.test.ts`
- Verify: `coverage-profiles.ts`
- Verify: `docs/superpowers/plans/2026-08-31-quality-ci.md`

**Interfaces:**

- Consumes: the completed Tasks 1 and 2 deliverables.
- Produces: fresh local evidence for formatting, linting, both TypeScript compilers, focused behavior, coverage, marketplace validation, workflow linting, and repository diff scope.

- [x] **Step 1: Format the authored files**

Run:

```bash
npx prettier --write .github/workflows/quality.yml tests/quality-workflow.test.ts coverage-profiles.ts docs/superpowers/plans/2026-08-31-quality-ci.md
```

Expected: exit code 0. Review the diff after formatting; formatting must not change workflow semantics.

- [x] **Step 2: Run every validation command required by the specification**

Run each command separately and require exit code 0:

```bash
npx vitest run tests/quality-workflow.test.ts
npm run format:check
npm run lint -- --max-warnings=0
npm run typecheck
npm run check
actionlint .github/workflows/quality.yml
```

- [x] **Step 3: Run the documentation gate over the actual branch range**

Run:

```bash
npm run documentation:gate -- --base origin/main --head HEAD
```

Expected: exit code 0. This change does not modify a plugin package, so the gate must accept the range without demanding plugin README or changelog changes.

- [x] **Step 4: Prove the contract rejects a permissions regression**

Temporarily change the workflow permission from `contents: read` to
`contents: write`, run the focused test, and require the permissions test to
fail with the semantic mismatch. Restore `contents: read` immediately and run
the focused test again, requiring all 7 tests to pass. Do not continue until
`git diff --check` confirms the restored workflow has no malformed patch.

- [x] **Step 5: Audit scope and invariants**

Run:

```bash
git diff --check origin/main...HEAD
git diff --check
git status --short --branch
git ls-files --others --exclude-standard
git diff --stat origin/main
git diff --name-status origin/main
```

Expected before any separately authorized commit: `git log origin/main..HEAD`
shows the approved spec commit, while `git status` and the untracked-file
inventory show only the plan, workflow, contract test, and coverage-profile
changes. The `git diff` commands cover tracked paths only; they must not be
treated as proof about untracked files. No plugin, catalog, release,
credential, or branch-protection artifact is modified.

- [x] **Step 6: Record the remote-validation boundary**

Do not claim the acceptance criterion for a successful remote `Required quality gates` check until a separately authorized push and pull request exist and GitHub reports the check successful. Local completion is necessary but not sufficient for that final remote criterion.

---

### Task 4: Close independent review contract gaps

**Files:**

- Modify: `tests/quality-workflow.test.ts`
- Modify: `docs/superpowers/plans/2026-08-31-quality-ci.md`

**Interfaces:**

- Consumes: the independent review of `origin/main..52f03d3`.
- Produces: regression coverage for exact step topology and job-level failure behavior, plus an accurate scope-audit description.

- [x] **Step 1: Assert the exact ordered step topology**

Require the five approved steps in their exact order and reject any additional
`uses` or `run` step.

- [x] **Step 2: Reject job-level failure hiding and skip conditions**

Require the only job to omit both `continue-on-error` and `if`, in addition to
the existing step-level `continue-on-error` prohibition.

- [x] **Step 3: Prove the new assertions with controlled mutations**

Temporarily add an extra workflow step and require the topology test to fail.
After restoring it, separately add job-level `continue-on-error: true` and a
job-level `if` condition, requiring the failure-behavior test to fail for each
mutation. Restore the workflow and require all focused tests plus
`git diff --check` to pass.

- [x] **Step 4: Correct the plan scope-audit evidence description**

Attribute commit history to `git log origin/main..HEAD`; use `git status` and
the untracked-file inventory only for working-tree paths.
