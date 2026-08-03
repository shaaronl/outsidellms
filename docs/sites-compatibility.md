# ChatGPT Sites compatibility proof

Date: 2026-08-02. The available Sites connector confirms production runtime environment variables, including secret-marked variables, and a git-source/version/deployment workflow. The source includes `server/api/health.ts`, a protected-server-style adapter that reads only the *presence* of a secret and never returns its value.

| Capability | Result | MVP behavior |
| --- | --- | --- |
| Server runtime & environment secrets | Secret storage is confirmed; executable server artifact is not confirmed | The deployed demo is a static export. Compatible-host adapters reside in `/server` and must run server-side. |
| Outbound HTTPS | Not verified without supplied credentials | JamBase/OpenAI adapters are disabled safely and demo fixtures are served. |
| Convex client/server functions | Not configured/verified | Repository fallback + Convex schema blueprint retained. |
| Image/file uploads | Browser picker UI present; secure storage unverified | No image is uploaded in this hosted demo. Production must enforce MIME, dimensions, 5 MB max, metadata stripping, and non-SVG/non-executable rules server-side. |
| Scheduled/background jobs | Not verified | Refresh is request-driven with cached fixtures. |
| React framework | Confirmed | Next.js React static export served by a minimal Cloudflare Assets worker entrypoint. |

Local development uses `app/api/events/route.ts` plus `lib/jambase/client.ts`. The Sites build requires a static `dist` artifact, so the server route is temporarily excluded only from its static package and is not executed in the deployed demo. JamBase's documented v3 base is `https://api.data.jambase.com/v3`; configure `JBD_API_KEY` locally without exposing it.
