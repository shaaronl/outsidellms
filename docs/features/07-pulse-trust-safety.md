# 07 — Pulse, Visibility, Trust, and Moderation

## Outcome

If JamQuest enables social posting, make it event-scoped, privacy-controlled, and operationally supportable. Replace fixture activity with honest empty states and do not invite public content before reporting, blocking, moderation, and enforcement exist.

## Recommended launch stance

Do not include public Pulse in Release A. Start with crew-only text posts or a read-only event update feed after private crews work. Expand to event-visible user posts only when moderators, response targets, tooling, and coverage are assigned.

## User stories

- As a user, I know exactly who can see a post before I publish it.
- As a crew member, I can share a memory with my accepted crew without exposing exact location.
- As a user, I can report content and receive a durable receipt/status.
- As a user, I can block or mute someone and see the effect immediately.
- As a moderator, I can review context, take consistent action, and leave an audit trail.

## Scope

### 1. Event-scoped feed

Allowed feed sources:

- Organizer/event updates.
- Accepted crew posts.
- Current-event posts when event visibility is explicitly enabled.
- Selected artist updates only from verified/approved sources.

There is no generic global feed for MVP. Each post includes event scope, author type, visibility, created/edited time, moderation state, and source/provenance where applicable. Never show an exact location field.

### 2. Visibility

Initial options:

- `Crew` — accepted members of a selected crew.
- `Event` — signed-in attendees of the current event, only after moderation launch.
- `Private` — author-only draft/memory if this use case is retained.

Default to Crew or the user's saved privacy default, never broad public. Show an audience summary immediately before Publish and on the resulting post. Server queries enforce visibility and membership changes immediately.

### 3. Content creation

Start with constrained text, optional approved tags, and optional event/artist association. Apply length limits, normalization, link policy, rate limits, spam controls, and prohibited-content guidance.

Do not ship image/video uploads until all are operational:

- File type/signature validation and size/dimension limits.
- Malware and safety scanning appropriate to the media.
- Metadata stripping, including EXIF location.
- Private-by-default storage with authorized, expiring delivery.
- Consent guidance for images of other people.
- Retention/deletion policy.
- Moderator rendering and removal.

### 4. Interactions and honest empty states

- Likes/comments must be server records with authorization and idempotency.
- Counts come from queries, not fixtures or client state.
- Empty Pulse explains the scope and offers a clear action.
- Example posts may appear only in a labeled preview/tutorial and cannot be mistaken for real people/activity.
- Editing/deletion updates derived content/counts and follows moderation retention policy.

### 5. Reports

Reporting creates a durable record and returns a receipt/reference. Flow:

1. Select reason from defined taxonomy; optional bounded details.
2. Confirm immediate safety options: mute, block, hide.
3. Create server record with relevant content snapshot/reference.
4. Show submitted status and what happens next without promising unsupported response times.
5. Allow status visibility appropriate to privacy/legal policy.

Reports never exist only as a local `reported` flag.

### 6. Block and mute

- Mute hides content without notifying the muted user.
- Block prevents relevant profile exposure, invites, crew joins/interactions, posts/comments visibility, and future direct interactions.
- Blocking does not silently remove evidence needed for an existing moderation case.
- Users can review and reverse block/mute in Settings.

### 7. Moderation operations

Required before Event-visible posting:

- Authenticated moderator role separate from normal users.
- Queue by severity/age/event and access to necessary context only.
- Actions: no action, hide, remove, warn, restrict, suspend, escalate.
- Decision reason, moderator, timestamp, and appeal/review state.
- Documented severity taxonomy, escalation contacts, retention, and event-hour coverage.
- Emergency language directing users to event/local authorities rather than implying JamQuest provides emergency response.

## Data model

| Table | Required fields and constraints |
| --- | --- |
| `posts` | author, event, optional crew, visibility, text/content refs, moderation state, created/edited/deleted timestamps |
| `comments` | post, author, visibility inheritance, moderation state, timestamps |
| `reactions` | target, user, type, createdAt; unique target + user + type |
| `reports` | reporter, target type/ID, reason, details, content snapshot/ref, state, timestamps |
| `moderationActions` | report/target, moderator, action, reason, duration, audit timestamps |
| `userBlocks` / `userMutes` | actor, target, timestamps; unique pairs |
| `mediaAssets` | owner, storage ref, scan state, metadata-strip state, moderation state, expiry/retention |

## Not in scope

- A global public social network, direct messages, follower graph, or exact-location check-ins.
- Fake seed users or unlabeled activity to make the network appear populated.
- Public posts without assigned moderation operations.
- Media uploads in the first text-only pilot.

## Implementation steps

1. [ ] Decide the smallest launch scope: organizer-only, crew-only, or event-visible.
2. [ ] Approve community rules, report taxonomy, moderator roles, response process, and coverage.
3. [ ] Create server-enforced post visibility and event/crew authorization.
4. [ ] Build text post creation, edit/delete, feed, and truthful empty states.
5. [ ] Implement reactions/comments only if operationally justified.
6. [ ] Implement report records, receipts, hide/mute/block shortcuts, and user settings.
7. [ ] Build moderation queue, decisions, audit trail, restriction enforcement, and alerts.
8. [ ] Run adversarial authorization and abuse tests.
9. [ ] Pilot crew-only posting with strict rate/size limits.
10. [ ] Add secure media pipeline only as a separately gated expansion.

## Acceptance criteria

- Every post displays its audience and is inaccessible to users outside that audience.
- Leaving/removal/blocking from a crew removes access to future private queries immediately.
- Publishing requires an explicit visibility choice or clearly displayed saved default.
- Reporting creates a backend record and durable receipt; moderators can change its state.
- Mute and block take effect across feeds, profiles, invitations, and interactions as documented.
- No fixture user/post/like/comment is presented as live activity in production.
- Event-visible posting is impossible when moderation staffing or the capability flag is off.
- Media cannot be uploaded until validation, metadata, storage, moderation, and deletion gates all pass.

## Test plan

- Full visibility matrix across crew membership transitions, event scope, block/mute, deletion, and account deletion.
- Report lifecycle from submission through moderator action and audit review.
- Rate-limit, spam, oversized content, forbidden field, and concurrent reaction tests.
- Adversarial direct Convex calls attempting to bypass UI audience controls.
- Moderator accessibility, least-privilege, and sensitive-data exposure review.
- Qualitative task: “Post a memory only to your crew, then delete it.”

## Metrics and guardrails

Track feed usefulness, publish completion, visibility changes, reports per active poster, time to first review/action, repeat abuse, blocks/mutes, and removal appeals. Never optimize raw post volume at the cost of report rate, core utility, or privacy. Exclude private text and media from analytics payloads.

## Dependencies and rollout

Depends on [02](02-auth-account-data.md), [03](03-events-schedule-today.md), and [05](05-crews.md). Roll out organizer content, then crew-only text, then a small event-visible pilot. Every expansion is a separate capability flag with a tested shutdown path.
