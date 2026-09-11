# Production / Infrastructure Domain

Default production-adjacent investigation to read-only unless explicit mutation authority exists.

Before mutation, require exact change definition, affected systems, permissions, blast radius, rollback/recovery path, validation plan, and approval gate.

Gate deployment, migration, DNS, secrets, access-control, billing, databases, and customer-facing changes.

Prefer preparation and verification locally/staging before external mutation.

Final report should distinguish actions performed from actions intentionally withheld and include rollback information when applicable.
