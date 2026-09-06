# Workspace Contract

## Canonical Workspace Name

The canonical workspace folder is named exactly:

```text
System-Ops
```

The folder name and internal architecture are fixed requirements for this workflow. The agent may recommend only the parent location where `System-Ops` should live.

## Required Architecture

```text
System-Ops/
  .codex/
    hooks/
    skills/
      system-ops-audit/
  archive/
  audits/
    environment/
  decisions/
  inventory/
  scripts/
```

## Startup Procedure

1. Determine the active username without collecting unnecessary personal data.
2. Check whether `/Users/{username}/System-Ops` exists.
3. If it exists, use it as the workspace candidate.
4. Verify every required directory.
5. If directories are missing, report the exact missing relative paths.
6. Ask for explicit approval before creating missing directories.
7. If `/Users/{username}/System-Ops` does not exist, inspect the local context and recommend a parent location.
8. Explain that only the parent location is variable; `System-Ops` and the internal architecture are fixed.
9. Ask the user whether to create `System-Ops` under the recommended parent or under a different parent.
10. Do not create, move, rename, delete, or modify files before explicit approval.

## Workspace Mutation Boundary

Creating the workspace or missing folders is a filesystem mutation. It requires explicit user approval.

Approved workspace creation does not imply approval to create scripts, execute scripts, modify audit outputs, install tools, change system settings, or remediate findings.
