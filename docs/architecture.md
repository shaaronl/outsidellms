# Architecture

JamQuest is a Next.js / React mobile-first presentation and demo MVP. Browser UI only receives normalized demo event data and calls local route handlers. Secret-dependent service calls belong in Node route handlers or Convex actions. `lib/repositories` prevents the UI from depending directly on a backend provider.

Submission lifecycle: draft → submitted → reviewing → accepted / needs_review / rejected / removed. AI signals are advisory and may never establish identity, location, or attendance. Low-risk high-confidence paths may be auto-accepted only after an idempotent ledger check; otherwise route to human review.

API protection: derive the user from server authentication, validate payloads with Zod, rate-limit all writes, use CSRF-safe cookies/origin policy, validate external ticket URLs, and enforce visibility in every query. Do not log captions, images, email, tokens, exact coordinates, or secrets.
