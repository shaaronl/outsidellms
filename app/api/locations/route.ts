import { NextRequest, NextResponse } from "next/server";
import { JamBaseError, searchJamBaseCities } from "@/lib/jambase/client";

export const runtime = "nodejs";

const aliases: Record<string, string> = {
  sf: "San Francisco",
  "san fran": "San Francisco",
  nyc: "New York",
  la: "Los Angeles",
};

export async function GET(request: NextRequest) {
  const rawQuery = (request.nextUrl.searchParams.get("q") ?? "").trim();
  if (rawQuery.length < 2 || rawQuery.length > 80) {
    return NextResponse.json({ error: "Enter a city name." }, { status: 400 });
  }
  const query = aliases[rawQuery.toLowerCase()] ?? rawQuery;
  try {
    return NextResponse.json({ locations: await searchJamBaseCities(query) }, { headers: { "Cache-Control": "private, max-age=300" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to look up that city.";
    const status = error instanceof JamBaseError ? error.status : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
