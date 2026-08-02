# Convex implementation handoff

The Sites deployment uses the demo repository because this runtime proof did not establish a configured Convex deployment. `lib/repositories/event-repository.ts` is the persistence boundary.

To activate Convex on a compatible host: install `convex`, replace this schema blueprint with `defineSchema` and typed validators, configure `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL`, then implement each repository method as an authenticated Convex query/mutation. Add compound uniqueness checks for `(userId,eventId)` RSVPs and `(userId,feedItemId)` likes. Award points inside the same accepted-submission transaction after checking an immutable ledger key (`submission:{id}:accepted`) so retries cannot double-award. Admin review must check a server-side role claim.

Required indexes are enumerated in `schema.ts`; it mirrors the requested data model without silently claiming the demo is connected to Convex.
