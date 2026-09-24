# Ruff Hook Validation

Validate in a disposable or already-approved consumer scope.

## Static checks

Run these against copied consumer scripts:

```sh
shfmt -d .codex/hooks/ruff-after-edit.sh .codex/hooks/ruff-check-on-stop.sh
shellcheck .codex/hooks/ruff-after-edit.sh .codex/hooks/ruff-check-on-stop.sh
```

Run the selected Ruff route against the approved scope:

```sh
<ruff> check -- <scope>
<ruff> format --check -- <scope>
```

If pre-existing diagnostics exist outside the requested work, narrow the scope
or record the baseline. Do not suppress rules to make the gate green.

## Behavioral checks

Use a temporary Python file inside the approved scope:

1. Create an intentionally formatable `.py` file.
2. Feed a representative `PostToolUse` JSON payload to `ruff-after-edit.sh`.
3. Confirm safe lint fixes and formatting run only for that file.
4. Feed an out-of-scope or non-Python path and confirm it is skipped.
5. Run `ruff-check-on-stop.sh` and confirm it exits `0` only when the approved
   scope is clean.

After wiring, inspect `/hooks`. Non-managed hooks must be reviewed and trusted
by the user before they run.
