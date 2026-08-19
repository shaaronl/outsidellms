# 04 — Map, Offline Access, and Safety Essentials

## Outcome

Make essential festival information dependable under bright light, weak service, limited battery, and stressful conditions. Safety content is permanently available, provenance is explicit, and a downloaded plan remains useful offline.

## User stories

- As an attendee, I can reach water, medical, entrances/exits, accessibility, restrooms, information, and emergency help within two taps.
- As an attendee without service, I can still view my downloaded schedule, essential locations, and text directions.
- As a user, I know whether a map item is official, organizer-provided, a community tip, or an estimate.
- As a low-battery user, I can reduce motion, imagery, and background activity.

## Scope

### 1. Permanent essentials

Always expose these categories when the active event provides them:

- Water.
- Medical / first aid.
- Entrances and exits.
- Accessibility services.
- Restrooms.
- Information / help.
- Emergency instructions and organizer contact path.

They cannot be locked, purchased, earned, or hidden behind a quest. Remove duplicate locked “Quick Filters.” Viewing safety content must not award currency. An optional pre-event preparedness badge may acknowledge learning, but cannot change access.

### 2. Provenance and freshness

Every location carries one of:

- `Official` — directly published by the event/authority.
- `Organizer-provided` — supplied through an organizer-controlled feed or document.
- `Community tip` — user-submitted and visibly unverified.
- `Estimate` — approximate; never rendered as a precise pin.

Display “Last verified” for time-sensitive data. Exact pins require sufficient coordinate confidence. Estimates use zones, text descriptions, or approximate areas with an explanation.

### 3. Map and text fallback

- Replace the fragile hardcoded iframe as the primary experience.
- Use a lightweight, licensed festival map asset or verified vector/tile representation.
- Provide category filters, stage labels, current selection, and clear reset.
- Provide an equivalent text list with zone, nearest stage/landmark, operating hours, accessibility detail, and source.
- Do not require device location. If “near me” is later added, request permission in context and preserve full manual access after denial.

### 4. Offline pack

Users can download an event pack containing:

- Current schedule and RSVP state.
- Essential location records and text fallback.
- Optimized static map assets.
- Event emergency/help copy.
- Event metadata, time zone, data version, and last refresh.

The UI shows estimated size, download status, last updated time, staleness, and retry/remove controls. Account/private writes performed offline use an explicit queue only where safe, with duplicate prevention and visible reconciliation. Emergency copy is readable without waiting for a sync.

### 5. Low-battery and reduced-data mode

When enabled:

- Disable decorative animation and autoplay.
- Prefer text/list views and cached assets.
- Defer nonessential images and social content.
- Stop nonessential polling/background refresh.
- Keep schedule, clock, essentials, and crew status usable.

Respect OS reduced-motion and data-saving preferences where available, while allowing explicit user control.

### 6. Content operations

Assign an owner and verification cadence for each festival map. Support urgent correction/publication without a full frontend release. Record source, editor, timestamp, and prior value. Safety copy requires product/legal/operations review appropriate to the event and must direct true emergencies to local/event authorities rather than implying JamQuest dispatches help.

## Data model

| Table | Required fields and constraints |
| --- | --- |
| `mapLocations` | event, category, name, zone, coordinates/area, confidence, provenance, hours, accessibility, verifiedAt, source |
| `mapVersions` | event, version, publishedAt, source summary, asset references |
| `offlineManifests` | event, version, included records/assets, size, checksum |
| `contentCorrections` | target, reporter/source, proposed value, review state, audit timestamps |

Client offline metadata may be local, but authoritative map content remains versioned server data.

## Not in scope

- Continuous user tracking or precise friend tracking.
- Turn-by-turn routing presented as authoritative without verified paths and accessibility constraints.
- Medical advice or emergency dispatch.
- Community tips in production before moderation and provenance UI work.

## Implementation steps

1. [ ] Define essential categories, provenance levels, coordinate confidence, and event content ownership.
2. [ ] Remove access gates/rewards and duplicate locked safety UI.
3. [ ] Create versioned map-location and source schema in Convex.
4. [ ] Build responsive map plus feature-equivalent text list.
5. [ ] Add permanent essentials shortcuts to Today and Map.
6. [ ] Build offline manifest generation, download, integrity check, update, and removal.
7. [ ] Cache schedule, essentials, emergency copy, and optimized map assets.
8. [ ] Add visible connectivity, freshness, storage, and sync states.
9. [ ] Implement low-battery/reduced-data behavior.
10. [ ] Create content correction and emergency update runbook.
11. [ ] Conduct an on-site-style field test with airplane mode and low-power settings.

## Acceptance criteria

- Every essential category is reachable in two taps from Today, Lineup, Map, or Crew.
- No safety function is reward-, account-, or quest-gated.
- Downloaded schedule, essential list, static map, and emergency copy work in airplane mode after an app restart.
- Estimated data is visually and textually distinct from official data and is not shown as an exact pin.
- Text fallback communicates the same essential location information as the visual map.
- A stale pack displays its version/age and can be refreshed without losing the last usable copy.
- Low-battery mode materially reduces animation, imagery, polling, and transfer while preserving utility.

## Test plan

- Offline install/update/restart tests with partial downloads, corrupt cache, storage denial, and expired manifests.
- Map/list parity tests for every essential location.
- Accessibility tests for keyboard, VoiceOver/TalkBack, high zoom, non-color markers, and map alternatives.
- Field simulation: direct sun, one hand, slow 3G, airplane mode, battery saver, and a schedule update.
- Content provenance audit against organizer sources before launch and event day.

## Metrics and guardrails

Track essential-category reachability, offline-pack completion/failure, offline screen success, stale-pack use, and low-battery activation. Monitor correction reports and time-to-publish urgent changes. Never record exact user location for these metrics.

## Dependencies and rollout

Depends on [00](00-platform-foundations.md) and [03](03-events-schedule-today.md). Ship permanent text essentials first, then the licensed map, then offline packs. Do not announce offline support until restart-in-airplane-mode testing passes on the supported mobile/browser matrix.
