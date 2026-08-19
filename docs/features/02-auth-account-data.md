# 02 — Authentication, Account Lifecycle, and User Data

## Outcome

Provide production-grade Convex-backed identity and account data so people can safely use a real email, recover access, sync across devices, understand privacy, and delete or export their data.

## Recommended MVP decision

Use verified email OTP or magic link as the default sign-in method if supported by the chosen Convex Auth provider configuration. This removes password reset and password-storage UX from the first public release. If password auth remains, verification and a complete reset flow are launch requirements—not follow-up work.

## User stories

- As a visitor, I know why my email is needed and which information will be public.
- As a user, I can create an account, verify it, sign out, and sign in on another device.
- As a locked-out user, I can regain access without operator intervention.
- As a user, I can see active sessions, change privacy preferences, export my data, and delete my account.
- As a user, I never see “saved” until the backend has accepted the write.

## Scope

### 1. Convex Auth integration

- Complete provider configuration separately for local, preview, and production Convex deployments.
- Use secure, provider-supported session handling; do not store raw auth tokens in application-managed local storage.
- Derive user identity inside every Convex query/mutation using auth context.
- Create an application profile on first verified sign-in through an idempotent mutation.
- Prevent account enumeration in sign-in and recovery messages.
- Rate-limit sign-in, verification, recovery, invite, and sensitive account operations.

### 2. Entry and recovery flows

Required screens/states:

- Enter email with purpose/privacy summary.
- Check inbox / resend with cooldown.
- Invalid, expired, already-used, and rate-limited token.
- Successful sign-in with pending-action resume.
- Sign out from current session.
- Recovery or replacement sign-in path.
- Expired session encountered during a write, preserving the intended action.

If passwords are retained, also include password strength guidance, reset request, reset completion, invalid/expired reset token, recent-authentication checks, and breach-safe generic messages.

### 3. Profile versus account settings

Keep public or social identity separate from sensitive account data.

Profile may contain display name, avatar, optional bio, favorite artists, and badges with visibility settings. Account settings contain email, notification preferences, privacy settings, sessions, export, and deletion. Do not display the full email on a public-facing profile.

Collect display name once. Allow editing later, with validation, length limits, reserved-word handling, and an abuse-report path before public social launch.

### 4. Privacy controls

At minimum:

- Default post visibility.
- Crew-status visibility.
- Profile visibility.
- Optional discovery by invite/contact mechanisms, disabled by default unless clearly explained.
- Notification categories and unsubscribe state.
- Blocked and muted users when Pulse ships.
- Consent/version timestamps for material terms or privacy changes.

Do not collect precise background location for the documented product flow.

### 5. Export and deletion

Export includes profile, RSVPs, crews/memberships, statuses, quests/submissions, point ledger, redemptions, posts/comments, and reports authored by the user where legally and operationally appropriate. Exports must be authenticated, expire, and avoid exposing other users' private data.

Deletion flow:

1. Explain effects on schedule, crews, points, posts, and pending reports.
2. Require recent authentication and explicit confirmation.
3. Revoke sessions immediately.
4. Delete or anonymize records according to a documented retention policy.
5. Preserve moderation/audit records only where required, with identity minimized.
6. Send/show a durable completion receipt without revealing account existence to third parties.

### 6. User-facing persistence states

All account-backed writes use shared status language:

- `Saving…` while pending.
- `Saved` only after Convex confirms.
- `Offline—will retry` only when a retry queue actually exists.
- `Couldn't save` with retry and non-destructive recovery.

Optimistic UI must reconcile to server truth and roll back visibly on failure.

## Initial data model

| Table | Required fields and constraints |
| --- | --- |
| `profiles` | auth subject, display name, avatar reference, active event, created/updated timestamps; unique auth subject |
| `privacySettings` | user, profile visibility, crew visibility, post default, consent versions |
| `notificationSettings` | user, category preferences, unsubscribe timestamps |
| `accountExports` | user, state, requested/completed/expiry timestamps, secure artifact reference |
| `accountDeletionJobs` | user, state, request/execute timestamps, retention outcome |

Feature-specific user records belong in their domain tables rather than one mutable progress JSON object.

## Not in scope

- Social login unless it clearly reduces launch friction and its privacy/callback setup is fully owned.
- Collecting phone number, contacts, legal name, birthdate, or precise location without a separately approved need.
- Implementing social/profile features before their feature specs are ready.

## Implementation steps

1. [ ] Choose and document email OTP/magic link or complete password lifecycle.
2. [ ] Configure local Convex Auth and validate identity inside a minimal authenticated query.
3. [ ] Create the profile/settings schema and idempotent first-sign-in provisioning.
4. [ ] Replace client/local-file identity and progress ownership with auth-derived Convex access.
5. [ ] Build accessible sign-in, verification, error, cooldown, and sign-out states.
6. [ ] Connect pending-action resume from [01](01-guest-entry-navigation.md).
7. [ ] Build Account, Privacy, Notifications, and session controls.
8. [ ] Implement data export with authorization, expiry, and audit logging.
9. [ ] Implement account deletion/anonymization and test every feature table.
10. [ ] Configure preview and production providers, domains, secrets, and email delivery.
11. [ ] Add rate limits, security events, anomaly alerts, and support runbooks.

## Acceptance criteria

- A person can use a real email to register/sign in; no fake email guidance is needed.
- Verification or password recovery works in production from request through successful access.
- Sign-out revokes the current session and protected data is no longer readable.
- The same account sees its saved data on a second browser/device.
- Convex mutations ignore or reject client-supplied ownership IDs.
- Email is absent from public profile responses and product analytics.
- Export contains the user's relevant records but no other user's private fields.
- Deletion revokes access immediately and completes the documented deletion/anonymization policy.
- Persistence claims appear only after confirmed writes.

## Test plan

- Auth lifecycle end-to-end tests for new, returning, expired, invalid, reused, and rate-limited links/tokens.
- Authorization tests attempting cross-user reads/writes for every table.
- Session expiry during Save, Join Crew, quest submission, and account deletion.
- Export fixture review for accidental third-party/private data leakage.
- Deletion integration test that enumerates all domain tables.
- Email deliverability checks for production sender/domain, spam placement, and broken-link handling.

## Metrics and alerts

Track sign-in start/completion, verification delivery latency, verification failure reason class, recovery success, session-expiry errors, export completion time, and deletion completion. Alert on delivery failures, abnormal auth attempts, unexpected authorization denials, or stuck deletion jobs. Never log email links, tokens, passwords, or full email addresses.

## Dependencies and rollout

Depends on [00](00-platform-foundations.md) and integrates with [01](01-guest-entry-navigation.md). Migrate existing local development identities only if explicitly needed; do not import fake/demo credentials into production. Launch to preview with real email delivery, run an account lifecycle drill, then enable production sign-in before any durable user feature.
