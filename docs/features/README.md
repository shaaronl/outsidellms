# JamQuest Feature Delivery Roadmap

This folder translates [`ux-flow-audit.md`](../ux-flow-audit.md) into independently deliverable feature specifications. The goal is a production-ready festival companion that earns trust, is useful before and during an event, and can attract and retain an audience without depending on simulated activity.

Backend schemas, function contracts, migration order, responsive data requirements, and production evidence are defined in [`backend-functional.md`](../backend-functional.md).

## Product outcome

A visitor should be able to:

1. Understand JamQuest and browse a relevant event without registering.
2. Save a set and recover that plan on another device.
3. Open the app on-site and find the next set, water, medical help, and crew status within two taps.
4. Understand what is official, estimated, private, public, saved, or still pending.
5. Opt into quests, rewards, and social features only after the core utility is dependable.

## Delivery sequence

The feature numbers are the recommended implementation order. A later feature may be designed early, but it should not ship before its listed dependencies and release gates are complete.

| Order | Feature specification | Release track | Priority | Depends on |
| --- | --- | --- | --- | --- |
| 00 | [Platform foundations](00-platform-foundations.md) | Foundation | P0 | None |
| 01 | [Guest entry and navigation](01-guest-entry-navigation.md) | Foundation | P0 | 00 |
| 02 | [Authentication and account data](02-auth-account-data.md) | Foundation | P0 | 00 |
| 03 | [Events, schedule, and Today](03-events-schedule-today.md) | Core utility | P0 | 00, 01, 02 |
| 04 | [Map, offline access, and safety](04-map-offline-safety.md) | Core utility | P0 | 00, 03 |
| 05 | [Private crews](05-crews.md) | Coordination | P1 | 02, 03 |
| 06 | [Quests, points, and rewards](06-quests-points-rewards.md) | Engagement | P1 | 02, 03, 04 |
| 07 | [Pulse, trust, and moderation](07-pulse-trust-safety.md) | Social | P1/P2 | 02, 03, 05 |
| 08 | [Accessibility, performance, and SEO](08-accessibility-performance-seo.md) | Quality | P0 | Applied throughout |
| 09 | [Growth, discovery, and retention](09-growth-discovery-retention.md) | Growth | P1 | 01, 03, 08 |
| 10 | [Production deployment and observability](10-production-deployment-observability.md) | Launch | P0 | All launch-scope work |

## Audit traceability

| UX audit finding | Owning specification(s) |
| --- | --- |
| Account wall before product value | [01](01-guest-entry-navigation.md), [02](02-auth-account-data.md) |
| Prototype actions presented as real | [00](00-platform-foundations.md), [05](05-crews.md), [06](06-quests-points-rewards.md), [07](07-pulse-trust-safety.md) |
| Inconsistent/client-authoritative state | [02](02-auth-account-data.md), [03](03-events-schedule-today.md), [06](06-quests-points-rewards.md) |
| Safety mixed with unlock mechanics | [04](04-map-offline-safety.md), [06](06-quests-points-rewards.md) |
| Festival and generic concert context mixed | [00](00-platform-foundations.md), [03](03-events-schedule-today.md) |
| Authentication not public-ready | [02](02-auth-account-data.md), [10](10-production-deployment-observability.md) |
| Feature-bucket navigation and missing Today | [01](01-guest-entry-navigation.md), [03](03-events-schedule-today.md) |
| Fake crew, feed, reports, and rewards | [05](05-crews.md), [06](06-quests-points-rewards.md), [07](07-pulse-trust-safety.md) |
| Accessibility and dense on-site presentation | [04](04-map-offline-safety.md), [08](08-accessibility-performance-seo.md) |
| Audience acquisition and retention | [09](09-growth-discovery-retention.md) |
| Unknown production revision/backend state | [10](10-production-deployment-observability.md) |

## Recommended releases

### Release A — Trustworthy planner

Includes 00–04 plus the relevant parts of 08 and 10.

Ship when guests can browse, authenticated users can save schedules across devices, event context is never ambiguous, and essential information works under poor connectivity. Do not enable public posting, durable quest rewards, or fulfillment in this release unless their backend path is complete.

### Release B — Dependable coordination and engagement

Includes 05–06 plus their quality and operational gates.

Ship when crew invitations and expiring statuses are server-backed, quest completion is reviewable, and points cannot be duplicated. Rewards remain digital-only unless fulfillment and legal terms exist.

### Release C — Audience and community growth

Includes 07 and 09.

Ship public social surfaces only after moderation, block/mute, visibility enforcement, abuse response, and operational ownership are working. Growth experiments must not weaken privacy or make fake network effects.

## Global implementation rules

Every feature must follow these rules:

- Convex queries and mutations derive the user identity from authentication; client-supplied user IDs are never trusted.
- Production never displays demo posts, fake crew members, simulated proof, unsupported rewards, or claims of an action that did not create a backend record.
- Local, preview, and production environments use separate deployments and visibly identify non-production environments.
- Event-specific screens require an active event context and respect capability flags.
- Safety and accessibility functions are never paywalled, quest-gated, or dependent on reward points.
- Every write exposes `Saving`, `Saved`, `Offline—will retry`, and actionable failure states where applicable.
- Major screens have stable URLs and support refresh, browser Back, and deep linking.
- Analytics events contain product context, not email addresses, precise location, freeform private text, or proof media.

## Definition of ready

A feature issue is ready to implement when it has:

- A named owner and target release.
- Confirmed dependencies and data ownership.
- Final user-facing copy for trust-, privacy-, and safety-sensitive states.
- Designs for loading, empty, success, error, offline, permission-denied, and unavailable states.
- Acceptance criteria that can be tested without interpretation.
- An analytics and rollout plan.

## Definition of done

A feature is done only when:

- All acceptance criteria pass in local and preview environments.
- Authorization, data validation, idempotency, rate limits, and error handling have been reviewed where relevant.
- Mobile, keyboard, screen-reader, 200% zoom, reduced-motion, slow-network, and offline scenarios have been tested as applicable.
- Events and errors are visible in production monitoring without recording sensitive content.
- Feature-flag disablement or rollback has been rehearsed for high-risk features.
- Documentation, support behavior, and account/privacy consequences are current.
- A product owner has completed the feature-specific release gate.

## How to turn a specification into tickets

Use the numbered implementation steps in each file as epics. Create one issue per step or per independently testable slice. Each issue should copy the relevant acceptance criteria and include:

```text
Outcome:
User story:
In scope:
Out of scope:
Dependencies:
UI states:
Backend/API changes:
Analytics:
Acceptance criteria:
Test evidence:
Rollout/rollback:
```

Avoid tickets named only after components such as “Build schedule card.” Name them after observable outcomes, such as “A signed-in user can save a set and see it after refresh.”

## Launch scorecard

Production launch is blocked if any answer below is “No”:

- Can a guest find and understand a relevant event without registering?
- Does every production interaction accurately describe what happened?
- Can an authenticated user recover saved data on a second device?
- Are event identity, source attribution, date, and time zone always clear?
- Are water, medical, entrances/exits, accessibility, and emergency help reachable in two taps?
- Does the useful on-site plan survive loss of connectivity?
- Can the team detect, investigate, disable, and roll back a broken release?
- Can users reset access, export data, and delete their account?
- If social posting is enabled, can users control visibility, report, block, and mute—and can operators act on reports?
