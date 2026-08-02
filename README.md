# JamQuest

Social concert discovery and live-music quests. This is a polished, responsive demo-first MVP for ChatGPT Sites.

## Run locally

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
```

Copy `.env.example` to `.env.local` and provide only server-side values. Never prefix OpenAI, JamBase, or Spotify secrets with `NEXT_PUBLIC_`.

## Integrations and fallback

- **JamBase:** server-only adapter boundary. The demo serves labeled fictional fixtures until a verified `JAMBASE_API_KEY` and `JAMBASE_API_BASE_URL` are configured. This prevents invented API paths or fields.
- **OpenAI:** `POST /api/review` validates structured advisory output and fails closed to human review when no API key exists. Production should use the Responses API with strict JSON schema, capped input, timeout/retry, and a configurable vision-capable model.
- **Spotify:** disabled demo state plus manual favorite artists. Implement authorization-code + PKCE/callback server flow only once a secure redirect and token store are configured.
- **Convex:** absent from this runtime proof; the repository fallback is active. See `convex/README.md` to switch it on.

## Security decisions

Secrets are never committed, rendered, returned, or included in client configuration. All interactive demo mutations are local state; real mutations must be server-authorized. The production upload path must reject SVG/HTML/archive/executables, constrain JPEG/PNG/WebP by MIME/size/dimensions, strip metadata, and rate limit search, uploads, reviews, comments, tags, and reports. Ticket buttons are external links only. No payments are handled.

## Deployment

1. Set required runtime secrets in ChatGPT Sites (not in git).
2. `npm run build`; inspect generated client bundles for secret names/values.
3. Commit and push the exact source commit to the Sites source repository.
4. Save a Sites version, then deploy that version. Add secrets before deploying a version that needs them.
5. Validate `/api/health`, demo navigation, and the no-credential fallback after deployment.

See `docs/sites-compatibility.md` for current runtime limits and `docs/architecture.md` for production implementation guidance.
