# 05 — Private Crews and Temporary Status

## Outcome

Provide dependable, privacy-first group coordination without continuous location tracking. Invitations are unique and stateful, members explicitly accept, and temporary general statuses expire using server time.

## Target flow

```text
Crew empty state
  → Create crew or enter invite
  → Review privacy behavior
  → Generate code/link
  → Recipient previews crew and accepts
  → Members set temporary general status or meetup point
```

## User stories

- As a user, I can create a named private crew and invite a specific friend with a unique, expiring link/code.
- As an invitee, I can inspect the crew name and privacy behavior before accepting.
- As a member, I can share a general, temporary status without sharing exact location.
- As a member, I can leave, block a user, or understand why an invitation failed.
- As a crew, we can agree on a meetup landmark that is distinct from live tracking.

## Scope

### 1. Crew creation and roles

- Create crew with name, active event, privacy explanation, owner, and optional member limit.
- MVP roles: owner and member. If moderation needs require it, add admin explicitly rather than implicit permissions.
- Owner can rename, revoke invitations, remove members, transfer ownership, and disband with confirmation.
- Members can leave. Define what happens to meetup points and status history when membership changes.

### 2. Invitations

- Generate high-entropy server-side tokens; display a human-friendly code only if brute-force resistance and rate limiting remain adequate.
- Store only a hash of bearer invitation tokens where practical.
- Attach crew, creator, event, expiry, maximum uses, and revocation state.
- Support code entry and shareable HTTPS deep link.
- Preview crew name, event, inviter display name, expiry, and privacy rules before acceptance.
- Handle invalid, expired, revoked, already-used, self-invite, blocked, already-member, capacity, and wrong-event states.
- Copy action has visible and announced success feedback.

### 3. Membership states

Persist `pending`, `accepted`, `removed`, `left`, and `blocked` states with server timestamps. Authorization queries expose only allowed profile/status fields to accepted members. Removed/left members immediately lose private crew access.

### 4. Temporary status

Start with approved, low-risk states such as:

- Heading to a stage.
- Getting food.
- At the meetup point.
- Taking a break.
- Phone low.
- All good / check in later.

Users set a TTL and see an exact event-local expiry time. Convex server time creates `expiresAt`; queries filter expired records regardless of client timers. Users can edit, clear, and renew. Freeform status text is out of scope for MVP unless moderation is ready.

### 5. Meetup points

Select only from organizer-provided/official landmarks or approved text zones. Display “agreed meetup point,” who changed it, and when. Never describe it as anyone's current location. Support a fallback note constrained to non-sensitive, non-precise content only if necessary.

### 6. Privacy and safety

- No continuous background location.
- Do not infer exact location from schedule or status.
- Explain visibility before the first status.
- Enforce block relationships in invitations, memberships, and profile exposure.
- Rate-limit crew creation, invite generation/attempts, joins, removals, and status updates.
- Log security-sensitive membership actions without logging raw invite tokens.

## Data model

| Table | Required fields and constraints |
| --- | --- |
| `crews` | event, name, owner, privacy settings, state, created/updated timestamps |
| `crewInvites` | crew, token hash/code hash, creator, expiresAt, maxUses, useCount, revokedAt |
| `crewMemberships` | crew, user, role, state, invitedBy, joined/left/removed timestamps; unique crew + user |
| `crewStatuses` | crew, user, approved status enum, optional zone, createdAt, expiresAt; one active per crew + user |
| `crewMeetupPoints` | crew, map location/zone, setter, active/version timestamps |
| `userBlocks` | blocker, blocked, createdAt; unique pair |

## Not in scope

- GPS friend map, background location, proximity alerts, or route surveillance.
- Open/public groups or searchable strangers.
- Crew chat; use temporary coordination states until moderation and notification complexity is justified.
- Any fixed universal code such as the current prototype code.

## Implementation steps

1. [ ] Finalize roles, limits, allowed status enum, TTL options, and privacy copy.
2. [ ] Create Convex schema, indexes, and authorization helpers.
3. [ ] Implement crew creation and the real empty state.
4. [ ] Implement secure invite generation, preview, acceptance, revocation, and rate limits.
5. [ ] Build complete invite and membership error/state UI.
6. [ ] Implement accepted-member list and owner/member lifecycle actions.
7. [ ] Implement server-expiring status set/edit/clear/renew.
8. [ ] Implement landmark-based meetup points.
9. [ ] Enforce blocking and immediate access removal across all queries.
10. [ ] Add audit events, abuse monitoring, and recovery/support procedures.
11. [ ] Test multi-device and concurrent membership transitions.

## Acceptance criteria

- Two newly created crews receive distinct, non-guessable invitation credentials.
- An invitation cannot be accepted after expiry/revocation or above its allowed uses.
- Invitees see crew/event/privacy context before joining.
- A successful acceptance creates exactly one membership and survives refresh/device change.
- Removed, left, or blocked users immediately lose private crew data access.
- Status expiry uses server time and expired statuses disappear even if a client was closed.
- The UI never implies a status or meetup point is exact live location.
- No raw invite token or private status appears in analytics/log output.

## Test plan

- Authorization matrix for owner, member, pending, left, removed, blocked, unrelated, and unauthenticated users.
- Invite brute-force/rate-limit, duplicate acceptance, expiry, revocation, capacity, and concurrency tests.
- Status tests with clock skew, device sleep, offline edit, renewal, and expiry.
- Multi-user usability scenario: “Tell friends you are getting food without sharing exact location.”
- Privacy copy comprehension and screen-reader tests.

## Metrics

- Crew creation → first accepted member.
- Invitation delivery/open/acceptance and failure reason class.
- Status set/renew/clear and successful expiry.
- Membership removal/block incidents.
- Crew-related authorization errors and abuse reports.

## Dependencies and rollout

Depends on [02](02-auth-account-data.md), [03](03-events-schedule-today.md), and block primitives needed by [07](07-pulse-trust-safety.md). Pilot with small invite-only crews. Enable event by event, cap membership, and retain a server-side kill switch for invite creation/status writes.
