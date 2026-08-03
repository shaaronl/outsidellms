# JamQuest

Social concert discovery and live-music quests. This is a polished, responsive demo-first MVP for ChatGPT Sites. The current Sites artifact contract requires a static `dist` export, so the production demo runs from clearly labeled fictional data; server integrations remain isolated for compatible runtimes.

## Run locally

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
```

Copy `.env.example` to `.env.local` and provide only server-side values. Never prefix OpenAI or JamBase secrets with `NEXT_PUBLIC_`.

## Integrations and fallback

- **JamBase:** local development serves live events through `GET /api/events` using server-only `JBD_API_KEY`/`JBD_BASE_URL`; it retries transient errors and falls back to labeled demo fixtures when unavailable. The static hosted demo cannot execute this endpoint.
- **OpenAI:** `server/api/review.ts` validates structured advisory output and fails closed to human review when no API key exists. Production should use the Responses API with strict JSON schema, capped input, timeout/retry, and a configurable vision-capable model.
- **Convex:** absent from this runtime proof; the repository fallback is active. See `convex/README.md` to switch it on.

## Security decisions

Secrets are never committed, rendered, returned, or included in client configuration. All interactive demo mutations are local state; real mutations must be server-authorized. The production upload path must reject SVG/HTML/archive/executables, constrain JPEG/PNG/WebP by MIME/size/dimensions, strip metadata, and rate limit search, uploads, reviews, comments, tags, and reports. Ticket buttons are external links only. No payments are handled.

## Deployment

1. Set required runtime secrets in ChatGPT Sites (not in git).
2. `npm run build`; inspect generated client bundles for secret names/values.
3. Commit and push the exact source commit to the Sites source repository.
4. Save a Sites version, then deploy that version. Add secrets before deploying a version that needs them.
5. Validate demo navigation and the no-credential fallback after deployment; run `server/api/health.ts` only on a compatible server host.

See `docs/sites-compatibility.md` for current runtime limits and `docs/architecture.md` for production implementation guidance.
