# 🧩 Codex Essentials

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

**Codex Essentials** is a community marketplace and data repository for
distributable Codex plugins. It provides the catalog, schemas, generators,
validators, documentation, and quality gates needed to publish reusable skills,
MCP integrations, and supporting assets.

> **Current status:** the marketplace publishes its first installable plugin:
> `Astro Commandments` (`astro-cli-commands`).

## 👤 Ownership and Repository

- **Owner:** Nery Samuel Murillo
- **GitHub:** [@nerymurillohnd](https://github.com/nerymurillohnd)
- **Declared repository:** [nerymurillohnd/codex-essentials](https://github.com/nerymurillohnd/codex-essentials)
- **Configured Git remote:** `https://github.com/nerymurillohnd/codex-essentials.git`.
- **License:** [MIT](LICENSE.md)

## 📦 Install the Marketplace

Codex can track a repository marketplace directly from its Git remote. The
`--ref` option pins the source to a branch or tag:

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin marketplace list
```

Open the Plugins Directory in the ChatGPT desktop app, select **Codex
Essentials**, and install **Astro Commandments** (`astro-cli-commands`) or
another available plugin.

For local authoring and testing, register a checkout instead:

```bash
codex plugin marketplace add /absolute/path/to/codex-essentials
```

Marketplace paths and plugin manifests must remain inside their intended roots.
Codex resolves local `source.path` values relative to the marketplace root, not
relative to `.agents/plugins/`.

See the [official Codex plugin packaging guide](https://developers.openai.com/plugins/build/plugins)
for current marketplace, plugin, path, and distribution behavior.

## 🗂️ Directory Reference

| Path                               | Purpose                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| `.agents/plugins/marketplace.json` | Required marketplace catalog and plugin ordering.                              |
| `plugins/<plugin-id>/`             | Plugin packages; each requires `.codex-plugin/plugin.json`.                    |
| `templates/`                       | JSON Schemas and product-documentation templates.                              |
| `.github/`                         | Issue forms, pull-request contract, release categories, and CI gates.          |
| `scripts/`                         | CommonJS validators, generators, and typecheck wrapper.                        |
| `tsconfig.scripts.json`            | Dedicated `checkJs` project for JavaScript, CJS, and MJS sources.              |
| `scripts/tsconfig.json`            | Editor-discoverable config for files inside `scripts/`.                        |
| `types/`                           | TypeScript contracts and declaration-only interfaces.                          |
| `tests/`                           | TypeScript Vitest tests and configuration boundary checks.                     |
| `docs/agent-guidelines/`           | Detailed architecture, tooling, security, quality, and communication guidance. |
| `docs/decisions/`                  | Architecture Decision Records and the reusable ADR template.                   |
| `docs/maintenance/`                | Pending and resolved maintenance debt.                                         |
| `docs/operations/`                 | Community GitHub Projects and operational automation guidance.                 |
| `adapters/`, `config/`             | Supporting integration and repository configuration material.                  |

There is intentionally no repository-level `skills/` directory. Skills belong
inside the plugin that distributes them, for example
`plugins/example/skills/example-workflow/SKILL.md`.

The current manifest schema validates skills, apps, MCP integrations, and
interface assets. Top-level `hooks` are intentionally outside this schema until
the repository validator and the supported Codex packaging contract are aligned.

## 🛠️ Development

```bash
npm install
npm run format          # Write Prettier formatting
npm run lint            # Lint JavaScript runtime files
npm run typecheck       # TypeScript 7 strict no-emit check
npm run typecheck:scripts # Check JavaScript files with @ts-check
npm test                # Vitest with coverage
npm run validate:all    # Validate catalog, schemas, and plugin directories
npm run documentation:gate -- --base <base> --head <head> # PR documentation gate
npm run validate:release -- plugin/<plugin-id>/v<semver> # Release contract
npm run check           # Aggregate npm-owned quality gate
```

The policy is literal: local hooks are advisory; CI is authoritative. Husky installs a no-shim
pre-commit hook that runs `npx --no-install lint-staged` for staged files.
Authorized emergency bypasses use `HUSKY=0` or `--no-verify`; HUSKY=0 in CI
keeps npm installation reproducible and prevents local hook side effects.

Required quality commands:

```bash
npm run format:check
npm run lint -- --max-warnings=0
npm run typecheck
npm run typecheck:scripts
npx tsc6 --noEmit
npm test
npm run validate:all
npm run validate:release
actionlint .github/workflows/*.yml
git diff --check
```

The repository keeps TypeScript 7 and TypeScript 6 side by side:

```bash
npx tsc --noEmit        # Native TypeScript 7 compiler
npx tsc6 --noEmit       # TypeScript 6 compiler/API compatibility path
```

GitHub Actions use Node 24, full SHA pins for third-party actions, separate
quality jobs, and a stable `required` aggregator for branch-protection required
checks. Plugin release tags are validated against the exact tag checkout, draft
releases attach a deterministic archive of the target plugin, and final
publication requires release environment approval through the protected
`release` environment. Rollback for a plugin release means restoring the prior
marketplace metadata, deleting the GitHub release, and deleting the release tag.

To scaffold content, use the repository generators:

```bash
npm run generate:marketplace
npm run generate:plugin -- example-plugin
npm run complete:marketplace
npm run complete:plugin -- example-plugin
```

## 📚 Documentation

- [Architecture and paths](docs/agent-guidelines/architecture.md)
- [Tooling and runtimes](docs/agent-guidelines/tooling.md)
- [Security and credentials](docs/agent-guidelines/security.md)
- [Quality and maintenance](docs/agent-guidelines/quality.md)
- [ADR template](docs/decisions/adr-template.md)
- [TypeScript side-by-side decision](docs/decisions/typescript-side-by-side.md)
- [Maintenance records](docs/maintenance/)
- [GitHub Projects operations](docs/operations/github-project-template.md)
- [Documentation automation decision](docs/decisions/adr-0004-documentation-and-maintenance-automation.md)
- [Hooks and quality gates decision](docs/decisions/adr-0005-hooks-and-quality-gates.md)

## 🤝 Contribution Style

Use clear Markdown, semantic headings, restrained emoji, and descriptive file
names. Keep plugin paths relative and `./`-prefixed, avoid `any` and magic
strings, never commit credentials, and include validation evidence in pull
requests. All repository artifacts are written in English; conversation and
issue coordination may use Spanish.
