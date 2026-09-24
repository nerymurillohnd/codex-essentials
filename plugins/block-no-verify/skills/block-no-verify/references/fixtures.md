# Block No Verify Fixtures

The package includes handler fixtures under `hooks/fixtures/`.

Expected results:

| Fixture                    | Expected                                                      |
| -------------------------- | ------------------------------------------------------------- |
| `allow-status.json`        | Exit `0`, no stdout, no stderr.                               |
| `block-no-verify.json`     | Exit `0`, JSON deny output mentioning `--no-verify`.          |
| `block-gpgsign-false.json` | Exit `0`, JSON deny output mentioning `commit.gpgsign=false`. |

Manual examples after `/hooks` trust:

```sh
git status
git commit --no-verify -m hook-live-probe
git -c commit.gpgsign=false commit -m hook-live-probe
```

Use a disposable repository or a state where the blocked commands cannot create
a real commit. Do not bypass hooks or signing to make a test pass.
