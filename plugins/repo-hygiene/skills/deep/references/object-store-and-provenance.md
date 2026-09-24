# Object Store and Provenance

Use narrowly scoped read-only checks when ordinary refs do not explain a
repository's history or size:

```sh
git for-each-ref --format='%(refname) %(objecttype) %(objectname)' refs
git show-ref --head --dereference
git count-objects -vH
git fsck --full --strict --connectivity-only
git rev-parse --git-path objects/info/alternates
git rev-parse --git-path packed-refs
```

Logical refs may be loose or packed. Notes, replace refs, provider refs, and
tool refs are provenance until classified. Alternates can make objects available
from another store. `git fsck --unreachable --no-reflogs` may expose objects
kept only by reflogs; it does not prove that they are dispensable. Correlate
findings with refs, stashes, worktrees, and any retained bundle before proposing
object deletion. Do not edit `packed-refs`, prune, repack, or run `git gc` as a
diagnostic response.

Configuration inspection can expose private remote URLs or credential-helper
settings. Query only relevant keys, redact values, and report provenance without
printing secrets.

Source: [Git reference](https://git-scm.com/docs/git).
