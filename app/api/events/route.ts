import { NextRequest, NextResponse } from "next/server";
import { JamBaseError, searchJamBaseEvents } from "@/lib/jambase/client";
export const runtime = "nodejs";
const hits = new Map<string, { count: number; resetAt: number }>();
function allowed(request: NextRequest) { const key = request.headers.get("x-forwarded-for")?.split(",")[0] || "local"; const now = Date.now(); const item = hits.get(key); if (!item || item.resetAt < now) { hits.set(key, { count: 1, resetAt: now + 60_000 }); return true; } item.count += 1; return item.count <= 30; }
export async function GET(request: NextRequest) {
  if (!allowed(request)) return NextResponse.json({ error: "Too many searches. Try again in a minute." }, { status: 429 });
  try { const search = request.nextUrl.searchParams.get("q") ?? ""; const cityId = request.nextUrl.searchParams.get("geoCityId"); const metroId = request.nextUrl.searchParams.get("geoMetroId"); const locationId = cityId ?? metroId ?? "jambase:1"; if (!/^jambase:\d+$/.test(locationId)) return NextResponse.json({ error: "Invalid location id." }, { status: 400 }); return NextResponse.json({ ...(await searchJamBaseEvents({ cityId: cityId || undefined, metroId: metroId || undefined, query: search })), source: "JamBase" }, { headers: { "Cache-Control": "private, max-age=60" } }); }
  catch (error) { const message = error instanceof Error ? error.message : "Unable to load events."; const status = error instanceof JamBaseError ? error.status : 502; return NextResponse.json({ error: message }, { status }); }
}
