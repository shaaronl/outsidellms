# JamQuest UX Flow Audit and Practical Redesign

**Audit date:** 2026-08-18
**Audited state:** local checkout at `6332b14` plus the current, not-yet-wired Convex backend work
**Primary source:** `components/JamQuest.tsx`, `app/styles.css`, API routes, persistence code, and deployment documentation

## Executive assessment

JamQuest has a distinctive festival identity, a warm visual system, and a promising privacy-first idea. The strongest product concept is not the Spark economy or the avatar shop; it is a lightweight festival field guide that helps someone plan a day, find essentials, coordinate with friends without exact tracking, and notice memorable moments.

The current flow puts that value in the wrong order. A new visitor must create an account before seeing useful event content, then is pushed toward identity customization and an eight-quest chapter before the app has helped them save a real set, resolve a schedule conflict, or find something essential. During a festival, this would feel like work.

The larger issue is trust. Multiple experiences look operational but are local prototypes: the crew code is fixed, social users are fixtures, reports never reach moderators, several quest proofs are buttons that immediately award points, profile statistics are hardcoded, and rewards promise outcomes that are not implemented. A showcase audience may forgive a clearly labeled prototype. A consumer audience will interpret these surfaces as broken or misleading.

The practical redesign should make utility primary and gamification optional:

> **Find the event → build a plan → use it on-site → coordinate safely → optionally complete quests and share memories.**

The first meaningful success should be “I found and saved something useful,” not “I created an account” or “I earned ten Sparks.”

## Product position and intended audience

### Recommended product promise

**JamQuest is a mobile festival companion for planning sets, finding essentials, coordinating with friends, and collecting optional memories without sharing precise live locations.**

This is clearer and more defensible than positioning it primarily as a quest platform. Quests can create differentiation after the utility layer works.

### Audience modes

The same person has different needs at different times. The interface should change emphasis accordingly.

| Mode | User context | Primary need | Design implication |
| --- | --- | --- | --- |
| Before the festival | Time to browse, often on desktop or at home | Explore lineup, compare sets, create a schedule, invite friends | Editorial visuals are welcome; allow deeper browsing and preference setup |
| Traveling / arriving | Mobile, distracted, intermittent connection | Ticket link, entrance, transit, meetup point, downloaded plan | Put the next action and essentials first; cache critical content |
| On the grounds | Bright light, crowds, noise, low battery, one-handed use | “What is next?”, map, water, medical, crew status | Large targets, high contrast, short copy, low-motion and battery-friendly mode |
| After the festival | More time and attention | Recap, memories, discoveries, rewards | Bring back expressive visuals, social sharing, and reflection quests |

### Audience risks to design for

- First-time festival attendees need plain language and safety information more than lore.
- Experienced attendees will leave if setup blocks lineup and schedule tools.
- Friend groups need dependable status and meetup mechanics; a pretend friend system damages confidence quickly.
- Users may be tired, overstimulated, in direct sunlight, have limited connectivity, or have accessibility needs.
- Some attendees will not want an avatar, social profile, or public feed. Those features must remain optional.
- A fan-made guide must clearly distinguish official information, third-party listings, estimates, and community content.

## Current flow

The effective first-time journey is:

```text
Landing
  → Enter the Lands
  → Sign in / register
  → Identity quest (asks for display name again)
  → Avatar customization
  → Questbook with 8 Chapter 1 tasks
  → Crew / artist preferences / map / simulated QR and route tasks
  → Chapter 2 discovery sequence
```

The main application navigation is split into two conceptual buckets:

```text
Discover bucket: Pulse, Lineup, Rewards
Questbook bucket: Quests, Map
Separate avatar button: Profile
Mobile: only Discover and Questbook
```

This structure reflects the product's internal feature categories, not the attendee's immediate questions. A person at a festival thinks “what is next?”, “where is it?”, “where are my friends?”, and “where is water?” They do not naturally decide whether that need belongs to Discover or Questbook.

## What is already working conceptually

These choices should survive the redesign:

- The visual identity is memorable. The dark teal, orange, yellow, moss, editorial serif, and illustrated poster language feel appropriate for a festival product.
- The privacy principle is strong. General crew statuses and explicit avoidance of continuous tracking are a useful differentiator.
- Safety information is visible without precise user location.
- The event provider is isolated behind server routes, and provider normalization is a sound technical boundary.
- Reward previews use the user's avatar rather than an abstract catalog image, which improves comprehension.
- Motion reduction and strong focus outlines already exist in CSS.
- The landing-page quest preview gives hesitant visitors more context before committing.
- The “put your phone away and enjoy the set” idea is aligned with the event rather than screen-time maximization.

The recommendation is to keep the brand and emotional tone while simplifying the operational experience.

## Critical flaws and specific changes

### P0 — Must change before presenting this as a working consumer app

#### 1. The account wall appears before product value

**Current behavior**

- “Enter the Lands” immediately opens sign-in/register.
- Lineup, map, event detail, and quest browsing are unavailable to guests.
- Registration requests a display name, then Quest 1.1 asks for a display name again.

**Why this fails**

Visitors do not yet know whether the event data is relevant or the app is trustworthy. Requiring email/password before they can inspect anything creates suspicion and abandonment. The recent need to ask whether a fake email should be used is direct evidence of that trust gap.

**Specific redesign**

- Change the landing primary CTA to **“Explore Outside Lands”** or **“Browse events”**.
- Add a secondary **“Sign in”** action in the header.
- Let guests browse Lineup, Event Detail, Map essentials, and a read-only Questbook.
- Trigger authentication only when someone saves a set, joins a crew, starts a persistent quest, posts, or purchases a reward.
- Use a bottom sheet or modal that explains the benefit: “Create an account to keep this set and sync your plan.”
- Preserve the pending action after authentication; a user who taps Save should return with that event saved.
- Remove the duplicate display-name step. Collect it once during account creation or later in optional profile setup.

**Acceptance criteria**

- A new visitor can reach a real event detail and map essentials without an account.
- The first auth prompt appears only after a persistence-requiring action.
- Successful auth returns the user to the interrupted action.
- Display name is requested no more than once.

#### 2. Prototype interactions are presented as real systems

**Current behavior**

- Every user sees crew code `FOG-72Q`; any three-character friend code completes the task.
- Story profiles and feed posts from Maya, Jordan, and Dani are fixtures but appear as community activity.
- Reporting only writes a local “reported” flag.
- “Demo QR scan,” “Demo regional proof,” and manual check-in award Sparks without evidence.
- The profile always displays `3 saved sets`, regardless of actual saves.
- Chapter 2 promises a premium item and merchandise drawing entry that are not awarded.

**Why this fails**

These are not harmless empty states. They communicate that another person was added, a report entered moderation, attendance was verified, or a reward was issued. A user will make decisions based on those claims.

**Specific redesign**

- Introduce an explicit, global **Demo mode** banner in non-production builds.
- In production, hide any capability that lacks a server-backed implementation.
- Replace fixture social content with a clearly labeled “Example Pulse” empty-state preview, or seed it only in a dedicated demo environment.
- Generate unique crew invite codes on the backend and show pending/accepted membership states.
- Submit reports to a moderation queue and give a durable report receipt/status.
- Award points only after a server-authorized, idempotent completion transaction.
- Replace simulated proof buttons with **“Preview prototype”** controls that never change durable progress.
- Calculate all profile stats from persisted data.
- Remove merchandise drawing language until legal terms, eligibility, inventory, and fulfillment exist.

**Acceptance criteria**

- No production control claims a social, safety, moderation, verification, or fulfillment action unless a backend record is created.
- Demo actions are visibly labeled before the user taps them and never affect production currency.
- Profile totals match backend queries.

#### 3. Saved state is inconsistent and client-authoritative

**Current behavior**

- Progress, avatar, Sparks, purchases, likes, posts, and comments are included in the saved progress payload.
- Saved event RSVPs, crew status, map views, Chapter 2 reactions, selected new artist, check-in state, and reflection answers are not reliably persisted.
- Points and quest completion are calculated in React state and then uploaded as a general progress document.
- Leaving Chapter 2 can reset intermediate answers while leaving completed quest IDs intact.

**Why this fails**

Users cannot predict what will survive navigation, refresh, sign-out, or another device. Client-authoritative points can be duplicated or modified. Lost schedules are especially damaging because scheduling is a core utility.

**Specific redesign**

- Store RSVPs as first-class records keyed by `(userId, eventId)` with status and timestamps.
- Store quest submissions and completions as server records, not arbitrary client totals.
- Use an immutable point ledger with a unique award key, such as `quest:{questId}:user:{userId}`.
- Derive Spark balance from the ledger or update it atomically in the same mutation.
- Persist Chapter 2 answers, schedule choice, and step status separately.
- Store crew status server-side with `expiresAt`; do not rely on a client interval for expiration.
- Treat local state as an optimistic cache, never the source of truth.
- Show save states: `Saving…`, `Saved`, `Offline—will retry`, and `Couldn’t save`.

**Acceptance criteria**

- Saving a set, completing a quest, buying a reward, and setting crew status survive refresh and appear on a second signed-in device.
- Repeating the same completion request never awards points twice.
- Failed saves are visible and retryable.

#### 4. Safety and on-site utility are mixed with unlock mechanics

**Current behavior**

- Water, medical/wellness, and entrances are available in one block, then duplicated as locked “Quick Filters.”
- Viewing all safety categories produces a reward claim.
- The map is an external OpenStreetMap iframe centered on hardcoded planning coordinates.
- Critical map content requires network access and is not cached.

**Why this fails**

Essential information should never look gated, earned, estimated-but-official, or dependent on a fragile iframe. During a real event, network conditions and battery constraints are predictable problems.

**Specific redesign**

- Make Water, Medical, Entrances, Exits, Accessibility, Information, Restrooms, and Emergency help permanently available.
- Remove the duplicate locked safety filters.
- Do not award currency for accessing safety information. If desired, award an optional pre-event “Know the grounds” badge without changing access.
- Label every pin as **Official**, **Organizer-provided**, **Community tip**, or **Estimate**.
- Do not display estimated station coordinates as exact pins.
- Ship a lightweight static festival map that can be downloaded and cached for offline use.
- Provide a text list fallback with zone, nearest stage, and operating hours.
- Add an “On-site low battery” mode that disables decorative motion and nonessential images.

**Acceptance criteria**

- Safety information is reachable from any main screen in two taps or fewer.
- The downloaded plan and essential map remain usable without connectivity.
- Estimated information is visually distinct from official information.

#### 5. The app mixes festival-specific and generic concert experiences

**Current behavior**

- Live search can return generic Ticketmaster or JamBase events in any city.
- The shell, questbook, map, profile, and copy remain specifically branded as Outside Lands 2026.
- Opening a generic event and choosing “Open questbook” routes to the Outside Lands questbook.
- The UI says results come from JamBase even when Ticketmaster is the active provider.

**Why this fails**

The user loses track of whether JamQuest is an Outside Lands companion, a general concert discovery app, or a platform for any festival. Generic event data connected to festival-specific quests creates nonsensical paths.

**Specific redesign**

- Create an explicit `activeEvent` / `activeFestival` context.
- Separate **Festivals** from **Nearby shows** in discovery.
- Only show festival map and festival quest modules when an event has those capabilities.
- Generic concerts should have a simpler detail experience: event info, save, ticket link, friends attending, and any event-specific quests.
- Render attribution from `event.source` instead of hardcoded provider copy.
- Give each event capability flags such as `hasOfficialMap`, `hasSchedule`, `hasQuests`, and `hasCrewSpace`.

**Acceptance criteria**

- No generic concert links to an unrelated Outside Lands quest.
- The active event name is always visible when the user is inside event-specific tools.
- Provider attribution matches the actual response source.

#### 6. Authentication is not ready for a public audience

**Current behavior**

- Local auth uses an ignored JSON file; the public site has no working database binding.
- Convex conversion is started but not deployed or wired into the UI.
- The password flow has no email verification or password reset.
- The app says the user's account remains saved even when deployed persistence is not guaranteed.

**Why this fails**

Users will use real credentials if the UI looks real. An unavailable reset path can permanently lock them out, while unclear storage behavior undermines trust.

**Specific redesign**

- Finish Convex Auth and use verified email OTP/magic link as the default for the lowest-friction MVP, or add a complete password reset flow before keeping passwords.
- Add a plain-language explanation at the point of collection: what email is used for, what is public, and what is private.
- Provide Account, Privacy, Sign out, Export data, and Delete account controls.
- Do not show “saved to your account” until a confirmed backend write succeeds.
- Use production, preview, and local environments with separate data and visible environment labels outside production.

**Acceptance criteria**

- A user can create an account, sign out, sign back in, reset access, and delete the account.
- Authenticated state and data persist across devices.
- No production copy claims persistence that has not been verified.

## P1 — High-impact usability and information architecture changes

### Replace feature buckets with task-based navigation

Recommended mobile navigation:

| Destination | Purpose |
| --- | --- |
| **Today** | Now/next set, countdown, schedule conflicts, active crew status, critical alerts |
| **Lineup** | Browse and filter artists/events; manage saved schedule |
| **Map** | Stages and permanent essentials, with offline access |
| **Crew** | Members, meetup point, temporary status, invite handling |
| **More** | Questbook, Pulse, Rewards, Profile, Settings |

Desktop can expose Questbook and Pulse as secondary destinations, but should retain the same hierarchy.

Why this is more practical:

- The four most common on-site actions become one tap away.
- “Today” gives the product a clear home rather than dropping users into a social feed or a long quest list.
- Optional engagement mechanics remain discoverable without competing with essential tools.

### Add a real Today screen

The current app has no operational dashboard. Add a screen with:

1. **Now / Next:** artist, stage, start time, walking estimate, and “Leave in 12 min.”
2. **Schedule conflict:** only shown when present, with a simple resolution action.
3. **Crew pulse:** last voluntary status from each accepted crew member; no precise location.
4. **Essentials row:** Water, Medical, Entrance/Exit, Accessibility.
5. **Active quest:** one relevant optional action, not the full questbook.
6. **Connectivity state:** downloaded/offline status and last data refresh.

Empty state: “Save your first set to build Today” with a direct Lineup CTA.

### Make onboarding progressive and skippable

Recommended onboarding after the first save:

```text
Account created
  → Confirm saved set
  → Optional: choose 3 favorite artists
  → Optional: customize avatar
  → Today screen
```

- Show a `1 of 2` step indicator only for required setup.
- Add **Skip for now** to artist preferences and avatar setup.
- Move crew creation to the moment a user taps Crew.
- Do not call onboarding actions “quests” until the user understands the quest system.
- Awarding a small welcome item is fine, but avoid using rewards to pressure profile completion.

### Redesign the Questbook around context and proof

Current quest cards are long, numerous, and mixed between setup, safety, map actions, fake proof, and event discovery.

Change the Questbook to three filters:

- **Available now** — actionable based on date, location zone, and prerequisites.
- **Before / After** — planning and reflection tasks.
- **Completed** — compact history.

Each quest card should show:

- A verb-first title.
- Why it is relevant now.
- Time estimate and expiration.
- Proof requirement before starting.
- Privacy/visibility of the submission.
- Reward and exactly what it unlocks.
- A disabled reason when unavailable.

Specific corrections:

- Renumber the duplicate Quest `1.5`.
- Chapter 2 says “three new signals” but contains four; make count and copy consistent.
- Replace “Complete 3 of 4” language where the chapter contains eight tasks; distinguish the bonus milestone from chapter completion.
- Remove the play-preview control until licensed audio exists.
- Never claim “No conflict detected” without comparing against the user's real schedule.
- Make the final Chapter 2 reward match what is actually granted.

### Improve Lineup and event planning

Specific screen changes:

- Persist city/festival selection globally instead of placing a city search at the top of every lineup session.
- Default to the user's active festival or last city, with a visible Change action.
- Add date/day, genre, distance, and saved filters.
- Separate **Interested** from **Going** rather than toggling between hidden states with one button.
- Add a dedicated **My schedule** view grouped by day and time.
- Flag overlaps immediately when a set is saved.
- Offer Add to calendar and share-event actions.
- On event cards, display source, sale/status information when reliable, and an explicit ticket-provider handoff.
- Use a real link/button structure for the card rather than a clickable article with nested controls.
- Fix event-detail hero images by applying URL images as CSS `url(...)` backgrounds, not raw URL strings.

### Make Crew a dependable private feature

Recommended crew flow:

```text
Crew empty state
  → Create crew or enter invite
  → Review crew name and privacy behavior
  → Invite by code/link
  → Recipient accepts
  → Members can set expiring general statuses
```

Required UI states:

- Invalid, expired, already-used, and self-invite errors.
- Pending, accepted, removed, blocked, and left membership states.
- Clear copy-feedback after copying a code.
- Server time for status expiration and an exact “Expires at 4:35 PM” label.
- Set, edit, clear, and renew status actions.
- A pre-agreed meetup-point label that is not the same as live location.
- Privacy settings explaining who can see a status.

Do not build precise live friend tracking unless the product strategy and safety model change substantially.

### Reframe Pulse as event-scoped, not generic social media

Pulse currently behaves like a miniature social network before there is a credible network or moderation system. This increases scope and risk.

Practical MVP:

- Show posts only from the current event, accepted crew, or selected artists.
- Default post visibility to Crew or Event, never broad public without an explicit choice.
- Do not show exact location fields.
- Require a real moderation queue before enabling public posts.
- Show submission/report status and provide Block/Mute controls.
- Replace fake likes/comments with a strong empty state and example content labeled as example.
- Delay images until upload validation, metadata stripping, storage policy, consent guidance, and moderation are operational.

### Move Rewards behind utility

Rewards can support retention, but the current shop is more finished than the core schedule and crew tools. That communicates the wrong product priority.

Specific redesign:

- Put Rewards under More until the user has completed at least one real quest.
- Show “Equip now” immediately after buying an avatar item.
- Add confirmation or a short undo window for purchases.
- Explain where each item appears before purchase.
- Keep all safety and scheduling features outside the economy.
- Do not use random drawings or merchandise until rules and fulfillment exist.
- Display transaction history so users understand balance changes.

### Make Profile factual and controllable

- Replace hardcoded saved-set totals with real data.
- Show current active festival and a Change action.
- Separate Profile from Account & Privacy settings.
- Add download/export, delete account, notification preferences, blocked users, and content visibility.
- Display earned badges only when backed by completion records.
- Avoid exposing the full email beside the public-facing profile identity.

## P2 — Visual, interaction, accessibility, and content refinements

### Use two visual densities

Keep the expressive brand, but adapt it to context:

- **Planning / recap:** large editorial headlines, gradients, poster stamps, avatar animation.
- **On-site utility:** compact cards, stronger contrast, larger action targets, less decoration, fewer animations.

The current visual language is attractive but dense. Long serif headings and repeated decorative panels compete with actionable information on small screens.

### Reduce branded vocabulary at decision points

“Signals,” “Sparks,” “Field Notes,” “Pulse,” “Field Guide,” “Questbook,” and “The Fog” create personality, but too many unfamiliar nouns increase cognitive load.

Recommended rule:

- Use plain language for actions: Save set, View map, Invite friend, Set status, Report post.
- Use branded language for emotional framing and rewards.
- Introduce currency as **“Sparks — reward points”** the first time.

### Accessibility requirements

- Use real links for navigation and real buttons for actions; avoid a clickable `<article>` containing another button.
- Add `aria-current="page"` to active navigation items.
- All modal dialogs need initial focus, focus trapping, Escape handling, background inertness, and focus restoration.
- The story preview should not use `role="dialog"` with `aria-modal="false"`; model it as an expanded region or a proper modal.
- Announce asynchronous save success and failure without flooding screen readers during auto-save.
- Provide non-color selected indicators everywhere.
- Maintain 44 × 44 px minimum touch targets for on-site controls.
- Verify text and control contrast in bright-light conditions, not only against automated minimums.
- Respect reduced motion and add the low-battery mode described above.
- Do not put meaning only in emoji or stylized symbols; include accessible text.
- Test 200% zoom, large mobile text, keyboard-only use, VoiceOver, and TalkBack.

### Content corrections

- Change hardcoded “JamBase” attribution to the actual provider.
- Remove unsupported “community” and “moderators” claims until those systems exist.
- Distinguish “Saved,” “Interested,” and “Going.”
- State when map information was last verified.
- Use exact calendar dates and time zones; festival audiences often travel.
- Replace “Return afterward to claim your coins” with “Return after the set to reflect and claim Sparks.”
- Avoid a false sense of verification from phrases like “No conflict detected” and “Signal claimed.”

## Recommended end-to-end flows

### First visit

```text
Landing
  → Browse festival or nearby events as guest
  → Event detail
  → Save set
  → Lightweight auth prompt with reason
  → Saved confirmation
  → Optional preferences
  → Today / My schedule
```

Target: a user should find and save a relevant event within 90 seconds.

### Returning planner

```text
Open app
  → Today or My schedule
  → See conflict / missing day
  → Browse lineup with saved filter context
  → Adjust schedule
  → Invite crew or download plan
```

### On-site attendee

```text
Open app
  → Today shows Now / Next
  → One tap to route or stage zone
  → One tap to essentials
  → Optional crew status update
  → Optional context-aware quest
```

Target: next set, water, medical, and crew status should each be reachable within two taps.

### Quest completion

```text
Available-now quest
  → Review proof, privacy, time, reward
  → Start
  → Submit allowed proof
  → Server validates / queues review
  → Pending status
  → Accepted
  → Atomic point award and receipt
```

There should be no client-only “claim” path for durable rewards.

### Post-event

```text
Event ends
  → Recap prompt
  → Favorite set / artist discovery / memory
  → Optional Pulse post with visibility choice
  → Earned reward receipt
  → Download or share recap
```

## Backend and data requirements for the redesigned UX

The Convex migration is a good fit if the UI uses authenticated queries and transactional mutations rather than one large progress JSON document.

Minimum first-class records:

| Record | Important fields / guarantees |
| --- | --- |
| Users / profiles | Auth identity, display name, privacy settings, active festival |
| RSVPs | Unique `(userId, eventId)`, explicit status, created/updated timestamps |
| Crews | Owner, name, invite code hash, expiration and privacy settings |
| Crew memberships | User, crew, pending/accepted/removed role and timestamps |
| Crew statuses | User, crew, approved status enum, `expiresAt`; server filters expired rows |
| Quest submissions | User, quest, proof reference, visibility, review state |
| Point ledger | Immutable unique award key, amount, source, timestamp |
| Reward redemptions | User, reward, cost snapshot, atomic ledger debit |
| Posts / comments | Author, event/crew scope, visibility, moderation state |
| Reports | Reporter, target, reason, status, moderator audit timestamps |

Security and integrity rules:

- Derive user ID from Convex Auth; never accept it from client input.
- Enforce authorization and visibility in every query.
- Award points and accept a submission in one transaction.
- Enforce unique ledger keys so retries cannot double-award.
- Validate post and progress payloads server-side.
- Rate-limit auth attempts, posts, comments, reports, invitations, and proof submissions.
- Store precise location only if a future feature truly needs it; the current design does not.
- Keep production, preview, and development deployments separate.

## Implementation plan

### Phase 0 — Honesty and trust cleanup (small)

- Add a global demo label outside production.
- Hide or relabel fake crew, reporting, check-in, QR, proof, and reward-fulfillment actions.
- Correct provider attribution and hardcoded stats.
- Remove unsupported merchandise/drawing claims.
- Fix duplicate quest number and inconsistent chapter counts.

**Exit criterion:** no visible production claim implies a backend action that does not exist.

### Phase 1 — Utility-first foundation (medium/large)

- Enable guest browsing.
- Build Today and My Schedule.
- Persist RSVPs in Convex.
- Replace navigation with Today, Lineup, Map, Crew, More.
- Add active event/festival context and event capability flags.
- Make essential map content permanent and cacheable.
- Finish production auth, verification/reset, and account controls.

**Exit criterion:** a user can browse, save, revisit, and use a basic plan across devices.

### Phase 2 — Real crew and quests (large)

- Build unique invitations, membership states, status TTL, privacy controls, and meetup points.
- Model quests and submissions as backend records.
- Add proof review and idempotent point ledger.
- Make Questbook contextual and event-specific.

**Exit criterion:** friend and reward actions are dependable enough for a real event pilot.

### Phase 3 — Social and reward depth (large, optional)

- Event/crew-scoped Pulse with moderation, block/mute, and visibility.
- Secure image uploads and review pipeline.
- Reward history, equip flow, and carefully scoped fulfillment.
- Post-event recaps and sharing.

**Exit criterion:** public social features have operational moderation and privacy support.

## Recommended component and code restructuring

`JamQuest.tsx` currently owns authentication, persistence, live search, navigation, all major page state, and nearly every feature component. This makes flow changes risky and encourages inconsistent persistence.

Recommended structure:

```text
app/
  (public)/landing
  (public)/events
  (app)/today
  (app)/schedule
  (app)/map
  (app)/crew
  (app)/quests
  (app)/pulse
  (app)/profile
components/
  shell/
  events/
  schedule/
  map/
  crew/
  quests/
  pulse/
  rewards/
convex/
  events.ts
  rsvps.ts
  crews.ts
  quests.ts
  points.ts
  pulse.ts
  reports.ts
```

Use URLs for major destinations rather than a single `page` string. This enables deep links, correct browser back behavior, refresh-safe navigation, analytics, and shareable event/quest pages.

## Measurement plan

Do not use account creation as the primary activation metric.

### Core success metrics

- Time from landing to first relevant event detail.
- First-set save rate among event viewers.
- Percentage of savers who return to My Schedule.
- Schedule conflict resolution rate.
- Percentage of on-site sessions that reach Next Set or Map Essentials in two taps.
- Successful crew invite acceptance and status update rate.
- Quest start-to-valid-submission and submission-to-acceptance rates.

### Trust and quality guardrails

- Auth abandonment and reset success.
- Save failure and sync-conflict rate.
- Stale/incorrect event or map reports.
- Report handling time and repeat abuse rate.
- Accidental purchase reversal requests.
- Battery/network failures during event hours.
- Account deletion completion rate.

### Qualitative tests

Run five-person tests for each context:

1. A first-time visitor: “Find a Saturday artist and save the set.”
2. A planner: “Build a conflict-free plan with three artists.”
3. An on-site attendee: “You need water and your next set starts soon.”
4. A crew member: “Tell friends you are getting food without sharing exact location.”
5. A privacy-conscious user: “Post a memory only to your crew, then delete it.”

Observe whether participants understand what is real, what is official, what is public, and what is saved. Any uncertainty in those four areas is a release blocker.

## Final recommendation

JamQuest is practical if it becomes a festival utility with an optional game layer. It is not practical as a quest-and-reward experience that happens to contain a lineup and map.

The next product release should therefore prioritize, in order:

1. Truthful states and a real backend.
2. Guest browsing and persistent scheduling.
3. Today, offline essentials, and dependable crew coordination.
4. Contextual verified quests.
5. Social and cosmetic depth.

The current brand does not need to be discarded. The visual personality is one of the app's best assets. The design task is to make that personality serve clear, dependable decisions—especially when the user is standing in a crowded field with weak service and only a few seconds of attention.
