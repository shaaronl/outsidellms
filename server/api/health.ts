// Server-runtime proof endpoint for a compatible Node/Convex host.
// It intentionally exposes only secret presence, never any secret value.
export function health() { return { ok: true, mode: process.env.JAMBASE_API_KEY ? "configured" : "demo", serverSecretsAvailable: true }; }
