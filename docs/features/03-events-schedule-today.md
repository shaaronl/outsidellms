# 03 — Event Discovery, Schedule, and Today

## Outcome

Make the core product useful: people can find trustworthy event information, express Interested or Going, build a conflict-aware schedule that syncs across devices, and use a focused Today screen before and during the event.

## Primary activation event

The first meaningful activation is a confirmed first saved set—not account creation, avatar completion, or points earned.

## User stories

- As a guest, I can browse festivals and nearby shows and understand the source and freshness of each listing.
- As a planner, I can save sets, distinguish Interested from Going, see conflicts immediately, and view a day-by-day schedule.
- As an attendee, I can open Today and understand what is happening now, what is next, when to leave, and whether my plan changed.
- As a traveler, I see exact dates and the event's time zone rather than an ambiguous local time.

## Scope

### 1. Discovery and event detail

Separate `Festivals` from `Nearby shows`. Persist the active festival or last city rather than forcing a city search each visit. Provide visible Change controls.

Discovery filters:

- Festival/day/date.
- Genre.
- Distance for nearby shows, only after explicit location or city input.
- Saved/Interested/Going.
- Accessibility or event capabilities where verified data exists.

Event cards and detail include stable name, artist(s), venue/stage, exact date, event-local time and time-zone abbreviation, source attribution, data freshness, reliable sale/status, and explicit ticket-provider handoff. Cards use a real link for navigation and separate buttons for actions; no clickable article with nested controls.

Event hero images use valid image rendering with fallbacks, alt behavior, aspect-ratio reservation, and provider rights compliance.

### 2. RSVP and schedule persistence

Use first-class Convex records with unique `(userId, eventId)`. Supported states:

- `interested`
- `going`
- `removed` represented by deletion or audit-safe state according to product needs

Actions are explicit; a single unexplained toggle is not sufficient. The server owns timestamps and identity. Updates are idempotent, survive refresh, and reconcile offline/optimistic state.

### 3. Conflict detection

Compare event-local start/end intervals with the user's existing schedule. Where end time is unknown, label the conflict as possible and use a documented estimate rather than asserting “No conflict.” Include walking/buffer estimates only when stage/location data is trustworthy, with the estimate clearly labeled.

When a conflict occurs:

- Show it immediately after Save/Going.
- Identify both events and the overlapping interval.
- Offer Keep both, change status, or remove one.
- Preserve the user's choice and do not repeatedly nag.

### 4. My Schedule

Provide a dedicated route grouped by festival-local day and sorted by start time. It includes:

- Interested/Going distinction and filter.
- Conflict markers and resolution.
- Stage/venue and status changes.
- Add to calendar using correct time zone.
- Shareable schedule summary with privacy-safe defaults.
- Download/offline readiness delegated to [04](04-map-offline-safety.md).

Empty state: “Save your first set to build Today” with Lineup CTA.

### 5. Today screen

Content priority:

1. `Now / Next`: artist, stage, start time, status, and clearly labeled leave estimate.
2. Active conflict or material schedule change, only when present.
3. Crew pulse from accepted members, if the user has a crew.
4. Essentials shortcuts: Water, Medical, Entrance/Exit, Accessibility.
5. One optional context-relevant quest, if enabled.
6. Connectivity, offline-pack state, and last refresh.

Before the festival, Today becomes a concise preparation screen with date countdown, schedule gaps, download plan, and crew setup. After the festival, it becomes a recap entry point. It must not become a generic social feed.

## Data model

| Table | Required fields and constraints |
| --- | --- |
| `events` | stable normalized ID, provider/source ID, type, name, dates, IANA zone, location/stage, source, freshness, capabilities |
| `eventOccurrences` | event, start/end, status, stage/venue, last verified timestamp |
| `rsvps` | user, event/occurrence, `interested`/`going`, timestamps; unique user + occurrence |
| `scheduleDecisions` | user, conflict pair/key, decision, timestamp; unique decision key |
| `eventChanges` | event/occurrence, material change type, previous/current value, source, observed timestamp |

Normalize providers at server boundaries. Cache provider responses under explicit freshness rules and retain enough provenance to explain displayed data. Ticketmaster credentials remain server-only; never expose keys in client bundles, docs, analytics, or logs.

## UI states

- Loading skeleton with stable layout.
- No results with removable filters and city/festival change action.
- Provider unavailable with cached-data timestamp when available.
- Event cancelled, postponed, sold out, time/stage changed, or incomplete.
- Save pending, confirmed, offline queued, failed, and conflict detected.
- Today before/during/after event, no schedule, next set unknown, and all planned sets complete.

## Not in scope

- Ticket resale, purchase processing, or guaranteeing third-party ticket availability.
- Precise indoor/outdoor routing without verified paths.
- Claiming attendance from Going status.
- Personalized recommendations until adequate preference and outcome data exist.

## Implementation steps

1. [ ] Define the normalized event and occurrence contracts plus provider provenance/freshness rules.
2. [ ] Create Convex event cache/sync and server-only provider access.
3. [ ] Build public festival/nearby discovery and event detail routes.
4. [ ] Create authenticated RSVP queries/mutations with unique constraints and idempotency.
5. [ ] Connect contextual auth and first-save resume.
6. [ ] Build My Schedule grouped by event-local day.
7. [ ] Implement interval-based conflict detection and explicit user decisions.
8. [ ] Add status-change handling, freshness labels, and safe cached fallbacks.
9. [ ] Build Today states for pre-event, on-site, and post-event contexts.
10. [ ] Add calendar export/share with privacy review.
11. [ ] Instrument activation, schedule usage, conflicts, and provider health.

## Acceptance criteria

- Guests can browse event details with correct source, date, and time zone.
- An authenticated user can set Interested or Going and see the state after refresh and on a second device.
- The same user/event action does not create duplicate RSVP records.
- Definite and possible conflicts are distinguished and never represented as verified absence without comparison.
- My Schedule is correctly ordered by the event's local day through time-zone boundaries.
- Today has a useful no-schedule state and shows Now/Next correctly before, during, and after occurrences.
- A material provider change is visible with freshness information.
- Ticketmaster or other provider keys never appear in client assets or response payloads.

## Test plan

- Provider contract tests for missing images, missing end times, cancellations, duplicates, time zones, DST, and stale responses.
- RSVP concurrency/idempotency tests and cross-user authorization tests.
- Conflict tests for overlap, adjacency, unknown end, multi-day events, and stage buffers.
- Today clock tests around midnight, festival time zone versus device time zone, and schedule changes.
- End-to-end fresh-user first-save and returning-user schedule flows.
- Manual one-handed, bright-light, slow-network, and 200% text-size tests.

## Metrics

- Time to first event detail and first save.
- Event-detail → Interested/Going conversion.
- First-savers returning to Schedule/Today within 7 days and on event day.
- Conflict occurrence and resolution rate.
- Save failure, stale-data view, and provider error rates.
- On-site sessions reaching Now/Next in one tap.

## Dependencies and rollout

Depends on [00](00-platform-foundations.md), [01](01-guest-entry-navigation.md), and [02](02-auth-account-data.md). Ship discovery read-only, then RSVP persistence, then Schedule/conflicts, then Today. Seed production only with verified event data and maintain a kill switch for unhealthy providers.
