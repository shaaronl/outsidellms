# 01 — Guest Entry, Progressive Onboarding, and Task-Based Navigation

## Outcome

Let visitors experience useful event content before creating an account, then request authentication only when the user takes an action that must persist. Replace internal feature buckets with navigation based on attendee tasks.

## Target flow

```text
Landing
  → Explore festival / Browse nearby events
  → Public event detail
  → Save set
  → Auth prompt explaining the benefit
  → Complete sign-in
  → Resume and confirm the save
  → Optional preferences
  → Today / My schedule
```

Target: a new visitor reaches a relevant event detail and attempts a first save within 90 seconds.

## User stories

- As a visitor, I can inspect lineup, event details, map essentials, and available quests before sharing my email.
- As a visitor, I understand why an account is needed when I choose to save, join, start, post, or purchase.
- As a new user, I return to the action I intended after authentication.
- As an attendee, I can reach Today, Lineup, Map, or Crew directly from the main navigation.
- As a user uninterested in avatars or preferences, I can skip optional setup.

## Scope

### 1. Public landing and discovery

- Primary CTA: `Explore Outside Lands` when a featured festival is active, otherwise `Browse events`.
- Secondary header action: `Sign in`.
- Above the fold: one-sentence product promise, event/date context, and concrete utility preview such as building a schedule or finding essentials.
- Public routes: event discovery, event detail, lineup, permanent map essentials, and read-only Questbook.
- Clearly explain that JamQuest may use third-party or community data and label provenance on the content itself.

### 2. Authentication triggers

Require an account only for actions with durable or private state:

- Save/mark Interested or Going.
- Create or join a crew.
- Start or submit a persistent quest.
- Post, comment, like, report, block, or mute.
- Redeem or equip a reward across devices.
- Change account-level preferences.

The auth prompt names the interrupted action: “Create an account to save this set and sync your plan.” Avoid a generic “Sign in to continue.”

### 3. Pending-action resume

Store a short-lived, validated intent containing action type, target ID, safe return URL, and creation time. Never store passwords or private freeform content in the intent. After successful auth:

1. Revalidate that the target exists and the capability is enabled.
2. Ask for confirmation again if the action is destructive, paid, visibility-sensitive, or older than 15 minutes.
3. Execute idempotently.
4. Show a durable success or actionable failure state.
5. Return to the originating context.

### 4. Main navigation

Mobile navigation:

| Destination | Primary job |
| --- | --- |
| Today | Now/next, conflicts, crew pulse, essentials |
| Lineup | Browse, filter, and manage saved sets |
| Map | Stages and permanently available essentials |
| Crew | Private invitations, meetup point, temporary statuses |
| More | Questbook, Pulse, Rewards, Profile, Settings |

Desktop uses the same hierarchy; it may expose Questbook and Pulse as secondary links. Active items use `aria-current="page"`. Labels remain visible; icons never carry meaning alone.

Guest variants of authenticated destinations show useful read-only content and a contextual account action instead of a blank sign-in wall.

### 5. Progressive onboarding

Required onboarding consists only of the minimum account/auth step. Display name is collected once. After the first successful save:

- Confirm what was saved and where to find it.
- Offer, but do not require, favorite-artist selection.
- Offer, but do not require, avatar customization.
- Provide `Skip for now` and preserve the saved set either way.
- Create or join a crew only after the user selects Crew.
- Do not label basic account setup as a quest.

## UI states

- Guest header and signed-in header.
- Empty discovery result, provider unavailable, and stale cached result.
- Auth-required sheet/modal with explicit reason.
- Auth cancelled with the original screen intact.
- Pending action expired, target removed, already completed, offline, and server failure.
- Optional onboarding skipped, partially complete, and complete.
- Mobile More menu open/closed with focus restoration.

## Not in scope

- The authentication method and account lifecycle, specified in [02](02-auth-account-data.md).
- Schedule conflict logic and Today content, specified in [03](03-events-schedule-today.md).
- A forced product tour, mandatory avatar, or mandatory artist questionnaire.

## Implementation steps

1. [ ] Rewrite the landing hierarchy and CTA around immediate utility.
2. [ ] Mark each route and action as public, authenticated, or conditionally authenticated.
3. [ ] Make lineup, event detail, essential map content, and Questbook preview readable by guests.
4. [ ] Build a reusable contextual auth prompt with accessible dialog behavior.
5. [ ] Implement signed, expiring pending-action intents and safe return URLs.
6. [ ] Resume the first save end-to-end with idempotency and failure recovery.
7. [ ] Extend resume behavior to crew, quest, social, and reward actions as those features ship.
8. [ ] Replace Discover/Questbook buckets with Today, Lineup, Map, Crew, and More.
9. [ ] Implement optional preference/avatar steps with Skip and later-edit paths.
10. [ ] Add funnel analytics and run first-visit usability tests.

## Acceptance criteria

- A logged-out visitor can open a real event detail and map essentials without an auth prompt.
- Auth is first requested only after a persistence- or identity-requiring action.
- The auth prompt names the action and benefit.
- After auth, a first-save intent completes once and the event appears in My Schedule.
- Cancelling auth loses no browsing context and makes no write.
- Display name is requested no more than once.
- Artist preferences and avatar setup have working Skip actions.
- The four primary on-site destinations are one tap from the app shell.
- Mobile navigation works with keyboard and screen reader, and all targets are at least 44 × 44 px.

## Test plan

- Automated guest access matrix for all public and protected routes.
- Pending-action tests for success, cancellation, expiration, tampering, duplicate callback, missing target, disabled capability, and offline retry.
- End-to-end test from a fresh browser to first saved event.
- Five-person first-visit usability test using “Find a Saturday artist and save the set.”
- Funnel comparison by device without using personally identifying analytics.

## Metrics

- Landing → event-detail rate.
- Median time to first relevant event detail.
- Event-detail → save-intent rate.
- Contextual auth start, completion, cancellation, and failure rates.
- Percentage of successful auth callbacks that complete the intended action.
- Optional onboarding skip rate and later completion rate.

## Dependencies and rollout

Depends on [00](00-platform-foundations.md). Release public browsing first, then contextual auth for Save, then the new navigation. Preserve old deep links through redirects during rollout. A rise in auth starts is not success unless first saves and schedule return visits also improve.
