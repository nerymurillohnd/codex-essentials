# Prettier After Edit Plugin Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the second community plugin (`prettier-after-edit`) into this marketplace with a production-safe hook script that formats edited files with local project Prettier first, then global fallback, and document and register it end-to-end.

**Architecture:** The package lives under `plugins/prettier-after-edit/` with a required plugin manifest in `.codex-plugin/plugin.json`, a hook script under `hooks/`, plugin markdown documentation, changelog, optional LICENSE copy from root, and a catalog registration in `.agents/plugins/marketplace.json`. The runtime behavior is shell-driven and policy-safe: explicit local binary detection from `node_modules/.bin`, global fallback via `PATH`, and no dependency installation.

**Tech Stack:** Bash 5+, jq, Prettier CLI, Node/Yarn scripts for repository validation, npm test + Vitest for automated checks.

**Spec:** User request and source package at `/Users/nerymurillohnd/Downloads/prettier-after-edit`.

## Global Constraints

- `local-first-then-global` formatting fallback (no global install or config mutation).
- Do not replace package manager or install extra global dependencies.
- No top-level `hooks` field in `plugin.json` because this repo schema does not permit it.
- Commit and push via branch `codex/prettier-after-edit`, no `main` edits.
- Keep all behavior backwards-compatible for existing hook payload formats and do not fail hard when metadata is missing.

---

### Task 1: Create plugin folder and base files from source package

**Files:**

- Create: `plugins/prettier-after-edit/.codex-plugin/plugin.json`
- Create: `plugins/prettier-after-edit/README.md`
- Create: `plugins/prettier-after-edit/CHANGELOG.md`
- Create: `plugins/prettier-after-edit/hooks/hooks.json`
- Create: `plugins/prettier-after-edit/hooks/prettier-format.sh`
- Create: `plugins/prettier-after-edit/LICENSE.md` (copied policy text from root)
- Create: `plugins/prettier-after-edit/skills/prettier-after-edit/SKILL.md`

**Task steps:**

- [ ] Create directory structure.

```bash
mkdir -p plugins/prettier-after-edit/.codex-plugin plugins/prettier-after-edit/hooks plugins/prettier-after-edit/skills/prettier-after-edit
```

- [ ] Copy source `README.md`, `CHANGELOG.md`, hook script, and hook config into package.

- [ ] Prepare `plugins/prettier-after-edit/.codex-plugin/plugin.json` with `name`, `version`, `description`, `author`, `license`, and `interface` block containing `capabilities` and `defaultPrompt`.
- [ ] Keep `skills: "./skills/"` in the manifest even if only one skill is defined.

- [ ] Add `LICENSE.md` by policy for a distributable package if policy requires explicit license copies.

### Task 2: Implement robust hook behavior with local-first then global fallback

**Files:**

- Modify: `plugins/prettier-after-edit/hooks/prettier-format.sh`

**Task steps:**

- [ ] Resolve target file path from hook input (tool payload or command patch fallback).
- [ ] Resolve Prettier binary selection using:
  1. nearest `node_modules/.bin/prettier` from edited path tree (explicit local first);
  2. `command -v prettier` for PATH/global fallback;
  3. skip quietly if absent.

- [ ] Send valid JSON system messages and never exit nonzero on formatter failures.
- [ ] Preserve behavior for apply_patch multi-file payload by formatting only the first file path parsed.
- [ ] Ensure script handles relative and absolute paths and ignores nonexistent targets.

### Task 3: Draft skill and marketplace docs for operational clarity

**Files:**

- Modify: `plugins/prettier-after-edit/skills/prettier-after-edit/SKILL.md`
- Modify: `plugins/prettier-after-edit/README.md`
- Modify: `plugins/prettier-after-edit/CHANGELOG.md`

**Task steps:**

- [ ] Document install, usage, approval boundaries, permissions, side effects, and limitations.
- [ ] Add explicit behavior contract: local project Prettier preferred, then global fallback.
- [ ] Add changelog `[Unreleased]` itemized by area and versioned release target for `0.1.0`.

### Task 4: Register plugin in marketplace catalog

**Files:**

- Modify: `.agents/plugins/marketplace.json`

**Task steps:**

- [ ] Add plugin entry:

```json
{
  "name": "prettier-after-edit",
  "source": {
    "source": "local",
    "path": "./plugins/prettier-after-edit"
  },
  "policy": {
    "installation": "AVAILABLE",
    "authentication": "ON_INSTALL"
  },
  "category": "Developer Tools"
}
```

- [ ] Keep existing plugin entries untouched.

### Task 5: Add coverage-oriented tests for hook execution logic

**Files:**

- Create: `tests/prettier-after-edit-hooks.test.ts`
- Create: `tests/fixtures/prettier-after-edit/*`

**Task steps:**

- [ ] Build temporary fixture with local `node_modules/.bin/prettier` stub and target JS file.
- [ ] Test 1: when local prettier exists, script uses local path.
- [ ] Test 2: when local prettier missing, script uses global fallback in PATH.
- [ ] Test 3: when no formatter binary exists, script returns skip status without fail.
- [ ] Test 4: multi-line input with non-file payload produces skip with exit 0.
- [ ] Run the test file directly until red, then make implementation match tests.

```bash
npx vitest run tests/prettier-after-edit-hooks.test.ts
```

### Task 6: Documentation and integration verification

**Files:**

- No new files

**Task steps:**

- [ ] Run formatting and lint/type/tests for entire repo.

```bash
npm run format:check
npm run lint -- --max-warnings=0
npm run typecheck
npm run typecheck:scripts
npx tsc --noEmit
npx tsc6 --noEmit
npm test
npm run validate:plugins
npm run validate:all
npm run validate:release -- plugin/prettier-after-edit/v0.1.0
```

- [ ] Run plugin-creator validation for this package.

```bash
uv run --with pyyaml python /Users/nerymurillohnd/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/prettier-after-edit
```

- [ ] Run repo-level shell/security checks for touched scripts.

```bash
shfmt -d plugins/prettier-after-edit/hooks/prettier-format.sh
shellcheck -o all -x -f gcc plugins/prettier-after-edit/hooks/prettier-format.sh
```

### Task 7: Commit and push final branch

**Files:**

- Modify/create all files above.

**Task steps:**

- [ ] `git add` package + catalog + plan + tests.
- [ ] Commit with Conventional Commit.
- [ ] Push branch to origin.
- [ ] Final reporting with commit hash and verification outputs.
