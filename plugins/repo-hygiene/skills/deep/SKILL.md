---
name: deep
description:
  Use when explicitly invoked as $repo-hygiene:deep for comprehensive Git
  topology, integration, recovery, security, or object-store audits before a
  consequential repository cleanup.
---

# Deep Repo Hygiene

Start with a read-only topology: root and common Git directory, all worktrees,
dirty state, local and remote refs, stashes, reflogs, provider PRs, and tags.
Read [topology and recovery](references/topology-and-recovery.md) for those
surfaces, [revisions and integration](references/revisions-and-integration.md)
for divergence or strategy, and
[object provenance](references/object-store-and-provenance.md) for hidden refs,
packfiles, alternates, or object health.

Classify every item as active work, authoritative ref, retained recovery
evidence, stale operational risk, deletion candidate, or unknown. A branch equal
to its remote ref proves only that pair's position; it does not certify PR
review, hidden refs, stashes, other worktrees, or unreached objects. Separate
provider state from local Git and record the exact observed SHA and time. Do not
print credential-bearing configuration or private URLs.

Before a consequential mutation, establish exact targets, dependency order,
protection rules, recoverability, and a rollback or retained path. If the user
already approved a concrete plan, proceed within it after revalidation. A
generic cleanup request does not identify which forensics or user data may be
destroyed; present a reviewable plan for that missing decision. Do not force
push, rewrite published history, prune objects, delete unique commits, or remove
a remote merely to simplify a diagram.

After an authorized action, re-enumerate refs, worktrees, stashes, provider PRs,
relevant objects, checks, and the target project's gate at the scope of the
original request. Report exact operations, preserved evidence, recovery, and
unresolved limits. No narrow topological equality is a whole-repo cleanliness
certificate.
