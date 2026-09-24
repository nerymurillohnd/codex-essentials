# ShellCheck Hook Validation

Validate in a disposable or already-approved consumer scope.

## Static checks

Run these against copied consumer scripts:

```sh
shfmt -d .codex/hooks/shellcheck-after-edit.sh
shellcheck .codex/hooks/shellcheck-after-edit.sh
```

Run the selected tools against representative files:

```sh
shfmt --apply-ignore -d -- path/to/script.sh
shellcheck -- path/to/script.sh
```

If the approved workflow uses a ShellCheck rcfile, include
`--rcfile path/to/shellcheckrc` in the check.

## Behavioral checks

Use a temporary shell file inside the approved scope:

1. Create an intentionally formatable `.sh` file.
2. Feed a representative `PostToolUse` JSON payload to
   `shellcheck-after-edit.sh`.
3. Confirm shfmt rewrites only that file and ShellCheck reports remaining
   diagnostics.
4. Feed an out-of-scope or non-shell path and confirm it is skipped.
5. Feed a missing eligible path and confirm the handler fails visibly.

After wiring, inspect `/hooks`. Non-managed hooks must be reviewed and trusted
by the user before they run.
