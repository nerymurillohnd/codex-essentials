# Prettier and Markdownlint After Edit Implementation Plan

**Status:** Superseded

**Superseded by:**
[`docs/superpowers/specs/2026-09-03-prettier-after-edit-only-design.md`](../specs/2026-09-03-prettier-after-edit-only-design.md)

> Historical note: do not execute this plan as current product authority. It
> implemented a combined Prettier and markdownlint-cli2 hook. The current
> approved direction for `plugins/prettier-after-edit` is Prettier-only, with
> Markdownlint left to each target repository's own scripts, hooks, editor
> integration, or CI.

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing `prettier-after-edit` plugin format only edited
files with Prettier, lint edited Markdown with markdownlint-cli2, and report
truthful byte-change and diagnostic outcomes across Codex, CLI, VS Code,
lint-staged, and CI.

**Architecture:** One self-contained Node ESM `PostToolUse` orchestrator replaces
the Bash hook, preserves project-local-first/PATH-fallback tool resolution, and
runs Prettier before markdownlint-cli2 for exact event-reported files. Root
Prettier and markdownlint configuration files own policy; the hook owns only
payload parsing, containment, ordered invocation, hashing, and status reporting.

**Tech Stack:** Node.js `24.20.0`, npm `12.0.2`, Prettier `3.9.6`,
markdownlint-cli2 `0.23.2`, markdownlint `0.41.1`, TypeScript tests, Vitest,
JSONC, Codex `PostToolUse` hooks.

**Spec:**
[`docs/superpowers/specs/2026-08-31-prettier-markdownlint-after-edit-design.md`](../specs/2026-08-31-prettier-markdownlint-after-edit-design.md)

## Global Constraints

- Preserve the plugin identifier `prettier-after-edit`; expose the expanded
  display name `Prettier + Markdownlint After Edit` and version `0.2.0`.
- Keep Node.js at `24.20.0` through `.nvmrc`; markdownlint-cli2 requires Node.js
  `>=22`.
- Pin `prettier` at `3.9.6` and `markdownlint-cli2` at `0.23.2` exactly.
- Use npm only; do not introduce Yarn, pnpm, Corepack, or runtime installs.
- Keep all installed-plugin runtime resources inside
  `plugins/prettier-after-edit`; root dependencies and configuration are
  repository maintenance inputs, not packaged plugin dependencies.
- Keep `prettier.config.cjs` as the sole Prettier option source.
- Use `.markdownlint-cli2.jsonc` as the single rule, glob, ignore, and override
  policy source so CLI2 overrides are not shadowed by a separate config.
- Never edit `.agents/plugins/marketplace.json` by hand; regenerate it with
  `npm run marketplace:build` after manifest changes.
- Update the plugin README, changelog, skill, agent metadata, manifest, and root
  README in the same behavioral change.
- Preserve unrelated working-tree changes. The initial dirty paths are
  `README.md`, `package.json`, and `package-lock.json`; the dependency install is
  an implementation input and the deliberate README content must move into
  disposable test fixtures before removal.
- Do not commit, push, create a pull request, merge, release, tag, or clean
  remote state without separate explicit authorization. Commit steps below are
  conditional execution checkpoints.
- At execution start, use `superpowers:using-git-worktrees` only after deciding
  how the current dirty diff will be carried; never discard or overwrite it.
- Apply Prettier immediately after each authored-file edit. Run the full
  verification gate before any completion claim.

---

### Task 1: Establish the shared Markdown policy and dependency contract

**Files:**

- Create: `.markdownlint-cli2.jsonc`
- Modify: `package.json:10-64`
- Modify: `package-lock.json`
- Create: `tests/markdownlint-configuration.test.ts`

**Interfaces:**

- Consumes: project-local `node_modules/.bin/markdownlint-cli2` and
  `node_modules/markdownlint/style/prettier.json`.
- Produces: one unified policy file consumed by CLI2, VS Code, repository
  scripts, and hook discovery; `lint:markdown` and `lint:markdown:fix` npm
  commands.

- [ ] **Step 1: Write the failing configuration contract test**

Create `tests/markdownlint-configuration.test.ts` with these assertions:

```ts
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const repositoryRoot = resolve(import.meta.dirname, "..");
const cli = resolve(repositoryRoot, "node_modules/.bin/markdownlint-cli2");
const ruleConfig = resolve(repositoryRoot, ".markdownlint-cli2.jsonc");
const roots: string[] = [];

function lint(source: string) {
  const root = mkdtempSync(join(tmpdir(), "markdownlint-config-"));
  roots.push(root);
  const target = join(root, "README.md");
  writeFileSync(target, source);
  return spawnSync(cli, ["--config", ruleConfig, "--no-globs", `:${target}`], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
}

function lintExisting(relativePath: string) {
  return spawnSync(
    cli,
    ["--config", ruleConfig, "--no-globs", `:${relativePath}`],
    {
      cwd: repositoryRoot,
      encoding: "utf8",
    },
  );
}

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("markdownlint repository configuration", () => {
  it("does not enforce Prettier-owned line length", () => {
    const result = lint(`# Title\n\n${"x".repeat(120)}\n`);
    expect(result.status, result.stderr).toBe(0);
  });

  it("allows the repository's intentional details markup", () => {
    const result = lint(
      "# Title\n\n<details>\n<summary>More</summary>\n\nText\n</details>\n",
    );
    expect(result.status, result.stderr).toBe(0);
  });

  it("rejects a second top-level heading", () => {
    const result = lint("# Title\n\n# Deliberate formatting error **\n");
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("MD025/single-title");
  });

  it("applies the license override", () => {
    const result = lintExisting("plugins/prettier-after-edit/LICENSE.md");
    expect(result.status, result.stderr).toBe(0);
  });

  it("applies the ADR template overrides", () => {
    const result = lintExisting("docs/decisions/adr-template.md");
    expect(result.status, result.stderr).toBe(0);
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npx vitest run tests/markdownlint-configuration.test.ts
```

Expected: FAIL because `.markdownlint-cli2.jsonc` does not exist.

- [ ] **Step 3: Add the exact unified CLI2 configuration**

Create `.markdownlint-cli2.jsonc`:

```jsonc
{
  "$schema": "https://raw.githubusercontent.com/DavidAnson/markdownlint-cli2/v0.23.2/schema/markdownlint-cli2-config-schema.json",
  "config": {
    "extends": "markdownlint/style/prettier",
    "MD024": {
      "siblings_only": true,
    },
    "MD033": {
      "allowed_elements": ["br", "details", "summary"],
    },
  },
  "globs": ["**/*.md", "**/*.markdown"],
  "gitignore": true,
  "overrides": [
    {
      "filter": ["**/LICENSE.md", "templates/LICENSE-reusable-template.md"],
      "combine": "merge",
      "config": {
        "MD036": false,
      },
    },
    {
      "filter": ["docs/decisions/adr-template.md", "templates/adr-template.md"],
      "combine": "merge",
      "config": {
        "MD026": false,
        "MD041": false,
      },
    },
  ],
}
```

- [ ] **Step 4: Pin markdownlint-cli2 and expose focused scripts**

Run:

```bash
npm install --save-dev --save-exact markdownlint-cli2@0.23.2
```

Set these exact `package.json` scripts without adding markdownlint to `check`
yet:

```json
"lint:markdown": "markdownlint-cli2",
"lint:markdown:fix": "markdownlint-cli2 --fix"
```

Expected dependency entry:

```json
"markdownlint-cli2": "0.23.2"
```

- [ ] **Step 5: Format the authored configuration and test**

Run:

```bash
node_modules/.bin/prettier --write .markdownlint-cli2.jsonc package.json tests/markdownlint-configuration.test.ts
```

- [ ] **Step 6: Run the focused contract and verify GREEN**

Run:

```bash
npx vitest run tests/markdownlint-configuration.test.ts
```

Expected: 5 tests pass, including real license and ADR override behavior.

- [ ] **Step 7: Record the conditional checkpoint**

After explicit commit authorization only:

```bash
git add .markdownlint-cli2.jsonc package.json package-lock.json tests/markdownlint-configuration.test.ts
git commit -m "chore(markdown): define shared lint policy"
```

### Task 2: Remediate the repository Markdown baseline

**Files:**

- Modify: `README.md:177-186`
- Modify: `docs/audits/2026-08-30-readme-audit-review.md:225-352`
- Modify: `docs/decisions/adr-0005-hooks-and-quality-gates.md:114-121`
- Modify: `docs/decisions/adr-0008-release-please-manifest-releases.md:14-16,79-80`
- Modify: `plugins/astro-cli-commands/README.md:8-10`
- Modify: `plugins/astro-cli-commands/skills/astro-commands/references/commands.md:177-190`
- Modify: `plugins/configure-prettier/README.md:8-12`
- Modify: `plugins/doc-keeper/README.md:8-10`
- Modify: `plugins/optimize-memories/README.md:8-10`
- Modify: `plugins/prettier-after-edit/README.md:8-10`
- Modify: `templates/plugin-README-reusable-template.md:8-10`
- Verify: `docs/audits/2026-08-30-repository-state-review.md`
- Verify: `docs/decisions/adr-template.md`
- Verify: `templates/adr-template.md`
- Verify: `LICENSE.md`
- Verify: `plugins/*/LICENSE.md`
- Verify: `plugins/*/CHANGELOG.md`
- Verify: `plugins/doc-keeper/skills/doc-keeper/outputs/changelog-example.md`
- Verify: `templates/LICENSE-reusable-template.md`
- Verify: `templates/root-README-recommended-template.md`

**Interfaces:**

- Consumes: `.markdownlint-cli2.jsonc` and the current 82-file Markdown corpus.
- Produces: a zero-error baseline that permits adding markdownlint to the
  required quality gate without making `main` permanently red.

- [ ] **Step 1: Capture the policy-specific RED baseline**

Run:

```bash
npm run lint:markdown
```

Expected: exit `1`. The previously observed broad baseline was 115 issues in 25
files before repository-specific `MD024`, `MD033`, and overrides were applied.
Save the complete output in the execution log; do not suppress failures.

- [ ] **Step 2: Apply rule-provided safe fixes**

Run:

```bash
npm run lint:markdown:fix
```

Expected automatic changes include fixable bare URLs and fixable whitespace or
reference issues not owned by Prettier. Review `git diff --check` and
`git diff -- '*.md'` immediately; revert no user change automatically.

- [ ] **Step 3: Remove the deliberate root README artifacts**

Delete only this block from the root `README.md`:

```markdown
# Deliberate formatting error **

| Column A  | Column B  |
| --------- | --------- |
| value one | value two |
```

The table and second-H1 cases are retained as disposable fixtures in Tasks 5
and 6, so removing this block does not remove behavioral coverage.

- [ ] **Step 4: Convert audit pseudo-headings into real nested headings**

Within `docs/audits/2026-08-30-readme-audit-review.md`, replace each standalone
bold label under a `### <file>` section with an H4. Exact conversions:

```markdown
**What works**
```

becomes:

```markdown
#### What works
```

Apply the same conversion to:

```text
What fails or underperforms
Recommended target
Required fixes
Remaining improvements
```

Do not convert inline emphasis or license text.

- [ ] **Step 5: Correct literal placeholders and source links**

In `docs/decisions/adr-0008-release-please-manifest-releases.md`, replace:

```markdown
plugins/<plugin-id>/.codex-plugin/plugin.json
plugin/<plugin-id>/v<semver>
```

with:

```markdown
`plugins/<plugin-id>/.codex-plugin/plugin.json`
`plugin/<plugin-id>/v<semver>`
```

In `docs/decisions/adr-0005-hooks-and-quality-gates.md`, retain every reference
but use Markdown autolink form:

```markdown
- <https://github.com/typicode/husky/releases>
- <https://github.com/typicode/husky/blob/main/docs/get-started.md>
- <https://github.com/typicode/husky/blob/main/docs/how-to.md>
- <https://github.com/lint-staged/lint-staged>
- <https://github.com/prettier/prettier/blob/main/docs/precommit.md>
- <https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0>
```

- [ ] **Step 6: Correct plugin README fragment links**

For the affected plugin READMEs, replace the emoji-dependent requirements link
with the stable child heading:

```markdown
[Requirements](#supported-environments)
```

For `plugins/configure-prettier/README.md` and
`templates/plugin-README-reusable-template.md`, retain the label `Environments`
but use:

```markdown
[Environments](#supported-environments)
```

- [ ] **Step 7: Label the Astro CLI output fence**

In
`plugins/astro-cli-commands/skills/astro-commands/references/commands.md`, change
the output fence at line 179 from ````` to:

````markdown
```text
Astro                    v5.14.1
Vite                     v6.3.6
Node                     v22.17.1
System                   macOS (arm64)
Package Manager          npm
Output                   static
Adapter                  none
Integrations             @astrojs/starlight (v0.35.3)
```
````

- [ ] **Step 8: Run markdownlint and resolve only listed residual classes**

Run:

```bash
npm run lint:markdown
```

Expected residual findings are confined to the paths listed in this task. Apply
only these source-level transformations before the next run:

- Convert a standalone bold section label to the corresponding nested heading.
- Convert a literal placeholder using angle brackets to a code span.
- Add a missing code-fence language matching the actual content (`text`,
  `bash`, `json`, `yaml`, or `markdown`).
- Correct a broken fragment to an existing literal heading anchor.
- Rename a genuinely duplicated sibling heading so its content describes its
  section.

Do not disable another rule or broaden an allowlist. If a new path or rule class
appears, stop and amend the specification and plan before changing it. Expected
final result: exit `0` with no diagnostic lines.

- [ ] **Step 9: Format and verify the remediated Markdown set**

Run:

```bash
node_modules/.bin/prettier --write README.md docs plugins templates
npm run lint:markdown
git diff --check
```

Expected: all three commands exit `0`.

- [ ] **Step 10: Record the conditional checkpoint**

After explicit commit authorization only, stage the exact Markdown paths shown
by `git diff --name-only -- '*.md'` and commit:

```bash
git commit -m "docs(markdown): align content with shared lint policy"
```

### Task 3: Wire markdownlint into repository and editor workflows

**Files:**

- Modify: `package.json:10-64`
- Modify: `.vscode/extensions.json`
- Modify: `.vscode/settings.json:14-24`
- Modify: `tests/markdownlint-configuration.test.ts`

**Interfaces:**

- Consumes: the zero-error baseline from Task 2.
- Produces: read-only `npm run check` enforcement, staged-file-only automatic
  fixes, and VS Code actions that use the checked-in configurations.

- [ ] **Step 1: Add failing workflow assertions**

Append to `tests/markdownlint-configuration.test.ts`:

```ts
it("wires Markdown linting into check after formatting", () => {
  const packageJson = JSON.parse(
    readFileSync(resolve(repositoryRoot, "package.json"), "utf8"),
  ) as {
    scripts: Record<string, string>;
    "lint-staged": Record<string, string[]>;
  };
  expect(packageJson.scripts["check"]).toContain(
    "npm run format:check && npm run lint -- --max-warnings=0 && npm run lint:markdown",
  );
  expect(packageJson["lint-staged"]["*.{md,markdown}"]).toEqual([
    "prettier --write",
    "markdownlint-cli2 --fix --no-globs --",
  ]);
});
```

Run:

```bash
npx vitest run tests/markdownlint-configuration.test.ts
```

Expected: the new assertion fails because `check` and lint-staged are not wired.

- [ ] **Step 2: Add markdownlint to the read-only quality gate**

Set the exact `check` script prefix to:

```text
npm run format:check && npm run lint -- --max-warnings=0 && npm run lint:markdown && npm run typecheck
```

Retain every existing command after `npm run typecheck` in its existing order.

- [ ] **Step 3: Split lint-staged ownership by file type**

Set:

```json
"lint-staged": {
  "*.{js,cjs,mjs}": [
    "eslint --fix --max-warnings=0",
    "prettier --write"
  ],
  "*.{ts,tsx,mts,cts,json,jsonc,yaml,yml}": ["prettier --write"],
  "*.{md,markdown}": [
    "prettier --write",
    "markdownlint-cli2 --fix --no-globs --"
  ]
}
```

- [ ] **Step 4: Align VS Code extensions and save actions**

Set `.vscode/extensions.json` to:

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "DavidAnson.vscode-markdownlint"
  ]
}
```

Set the existing `[markdown]` block in `.vscode/settings.json` to:

```jsonc
"[markdown]": {
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.prettier": "explicit",
    "source.fixAll.markdownlint": "explicit"
  }
}
```

Do not add `markdownlint.config`, `markdownlint.configFile`, or duplicated rule
values.

- [ ] **Step 5: Format and verify the workflow contract**

Run:

```bash
node_modules/.bin/prettier --write package.json .vscode/extensions.json .vscode/settings.json tests/markdownlint-configuration.test.ts
npx vitest run tests/markdownlint-configuration.test.ts
npm run lint:markdown
```

Expected: all commands exit `0` and the focused test reports 4 passing tests.

- [ ] **Step 6: Record the conditional checkpoint**

After explicit commit authorization only:

```bash
git add package.json .vscode/extensions.json .vscode/settings.json tests/markdownlint-configuration.test.ts
git commit -m "chore(markdown): wire linting into local workflows"
```

### Task 4: Build the contained Node hook foundation

**Files:**

- Create: `plugins/prettier-after-edit/hooks/format-and-lint.mjs`
- Modify: `tests/prettier-after-edit-hooks.test.ts`

**Interfaces:**

- Consumes: one Codex hook JSON payload on stdin and event `cwd`.
- Produces: exported pure helpers `parsePayload`, `collectCandidates`,
  `resolveContainedFile`, `findExecutable`, `runCommand`, and `fileDigest`, plus
  an executable `main` entrypoint.

- [ ] **Step 1: Replace Bash-specific test invocation with the Node entrypoint**

Change `runHook` to invoke:

```ts
return spawnSync(
  process.execPath,
  [resolve(pluginRoot, "hooks", "format-and-lint.mjs")],
  {
    cwd: executionCwd,
    encoding: "utf8",
    env,
    input: JSON.stringify(payload),
  },
);
```

Add a test that supplies one in-scope file, one duplicate directive, and one
outside path. Assert that the in-scope file appears once and the outside path
produces `skipped; target outside cwd`.

- [ ] **Step 2: Run the focused hook test and verify RED**

Run:

```bash
npx vitest run tests/prettier-after-edit-hooks.test.ts
```

Expected: FAIL with missing `hooks/format-and-lint.mjs`.

- [ ] **Step 3: Implement payload parsing and first-seen deduplication**

Create the Node ESM file with these public signatures and behavior:

```js
// @ts-check

import { createHash } from "node:crypto";
import {
  accessSync,
  constants,
  existsSync,
  readFileSync,
  realpathSync,
  statSync,
} from "node:fs";
import {
  delimiter,
  dirname,
  extname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

/** @typedef {{ cwd?: string, tool_input?: unknown, tool_response?: Record<string, unknown> }} HookPayload */
/** @typedef {{ root: string, target: string, relativePath: string }} ContainedFile */
/** @typedef {{ status: number | null, stdout: string, stderr: string, error?: Error }} ProcessResult */
/** @typedef {{ state: string, diagnostic: string }} ToolResult */

/** @param {string} rawInput @returns {HookPayload | null} */
export function parsePayload(rawInput) {
  if (!rawInput.trim()) return null;
  const value = JSON.parse(rawInput);
  return value && typeof value === "object"
    ? /** @type {HookPayload} */ (value)
    : null;
}

/** @param {HookPayload} payload @returns {string[]} */
export function collectCandidates(payload) {
  /** @type {string[]} */
  const candidates = [];
  const seen = new Set();
  /** @param {unknown} value */
  const add = (value) => {
    if (typeof value === "string" && value && !seen.has(value)) {
      seen.add(value);
      candidates.push(value);
    }
  };
  const input = payload.tool_input;
  const response = payload.tool_response;
  const inputRecord =
    input && typeof input === "object"
      ? /** @type {Record<string, unknown>} */ (input)
      : null;
  if (response) add(response.filePath);
  if (inputRecord) {
    add(inputRecord.file_path);
    add(inputRecord.path);
    add(inputRecord.file);
  }
  const patch =
    typeof input === "string"
      ? input
      : inputRecord && typeof inputRecord.command === "string"
        ? inputRecord.command
        : "";
  for (const line of patch.split(/\r?\n/u)) {
    const match = line.match(/^\*\*\* (?:Add|Update) File: (.+)$/u);
    add(match?.[1]);
  }
  return candidates;
}
```

- [ ] **Step 4: Implement canonical containment and process primitives**

Use these contracts:

```js
/** @param {string} cwd @param {string} candidate @returns {ContainedFile | null} */
export function resolveContainedFile(cwd, candidate) {
  const root = realpathSync(cwd);
  const unresolved = isAbsolute(candidate)
    ? candidate
    : resolve(root, candidate);
  if (!existsSync(unresolved) || !statSync(unresolved).isFile()) return null;
  const target = realpathSync(unresolved);
  const fromRoot = relative(root, target);
  if (
    fromRoot === ".." ||
    fromRoot.startsWith(`..${sep}`) ||
    isAbsolute(fromRoot)
  ) {
    return null;
  }
  return { root, target, relativePath: fromRoot || "." };
}

/** @param {string} path @returns {string} */
export function fileDigest(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

/** @param {string} command @param {string[]} args @param {string} cwd @returns {ProcessResult} */
export function runCommand(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    shell: false,
    timeout: 20_000,
  });
  return {
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    error: result.error,
  };
}
```

Implement executable resolution exactly as follows:

```js
/** @param {string} name @param {NodeJS.ProcessEnv} env @returns {string[]} */
function executableNames(name, env) {
  if (process.platform !== "win32") return [name];
  const extensions = (env.PATHEXT ?? ".COM;.EXE;.BAT;.CMD")
    .split(";")
    .filter(Boolean);
  return [
    name,
    ...extensions.map((extension) => `${name}${extension.toLowerCase()}`),
  ];
}

/** @param {string} path @returns {boolean} */
function isExecutable(path) {
  if (!existsSync(path) || !statSync(path).isFile()) return false;
  if (process.platform === "win32") return true;
  try {
    accessSync(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

/** @param {string} startDir @param {string} rootDir @param {string} name @param {NodeJS.ProcessEnv} env @returns {string | null} */
export function findExecutable(startDir, rootDir, name, env = process.env) {
  const root = realpathSync(rootDir);
  let current = realpathSync(startDir);
  const names = executableNames(name, env);
  while (true) {
    for (const executableName of names) {
      const candidate = join(current, "node_modules", ".bin", executableName);
      if (isExecutable(candidate)) return candidate;
    }
    if (current === root) break;
    const parent = dirname(current);
    const fromRoot = relative(root, parent);
    if (
      parent === current ||
      fromRoot === ".." ||
      fromRoot.startsWith(`..${sep}`)
    ) {
      break;
    }
    current = parent;
  }
  for (const directory of (env.PATH ?? "").split(delimiter).filter(Boolean)) {
    for (const executableName of names) {
      const candidate = join(directory, executableName);
      if (isExecutable(candidate)) return candidate;
    }
  }
  return null;
}
```

- [ ] **Step 5: Add explicit payload and containment messages**

Use exactly these prefixes:

```text
prettier-after-edit: skipped; empty hook payload.
prettier-after-edit: skipped; unable to parse hook payload.
prettier-after-edit: skipped; no target file in hook payload.
prettier-after-edit: <candidate>; skipped; target missing, not a file, or outside cwd.
```

Emit each as `JSON.stringify({ systemMessage })` on stdout.

- [ ] **Step 6: Format, lint, and run the foundation tests**

Run:

```bash
node_modules/.bin/prettier --write plugins/prettier-after-edit/hooks/format-and-lint.mjs tests/prettier-after-edit-hooks.test.ts
npm run lint -- --max-warnings=0
npx vitest run tests/prettier-after-edit-hooks.test.ts
```

Expected: all commands exit `0` for payload, containment, and existing routing
tests adapted to the Node entrypoint.

- [ ] **Step 7: Record the conditional checkpoint**

After explicit commit authorization only:

```bash
git add plugins/prettier-after-edit/hooks/format-and-lint.mjs tests/prettier-after-edit-hooks.test.ts
git commit -m "refactor(prettier-after-edit): add contained Node hook runtime"
```

### Task 5: Implement truthful Prettier outcomes

**Files:**

- Modify: `plugins/prettier-after-edit/hooks/format-and-lint.mjs`
- Modify: `tests/prettier-after-edit-hooks.test.ts`

**Interfaces:**

- Consumes: contained file targets and resolved Prettier executable.
- Produces: `formatted`, `unchanged`, `skipped`, or `failed` Prettier results
  derived from `--file-info`, process status, and before/after SHA-256 hashes.

- [ ] **Step 1: Add real-Prettier table and idempotence tests**

Create a temporary `README.md` with:

```markdown
# Fixture

| Column A  | Column B  |
| --------- | --------- |
| value one | value two |
```

Use the repository Prettier symlink helper, run the hook, and assert:

```ts
expect(readFileSync(target, "utf8")).toContain("| Column A  | Column B  |");
expect(result.stdout).toContain("prettier=formatted");
```

Run the hook a second time and assert:

```ts
expect(second.stdout).toContain("prettier=unchanged");
expect(readFileSync(target, "utf8")).toBe(afterFirstRun);
```

Replace the Bash fake formatter with a Node fake that supports both phases used
by the hook:

```js
#!/usr/bin/env node
const { writeFileSync } = require("node:fs");

const args = process.argv.slice(2);
if (args[0] === "--file-info") {
  process.stdout.write(
    JSON.stringify({ ignored: false, inferredParser: "babel" }),
  );
  process.exit(0);
}
const separator = args.lastIndexOf("--");
const target = args[separator + 1];
if (args.includes("--write") && target) {
  writeFileSync(target, "formatted\n");
  process.exit(0);
}
process.exit(2);
```

Retain and adapt the existing ignored-file, PATH fallback, multi-file, spaces,
and untouched-file tests. The ignored-file test continues using real Prettier
because ignore behavior belongs to Prettier, not the fake.

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
npx vitest run tests/prettier-after-edit-hooks.test.ts
```

Expected: FAIL because the runtime does not yet implement `--file-info`, hashes,
or truthful statuses.

- [ ] **Step 3: Implement Prettier file-info parsing**

Add:

```js
/** @param {string} executable @param {ContainedFile} file @returns {ToolResult} */
export function runPrettier(executable, file) {
  const info = runCommand(
    executable,
    ["--file-info", file.relativePath],
    file.root,
  );
  if (info.status !== 0) {
    return { state: "failed", diagnostic: firstDiagnostic(info) };
  }
  let metadata;
  try {
    metadata = JSON.parse(info.stdout);
  } catch {
    return { state: "failed", diagnostic: "invalid --file-info JSON" };
  }
  if (metadata.ignored) return { state: "skipped", diagnostic: "ignored" };
  if (!metadata.inferredParser) {
    return { state: "skipped", diagnostic: "unsupported file type" };
  }
  const before = fileDigest(file.target);
  const write = runCommand(
    executable,
    ["--write", "--ignore-unknown", "--", file.relativePath],
    file.root,
  );
  if (write.status !== 0) {
    return { state: "failed", diagnostic: firstDiagnostic(write) };
  }
  return {
    state: before === fileDigest(file.target) ? "unchanged" : "formatted",
    diagnostic: "",
  };
}
```

Implement diagnostic selection exactly:

```js
/** @param {ProcessResult} result @returns {string} */
export function firstDiagnostic(result) {
  const stderrLines = result.stderr.split(/\r?\n/u).filter(Boolean);
  const stdoutLines = result.stdout.split(/\r?\n/u).filter(Boolean);
  const lines = stderrLines.length ? stderrLines : stdoutLines;
  const first = lines[0] ?? result.error?.message ?? "process failed";
  const suffix = lines.length > 1 ? ` (${lines.length} diagnostic lines)` : "";
  return `${first.slice(0, 500)}${suffix}`;
}
```

- [ ] **Step 4: Integrate Prettier into main without markdownlint**

For each contained file, resolve Prettier, call `runPrettier`, and emit:

```text
prettier-after-edit: <relative-path>; prettier=<state>[; <diagnostic>]
```

When no executable resolves, use:

```text
prettier=skipped; prettier not found
```

- [ ] **Step 5: Format and verify the Prettier contract**

Run:

```bash
node_modules/.bin/prettier --write plugins/prettier-after-edit/hooks/format-and-lint.mjs tests/prettier-after-edit-hooks.test.ts
npm run lint -- --max-warnings=0
npx vitest run tests/prettier-after-edit-hooks.test.ts
```

Expected: all focused hook tests pass, including the real table rewrite and
second-run `unchanged` assertion.

- [ ] **Step 6: Prove the status test rejects the old lie**

Temporarily replace the digest comparison in the execution worktree with an
unconditional `state: "formatted"`, run the focused test, and verify the
idempotence assertion fails. Restore the implementation and rerun the test to
green before continuing.

- [ ] **Step 7: Record the conditional checkpoint**

After explicit commit authorization only:

```bash
git add plugins/prettier-after-edit/hooks/format-and-lint.mjs tests/prettier-after-edit-hooks.test.ts
git commit -m "fix(prettier-after-edit): report real formatting outcomes"
```

### Task 6: Add scoped markdownlint fixes and diagnostics, then switch the hook

**Files:**

- Modify: `plugins/prettier-after-edit/hooks/format-and-lint.mjs`
- Modify: `plugins/prettier-after-edit/hooks/hooks.json`
- Delete: `plugins/prettier-after-edit/hooks/prettier-format.sh`
- Modify: `tests/prettier-after-edit-hooks.test.ts`

**Interfaces:**

- Consumes: a Prettier-processed Markdown file, recognized project
  configuration, and resolved markdownlint-cli2 executable.
- Produces: `clean`, `fixed`, `issues remain`, `fixed; issues remain`, `skipped`,
  or `failed` markdownlint state; final packaged `PostToolUse` command.

- [ ] **Step 1: Add Markdown activation and MD025 tests**

Add tests that prove:

```ts
expect(jsResult.stdout).toContain("markdownlint=skipped; not Markdown");
expect(markdownWithoutConfig.stdout).toContain(
  "markdownlint=skipped; no project configuration",
);
expect(secondH1Result.stdout).toContain("markdownlint=issues remain");
expect(secondH1Result.stdout).toContain("MD025/single-title");
```

For the MD025 fixture, create `.markdownlint.jsonc` containing
`{ "default": true, "MD013": false }`, symlink the repository
markdownlint-cli2 into the temporary project, and write:

```markdown
# Title

# Deliberate formatting error **
```

- [ ] **Step 2: Add fixable and partially-fixable tests**

Create a fixture with a missing space after `#` and assert markdownlint changes
it and reports `fixed`. Create a fixture containing both a fixable spacing issue
and a second H1; assert the file changes, exit semantics are preserved, and the
message reports `fixed; issues remain` plus `MD025`.

- [ ] **Step 3: Run the focused tests and verify RED**

Run:

```bash
npx vitest run tests/prettier-after-edit-hooks.test.ts
```

Expected: new markdownlint assertions fail.

- [ ] **Step 4: Implement project configuration discovery**

Search from the target directory upward through event `cwd` using this exact
implementation and precedence:

```js
const markdownlintConfigNames = [
  ".markdownlint-cli2.jsonc",
  ".markdownlint-cli2.yaml",
  ".markdownlint-cli2.cjs",
  ".markdownlint-cli2.mjs",
  ".markdownlint.jsonc",
  ".markdownlint.json",
  ".markdownlint.yaml",
  ".markdownlint.yml",
  ".markdownlint.cjs",
  ".markdownlint.mjs",
];

/** @param {string} startDir @param {string} rootDir @returns {boolean} */
export function hasMarkdownlintConfig(startDir, rootDir) {
  const root = realpathSync(rootDir);
  let current = realpathSync(startDir);
  while (true) {
    for (const name of markdownlintConfigNames) {
      const candidate = join(current, name);
      if (existsSync(candidate) && statSync(candidate).isFile()) return true;
    }
    if (current === root) return false;
    const parent = dirname(current);
    const fromRoot = relative(root, parent);
    if (
      parent === current ||
      fromRoot === ".." ||
      fromRoot.startsWith(`..${sep}`)
    ) {
      return false;
    }
    current = parent;
  }
}
```

Never search above canonical event `cwd`.

- [ ] **Step 5: Implement markdownlint execution and exit mapping**

Add:

```js
/** @param {string} executable @param {ContainedFile} file @returns {ToolResult} */
export function runMarkdownlint(executable, file) {
  const before = fileDigest(file.target);
  const result = runCommand(
    executable,
    ["--fix", "--no-globs", `:${file.relativePath}`],
    file.root,
  );
  const changed = before !== fileDigest(file.target);
  if (result.status === 0) {
    return { state: changed ? "fixed" : "clean", diagnostic: "" };
  }
  if (result.status === 1) {
    return {
      state: changed ? "fixed; issues remain" : "issues remain",
      diagnostic: firstDiagnostic(result),
    };
  }
  return { state: "failed", diagnostic: firstDiagnostic(result) };
}
```

Run this phase only for case-insensitive `.md` and `.markdown` extensions,
after Prettier and only when project configuration exists.

- [ ] **Step 6: Emit one combined status per file**

Use:

```text
prettier-after-edit: <relative-path>; prettier=<state>; markdownlint=<state>[; <diagnostic>]
```

The process continues to the next file after any per-file failure and exits `0`
after emitting all results.

Implement the main-loop boundary with this structure:

```js
/** @param {string} rawInput @param {NodeJS.ProcessEnv} env @returns {number} */
export function main(rawInput = readFileSync(0, "utf8"), env = process.env) {
  let payload;
  try {
    payload = parsePayload(rawInput);
  } catch {
    emit("prettier-after-edit: skipped; unable to parse hook payload.");
    return 0;
  }
  if (!payload) {
    emit("prettier-after-edit: skipped; empty hook payload.");
    return 0;
  }
  const cwd = typeof payload.cwd === "string" ? payload.cwd : process.cwd();
  const candidates = collectCandidates(payload);
  if (!candidates.length) {
    emit("prettier-after-edit: skipped; no target file in hook payload.");
    return 0;
  }
  for (const candidate of candidates) {
    const file = resolveContainedFile(cwd, candidate);
    if (!file) {
      emit(
        `prettier-after-edit: ${candidate}; skipped; target missing, not a file, or outside cwd.`,
      );
      continue;
    }
    const prettier = findExecutable(
      dirname(file.target),
      file.root,
      "prettier",
      env,
    );
    const prettierResult = prettier
      ? runPrettier(prettier, file)
      : { state: "skipped", diagnostic: "prettier not found" };
    let markdownlintResult = { state: "skipped", diagnostic: "not Markdown" };
    if ([".md", ".markdown"].includes(extname(file.target).toLowerCase())) {
      if (!hasMarkdownlintConfig(dirname(file.target), file.root)) {
        markdownlintResult = {
          state: "skipped",
          diagnostic: "no project configuration",
        };
      } else {
        const markdownlint = findExecutable(
          dirname(file.target),
          file.root,
          "markdownlint-cli2",
          env,
        );
        markdownlintResult = markdownlint
          ? runMarkdownlint(markdownlint, file)
          : { state: "skipped", diagnostic: "markdownlint-cli2 not found" };
      }
    }
    emit(
      formatFileMessage(file.relativePath, prettierResult, markdownlintResult),
    );
  }
  return 0;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  process.exitCode = main();
}
```

Use these exact message helpers:

```js
/** @param {string} systemMessage */
export function emit(systemMessage) {
  process.stdout.write(`${JSON.stringify({ systemMessage })}\n`);
}

/** @param {string} name @param {ToolResult} result @returns {string} */
function phaseText(name, result) {
  return `${name}=${result.state}${
    result.diagnostic ? ` (${result.diagnostic})` : ""
  }`;
}

/** @param {string} relativePath @param {ToolResult} prettierResult @param {ToolResult} markdownlintResult @returns {string} */
export function formatFileMessage(
  relativePath,
  prettierResult,
  markdownlintResult,
) {
  return [
    `prettier-after-edit: ${relativePath}`,
    phaseText("prettier", prettierResult),
    phaseText("markdownlint", markdownlintResult),
  ].join("; ");
}
```

- [ ] **Step 7: Switch the packaged hook atomically**

Set `plugins/prettier-after-edit/hooks/hooks.json` to:

```json
{
  "description": "Format edited files with Prettier and lint configured Markdown files with markdownlint-cli2.",
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "apply_patch|Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "node \"${PLUGIN_ROOT}/hooks/format-and-lint.mjs\"",
            "timeout": 60,
            "statusMessage": "Formatting edited files and linting Markdown"
          }
        ]
      }
    ]
  }
}
```

Update `configuredHookCommand` to expect the Node entrypoint. Delete
`hooks/prettier-format.sh` only after the complete focused suite is green.

- [ ] **Step 8: Format and verify the complete hook contract**

Run:

```bash
node_modules/.bin/prettier --write plugins/prettier-after-edit/hooks/hooks.json plugins/prettier-after-edit/hooks/format-and-lint.mjs tests/prettier-after-edit-hooks.test.ts
npm run lint -- --max-warnings=0
npx vitest run tests/prettier-after-edit-hooks.test.ts
npm run validate:plugins
```

Expected: all commands exit `0`; validation resolves only the Node hook resource
inside the plugin package.

- [ ] **Step 9: Record the conditional checkpoint**

After explicit commit authorization only:

```bash
git add plugins/prettier-after-edit/hooks/hooks.json plugins/prettier-after-edit/hooks/format-and-lint.mjs plugins/prettier-after-edit/hooks/prettier-format.sh tests/prettier-after-edit-hooks.test.ts
git commit -m "feat(prettier-after-edit): lint Markdown after formatting"
```

### Task 7: Synchronize plugin product metadata, documentation, and catalog

**Files:**

- Modify: `plugins/prettier-after-edit/.codex-plugin/plugin.json`
- Modify: `plugins/prettier-after-edit/skills/prettier-after-edit/SKILL.md`
- Modify: `plugins/prettier-after-edit/skills/prettier-after-edit/agents/openai.yaml`
- Modify: `plugins/prettier-after-edit/README.md`
- Modify: `plugins/prettier-after-edit/CHANGELOG.md`
- Modify: `README.md`
- Regenerate: `.agents/plugins/marketplace.json`

**Interfaces:**

- Consumes: the verified runtime and repository workflow from Tasks 1-6.
- Produces: one truthful package contract, public usage guide, rollback guide,
  capability description, version source, and generated marketplace entry.

- [ ] **Step 1: Read the mandatory artifact templates before editing**

Read completely:

```text
templates/codex-plugin-plugin.json
templates/root-README-recommended-template.md
templates/plugin-README-reusable-template.md
templates/CHANGELOG-reusable-template.md
```

Preserve the current artifact structure where it is already more specific than
the template.

- [ ] **Step 2: Update the manifest contract**

Set:

```json
"version": "0.2.0",
"description": "Format files edited by Codex with Prettier and fix or lint configured Markdown files with markdownlint-cli2 after each change.",
"keywords": [
  "prettier",
  "markdownlint",
  "formatter",
  "linter",
  "hooks",
  "quality",
  "developer-tools"
]
```

Set interface values:

```json
"displayName": "Prettier + Markdownlint After Edit",
"shortDescription": "Format edited files and lint configured Markdown.",
"longDescription": "This plugin processes only files reported by supported Codex edit events. It formats supported files with project-local-first Prettier, then applies configured markdownlint-cli2 fixes to edited Markdown files, retaining PATH fallback and reporting changed, unchanged, skipped, failed, and remaining-issue outcomes distinctly."
```

Set capabilities to:

```json
[
  "PostToolUse hook integration",
  "Per-event exact-file Prettier formatting with truthful change status",
  "Configured Markdown fixes and diagnostics with markdownlint-cli2",
  "Project-local tool preference with PATH fallback",
  "No installation-time project mutations"
]
```

Set the default prompt to:

```text
Use Prettier + Markdownlint After Edit to format changed files and lint configured Markdown after supported Codex edits.
```

- [ ] **Step 3: Align the skill and agent metadata**

Keep the skill name `prettier-after-edit`. Change its description to:

```text
Use this skill first when edited files should be formatted immediately with Prettier and configured Markdown should be fixed or linted with markdownlint-cli2. It resolves project-local tools first, then PATH fallbacks.
```

Document the exact phase ordering, project-config activation gate, status
taxonomy, no-install boundary, and explicit-file containment contract from the
specification.

Set `agents/openai.yaml` to:

```yaml
interface:
  display_name: Prettier + Markdownlint After Edit
  short_description: Format edits and lint configured Markdown.
  default_prompt: Use Prettier + Markdownlint After Edit to format changed files and lint configured Markdown after supported Codex edits.
```

- [ ] **Step 4: Rewrite package documentation around the verified behavior**

Retain the current README section structure and update every Bash/jq/Prettier-only
claim. The resulting README must state:

- Node.js, Prettier, and optional markdownlint-cli2 requirements.
- Project-local-first and PATH-fallback resolution for both tools.
- markdownlint activation only for configured `.md` and `.markdown` files.
- Exact-file scope and `--no-globs` behavior.
- `formatted` versus `unchanged` and all markdownlint states.
- Automatic write effects from both tools.
- No package installation or network access.
- Uninstall stops future events but does not revert prior writes.
- Recovery uses version control and direct CLI reproduction.
- The smoke-test command pipes JSON to
  `node plugins/prettier-after-edit/hooks/format-and-lint.mjs`.
- The hook is not a repository-wide formatter or universal Markdown parser.

Update the root README catalog row and summary for `prettier-after-edit` to use
the same display name and one-sentence capability description.

- [ ] **Step 5: Record the behavioral change in the changelog**

Under `[Unreleased]`, retain prior valid entries and add:

```markdown
### Added

- **[Area: Markdown]** Added configured, exact-file markdownlint-cli2 fixes and
  remaining-issue diagnostics after Prettier for edited `.md` and `.markdown`
  files.

### Changed

- **[Area: Runtime]** Replaced the Bash and jq hook with a self-contained Node
  orchestrator, increased the hook timeout to 60 seconds, and preserved
  project-local-first tool resolution with PATH fallback.
- **[Area: Product]** Expanded the display name and documentation to describe
  the combined Prettier and markdownlint behavior while retaining the
  `prettier-after-edit` installation identifier.

### Fixed

- **[Area: Status]** Report `formatted` only when Prettier changes file bytes;
  distinguish unchanged, ignored, unsupported, failed, fixed, clean, and
  remaining-issue outcomes.
- **[Area: Scope]** Reject missing, non-file, and outside-cwd targets and prevent
  markdownlint configuration globs from widening a single edit event.
```

- [ ] **Step 6: Format package artifacts and regenerate the catalog**

Run:

```bash
node_modules/.bin/prettier --write README.md plugins/prettier-after-edit/.codex-plugin/plugin.json plugins/prettier-after-edit/README.md plugins/prettier-after-edit/CHANGELOG.md plugins/prettier-after-edit/skills/prettier-after-edit/SKILL.md plugins/prettier-after-edit/skills/prettier-after-edit/agents/openai.yaml
npm run marketplace:build
```

Expected: catalog generation updates only the generated fields derived from the
manifest and exits `0`.

- [ ] **Step 7: Run package and documentation synchronization checks**

Run:

```bash
npm run validate:plugins
npm run marketplace:check
```

Expected: both commands exit `0`.

- [ ] **Step 8: Record the conditional checkpoint**

After explicit commit authorization only:

```bash
git add README.md plugins/prettier-after-edit/.codex-plugin/plugin.json plugins/prettier-after-edit/README.md plugins/prettier-after-edit/CHANGELOG.md plugins/prettier-after-edit/skills/prettier-after-edit/SKILL.md plugins/prettier-after-edit/skills/prettier-after-edit/agents/openai.yaml .agents/plugins/marketplace.json
git commit -m "docs(prettier-after-edit): publish combined tool contract"
```

### Task 8: Run complete verification and audit the delivery boundary

**Files:**

- Verify: every path modified in Tasks 1-7
- Verify: `docs/superpowers/specs/2026-08-31-prettier-markdownlint-after-edit-design.md`
- Verify: `docs/superpowers/plans/2026-08-31-prettier-markdownlint-after-edit.md`

**Interfaces:**

- Consumes: the complete implementation and synchronized package.
- Produces: fresh evidence for behavior, formatting, linting, typechecking,
  marketplace consistency, documentation synchronization, and residual-risk
  reporting.

- [ ] **Step 1: Format every authored implementation and documentation path**

Run:

```bash
node_modules/.bin/prettier --write .markdownlint-cli2.jsonc package.json .vscode/extensions.json .vscode/settings.json README.md docs/superpowers/specs/2026-08-31-prettier-markdownlint-after-edit-design.md docs/superpowers/plans/2026-08-31-prettier-markdownlint-after-edit.md plugins/prettier-after-edit tests/markdownlint-configuration.test.ts tests/prettier-after-edit-hooks.test.ts
```

- [ ] **Step 2: Run focused behavioral verification**

Run:

```bash
npx vitest run tests/markdownlint-configuration.test.ts tests/prettier-after-edit-hooks.test.ts
npm run lint:markdown
```

Expected: all focused tests pass and markdownlint exits `0` with zero errors.

- [ ] **Step 3: Run the complete repository quality gate**

Run:

```bash
npm run check
```

Expected: formatting, ESLint, markdownlint, typechecks, tests with coverage,
GitHub-label validation, plugin validation, and marketplace validation all exit
`0`. Do not summarize away any failure output.

- [ ] **Step 4: Run explicit package and catalog checks**

Run:

```bash
npm run validate:plugins
npm run marketplace:check
git diff --check
```

Expected: all commands exit `0`.

- [ ] **Step 5: Run the documentation gate over the actual implementation range**

After authorized task commits exist on a feature branch, run:

```bash
npm run documentation:gate -- --base origin/main --head HEAD
```

Expected: the gate recognizes the plugin runtime change and confirms synchronized
plugin README and changelog changes. If commits are not authorized, report this
gate as not runnable over uncommitted working-tree content rather than claiming
it passed.

- [ ] **Step 6: Verify the installed-package boundary**

Run:

```bash
find plugins/prettier-after-edit -type f -print | sort
rg -n 'prettier-format\.sh|bash|jq|repositoryRoot|\.\./\.\.' plugins/prettier-after-edit
```

Expected inventory contains `hooks/format-and-lint.mjs` and no
`hooks/prettier-format.sh`. Any `bash` or `jq` match must be absent from active
runtime documentation. No runtime import or execution path may escape the
plugin directory.

- [ ] **Step 7: Audit Git scope and preserved user changes**

Run:

```bash
git status --short --branch
git diff --stat
git diff -- package.json package-lock.json README.md
```

Confirm:

- markdownlint-cli2 remains pinned exactly.
- the deliberate README artifacts are absent from product documentation and
  present only in disposable tests.
- no unrelated user path was modified.
- `.agents/plugins/marketplace.json` changed only through generation.
- no commit, push, PR, merge, release, or tag occurred without authorization.

- [ ] **Step 8: Record final residual risks**

Report these boundaries even when all checks pass:

- Stock markdownlint does not detect every syntactically literal unmatched
  emphasis marker.
- PATH fallbacks can drift from project versions and are less reproducible than
  project-local tools.
- JavaScript markdownlint configurations and custom rules execute only in
  trusted VS Code workspaces.
- PostToolUse failures are diagnostic because the original edit has already
  happened; repository gates remain the enforcement boundary.

- [ ] **Step 9: Record the conditional final checkpoint**

After explicit commit authorization only:

```bash
git add docs/superpowers/specs/2026-08-31-prettier-markdownlint-after-edit-design.md docs/superpowers/plans/2026-08-31-prettier-markdownlint-after-edit.md
git commit -m "docs(plan): define Prettier and markdownlint integration"
```

Do not push or create a pull request until separately authorized.
