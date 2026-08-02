import { NextRequest, NextResponse } from "next/server";
import { events } from "@/lib/demo-data";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.toLowerCase().slice(0,80) ?? "";
  // JamBase calls are deliberately server-only. The official API base and endpoint must be configured
  // from verified account documentation; demo fixtures remain available if credentials are absent.
  const filtered = q ? events.filter((e) => [e.name,e.venue,e.city,e.genre,...e.artists].join(" ").toLowerCase().includes(q)) : events;
  return NextResponse.json({ events: filtered, source: "demo", refreshedAt: new Date().toISOString(), notice: process.env.JAMBASE_API_KEY ? "Live JamBase adapter pending configured endpoint." : "Demo data — add JAMBASE_API_KEY and JAMBASE_API_BASE_URL for live results." });
}
