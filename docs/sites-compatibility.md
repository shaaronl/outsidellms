# ChatGPT Sites compatibility proof

Date: 2026-08-02. The available Sites connector confirms production runtime environment variables, including secret-marked variables, and a git-source/version/deployment workflow. The app includes `GET /api/health`, a protected-server-style route that reads only the *presence* of a secret and never returns its value.

| Capability | Result | MVP behavior |
| --- | --- | --- |
| Server runtime & environment secrets | Confirmed by Sites connector | Secrets are read only from server route handlers. |
| Outbound HTTPS | Not verified without supplied credentials | JamBase/OpenAI adapters are disabled safely and demo fixtures are served. |
| Convex client/server functions | Not configured/verified | Repository fallback + Convex schema blueprint retained. |
| Spotify OAuth callback | Not configured/verified | Disabled, polished demo state; manual favorite artists work. |
| Image/file uploads | Browser picker UI present; secure storage unverified | No image is uploaded in this hosted demo. Production must enforce MIME, dimensions, 5 MB max, metadata stripping, and non-SVG/non-executable rules server-side. |
| Scheduled/background jobs | Not verified | Refresh is request-driven with cached fixtures. |
| React framework | Confirmed | Next.js React app with route handlers. |

The minimum connectivity proof uses `/api/health`, `lib/repositories/demo-repository.ts` (read/write-compatible boundary), and `GET /api/events`. A live JamBase endpoint is deliberately not guessed: configure the verified account-specific endpoint in `JAMBASE_API_BASE_URL` before enabling its adapter.
