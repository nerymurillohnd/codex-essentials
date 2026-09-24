# Audit workspace contract

Discover the user's selected workspace or the current local context first.
`System-Ops` is a useful folder name when the user wants a dedicated operations
workspace, but neither its parent directory nor its internal layout is
universal. Inspect existing conventions before suggesting a new one.

A small initial layout can be:

```text
System-Ops/
  audits/environment/
  scripts/
  decisions/
```

Create only directories that the requested baseline actually needs. Record the
exact target path and existing files before a write. A direct request to prepare
that path authorizes scoped directory creation; it does not authorize running
diagnostics, changing macOS settings, or deleting existing files. Preserve
unrelated work and choose a different path if the proposed target would collide
with user data.
