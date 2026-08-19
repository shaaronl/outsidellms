# 00 — Platform Foundations and Truthful Product States

## Outcome

Create an application structure in which every route has a clear event context, every capability can be enabled honestly by environment and event, and every major destination is deep-linkable. Remove the architectural conditions that currently let prototype state look like production state.

## Why this ships first

Authentication, schedules, crews, quests, and social features all need the same routing, environment, authorization, and event-capability boundaries. Building them before these boundaries would repeat persistence and trust defects in multiple places.

## User stories

- As a visitor, I can tell whether I am using a demo, preview, or production product.
- As an attendee, I always know which festival or event a schedule, map, crew, or quest belongs to.
- As a user following a shared link, I land on the intended public page and browser Back behaves normally.
- As a product operator, I can disable an incomplete or unhealthy capability without deploying unrelated UI changes.

## Scope

### 1. Route and shell restructuring

Create route-level destinations rather than a single React `page` state:

```text
app/
  (public)/
    page.tsx                  # landing
    events/page.tsx           # public discovery
    events/[eventId]/page.tsx # public event detail
  (app)/
    today/page.tsx
    schedule/page.tsx
    map/page.tsx
    crew/page.tsx
    quests/page.tsx
    pulse/page.tsx
    rewards/page.tsx
    profile/page.tsx
    settings/page.tsx
components/
  shell/
  events/
  schedule/
  map/
  crew/
  quests/
  pulse/
  rewards/
```

Keep the existing visual system, but move data access and feature state out of `components/JamQuest.tsx`. Shared shell elements may include the active-event switcher, environment banner, connectivity indicator, mobile navigation, desktop navigation, and auth entry point.

### 2. Active event context

Define a normalized event/festival object used across routes:

```ts
type EventCapabilities = {
  hasOfficialMap: boolean;
  hasSchedule: boolean;
  hasQuests: boolean;
  hasCrewSpace: boolean;
  hasPulse: boolean;
  supportsOfflinePack: boolean;
};
```

The active context must include stable ID, slug, display name, dates, IANA time zone, source/provider, type (`festival` or `concert`), location, verification timestamp, and capabilities. A generic concert cannot inherit Outside Lands routes, map, quests, or copy.

Resolution order:

1. Event ID or slug in the URL.
2. User's saved active event when authenticated.
3. Last locally viewed event for guests.
4. Explicit selection state; never silently assume a branded festival on a generic event route.

### 3. Capability and environment controls

Add centrally defined feature flags for at least:

- `crewInvites`
- `questSubmissions`
- `durableRewards`
- `pulsePosting`
- `mediaUploads`
- `rewardFulfillment`
- `offlinePack`

Flags must be evaluated server-side for writes and mirrored in the UI for discoverability. Hiding a button is not authorization.

Local and preview builds show a persistent non-production banner. Prototype controls use “Preview prototype” and cannot write production points, posts, membership, moderation, or fulfillment records. Production hides incomplete actions.

### 4. Honest state and source vocabulary

Create shared UI patterns and copy for:

- `Official`, `Organizer-provided`, `Community tip`, and `Estimate` provenance.
- `Saving`, `Saved`, `Offline—will retry`, and `Couldn't save` write states.
- `Demo`, `Preview`, and `Unavailable` capabilities.
- `Interested`, `Going`, and `Saved` as distinct states.
- Dynamic provider attribution from normalized event data.

Remove or relabel fixed crew codes, fixture social activity, local-only moderation success, simulated proof awards, hardcoded profile totals, fake conflict claims, and unsupported merchandise/drawing claims.

## Not in scope

- Implementing each destination's full feature set.
- Replacing the brand, color palette, illustration style, or typography wholesale.
- Building a generic feature-flag administration console; versioned server configuration is acceptable for launch.

## Implementation steps

1. [ ] Inventory every current route-like state, write action, fixture, hardcoded total, provider label, and production claim.
2. [ ] Establish public and authenticated route groups with a shared responsive shell.
3. [ ] Split `JamQuest.tsx` by domain without changing behavior; add regression coverage before flow changes.
4. [ ] Add the normalized event type and one adapter per event provider.
5. [ ] Add active-event resolution, persistence, switcher, and “no active event” state.
6. [ ] Add event capability flags and enforce them in route loaders, components, and mutations.
7. [ ] Add environment identity and feature-flag configuration for local, preview, and production.
8. [ ] Introduce shared provenance, persistence-state, unavailable-state, and demo-state components.
9. [ ] Remove or visibly isolate all simulated production behavior identified by the audit.
10. [ ] Add route, event-context, and capability analytics with no personal or precise-location data.

## Acceptance criteria

- Refreshing or opening a deep link preserves the intended destination and active event.
- Browser Back returns to the previous meaningful screen, not an internal component state.
- The active event name is visible on every event-specific screen.
- A generic concert never links to an unrelated festival map, crew, Pulse, or Questbook.
- Provider attribution comes from the record actually displayed.
- A server write rejects disabled capabilities even if called outside the UI.
- Non-production environments are unmistakable; production contains no fixture users or simulated durable actions.
- No hardcoded count or success claim appears where persisted data is required.

## Test plan

- Route tests for direct entry, refresh, Back/Forward, invalid slugs, deleted events, and capability-disabled routes.
- Adapter contract tests for provider attribution, dates/time zones, source IDs, and missing optional fields.
- Cross-environment tests proving preview data and credentials cannot reach production.
- Manual content audit comparing every success message with the backend record it promises.
- Mobile and desktop navigation regression tests.

## Analytics and guardrails

Track public event-detail views, active-event selection/change, unsupported-capability encounters, route errors, and write failures. Alert on production demo labels, fixture identifiers, and sudden capability-denied errors. Never attach email, invite code, proof media, or private crew status to analytics.

## Dependencies and rollout

No product-feature dependency. Land the route split in small, behavior-preserving changes. Put the new shell behind a preview flag, validate URL compatibility, then make it the default before starting core utility work.
