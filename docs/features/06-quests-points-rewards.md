# 06 — Contextual Quests, Point Integrity, and Rewards

## Outcome

Keep JamQuest's distinctive game layer while making it optional, event-aware, honest about proof, and safe from duplicate awards. Scheduling and safety remain available without quests or Sparks.

## User stories

- As an attendee, I see a small number of quests that are possible and relevant now.
- As a participant, I understand the proof, privacy, review time, expiration, and exact reward before starting.
- As a participant, I can see Pending, Accepted, or Rejected status and never receive duplicate points.
- As a user, I can understand every balance change and equip a purchased cosmetic immediately.
- As a nonparticipant, I can use the complete schedule, map, safety, and crew utility without engaging with rewards.

## Scope

## Questbook structure

Use three filters:

- `Available now` — available for the active event, current time window, and prerequisites.
- `Before / After` — planning and reflection tasks.
- `Completed` — compact history with receipts.

Each card shows verb-first title, relevance, estimated time, expiration, proof type, submission visibility, reward, unlock result, prerequisites, and disabled reason. Today may show at most one optional relevant quest.

Correct current content before migration: duplicate numbering, chapter task/milestone counts, “three signals” versus four, unsupported audio previews, unverified conflict claims, coin terminology, and promised rewards that are not granted.

## Proof classes

Define explicit server-enforced proof modes:

- `none` — reflection/setup action whose completion is a validated server mutation.
- `schedule_state` — derived from a real RSVP or conflict decision.
- `code` — event/organizer code with expiry and use constraints.
- `media_review` — uploaded proof queued for review; do not enable until secure media and moderation exist.
- `operator_approval` — reviewed by an authorized event/operator role.

Remove “Demo QR,” “Demo regional proof,” and manual check-ins that award durable Sparks. Preview controls in non-production never create submissions or ledger entries.

## Submission lifecycle

```text
Eligible → Started → Submitted → Pending review
                                → Accepted → atomic award
                                → Rejected → reason/appeal guidance
                                → Expired/withdrawn
```

The server validates event, time window, prerequisites, proof payload, identity, rate limits, and duplicate submission rules. Acceptance and the point award occur atomically.

## Point ledger

Use immutable entries, not a client-controlled balance:

- Award key is globally unique, e.g. `quest:{questId}:user:{userId}:version:{version}`.
- Positive awards and negative redemptions are append-only.
- Corrections are compensating entries, never history edits.
- Balance is derived or atomically maintained and reconciled to the ledger.
- Every visible transaction has source, amount, timestamp, and status.
- Replayed requests cannot duplicate an award or debit.

## Rewards

For initial production:

- Digital avatar cosmetics only.
- Rewards live under More until the user completes one legitimate quest.
- Show preview, cost, ownership state, where the item appears, and refund/undo policy before confirmation.
- Purchase and debit are one atomic mutation.
- Immediately offer `Equip now` after purchase.
- Prevent duplicate purchase unless the item is intentionally consumable.
- Provide transaction history.

Merchandise, sweepstakes/drawings, premium access, transferable value, or cash-like mechanics are out of scope until legal terms, eligibility, inventory, fraud controls, support, and fulfillment ownership are complete.

## Data model

| Table | Required fields and constraints |
| --- | --- |
| `questDefinitions` | event/capabilities, version, time window, prerequisites, proof mode, visibility options, reward, state |
| `questStarts` | user, quest version, startedAt, state; unique per quest rules |
| `questSubmissions` | user, quest version, proof reference/data, visibility, review state, reviewer/reason timestamps |
| `pointLedger` | user, unique award/debit key, signed amount, source type/ID, createdAt, correction link |
| `rewardDefinitions` | version, item, cost, inventory/state, preview/equip metadata |
| `rewardRedemptions` | user, reward version, cost snapshot, ledger entry, state, createdAt; unique for non-consumables |
| `equippedItems` | user, slot, reward/item, updatedAt; unique user + slot |

Proof assets, if later enabled, use private storage, short-lived access, metadata stripping, retention limits, and moderator-only authorization.

## Not in scope

- Gating essentials, schedules, maps, accessibility, or crew coordination.
- Awarding points solely for viewing safety information.
- Client-authoritative check-ins, GPS attendance, or easily replayed QR codes.
- Public media proof at initial launch.
- Merchandise or chance-based prizes.

## Implementation steps

1. [ ] Audit and rewrite the quest catalog for relevance, counts, proof, privacy, and attainable rewards.
2. [ ] Define versioned quest eligibility and proof contracts.
3. [ ] Build Convex quest definitions, starts, submissions, and authorization.
4. [ ] Implement immutable ledger with unique keys, atomic award, reconciliation, and compensating corrections.
5. [ ] Build Available now / Before-After / Completed views and complete UI states.
6. [ ] Implement one low-risk proof class end-to-end before adding others.
7. [ ] Build operator review queue if any quest requires review.
8. [ ] Create digital reward definitions, atomic redemption, history, and equip flow.
9. [ ] Remove all simulated award paths and unsupported fulfillment language.
10. [ ] Add abuse/rate-limit monitoring and ledger reconciliation jobs.
11. [ ] Pilot with a small quest catalog and manual operational review.

## Acceptance criteria

- Quest availability respects active event, window, prerequisites, and capability flags.
- Proof/visibility/reward are visible before Start.
- Repeating or racing the same completion request awards points exactly once.
- The displayed balance equals the immutable ledger sum.
- Purchase and debit either both happen or neither happens.
- A purchased cosmetic can be equipped immediately and persists across devices.
- Rejected/pending submissions never display an accepted reward.
- Safety and planning work fully for an account with zero Sparks and no quests.
- Production has no reward-bearing demo proof path or unsupported physical-prize claim.

## Test plan

- Eligibility tests across event, date/time, prerequisite, capability, and time-zone boundaries.
- Duplicate/race/retry tests for submission acceptance, award, redemption, and correction.
- Authorization tests for participant, reviewer, unrelated user, and unauthenticated access.
- Ledger property test: balance always equals entries and cannot spend below allowed policy.
- Usability test of proof/privacy/reward comprehension before and after submission.
- Operational review drill for pending, rejection, correction, and account deletion.

## Metrics and guardrails

Track eligible view → start → submit → accept, review latency, rejection reason class, duplicate attempts, balance reconciliation failures, redemption/undo, and quest hides. Guard against maximizing screen time; success is contextual participation without reduced core-task completion.

## Dependencies and rollout

Depends on [02](02-auth-account-data.md), [03](03-events-schedule-today.md), and [04](04-map-offline-safety.md) for any map-context quests. Launch with a small server-validated, non-media catalog. Keep definitions versioned and event-scoped; expand only after ledger reconciliation and support workflows are stable.
