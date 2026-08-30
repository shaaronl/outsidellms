# JamQuest Backend Functionality Contract

## Purpose

This document is the implementation contract for making JamQuest functional across mobile, tablet, desktop, refreshes, devices, and production deployments. It converts the product specifications in [`features/`](features/README.md) into backend work that can be implemented and verified in order.

The backend is complete only when every visible production action has a durable, authorized server result and every screen has honest loading, empty, success, stale, offline, and failure behavior. A responsive layout is not considered functional if it changes or loses data at a breakpoint.

## Current reality

As of August 19, 2026, Phase 1 is connected to the Convex development deployment:

| Runtime | Current implementation | Limitation |
| --- | --- | --- |
| Local Next.js | React uses Convex Auth and generated Convex APIs directly | Connected to development Convex; not evidence of preview/production readiness |
| Static production worker | Public provider routes remain in the worker; legacy D1 auth/progress code has been removed | Must receive the correct production Convex URL at build time |
| Convex development | Auth signing, profiles/settings, events/occurrences, RSVPs, schedule, and Today functions are deployed | Password auth is development-only until verification/recovery is configured |

Additional gaps:

- The frontend no longer calls legacy `/api/auth/*` or `/api/progress`; those local routes were removed.
- Crews, statuses, quests, points, rewards, Pulse, account export, and deletion do not yet have complete first-class implementations.
- Event-provider data is fetched, but it is not normalized into a durable event/occurrence cache with freshness and change history.
- There is no verified local/preview/production Convex environment separation.
- A successful local build is not evidence that production auth or persistence works.
- The previously shared Ticketmaster key must be rotated before production and must never be committed or sent to the browser.

**Launch blocker:** development now has one Convex-backed ownership model, but do not ship account creation or claim production cross-device sync until verified email/recovery, preview, production, credential rotation, and the production release gate pass.

## Target architecture

Convex is the source of truth for identity and application data.

```text
Responsive Next.js client
  ├─ public Convex queries: events, occurrences, map essentials, capability flags
  ├─ authenticated Convex queries/mutations: profile, RSVP, schedule, crew, quests
  └─ Convex Auth session: secure provider-managed tokens

Convex actions / scheduled jobs
  ├─ Ticketmaster or JamBase provider adapters
  ├─ normalized event cache and material-change detection
  ├─ email delivery and lifecycle jobs
  ├─ offline manifest generation
  └─ telemetry, cleanup, expiry, and reconciliation

External systems
  ├─ event providers
  ├─ transactional email provider
  ├─ object storage, only when export or approved media ships
  └─ privacy-safe monitoring
```

Architecture rules:

1. Convex Auth identity is resolved inside every private query, mutation, and action. Client-provided user IDs are never accepted as ownership.
2. Domain data uses first-class tables. Do not expand `userProgress.payload` into a permanent application database.
3. Provider secrets exist only in Convex/runtime environment variables. They never use `NEXT_PUBLIC_` names and never appear in responses.
4. Public reads remain available when optional authenticated or social features fail.
5. Server time owns creation, update, expiry, and award timestamps.
6. Every mutation is idempotent or accepts an idempotency key.
7. Capability flags are checked on the server, not only used to hide UI.
8. Production contains no demo accounts, fixed crew codes, simulated feed items, fake attendance, or client-generated balances.

## Functional response contract

Every client-facing operation must resolve to one of these states:

| State | Required UI behavior | Backend requirement |
| --- | --- | --- |
| `loading` | Skeleton keeps the final layout dimensions | Query has deterministic shape and cancellation support |
| `empty` | Explain why it is empty and provide one useful next action | Return an empty collection or explicit state, not a generic error |
| `success` | Render confirmed server data | Include stable IDs and relevant server timestamps |
| `saving` | Disable only the duplicate action; preserve navigation | Mutation remains idempotent |
| `saved` | Announce confirmation and reconcile optimistic UI | Show only after mutation acknowledgement |
| `stale` | Keep useful cached content with visible freshness | Include `lastVerifiedAt`, source, and stale reason |
| `offlineQueued` | Show “Offline—will retry” and allow cancel | Use only after a real durable client retry queue exists |
| `unauthorized` | Preserve the intended action and open sign-in | Return a typed auth error without leaking resource existence |
| `forbidden` | Explain that access is unavailable | Authorization is enforced before private data is read |
| `rateLimited` | Show retry time without destructive reset | Return a safe `retryAfterMs` value |
| `unavailable` | Keep unrelated features usable | Return typed provider/feature availability information |
| `failed` | Preserve user input and expose Retry | Return a stable error code and correlation ID |

Recommended result envelope for actions crossing a provider or retry boundary:

```ts
type FunctionalResult<T> =
  | { ok: true; data: T; serverTime: number }
  | {
      ok: false;
      code:
        | "UNAUTHENTICATED"
        | "FORBIDDEN"
        | "NOT_FOUND"
        | "VALIDATION_FAILED"
        | "CONFLICT"
        | "RATE_LIMITED"
        | "FEATURE_DISABLED"
        | "PROVIDER_UNAVAILABLE";
      retryable: boolean;
      retryAfterMs?: number;
      correlationId: string;
    };
```

User-facing copy stays in the client. Backend errors must not expose provider responses, stack traces, account existence, tokens, emails, or private text.

## Responsive functionality contract

Backend behavior is viewport-independent. A user must see the same account, RSVP, schedule, and crew truth at 320 px and 1440 px. Responsive components may reorganize data but may not silently remove required actions.

| Surface | Mobile requirement | Wider-screen requirement | Backend data required |
| --- | --- | --- | --- |
| Landing/discovery | One-column cards, paginated load, no sign-in wall | Grid/list presentation | Compact event summary, source, freshness, cursor |
| Event detail | Primary information and Save remain above secondary content | Detail and planning panels may sit side by side | Event, occurrences, capabilities, current RSVP |
| Today | Now/Next and essentials in the first viewport | Schedule rail and crew summary may be adjacent | Server-time context, ordered occurrences, changes, crew summary |
| Schedule | Day tabs and conflict actions work one-handed | Multi-column day view allowed | Event-local grouping, conflicts, decisions |
| Map | Text essentials remain available without gestures | Map and list can coexist | Versioned locations, provenance, categories, freshness |
| Crew | Invite/status actions use sheets or full screens | Panels/modals allowed | Membership, role, invite state, expiring statuses |
| Account | Forms never lose values during layout changes | Settings can use sidebar navigation | Profile/settings/session queries and typed mutations |

API requirements supporting responsive use:

- Cursor pagination; never require downloading an entire event catalog or feed.
- Summary and detail query shapes so mobile cards do not fetch unused large records.
- Reserved image dimensions and optimized provider image variants.
- No correctness dependency on hover, local component memory, or the current device clock.
- Stable URLs and IDs so refresh, Back, deep links, and orientation changes preserve context.
- Abort/retry-safe reads and idempotent writes for intermittent mobile networks.
- Initial public screen payload target: 100 KB compressed JSON or less; later pages 50 KB or less per page unless measured and approved.

## Required data model

### Release A — trustworthy planner

| Table | Minimum fields | Required indexes/invariants |
| --- | --- | --- |
| `profiles` | `userId`, `displayName`, optional avatar, `activeEventId`, timestamps | unique `by_user`; normalized display-name validation |
| `privacySettings` | `userId`, profile/crew/post visibility, consent versions, timestamps | unique `by_user` |
| `notificationSettings` | `userId`, categories, quiet hours/time zone, unsubscribe timestamps | unique `by_user` |
| `events` | canonical ID, provider/source, source ID, type, name, IANA time zone, venue/location, capability flags, freshness, state | unique provider + source ID; by type/state |
| `eventOccurrences` | event, artist/title, start/end, stage/venue, status, verified timestamp | by event + start; unique provider occurrence |
| `eventChanges` | event/occurrence, change type, previous/current safe values, observed timestamp | by event and observed time |
| `rsvps` | user, occurrence, `interested`/`going`, timestamps | unique user + occurrence; by user and event |
| `scheduleDecisions` | user, deterministic conflict key, decision, timestamp | unique user + conflict key |
| `mapVersions` | event, version, published timestamp, source summary, state | unique event + version; one published version |
| `mapLocations` | event/version, category, name, area/coordinate confidence, provenance, hours, accessibility, verified timestamp | by event/version/category |
| `offlineManifests` | event/version, record list, asset list, size, checksum, published timestamp | unique event + version |
| `featureFlags` | environment/event scope, capability, enabled, reason, updated metadata | unique scope + capability |
| `accountExports` | user, state, request/completion/expiry timestamps, artifact reference | by user/state; expiring artifact |
| `accountDeletionJobs` | user, state, request/execute timestamps, retention outcome | one active job per user |

### Release B — coordination and engagement

| Table group | Required records |
| --- | --- |
| Crews | `crews`, `crewInvites`, `crewMemberships`, `crewStatuses`, `crewMeetupPoints`, `userBlocks` |
| Quests | `questDefinitions`, `questStarts`, `questSubmissions` |
| Economy | immutable `pointLedger`, `rewardDefinitions`, `rewardRedemptions`, `equippedItems` |

### Release C — social, only after moderation ownership exists

`posts`, `comments`, `reactions`, `reports`, `moderationActions`, `userMutes`, and optional approved `mediaAssets`. These tables and all Pulse mutations stay disabled until visibility, blocking, reporting, moderation queues, response ownership, and audit retention pass their release gate.

## Convex function contract

Function names are suggested module boundaries. Exact naming can change, but authorization and outcomes cannot.

### Auth and account

| Function | Type/access | Behavior |
| --- | --- | --- |
| `accounts:current` | query/authenticated | Return private account summary and public-profile fields separately |
| `profiles:provision` | mutation/authenticated | Idempotently create profile/settings after verified first sign-in |
| `profiles:update` | mutation/authenticated | Validate and update allowed profile fields |
| `settings:get` / `settings:update` | query/mutation/authenticated | Read/update privacy and notification settings |
| `accounts:requestExport` | mutation/authenticated + recent auth | Create one expiring export job |
| `accounts:requestDeletion` | mutation/authenticated + recent auth | Revoke sessions and start deletion/anonymization workflow |

MVP auth decision: use verified email OTP or magic link with a production transactional-email provider. The existing password-only provider is development-only until email verification, reset, abuse prevention, and recovery are complete.

### Events, RSVP, schedule, and Today

| Function | Type/access | Behavior |
| --- | --- | --- |
| `events:list` | query/public | Cursor-paginated festival or nearby summaries with source/freshness |
| `events:get` | query/public | Stable event detail, capabilities, occurrences, and attribution |
| `events:syncProvider` | action/internal | Fetch provider data using server secret, normalize, cache, record material changes |
| `rsvps:getForEvent` | query/authenticated | Return the signed-in user's states only |
| `rsvps:set` | mutation/authenticated | Upsert `interested`/`going` or remove; server owns user and time |
| `schedule:get` | query/authenticated | Event-local day groups, conflicts, changes, freshness |
| `schedule:resolveConflict` | mutation/authenticated | Store an explicit, idempotent decision |
| `today:get` | query/public or authenticated | Return server-relative phase, Now/Next, essentials, and optional private summary |

`rsvps:set` accepts `{ occurrenceId, state, idempotencyKey }`. It must return the confirmed RSVP, affected conflict summaries, and server time. It must reject nonexistent or disabled occurrences without creating orphan data.

### Map and offline

| Function | Type/access | Behavior |
| --- | --- | --- |
| `maps:getPublished` | query/public | Published version, categorized locations, provenance, freshness |
| `maps:getEssentials` | query/public | Water, medical, entrances/exits, accessibility, emergency copy |
| `offline:getManifest` | query/public | Versioned manifest metadata and signed/immutable asset references |
| `maps:publishVersion` | mutation/operator | Atomically publish a reviewed version and invalidate the prior manifest |

### Crews

| Function | Type/access | Behavior |
| --- | --- | --- |
| `crews:create` | mutation/authenticated | Create crew and owner membership atomically |
| `crewInvites:create` | mutation/owner | Generate a high-entropy, expiring invitation; persist only token hash where practical |
| `crewInvites:preview` | query/token holder | Return only safe crew/event/inviter/expiry context |
| `crewInvites:accept` | mutation/authenticated | Atomically validate invitation and create one membership |
| `crews:getMine` | query/authenticated | Return accepted memberships and permitted member fields |
| `crewStatuses:set` | mutation/accepted member | Set approved enum and server-owned expiry |
| `crewStatuses:clear` | mutation/status owner | Clear current status idempotently |
| `crews:leave` / `crews:removeMember` | mutation/authorized | End membership and immediately revoke access |

No crew query returns exact live location. Expired statuses are filtered using server time even before cleanup runs.

### Quests, points, and rewards

| Function | Type/access | Behavior |
| --- | --- | --- |
| `quests:listAvailable` | query/authenticated | Return only eligible, enabled, event-relevant definitions |
| `quests:start` | mutation/authenticated | Idempotently create a start for a versioned definition |
| `quests:submit` | mutation/authenticated | Validate the proof class and create a review/accepted state |
| `ledger:getBalance` | query/authenticated | Sum immutable entries; never trust a stored client balance |
| `rewards:redeem` | mutation/authenticated | Atomically verify inventory/balance, write debit, create redemption |
| `rewards:equip` | mutation/authenticated | Equip only an owned eligible digital item |

Award keys must be unique and deterministic. Retries cannot duplicate points. Corrections use compensating ledger entries; ledger history is never rewritten.

## Event-provider behavior

1. Use one normalized event contract regardless of provider.
2. Fetch provider data only from server actions or trusted scheduled jobs.
3. Cache the last usable verified response and record `lastVerifiedAt`.
4. Deduplicate by provider ID first, then conservative canonical matching. Never merge uncertain events automatically.
5. Store event-local IANA time zones and UTC timestamps. Formatting happens for the event time zone, not the device time zone.
6. Treat missing end times as unknown. Conflict logic may label a documented estimate as “possible conflict” but cannot claim “no conflict.”
7. Persist cancellations, postponements, stage/time changes, and sold-out status as material changes.
8. Add a provider circuit breaker and quota monitoring. Public cached data and safety essentials remain readable during outages.
9. Rotate the exposed Ticketmaster credential before enabling its adapter in preview or production.

## Authentication and migration sequence

The switch must avoid two active account systems.

1. Create isolated Convex deployments for local, preview, and production.
2. Configure the email provider, allowed origins, callback URLs, and separate secrets.
3. Replace the temporary generated Convex helper with official `npx convex dev` generated files.
4. Add `ConvexAuthProvider`/Convex client integration to the application root.
5. Implement verified sign-in, check-inbox, expired link, resend cooldown, sign-out, and recovery states.
6. Add profile provisioning and first-class RSVP tables.
7. Switch reads to Convex behind a local feature flag; compare results during development.
8. Switch writes to Convex. Do not dual-write to JSON/D1 without a designed reconciliation process.
9. Remove frontend dependency on `/api/auth/*` and `/api/progress`.
10. Keep legacy `.data`/D1 auth removed; do not reintroduce a second account system.
11. Verify one account and RSVP across two browsers in preview, then production canary.

No fake local accounts should be migrated to production. If real D1 users already exist, write a one-time, auditable migration plan with explicit identity linking and user communication before any transfer.

## Offline and retry behavior

- Public event detail, the user's schedule snapshot, Today essentials, and published map data are cached in IndexedDB through a versioned offline manifest.
- Private cached data is scoped to the authenticated account and cleared on sign-out or deletion.
- A queued write stores operation type, safe payload, idempotency key, account scope, creation time, attempts, and expiry. Never queue passwords, auth links, raw invite tokens, proof media, or account deletion.
- Reconnect processing checks session validity, replays in order where order matters, and stops for `FORBIDDEN`, `VALIDATION_FAILED`, or conflict resolution.
- The UI may say “Offline—will retry” only after the queue transaction succeeds.
- Queue count and last-sync time are visible. Users can retry or discard failed operations.

## Security and privacy requirements

- Validate all arguments with Convex validators and domain validation before writes.
- Enforce maximum sizes, allowed enums, rate limits, ownership, membership, visibility, and capability flags server-side.
- Prevent account enumeration in auth and recovery messages.
- Hash invitation bearer tokens and never log raw tokens.
- Redact emails, auth tokens/links, provider keys, private status, proof content, precise coordinates, and freeform private text from logs and analytics.
- Add a Content Security Policy and deliberate Convex/provider connect origins.
- Export and deletion require recent authentication. Deletion revokes sessions immediately.
- Safety essentials are public, free, and independent of quests or points.
- Pulse remains disabled until moderation operations are staffed and tested.

## Implementation plan

### Phase 0 — eliminate backend ambiguity (P0)

- [ ] Record local, preview, and production deployment identifiers and owners.
- [ ] Rotate the exposed Ticketmaster key and place replacement keys in server-only secret stores.
- [ ] Choose verified email OTP/magic link provider and configure development delivery.
- [x] Deploy development Convex and generate official API types.
- [x] Add client configuration validation that fails safely when the Convex URL is missing.
- [ ] Add a non-sensitive build/environment/version response for support.

**Exit evidence:** development Convex dashboard, successful authenticated `accounts:current`, no secret in client bundles, and documented environment IDs.

### Phase 1 — real identity and first save (P0)

- [x] Create `profiles`, settings, `events`, `eventOccurrences`, and `rsvps` with required indexes.
- [x] Connect the React application to Convex Auth.
- [x] Replace `/api/auth/*` with Convex Auth; verified email and recovery remain open.
- [x] Implement public cached-event reads plus authenticated RSVP list/set functions.
- [x] Implement pending guest Save resume with one idempotency key; browser evidence remains open.
- [ ] Load the same saved set after refresh and in a second browser.
- [x] Show Saving/Saved/failure using mutation acknowledgement, never timers alone.

**Exit evidence:** a real-email preview account saves one set, refreshes, signs into a second browser, and sees exactly one matching RSVP.

### Phase 2 — schedule, Today, map, and resilience (P0)

- [ ] Normalize and cache provider events with freshness and material-change history.
- [ ] Implement event-local schedule grouping and conflict detection.
- [ ] Implement Today pre-event, active-event, no-plan, changed-plan, and post-event states.
- [ ] Publish versioned essentials/map data with text-equivalent access.
- [ ] Generate and validate offline manifests.
- [ ] Add a real retry queue and visible sync state.
- [ ] Test at 320, 390, 768, 1024, and 1440 px with throttled and offline networks.

**Exit evidence:** first save flows into Today, time-zone/conflict tests pass, essentials remain available in airplane mode, and resize/orientation changes lose no state or action.

### Phase 3 — account lifecycle and production operations (P0)

- [ ] Implement settings, session handling, recovery, export, and deletion.
- [ ] Add authorization matrix and cross-user tests for every table/function.
- [ ] Add CI typecheck, unit, contract, accessibility, end-to-end, build, and secret-scan gates.
- [ ] Add redacted structured telemetry, provider health, write health, alerts, and runbooks.
- [ ] Add event-scoped feature flags and rollback/circuit-breaker controls.
- [ ] Deploy an isolated preview and run all release smoke tests.

**Exit evidence:** preview release gate passes with linked test runs, dashboards, configuration records, and rollback rehearsal.

### Phase 4 — crews (P1)

- [ ] Implement real crew creation, secure invite preview/acceptance/revocation, membership lifecycle, approved statuses, server expiry, meetup landmarks, and blocking.
- [ ] Replace the unavailable Crew screen only after two-account multi-device tests pass.

### Phase 5 — quests/rewards, then social (P1/P2)

- [ ] Implement one low-risk quest proof path and immutable point ledger.
- [ ] Enable digital rewards only after atomic redemption and reconciliation pass.
- [ ] Keep Pulse unavailable until visibility, reports, block/mute, moderation queue, operational ownership, and adversarial tests pass.

## Test matrix

### Automated unit and contract tests

- Schema validation, enum/size boundaries, provider normalization, missing fields, and time zones.
- RSVP idempotency, concurrent saves, removal, cross-user isolation, and orphan prevention.
- Schedule overlap, adjacency, unknown end, DST, multi-day events, and stored conflict decisions.
- Server-relative Today states before, during, after, and during provider changes.
- Invite entropy, expiry, revocation, capacity, concurrent acceptance, and blocked relationships.
- Ledger duplicate award, insufficient balance, concurrent redemption, and compensation.
- Export third-party data exclusion and deletion coverage across every domain table.

### End-to-end tests

1. Guest opens discovery and event detail without authentication.
2. Guest chooses Save, signs in with real test email, and returns to the same event.
3. The RSVP is confirmed once, appears in Schedule/Today, and survives refresh.
4. The same account sees the RSVP in a second browser and the first browser receives the update.
5. Sign-out removes private cached data while public event content remains available.
6. Provider failure shows cached/freshness state without breaking essentials.
7. Offline schedule/map loads; queued RSVP reconciles once after reconnect.
8. Account export and deletion complete in preview and revoked sessions cannot read data.

### Responsive and accessibility tests

At minimum test Chrome, Safari, and Firefox where supported, plus iOS Safari and Android Chrome at 320–1440 px:

- No horizontal document overflow at 320 or 390 px.
- 200% zoom retains every primary action.
- Keyboard and screen reader can complete sign-in, Save, conflict resolution, and sign-out.
- Rotation and breakpoint changes preserve forms, pending actions, selected event, and mutation status.
- Touch targets are at least 44 × 44 CSS px for primary on-site controls.
- Reduced motion, high contrast, offline, 3G throttling, and expired-session-during-write are covered.

## Observability and service targets

Initial preview/launch targets should be measured and adjusted with real traffic:

| Operation | Initial target | Alert signal |
| --- | --- | --- |
| Public event/essential query | 99.9% successful; p95 under 800 ms | 5-minute error or latency breach |
| Authenticated schedule/Today | 99.5% successful; p95 under 1 s | sustained query failure or auth collapse |
| RSVP mutation | 99.5% successful excluding validation; p95 under 1 s | write failures above 2% for 5 minutes |
| Provider sync | last usable cache within agreed freshness window | quota, malformed data, or stale cache breach |
| Account deletion | all jobs complete within documented policy window | stuck or failed job |

Every alert needs a named owner, dashboard, severity, user-impact description, and runbook. Correlation IDs may be logged; private payloads may not.

## Environment variables

Document names and ownership, never values:

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_CONVEX_URL` | browser, environment-specific | Public Convex deployment URL; not a secret |
| `CONVEX_DEPLOYMENT` | CLI/deployment | Select the intended Convex deployment |
| Convex Auth site/origin variables | Convex server | Allowed application site and callback context |
| Email-provider API key/from address | Convex server | OTP/magic-link delivery |
| `TICKETMASTER_API_KEY` or selected provider key | Convex server action | Event ingestion only |
| Build commit/environment | build/runtime | Non-sensitive release identification |
| Monitoring endpoint/token | server/runtime | Redacted operational telemetry |

Startup/deploy validation must distinguish required, optional, and feature-gated variables. A missing optional provider disables that provider with a truthful state; it must not crash public safety content.

## Production release gate

Production is not functional until all answers are **Yes** and evidence is linked:

- [ ] Is the frontend connected to the intended production Convex deployment?
- [ ] Does a real verified account sign in, recover access, sign out, export, and delete?
- [ ] Does one RSVP survive refresh and appear on a second device exactly once?
- [ ] Are event identity, time zone, source, and freshness always present?
- [ ] Does Today show the correct Now/Next state from server-relative time?
- [ ] Are water, medical, entrances/exits, accessibility, and emergency content public and available offline?
- [ ] Do mobile, tablet, desktop, zoom, rotation, slow-network, and offline tests pass without losing state or actions?
- [ ] Are secrets absent from Git, client bundles, responses, logs, screenshots, and analytics?
- [ ] Are demo/fake crew, feed, proof, attendance, rewards, and totals absent from production?
- [ ] Can risky writes be disabled without disabling public browsing or safety essentials?
- [ ] Are build revision, backend deployment, flags, dashboards, alerts, owners, and rollback recorded?
- [ ] Has the exposed Ticketmaster credential been rotated?

Until this gate passes, the product should identify itself as Local or Preview and unavailable features should remain explicitly unavailable.
