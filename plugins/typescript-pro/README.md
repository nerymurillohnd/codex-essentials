# TypeScript Pro

TypeScript Pro helps Codex implement and review TypeScript or TSX without
confusing compiler assertions with runtime proof. It inspects the project's
actual compiler, framework, module mode, lockfile, and checks before changing
types or configuration.

## Install and use

```sh
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add typescript-pro@codex-essentials
```

Ask:
`Use $typescript-pro to review this API boundary and preserve runtime behavior.`
The package includes one [skill](skills/typescript-pro/SKILL.md),
[Codex metadata](skills/typescript-pro/agents/openai.yaml), and a conditional
[boundary and state reference](skills/typescript-pro/references/boundary-and-state-patterns.md).

## Inputs and result

Provide the TypeScript task, target source, package manifest and lockfile,
`tsconfig`, framework configuration, and applicable checks. For reviews, the
skill reports location-specific trust, state, configuration, and security
findings without editing. For authorized changes, it makes a scoped fix and
reports the project-local checks and behavioral implications.

The skill treats JSON, network responses, environment variables, forms, and
third-party data as untrusted until runtime validation proves their shape.
Closed states can use discriminated unions and exhaustive handling. Client
prices and quantities still require server-side domain checks.

## Requirements and boundaries

- Supported environments: TypeScript/TSX projects using a local compiler and
  declared package manager. The skill itself bundles no compiler, hook, MCP
  server, credential, executable, or network service.
- Installation only changes Codex-managed plugin state. Target-project writes
  occur solely within a separately authorized TypeScript task.
- Compiler and framework commands must come from the target project. A missing
  tool or incompatible version is reported, not silently replaced by a
  downloaded or suppressed toolchain.
- Type assertions, `any`, non-null assertions, and suppression comments require
  a justified boundary. Types do not replace runtime authorization, pricing, or
  validation.

## Update and removal

```sh
codex plugin marketplace upgrade codex-essentials
codex plugin add typescript-pro@codex-essentials
codex plugin list --json
codex plugin remove typescript-pro@codex-essentials
```

This new lineage begins at `0.1.0`; explicitly reinstall after refreshing the
Git marketplace if an older installation from the former history remains. Start
a new Codex session to confirm the current skill is available. Removing the
plugin does not revert any target-project edits.

## Maintainer verification

Run `npm run check` from the marketplace root and install from a clean Codex
home. A representative review should identify an unchecked external-data
boundary without editing; a scoped implementation should run the project's
actual typecheck and relevant tests. Check version-specific claims against the
official TypeScript release for the detected compiler.

See the [changelog](CHANGELOG.md) and [MIT license](LICENSE.md). This is an
independent community plugin, not a Microsoft or OpenAI product.
