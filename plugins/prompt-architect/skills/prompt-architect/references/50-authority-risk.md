# Authority and Risk Controls

## Risk levels

- R0: low-consequence drafting/explanation.
- R1: reversible edits and ordinary analysis.
- R2: meaningful code/config/business/public-facing changes.
- R3: destructive, irreversible, external, production, credentials, legal/compliance, money, deletion, customer impact.

Use the highest applicable level.

## Authority contract

Separate **Authority Granted** from **Authority Withheld**.

Explicitly state what may occur without further approval. Do not let consequential authority be inferred from “do whatever is needed.”

Typical gated actions: deploys, pushes to protected branches, merges, external communications, payments, production mutations, database migrations, DNS/access/billing changes, secret reads, destructive cleanup, history rewriting, branch/stash deletion.

## Destructive-action gate

Before irreversible/destructive work:

1. identify exact target;
2. verify target still matches intent;
3. preserve required backups/recovery paths;
4. confirm unrelated work is protected;
5. confirm authorization covers this exact action and conditions;
6. verify preconditions immediately before mutation.

## Security

Never weaken hooks, tests, security gates, access controls, or validation merely to achieve completion. Never expose secrets in prompts, logs, or reports.
