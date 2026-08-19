# 09 — Audience Growth, Discovery, and Ethical Retention

## Outcome

Attract the right festival audience through useful public content and sharing, then retain people by making their plans and event-day experience dependable. Growth must represent real utility and real community—not fixtures, coercive onboarding, or reward pressure.

## Audience strategy

Prioritize three initial segments:

1. Festival planners comparing artists and set times before an event.
2. Friend groups building a shared plan and coordinating on-site.
3. First-time attendees seeking essentials, accessibility, and low-stress guidance.

The primary promise remains: plan sets, find essentials, coordinate privately, and optionally collect memories.

## User stories

- As a search visitor, I can understand an event page and start planning without registration.
- As a planner, I can share a useful event or privacy-safe schedule link with friends.
- As an invitee, I understand JamQuest and the crew/event context before creating an account.
- As a returning user, I receive timely, controllable reminders that help my plan rather than manufacture urgency.
- As a post-event user, I can review and share a recap without exposing private crew or attendance data by default.

## Scope

### 1. Acquisition surfaces

- Public festival and event pages built under [03](03-events-schedule-today.md) and indexed under [08](08-accessibility-performance-seo.md).
- Landing variants by real intent: featured festival, nearby shows, schedule planning, first-timer guide.
- Useful editorial content only where it can be kept accurate: planning guides, accessibility/transport links, schedule-change explainers.
- Clear source attribution and official-versus-fan-made positioning.
- Campaign links with privacy-safe attribution and canonical destinations.

Do not create thin city/event pages solely for search volume. Pages must contain trustworthy, differentiated utility.

### 2. Sharing loops

Supported share objects:

- Public event/festival detail.
- Artist/set detail.
- Crew invitation with secure expiring token.
- Privacy-safe schedule summary with explicit visibility and revocation.
- Post-event recap with user review before publication.

Every recipient gets a useful preview before auth. Share cards show event name, exact dates/time zone, venue/city, JamQuest value, and no private status or hidden attendance data.

### 3. Crew referral flow

Optimize for successful accepted invitations, not raw sends:

1. Existing user creates a crew.
2. Shares an expiring deep link.
3. Recipient views crew/event/inviter and privacy behavior.
4. Recipient browses relevant public event context.
5. Auth is requested at Accept.
6. Pending acceptance resumes once.

Do not auto-import contacts or send messages without explicit user action. Do not reveal whether an email has an account.

### 4. Lifecycle communication

Notification categories are opt-in or clearly controllable:

- Material set/stage/time changes to saved events.
- Upcoming plan/next set on event day.
- Crew invitation and meaningful membership changes.
- Expiring crew status, only if useful.
- Quest review result or reward receipt.
- Optional pre-event download-plan reminder and post-event recap.

Messages include exact event context and deep-link to the action. Apply quiet hours in the event/user time zone, frequency caps, unsubscribe controls, provider delivery tracking, and stale-action suppression. Marketing messages are separate from transactional/product-critical notices.

### 5. Retention loops

Retention is grounded in accumulated value:

- Saved schedule persists and improves Today.
- Crew remains useful through the event lifecycle.
- Offline pack and event changes build trust.
- Optional post-event recap captures favorite set, discovery, and memories.
- Quest/reward history is a secondary return reason.

Avoid daily streaks, loss-framed reward expiry, forced invites, notification spam, fake popularity, and opaque personalization.

### 6. Experimentation and measurement

Experiment on messaging, order, and discoverability—not on removal of safety, privacy, or accessibility controls. Each experiment declares hypothesis, population, success metric, guardrails, duration, and stopping rule. Use stable anonymous/session IDs for guests and account IDs only after sign-in; never send email, exact location, invite tokens, private text, or proof content to analytics.

Core funnel:

```text
Qualified landing
  → Event detail
  → Save intent
  → Account completion
  → Confirmed first save
  → Schedule/Today return
  → Event-day utility success
```

## Not in scope

- Paid acquisition before landing-to-first-save and retention are measured and healthy.
- Fake profiles, fake post counts, fake scarcity, or unlabeled seeded community content.
- Contact scraping, unsolicited invitations, or default-public sharing.
- Growth that depends on merchandise drawings or legally unprepared incentives.
- Personalized ranking using sensitive or precise-location data.

## Implementation steps

1. [ ] Define target segments, acquisition message, baseline funnel, and qualitative success criteria.
2. [ ] Launch accurate public event pages with social previews and canonical metadata.
3. [ ] Implement event sharing and measure recipient usefulness before auth.
4. [ ] Implement secure crew invitation deep links and acceptance funnel.
5. [ ] Design privacy-safe, revocable schedule sharing; test visibility comprehension.
6. [ ] Create notification preferences, templates, deep links, quiet hours, caps, and unsubscribe handling.
7. [ ] Add material schedule-change and event-day utility notifications.
8. [ ] Build an optional reviewed post-event recap/share flow.
9. [ ] Establish experiment governance and a privacy-reviewed analytics dictionary.
10. [ ] Run small channel/audience tests; invest only after activation and trust guardrails hold.

## Acceptance criteria

- A shared public event link provides real value without authentication.
- A crew invite never exposes private member/status data before acceptance.
- Shareable schedules are opt-in, limited to selected fields, unguessable where private, revocable, and visibly labeled with audience.
- Notification settings, quiet hours, unsubscribe, and category separation work end-to-end.
- Cancelled/rescheduled/expired actions suppress stale reminders.
- Analytics exclude emails, raw invite tokens, private content, exact location, and proof media.
- No production growth surface represents fixtures or estimates as real community activity.
- Experiments cannot hide safety, privacy, account deletion, accessibility, or provenance information.

## Test plan

- Search/share crawler previews for public, private, expired, revoked, and deleted links.
- Invite/share authorization tests and token-leak review across URLs, logs, referrers, and analytics.
- Notification tests across event/device time zones, quiet hours, duplicates, delays, opt-out, cancellation, and deep links.
- Funnel event validation against server records, with duplicate and bot filtering.
- Audience interviews and first-use tests segmented by planner, crew, and first-time attendee.

## Metrics and guardrails

Primary metrics: qualified event-detail visits, confirmed first-save rate, Schedule/Today return, invite acceptance, and event-day utility task success. Secondary: organic/share acquisition, recap use, quest participation. Guardrails: auth abandonment, notification opt-out/complaint, stale data, save failures, privacy incidents, reports/abuse, accessibility failures, and account deletion completion.

## Dependencies and rollout

Depends primarily on [01](01-guest-entry-navigation.md), [03](03-events-schedule-today.md), [05](05-crews.md), and [08](08-accessibility-performance-seo.md). Start with organic public pages and direct sharing. Add lifecycle notifications gradually by category. Delay paid growth until cohorts reliably activate and return.
