# Convex backend

JamQuest uses Convex Auth and Convex domain functions directly from the React client.

## Development setup

1. Run `npx convex dev` and select or provision the development deployment.
2. Run `node_modules/.bin/auth --web-server-url http://localhost:3001` once per deployment to configure `SITE_URL`, `JWT_PRIVATE_KEY`, and `JWKS`.
3. Confirm `.env.local` contains a deployment selector such as `CONVEX_DEPLOYMENT=dev:deployment-name` and the matching full `NEXT_PUBLIC_CONVEX_URL=https://deployment-name.convex.cloud`.
4. Run `npx convex dev --once`, `npm run typecheck`, `npm test`, and `npm run build`.

Never put a `.convex.cloud` URL in `CONVEX_DEPLOYMENT`; the CLI expects a selector, not a URL. Never commit Convex signing material or provider credentials.

## Current modules

- `auth.ts` and `http.ts`: Convex Auth password development flow and HTTP routes.
- `accounts.ts`: private account/profile provisioning and settings reads.
- `events.ts`: public reads for normalized cached events.
- `rsvps.ts`: auth-owned, idempotent saved-event writes and realtime reads.
- `schedule.ts`: ordered schedules, conflict detection, and decisions.
- `today.ts`: server-time Now/Next state.
- `jamquest.ts`: transitional visual-prototype progress only; it is not the RSVP source of truth.

The password provider is development-only until verified email delivery and recovery are configured. Crews, durable quest rewards, and Pulse remain unavailable until their server and operational release gates pass. See [`docs/backend-functional.md`](../docs/backend-functional.md).
