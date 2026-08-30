# ChatGPT Sites compatibility proof

Date: 2026-08-02. The available Sites connector confirms production runtime environment variables, including secret-marked variables, and a git-source/version/deployment workflow.

| Capability | Result | MVP behavior |
| --- | --- | --- |
| Server runtime & environment secrets | Secret storage is confirmed; executable server artifact is not confirmed | The deployed demo is a static export with an embedded worker for static files and public provider reads. |
| Outbound HTTPS | Not verified without supplied credentials | JamBase/OpenAI adapters are disabled safely and demo fixtures are served. |
| Convex client/server functions | Not configured/verified | Repository fallback + Convex schema blueprint retained. |
| Image/file uploads | Browser picker UI present; secure storage unverified | No image is uploaded in this hosted demo. Production must enforce MIME, dimensions, 5 MB max, metadata stripping, and non-SVG/non-executable rules server-side. |
| Scheduled/background jobs | Not verified | Refresh is request-driven with cached fixtures. |
| React framework | Confirmed | Next.js React static export served by a minimal Cloudflare Assets worker entrypoint. |

Local development uses `app/api/events/route.ts` plus `lib/jambase/client.ts`. The Sites build requires a static `dist` artifact, so `scripts/build-static.mjs` temporarily excludes Next route handlers while building and then writes a small embedded worker for static files, `/api/events`, `/api/locations`, and `/api/artists`. JamBase's documented v3 base is `https://api.data.jambase.com/v3`; configure `JBD_API_KEY` locally without exposing it.
