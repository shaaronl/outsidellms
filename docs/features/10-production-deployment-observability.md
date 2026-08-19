# 10 — Production Deployment, Operations, and Observability

## Outcome

Deploy JamQuest as a verifiably production-backed application with isolated environments, secure secrets, automated quality gates, actionable monitoring, controlled rollout, and a rehearsed rollback/incident process.

## Current gap this closes

The public ChatGPT Site and local repository cannot be assumed to run the same revision or backend configuration. Convex work exists locally but deployment/auth configuration must be completed and verified. A local Ticketmaster request succeeding does not mean the production runtime has the secret. Production readiness requires evidence from the deployed system, not UI appearance.

## User stories

- As a visitor, I reach the intended current release and its core public pages remain available during optional-feature failures.
- As a user, confirmed account and schedule writes go to the real production backend and survive across devices.
- As an operator, I can identify the deployed revision, detect user-impacting failures, and disable or roll back a risky capability quickly.
- As a support owner, I can trace a failure without exposing credentials or private user content.
- As a release owner, I have objective evidence that production configuration and launch gates pass.

## Environment model

Maintain at least:

| Environment | Purpose | Data | External credentials | UI identity |
| --- | --- | --- | --- | --- |
| Local | Development | Local/dev Convex | Dev/restricted | Persistent `Local` banner |
| Preview | PR/release verification | Dedicated preview data | Preview/restricted | Persistent `Preview` banner |
| Production | Public users | Production Convex | Production/restricted | No demo banner |

Never share Convex deployments, auth providers, encryption/signing material, webhooks, or unrestricted API credentials across these environments. Use least-privilege provider keys and rotate any key that has been exposed in chat, logs, screenshots, commits, or client assets.

## Scope

### 1. Secret and configuration management

- Inventory every environment variable, owner, environment, rotation process, and failure behavior.
- Keep Ticketmaster and other provider credentials in server/runtime secret storage only.
- Ensure `NEXT_PUBLIC_*` variables contain no secret.
- Prevent `.env*`, tokens, invite credentials, Convex admin keys, and auth links from commits, build output, logs, analytics, or browser responses.
- Validate required configuration at startup/deploy with safe error messages.
- Configure production allowed origins, callback URLs, email sender/domain, CSP/connect sources, and Convex deployment URL deliberately.
- Rotate the provided Ticketmaster key before production because it was shared in conversation; do not copy it into documentation.

### 2. CI quality gates

Every pull request/release candidate runs:

- Dependency install from lockfile.
- Type checking.
- Linting/format verification.
- Unit and contract tests.
- Convex schema/function validation and generated types.
- Production build.
- Critical end-to-end flows against preview.
- Accessibility checks and performance budget checks.
- Dependency/secret scanning and supported security checks.

Required end-to-end smoke paths:

1. Guest opens a public event.
2. New user signs in with real delivery in a safe test inbox.
3. User saves a set and sees it after refresh.
4. Today loads the saved set.
5. Essentials load; offline smoke passes where supported.
6. User signs out and protected data disappears.
7. Account deletion works in the non-production lifecycle test.

Add crew/quest/Pulse smoke tests only when each capability is enabled.

### 3. Data migration and integrity

- Version Convex schema changes and document compatible deploy order.
- Backfill in bounded, restartable, observable jobs.
- Take/export a recoverable production snapshot according to Convex capabilities and policy before risky migrations.
- Verify invariants: unique RSVP, unique crew membership, unique ledger key, no orphan redemptions/submissions, authorized visibility.
- Never import demo identities, fixture posts, fixed crew codes, or client-generated balances into production.

### 4. Deployment and release control

Recommended release flow:

```text
Pull request
  → Automated checks
  → Isolated preview + smoke tests
  → Product/accessibility/security review for changed risk
  → Backward-compatible backend deploy
  → Frontend deploy with risky features off
  → Internal/canary validation
  → Gradual feature enablement
  → Monitor gates
  → Full release or rollback/disable
```

Record deployed Git commit, frontend deployment ID/URL, Convex deployment/version, schema version, enabled flags, and operator. The production UI exposes a non-sensitive build/version identifier for support.

### 5. Observability

Instrument:

- Frontend errors by route/build/browser.
- Server/Convex function failure and latency by operation.
- Provider availability, latency, quota/rate-limit, cache age, and malformed responses.
- Auth delivery/completion failures without tokens/emails.
- RSVP write failures and cross-device sync health.
- Offline manifest/download failures.
- Crew invitation/status errors.
- Quest ledger reconciliation and redemption failures.
- Report queue age/moderation SLA when social is enabled.

Use structured logs with request/correlation IDs and redaction. Logs must not contain secrets, auth links/tokens, full email, invite tokens, precise location, private posts/status, or proof media. Define retention and access controls.

### 6. Service objectives and alerts

Set initial service objectives for availability and latency of public event detail, authenticated schedule, Today, essentials, and writes. Alert only when someone can act, with severity, owner, user impact, dashboard, and runbook. At minimum alert on:

- Production unavailable or error spike.
- Auth delivery/sign-in collapse.
- Save/write failure spike.
- Provider outage with no safe cache.
- Convex quota/limit or function failure.
- Ledger invariant failure.
- Moderation queue breach when public posting is on.
- Secret/scanning incident.

### 7. Rollback and incident response

- Frontend rollback to last known good build.
- Server capability flags to stop risky writes without disabling public essentials.
- Backward-compatible schema strategy; do not rely on destructive rollback.
- Provider circuit breaker/cached fallback.
- Auth outage communication and safe session behavior.
- Incident roles, communication templates, evidence preservation, user notification criteria, and retrospective.

Rehearse a broken frontend release, provider outage, failed Convex mutation, bad map update, and exposed credential before launch.

### 8. Domain, policy, and support readiness

- Confirm canonical production domain and redirect all alternates to it.
- Configure TLS, security headers, CSP, robots/sitemap, social metadata, and error pages.
- Publish accurate Privacy, Terms, Community Rules if social is enabled, attribution/licensing, accessibility contact, and support/contact paths.
- Document event-data disclaimer without undermining verified official content.
- Assign owners for event/map freshness, moderation, account deletion/export, provider quota, security, and incident response.

## Not in scope

- Treating a successful local build as production verification.
- Manually copying local data or secrets into production.
- A big-bang enablement of all unfinished capabilities.
- Logging sensitive content for convenience.
- Claiming uptime or moderation response targets the team cannot operate.

## Implementation steps

1. [ ] Inventory deployment targets, current public URL, DNS ownership, Convex deployments, auth providers, and runtime configuration.
2. [ ] Rotate exposed credentials and establish secret storage/ownership/rotation.
3. [ ] Create isolated local, preview, and production Convex/auth/provider configuration.
4. [ ] Add configuration validation and a safe build/version endpoint or UI label.
5. [ ] Build CI gates and isolated preview deployment.
6. [ ] Add critical end-to-end smoke tests and production-safe synthetic checks.
7. [ ] Create schema migration, backfill, invariant-check, and recovery procedures.
8. [ ] Add structured redacted telemetry, dashboards, service objectives, and actionable alerts.
9. [ ] Add feature flags/circuit breakers and document frontend/backend rollback.
10. [ ] Configure canonical domain, TLS/security headers, policy/support pages, and search metadata.
11. [ ] Run security/privacy/accessibility/performance launch reviews.
12. [ ] Execute launch rehearsal and incident/rollback drills; record evidence.
13. [ ] Deploy canary, verify deployed revision and real backend writes, then expand gradually.
14. [ ] Conduct a post-launch review after the first real traffic/event window.

## Production release gate

- The deployed build identifies the intended Git commit.
- Production reads/writes the production Convex deployment, proven by a controlled test record and cross-device retrieval.
- Real sign-in delivery, recovery, sign-out, export, and deletion pass.
- Server-side Ticketmaster/provider calls work without exposing credentials; quota/fallback monitoring is live.
- Public browsing, first save, Schedule/Today, essentials, and offline claims pass on supported devices.
- Demo/fixture/fake fulfillment surfaces are absent.
- Critical accessibility and performance gates pass.
- Dashboards, alerts, owners, support path, feature disablement, and rollback are verified.
- Privacy/Terms/attribution and any Community Rules match shipped behavior.
- A named release owner explicitly approves launch.

## Acceptance criteria

The production release gate above is the acceptance checklist for this feature. Each item requires linked test, dashboard, configuration, or drill evidence; a locally passing implementation or visually correct deployed page is not sufficient evidence.

## Test plan

- Preview and production smoke tests using isolated test accounts/data.
- Inspect browser bundles, network traffic, HTML, source maps, logs, and analytics for leaked secrets/private data.
- Cross-device persistence and auth-expiry tests.
- Load/quota tests sized to the expected launch audience, with provider limits respected.
- Migration dry run, invariant scan, recovery test, and rollback rehearsal.
- Synthetic checks for public event, auth entry, schedule query, essential content, and provider fallback.
- Incident exercises for credential exposure, provider outage, faulty content, abusive social activity, and account deletion failure.

## Launch and post-launch metrics

Monitor availability, p75/p95 latency, error rate, auth completion/delivery, RSVP success, provider cache age/quota, real-user Web Vitals, offline-pack success, support volume, and privacy/security/moderation incidents. Compare product funnel metrics from [09](09-growth-discovery-retention.md) only after technical health gates are met.

## Dependencies and rollout

This specification consumes all launch-scope features and should be implemented alongside them. Do not wait until the end to create environments, CI, or telemetry. Production enablement is gradual, with safety essentials and read-only browsing remaining available when optional writes are disabled.
