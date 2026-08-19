# JamQuest

A responsive festival field guide for discovering events, saving a schedule, finding essentials, and coordinating without continuous location tracking. Account identity and durable user data use Convex; event-provider requests remain server-only.

## Run locally

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
```

Copy `.env.example` to `.env.local` and provide only server-side values. Never prefix OpenAI or Ticketmaster secrets with `NEXT_PUBLIC_`.

## Integrations and fallback

- **Ticketmaster:** local development serves real, city-filtered events through `GET /api/events` using the server-only `TICKETMASTER_API_KEY`. City searches resolve through `GET /api/locations`, and event results can be narrowed by event, artist, or venue. Previous-city results are cleared while a new search loads; if Ticketmaster is unavailable or the key is missing, JamQuest displays an explicit empty/error state instead of presenting fictional listings as live data. The static hosted demo cannot execute this endpoint unless its runtime provides the corresponding server route and secret.
- **OpenAI:** `server/api/review.ts` validates structured advisory output and fails closed to human review when no API key exists. Production should use the Responses API with strict JSON schema, capped input, timeout/retry, and a configurable vision-capable model.
- **Convex:** Convex Auth, private profiles/settings, normalized saved events and occurrences, idempotent RSVPs, schedules, conflict detection, and Today queries are connected to the configured deployment. Local, preview, and production must use isolated deployments.

## Security decisions

Secrets are never committed, rendered, returned, or included in client configuration. Convex mutations derive ownership from Convex Auth; the client never supplies a user ID. Quest, reward, crew, and Pulse surfaces remain labeled or unavailable until their server-authorized paths ship. Ticket buttons are external links only. No payments are handled.

## Deployment

1. Set required runtime secrets in ChatGPT Sites (not in git).
2. `npm run build`; inspect generated client bundles for secret names/values.
3. Commit and push the exact source commit to the Sites source repository.
4. Save a Sites version, then deploy that version. Add secrets before deploying a version that needs them.
5. Validate demo navigation and the no-credential fallback after deployment; run `server/api/health.ts` only on a compatible server host.

See `docs/sites-compatibility.md` for current runtime limits and `docs/architecture.md` for production implementation guidance.
