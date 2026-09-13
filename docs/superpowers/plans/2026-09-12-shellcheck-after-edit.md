# ShellCheck After Edit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Build the shellcheck-after-edit marketplace plugin, which guides an approved consumer-owned Codex PostToolUse hook to format and lint every reported, contained .sh or .bash edit.

**Architecture:** The skills-only package distributes one skill, policy references, and consumer templates. The skill inspects scope, active hook sources, tooling, and existing configuration before proposing a write; after explicit approval it copies and merges only the selected consumer files. The Bash handler canonicalizes reported targets, runs shfmt, then runs ShellCheck using normal discovery or an approved rcfile.

**Tech Stack:** Codex plugin manifests and skills, Bash, jq, ShellCheck, shfmt, Python standard-library tests, Prettier, Ruff, Basedpyright, and the marketplace generator.

**Spec:** [ShellCheck After Edit Plugin Design](../specs/2026-09-12-shellcheck-after-edit-design.md)

## Global Constraints

- Use a portable root manifest at plugins/shellcheck-after-edit/plugin.json; do not create a .codex-plugin compatibility manifest.
- The package must not declare hooks or contain plugins/shellcheck-after-edit/hooks/. Installation exposes guidance and templates only.
- The skill must inspect the consumer environment and receive explicit approval before copying, merging, activating, or asking a user to trust consumer-owned hooks.
- Support project and user scope. In each scope select exactly one representation: hooks.json or inline config.toml.
- Preserve unrelated hook groups and reject same-scope duplicate wiring.
- Process only existing reported regular .sh and .bash files canonically inside the selected scope; no directory walk, glob, repository scan, unreported target, or escaping symlink.
- Run shfmt --apply-ignore -w -- target before ShellCheck, with no shfmt parser or printer options.
- Select ShellCheck independently: defaults/discovery, existing project configuration, or an approved consumer-owned --rcfile profile.
- Offer the shfmt profile only as an approved project .editorconfig merge. Do not claim a global user profile.
- Never install dependencies, use npx or uvx, modify PATH, add suppressions, or weaken policy to pass.
- Fail visibly for malformed payloads, selected invalid shell targets, missing tools, process failure, timeout, or ShellCheck findings.
- Every distributed Bash file uses #!/usr/bin/env bash and is added to repository ShellCheck and shfmt checks.

---

## File Structure

| Path                                                                              | Responsibility                                                                |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| plugins/shellcheck-after-edit/plugin.json                                         | Portable identity and interface metadata, without an active hook declaration. |
| plugins/shellcheck-after-edit/README.md, CHANGELOG.md, LICENSE.md                 | Product, safety, release, and license documentation.                          |
| plugins/shellcheck-after-edit/skills/shellcheck-after-edit/SKILL.md               | Intentional-use and approval-gated hook-installation router.                  |
| skills/shellcheck-after-edit/agents/openai.yaml                                   | The sole Codex discovery manifest.                                            |
| skills/shellcheck-after-edit/references/*.md                                      | Installation, policy, configuration, and test guidance.                       |
| skills/shellcheck-after-edit/assets/templates/shellcheck-after-edit.sh            | Consumer-owned PostToolUse handler.                                           |
| skills/shellcheck-after-edit/assets/templates/test-shellcheck-after-edit.sh       | Disposable handler test.                                                      |
| skills/shellcheck-after-edit/assets/templates/project-* and user-*                | Scope-specific JSON/TOML fragments.                                           |
| skills/shellcheck-after-edit/assets/templates/shellcheckrc and editorconfig-shell | Optional ShellCheck profile and project-only shfmt fragment.                  |
| scripts/test_shellcheck_after_edit_plugin.py                                      | Package-shape and materialized-handler contract test.                         |
| package.json                                                                      | Focused test and shell-template quality paths.                                |
| README.md and generated .agents/plugins/marketplace.json                          | Marketplace discovery and generated registration.                             |

### Task 1: Establish the contract with a failing package test

**Files:**

- Create: scripts/test_shellcheck_after_edit_plugin.py
- Modify: package.json
- Test: scripts/test_shellcheck_after_edit_plugin.py

**Interfaces:**

- Consumes: every package/template path named in File Structure.
- Produces: python3 scripts/test_shellcheck_after_edit_plugin.py, a standard-library test that later tasks make green.

- [ ] **Step 1: Write package-shape assertions**

Create a unittest module using Path, json, tempfile, subprocess, os, and shutil.

    ROOT = Path(__file__).resolve().parents[1]
    PLUGIN = ROOT / "plugins" / "shellcheck-after-edit"
    SKILL = PLUGIN / "skills" / "shellcheck-after-edit"
    TEMPLATES = SKILL / "assets" / "templates"

Require plugin.json, README.md, CHANGELOG.md, LICENSE.md, SKILL.md,
agents/openai.yaml, all four wiring fragments, shellcheckrc, editorconfig-shell,
the handler, and the handler test. Assert manifest name is shellcheck-after-edit,
neither root nor OpenAI extension has hooks, and no package-root hooks directory
exists. Parse both JSON fragments and require one PostToolUse entry with
statusMessage. Require both TOML fragments to contain [[hooks.PostToolUse]] and
[[hooks.PostToolUse.hooks]].

- [ ] **Step 2: Add materialized handler cases**

Use TemporaryDirectory to copy the handler and test templates into a disposable
consumer directory. Create PATH shims that append arguments to HOOK_LOG. The
diagnostic ShellCheck shim writes SC2086 to stderr and exits 1. Assert:

    clean.returncode == 0
    shellcheck_finding.returncode != 0
    missing_shfmt.returncode != 0
    non_shell.returncode == 0
    directory.returncode == 0
    invalid_json.returncode != 0
    outside_symlink.returncode != 0
    log.index("shfmt:") < log.index("shellcheck:")

Also prove an unreported file is unchanged and the shfmt invocation contains
--apply-ignore -w --.

- [ ] **Step 3: Prove the test is red**

Run:

    python3 scripts/test_shellcheck_after_edit_plugin.py

Expected: FAIL because the package does not exist.

- [ ] **Step 4: Register the focused test**

Add this package script:

    "shellcheck-after-edit:test": "python3 scripts/test_shellcheck_after_edit_plugin.py"

Insert npm run shellcheck-after-edit:test immediately after npm run
marketplace:test in npm run check. Do not add absent Bash paths to shell quality
commands until Task 3.

- [ ] **Step 5: Commit the red test contract**

  git add scripts/test_shellcheck_after_edit_plugin.py package.json
  git commit -m "test: define shellcheck after edit contract"

### Task 2: Create the skills-only package and policy templates

**Files:**

- Create: plugins/shellcheck-after-edit/plugin.json
- Create: plugins/shellcheck-after-edit/README.md
- Create: plugins/shellcheck-after-edit/CHANGELOG.md
- Create: plugins/shellcheck-after-edit/LICENSE.md
- Create: plugins/shellcheck-after-edit/skills/shellcheck-after-edit/agents/openai.yaml
- Create: project-hooks.json, user-hooks.json, project-config.toml.fragment, user-config.toml.fragment under assets/templates
- Create: shellcheckrc and editorconfig-shell under assets/templates
- Test: scripts/test_shellcheck_after_edit_plugin.py

**Interfaces:**

- Consumes: templates/plugin.json, templates/agents-openai.yaml,
  templates/plugin-README-reusable-template.md,
  templates/CHANGELOG-reusable-template.md, and
  templates/LICENSE-reusable-template.md.
- Produces: valid package metadata and four mutually exclusive wiring fragments.

- [ ] **Step 1: Build identity and package documentation from templates**

Set name to shellcheck-after-edit, version to 0.1.0, category to Developer
Tools, and omit hooks, apps, and mcpServers. Describe intentional
ShellCheck/shfmt use and approval-gated consumer wiring.

Create agents/openai.yaml with display name ShellCheck After Edit, short
description Format shell edits and design approval-gated ShellCheck hooks, an
appropriate shellcheck-after-edit default prompt, and
allow_implicit_invocation: true.

The README must state requirements (Bash, jq, ShellCheck, shfmt), effects,
approval, slash-hooks trust, rollback, failure recovery, and that PostToolUse
cannot undo completed edits. Add a non-empty Unreleased changelog section.

- [ ] **Step 2: Add JSON and TOML wiring fragments**

The project JSON PostToolUse fragment has matcher
apply_patch|Write|Edit|MultiEdit, timeout 30, status Formatting and linting
edited shell scripts, and runs:

    bash "$(git rev-parse --show-toplevel)/.codex/hooks/shellcheck-after-edit.sh" --scope "$(git rev-parse --show-toplevel)"

The user JSON counterpart runs:

    bash "$HOME/.codex/hooks/shellcheck-after-edit.sh" --scope "$PWD"

Create project/user TOML fragments with exact equivalent matcher, command,
timeout, and status using [[hooks.PostToolUse]] and
[[hooks.PostToolUse.hooks]]. Each is a merge fragment, not a complete
replacement config file.

- [ ] **Step 3: Add optional policy templates**

Write shellcheckrc:

    # Consumer-owned ShellCheck profile. Use only through approved --rcfile wiring.
    source-path=SCRIPTDIR
    external-sources=true
    enable=all

Write editorconfig-shell:

    # Merge after reviewing existing root EditorConfig policy.
    [*.sh]
    indent_style = space
    indent_size = 2
    shell_variant = posix
    simplify = true

    [*.bash]
    indent_style = space
    indent_size = 2
    shell_variant = bash
    simplify = true

Document that the ShellCheck profile can be copied into selected .codex and used
through --rcfile; the shfmt fragment is only a proposed repository
.editorconfig merge.

- [ ] **Step 4: Run the contract at the intended intermediate state**

  python3 scripts/test_shellcheck_after_edit_plugin.py

Expected: package assertions pass; handler materialization fails because the
handler has not yet been created.

- [ ] **Step 5: Commit the package scaffold**

  git add plugins/shellcheck-after-edit scripts/test_shellcheck_after_edit_plugin.py package.json
  git commit -m "feat: scaffold shellcheck after edit plugin"

### Task 3: Implement and verify the consumer Bash handler

**Files:**

- Create: skills/shellcheck-after-edit/assets/templates/shellcheck-after-edit.sh
- Create: skills/shellcheck-after-edit/assets/templates/test-shellcheck-after-edit.sh
- Modify: scripts/test_shellcheck_after_edit_plugin.py
- Modify: package.json
- Test: scripts/test_shellcheck_after_edit_plugin.py

**Interfaces:**

- Consumes: JSON stdin, --scope directory, optional --shellcheckrc path, jq,
  shfmt, and ShellCheck.
- Produces: zero for irrelevant candidates/clean targets and non-zero,
  stderr-visible failures for malformed input, invalid selected shell targets,
  missing tools, process errors, or ShellCheck findings.

- [ ] **Step 1: Write the Bash behavior fixture**

Use HOOK, TEST_BIN, mktemp -d, cleanup trap, and jq -n payloads. Include clean,
unformatted, SC2086, non-shell, directory, ignored, invalid JSON, and
escaping-symlink cases. Assert:

    expect_status 0 "clean .sh runs both tools"
    expect_status 1 "ShellCheck finding is non-zero"
    expect_status 1 "missing shfmt is non-zero"
    expect_status 0 "non-shell file is skipped"
    expect_status 0 "directory is skipped"
    expect_status 1 "invalid JSON is non-zero"
    expect_status 1 "outside symlink is non-zero"

Use shims to record shfmt and shellcheck order and exact
--apply-ignore -w -- arguments.

- [ ] **Step 2: Prove handler test is red**

  python3 scripts/test_shellcheck_after_edit_plugin.py

Expected: FAIL because shellcheck-after-edit.sh is absent.

- [ ] **Step 3: Implement the minimal safe interface**

Start with:

    #!/usr/bin/env bash
    set -u -o pipefail

    scope=""
    shellcheckrc=""

    fail() {
      printf 'shellcheck-after-edit: %s\n' "$1" >&2
      exit 1
    }

Accept only --scope and optional --shellcheckrc; reject unknown arguments.
Canonicalize scope with cd scope and pwd -P. Read stdin once and parse with jq
-er; never evaluate payload data as shell syntax.

Collect/deduplicate only tool_response.filePath, tool_input.file_path,
tool_input.path, tool_input.file, and Add File/Update File patch lines. Return
zero when there is no .sh/.bash candidate. For a selected shell candidate,
require a regular file, canonicalize it through its parent, and reject every
target outside the canonical scope.

Resolve tools only through command -v. Execute:

    "$shfmt_bin" --apply-ignore -w -- "$target" ||
      fail "shfmt failed for $target"

    if [ -n "$shellcheckrc" ]; then
      [ -f "$shellcheckrc" ] || fail "ShellCheck profile is missing: $shellcheckrc"
      "$shellcheck_bin" --rcfile "$shellcheckrc" -- "$target"
    else
      "$shellcheck_bin" -- "$target"
    fi

Do not force ShellCheck dialect, severity, -x, source path, optional checks, or
disables. Existing discovery or the approved profile is authoritative.

- [ ] **Step 4: Run behavior and static analysis**

  python3 scripts/test_shellcheck_after_edit_plugin.py
  bash -n plugins/shellcheck-after-edit/skills/shellcheck-after-edit/assets/templates/shellcheck-after-edit.sh
  shfmt -w plugins/shellcheck-after-edit/skills/shellcheck-after-edit/assets/templates/shellcheck-after-edit.sh plugins/shellcheck-after-edit/skills/shellcheck-after-edit/assets/templates/test-shellcheck-after-edit.sh
  shellcheck plugins/shellcheck-after-edit/skills/shellcheck-after-edit/assets/templates/shellcheck-after-edit.sh plugins/shellcheck-after-edit/skills/shellcheck-after-edit/assets/templates/test-shellcheck-after-edit.sh

Expected: all pass, fixture prints PASS, and recorded order proves shfmt precedes
ShellCheck.

- [ ] **Step 5: Add both templates to repository shell checks**

Modify package.json shellcheck:check and shfmt:check to include:

    plugins/shellcheck-after-edit/skills/shellcheck-after-edit/assets/templates/shellcheck-after-edit.sh
    plugins/shellcheck-after-edit/skills/shellcheck-after-edit/assets/templates/test-shellcheck-after-edit.sh

- [ ] **Step 6: Commit the executable contract**

  git add scripts/test_shellcheck_after_edit_plugin.py package.json plugins/shellcheck-after-edit/skills/shellcheck-after-edit/assets/templates
  git commit -m "feat: add shellcheck after edit hook template"

### Task 4: Author the approval-gated skill and references

**Files:**

- Create: plugins/shellcheck-after-edit/skills/shellcheck-after-edit/SKILL.md
- Create: references/hook-workflow.md
- Create: references/bundled-shellcheck-profile.md
- Create: references/project-configuration.md
- Create: references/hook-validation.md
- Modify: plugins/shellcheck-after-edit/README.md
- Test: scripts/test_shellcheck_after_edit_plugin.py

**Interfaces:**

- Consumes: templates from Tasks 2–3 and current official Codex, ShellCheck, and
  shfmt documentation at live-install time.
- Produces: a workflow selecting one scope, one representation, and independent
  policy routes only after inspection and approval.

- [ ] **Step 1: Write the skill router**

Use frontmatter naming shellcheck-after-edit and a description that activates for
linting/formatting .sh/.bash files or design, installation, review, test, and
troubleshooting of an approval-gated Codex hook. Route intentional commands
separately from hook work. Hook work verifies current official Codex hook
behavior, inspects sources, shows exact change, and waits for explicit approval.

- [ ] **Step 2: Write operational references**

Require read-only inventory of:

    <repo>/.codex/hooks.json
    <repo>/.codex/config.toml
    $HOME/.codex/hooks.json
    $HOME/.codex/config.toml
    <repo>/.shellcheckrc
    <repo>/shellcheckrc
    <repo>/.editorconfig

Then require chosen project/user scope, one JSON/TOML representation, minimal
merge, copied handler, optional profile, executable handler/test, fixture test,
exact configuration review, slash-hooks review/trust, and narrow rollback.

Explain that --rcfile supersedes normal ShellCheck discovery. Explain that
.editorconfig is project-owned, needs a reviewed merge, and is disabled by
shfmt parser/printer flags. Include the manual invocation:

    printf '%s\n' '{"cwd":"/path/to/project","tool_input":{"file_path":"script.sh"}}' | bash /path/to/.codex/hooks/shellcheck-after-edit.sh --scope /path/to/project

Require clean, unformatted, lint-negative, ignored, missing-tool, diff, and
slash-hooks review checks.

- [ ] **Step 3: Align README claims with components**

Add a component table for the skill, four references, handler/test, JSON/TOML
fragments, ShellCheck profile, and shfmt fragment. Document all three routes for
each tool; state the bundled shfmt profile is project-only while user scope uses
defaults or each project's discovered .editorconfig.

- [ ] **Step 4: Validate skill and product contract**

  uv run --with pyyaml python "$CODEX_HOME/skills/.system/skill-creator/scripts/quick_validate.py" plugins/shellcheck-after-edit/skills/shellcheck-after-edit
  python3 scripts/test_shellcheck_after_edit_plugin.py
  npx prettier --check plugins/shellcheck-after-edit README.md

Expected: all pass. If temporary uv dependency resolution requires approval, stop
rather than downloading it.

- [ ] **Step 5: Commit workflow documentation**

  git add plugins/shellcheck-after-edit scripts/test_shellcheck_after_edit_plugin.py package.json
  git commit -m "feat: document shellcheck after edit workflow"

### Task 5: Register and fully verify the marketplace product

**Files:**

- Modify: README.md
- Modify: .agents/plugins/marketplace.json through generator only.
- Modify: release configuration only if inspection proves an existing mechanism requires one entry.
- Test: scripts/test_shellcheck_after_edit_plugin.py

**Interfaces:**

- Consumes: the complete package from Tasks 1–4.
- Produces: root discovery, generated source ./plugins/shellcheck-after-edit, and final gate evidence.

- [ ] **Step 1: Inspect catalog and release conventions**

  find . -maxdepth 3 \( -name 'release-please-config.json' -o -name '.release-please-manifest.json' \) -print
  rg -n 'ruff-after-edit|block-no-verify|prettier-after-edit' README.md .agents/plugins/marketplace.json .github

Expected: identify actual convention; do not invent Release Please files when
none exist.

- [ ] **Step 2: Add root README discovery**

Add ShellCheck After Edit to catalog, routing, and keyword links using:

    Approval-gated ShellCheck and shfmt edit hygiene.
    Format and lint edited .sh/.bash files with approval-gated consumer hooks.
    ShellCheck edit hooks.

Keep table ordering and relative-link style.

- [ ] **Step 3: Generate catalog, never hand-edit it**

  npm run marketplace:build
  npm run marketplace:check

Expected: one shellcheck-after-edit entry with source
./plugins/shellcheck-after-edit.

- [ ] **Step 4: Run focused and full gates**

  python3 scripts/test_shellcheck_after_edit_plugin.py
  npm run format:check
  npm run marketplace:test
  npm run github-labels:test
  npm run validate:github-labels
  npm run ruff:format:check
  npm run ruff:check
  npm run basedpyright:check
  npm run shfmt:check
  npm run shellcheck:check
  npm run check
  git diff --check
  git status --short --branch

Expected: all applicable checks pass, generated metadata is current, and no
unrelated modifications exist.

- [ ] **Step 5: Review invariants and commit registration**

Confirm agreement among manifest, skill, agent manifest, README, changelog,
license, references, templates, root README, and catalog. Confirm no active
package hook, no duplicate representation, and no false global shfmt claim.

    git add README.md .agents/plugins/marketplace.json package.json scripts plugins/shellcheck-after-edit
    git commit -m "feat: register shellcheck after edit plugin"

## Plan Self-Review

- **Spec coverage:** Tasks 1–2 establish skills-only contract, scopes, JSON/TOML
  choices, and independent policies. Task 3 provides exact-file
  shfmt-then-ShellCheck behavior with positive and negative proof. Task 4 adds
  inspection, approval, merge, trust, and rollback. Task 5 registers and
  verifies the complete product.
- **Placeholder scan:** No task has TBD, TODO, unnamed files, or undefined
  interface. Release configuration is inspection-gated because current evidence
  found no root release configuration to copy.
- **Interface consistency:** Every wiring fragment runs shellcheck-after-edit.sh
  with --scope; an optional profile uses --shellcheckrc; shfmt always discovers
  .editorconfig; and the Python test invokes the same Bash interface consumers use.
